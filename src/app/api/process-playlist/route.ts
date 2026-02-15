import { NextRequest, NextResponse } from "next/server";
import youtube, { extractPlaylistId, parseDuration, formatDuration } from "@/lib/youtube";
import anthropic from "@/lib/anthropic";
import { adminDb } from "@/lib/firebase-admin";
import type { Course, Module, Video, ClaudeModuleResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { playlistUrl, userId } = await request.json();

    if (!playlistUrl || !userId) {
      return NextResponse.json(
        { error: "playlistUrl and userId are required" },
        { status: 400 }
      );
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      return NextResponse.json(
        { error: "Invalid URL. Make sure it's a YouTube playlist" },
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
        { error: "This playlist is private or does not exist" },
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
            title: item.snippet?.title || "Untitled",
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
        { error: "The playlist is empty" },
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
    const channelTitle = playlist.snippet?.channelTitle || "";

    let moduleStructure: ClaudeModuleResponse;
    try {
      const claudeResponse = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `You are an educational assistant. I will give you the data from a YouTube playlist.
Your job is to analyze the videos and organize them into logical modules for an educational course.
You must also suggest a URL slug and a professional display name for this course.

Playlist data:
- Title: ${playlist.snippet?.title}
- Channel: ${channelTitle}
- Description: ${playlist.snippet?.description}
- Videos:
${videoSummaries.join("\n")}

Instructions:
1. Generate a "slug": a short, kebab-case URL identifier based on the channel name and topic (e.g., "messer-security-plus", "traversy-react-crash-course"). Use only lowercase letters, numbers, and hyphens. Max 60 characters.
2. Generate a "displayName": a professional course title combining the channel/instructor and topic (e.g., "CompTIA Security+ with Professor Messer", "React Crash Course by Traversy Media").
3. Analyze whether the playlist is monothematic (single topic) or multithematic (multiple topics/sections).
4. If monothematic: create a single module with all videos.
5. If multithematic: group the videos into logical modules (chapters, sections, topic areas).
6. Give each module a descriptive name and a brief description.
7. Maintain the original order of videos within each module.
8. Do not change the global order of videos, only group them.

Respond ONLY with valid JSON using this structure:
{
  "slug": "channel-topic-keyword",
  "displayName": "Professional Course Title",
  "isMonothematic": boolean,
  "modules": [
    {
      "id": "mod_1",
      "title": "Module name",
      "description": "Brief description",
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
        slug: slugify(playlist.snippet?.title || "course"),
        displayName: playlist.snippet?.title || "Untitled Course",
        isMonothematic: true,
        modules: [
          {
            id: "mod_1",
            title: playlist.snippet?.title || "Main Module",
            description: "All videos in the playlist",
            videoIndices: allItems.map((_, i) => i),
          },
        ],
      };
    }

    // 6. Build Course object — use slug as the document ID
    // Validate/fallback the slug
    let slug = moduleStructure.slug;
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      slug = slugify(playlist.snippet?.title || "course");
    }

    const courseId = slug;

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
      title: playlist.snippet?.title || "Untitled",
      displayName: moduleStructure.displayName || playlist.snippet?.title || "Untitled",
      description: playlist.snippet?.description || "",
      thumbnailUrl:
        playlist.snippet?.thumbnails?.high?.url ||
        playlist.snippet?.thumbnails?.default?.url ||
        "",
      totalVideos: allItems.length,
      totalDuration: formatDuration(totalSeconds),
      modules,
      isMonothematic: moduleStructure.isMonothematic,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };

    // 7. Save to Firestore (Admin SDK bypasses security rules)
    await adminDb.collection("courses").doc(courseId).set(course);

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error processing playlist:", error);
    return NextResponse.json(
      { error: "Failed to process playlist. Please try again." },
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

// Convert a string to a kebab-case slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

