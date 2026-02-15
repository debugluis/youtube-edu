import { NextRequest, NextResponse } from "next/server";
import youtube, { extractPlaylistId } from "@/lib/youtube";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playlistUrl = searchParams.get("playlistUrl");

  if (!playlistUrl) {
    return NextResponse.json(
      { error: "playlistUrl is required" },
      { status: 400 }
    );
  }

  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId) {
    return NextResponse.json(
      { error: "Invalid URL" },
      { status: 400 }
    );
  }

  try {
    const response = await youtube.playlists.list({
      part: ["snippet", "contentDetails"],
      id: [playlistId],
    });

    const playlist = response.data.items?.[0];
    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: playlist.id,
      title: playlist.snippet?.title,
      description: playlist.snippet?.description,
      thumbnailUrl: playlist.snippet?.thumbnails?.high?.url,
      videoCount: playlist.contentDetails?.itemCount,
    });
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube data" },
      { status: 500 }
    );
  }
}
