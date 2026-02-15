import { NextRequest, NextResponse } from "next/server";
import youtube, { extractPlaylistId, parseDuration, formatDuration } from "@/lib/youtube";
import anthropic from "@/lib/anthropic";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Course, Module, Video, ClaudeModuleResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { playlistUrl, userId } = await request.json();

    if (!playlistUrl || !userId) {
      return NextResponse.json(
        { error: "playlistUrl y userId son requeridos" },
        { status: 400 }
      );
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      return NextResponse.json(
        { error: "URL no válida. Asegúrate de que sea una playlist de YouTube" },
        { status: 400 }
      );
    }

    // 1. Get playlist info
    const playlistInfo = await fetchWithRetry(() =>
      youtube.playlists.list({
        part: ["snippet"],
        id: [playlistId],
      })
    );

    const playlist = playlistInfo.data.items?.[0];
    if (!playlist) {
      return NextResponse.json(
        { error: "Esta playlist es privada o no existe" },
        { status: 404 }
      );
    }

    // 2. Get all playlist items (paginate)
    const allItems: Array<{
      videoId: string;
      title: string;
      description: string;
      thumbnailUrl: string;
      position: number;
    }> = [];

    let nextPageToken: string | undefined;
    do {
      const response = await fetchWithRetry(() =>
        youtube.playlistItems.list({
          part: ["snippet"],
          playlistId,
          maxResults: 50,
          pageToken: nextPageToken,
        })
      );

      for (const item of response.data.items || []) {
        const videoId = item.snippet?.resourceId?.videoId;
        if (videoId) {
          allItems.push({
            videoId,
            title: item.snippet?.title || "Sin título",
            description: item.snippet?.description || "",
            thumbnailUrl:
              item.snippet?.thumbnails?.high?.url ||
              item.snippet?.thumbnails?.default?.url ||
              "",
            position: item.snippet?.position || 0,
          });
        }
      }

      nextPageToken = response.data.nextPageToken || undefined;
    } while (nextPageToken);

    if (allItems.length === 0) {
      return NextResponse.json(
        { error: "La playlist está vacía" },
        { status: 400 }
      );
    }

    // 3. Get video durations (in batches of 50)
    const videoIds = allItems.map((item) => item.videoId);
    const durationMap: Record<string, { duration: string; durationSeconds: number }> = {};

    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50);
      const videosResponse = await fetchWithRetry(() =>
        youtube.videos.list({
          part: ["contentDetails"],
          id: batch,
        })
      );

      for (const video of videosResponse.data.items || []) {
        const id = video.id!;
        const iso = video.contentDetails?.duration || "PT0S";
        const seconds = parseDuration(iso);
        durationMap[id] = {
          duration: formatDuration(seconds),
          durationSeconds: seconds,
        };
      }
    }

    // 4. Build video summaries for Claude
    const videoSummaries = allItems.map((item, index) => {
      const dur = durationMap[item.videoId] || {
        duration: "0m",
        durationSeconds: 0,
      };
      return `${index}. "${item.title}" (${dur.duration}) - ${item.description.slice(0, 100)}`;
    });

    const totalSeconds = allItems.reduce(
      (sum, item) => sum + (durationMap[item.videoId]?.durationSeconds || 0),
      0
    );

    // 5. Call Claude to structure modules
    let moduleStructure: ClaudeModuleResponse;
    try {
      const claudeResponse = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `Eres un asistente educativo. Te voy a dar los datos de una playlist de YouTube.
Tu trabajo es analizar los videos y organizarlos en módulos lógicos para un curso educativo.

Datos de la playlist:
- Título: ${playlist.snippet?.title}
- Descripción: ${playlist.snippet?.description}
- Videos:
${videoSummaries.join("\n")}

Instrucciones:
1. Analiza si la playlist es monotemática (un solo tema) o multitemática (varios temas/secciones).
2. Si es monotemática: crea un solo módulo con todos los videos.
3. Si es multitemática: agrupa los videos en módulos lógicos (capítulos, secciones, áreas temáticas).
4. Dale a cada módulo un nombre descriptivo y una breve descripción.
5. Mantén el orden original de los videos dentro de cada módulo.
6. No cambies el orden global de los videos, solo agrúpalos.

Responde SOLO con un JSON válido con esta estructura:
{
  "isMonothematic": boolean,
  "modules": [
    {
      "id": "mod_1",
      "title": "Nombre del módulo",
      "description": "Breve descripción",
      "videoIndices": [0, 1, 2]
    }
  ]
}`,
          },
        ],
      });

      const content = claudeResponse.content[0];
      if (content.type !== "text") throw new Error("Unexpected response type");

      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");

      moduleStructure = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Claude error, using fallback:", error);
      // Fallback: single module with all videos
      moduleStructure = {
        isMonothematic: true,
        modules: [
          {
            id: "mod_1",
            title: playlist.snippet?.title || "Módulo Principal",
            description: "Todos los videos de la playlist",
            videoIndices: allItems.map((_, i) => i),
          },
        ],
      };
    }

    // 6. Build Course object
    const courseId = `course_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const modules: Module[] = moduleStructure.modules.map((mod, moduleIndex) => {
      const videos: Video[] = mod.videoIndices.map((videoIndex, order) => {
        const item = allItems[videoIndex];
        const dur = durationMap[item.videoId] || {
          duration: "0m",
          durationSeconds: 0,
        };
        return {
          id: item.videoId,
          title: item.title,
          description: item.description,
          thumbnailUrl: item.thumbnailUrl,
          duration: dur.duration,
          durationSeconds: dur.durationSeconds,
          order,
          moduleId: mod.id,
        };
      });

      return {
        id: mod.id,
        title: mod.title,
        description: mod.description,
        order: moduleIndex,
        videos,
      };
    });

    const course: Course = {
      id: courseId,
      userId,
      playlistId,
      playlistUrl,
      title: playlist.snippet?.title || "Sin título",
      description: playlist.snippet?.description || "",
      thumbnailUrl:
        playlist.snippet?.thumbnails?.high?.url ||
        playlist.snippet?.thumbnails?.default?.url ||
        "",
      totalVideos: allItems.length,
      totalDuration: formatDuration(totalSeconds),
      modules,
      isMonothematic: moduleStructure.isMonothematic,
      createdAt: Timestamp.now(),
      lastAccessedAt: Timestamp.now(),
    };

    // 7. Save to Firestore
    await setDoc(doc(db, "courses", courseId), course);

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error processing playlist:", error);
    return NextResponse.json(
      { error: "Error al procesar la playlist. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

// Retry helper with exponential backoff
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
  throw new Error("Max retries reached");
}
