"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import type { Video } from "@/lib/types";
import { useTranslation } from "@/hooks/useTranslation";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerProps {
  video: Video;
  isCompleted: boolean;
  onProgress: (watchedSeconds: number, percentage: number) => void;
  onComplete: (method: "auto" | "manual") => void;
  onVideoEnd: () => void;
}

export default function VideoPlayer({ video, isCompleted, onProgress, onComplete, onVideoEnd }: VideoPlayerProps) {
  const { t } = useTranslation();
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [manualComplete, setManualComplete] = useState(isCompleted);

  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  const onVideoEndRef = useRef(onVideoEnd);
  const isCompletedRef = useRef(isCompleted);

  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onVideoEndRef.current = onVideoEnd; }, [onVideoEnd]);
  useEffect(() => { isCompletedRef.current = isCompleted; }, [isCompleted]);

  useEffect(() => {
    if (window.YT) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }, []);

  useEffect(() => {
    setManualComplete(isCompleted);
  }, [isCompleted]);

  useEffect(() => {
    const startTracking = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (!playerRef.current) return;
        try {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          if (duration > 0) {
            const percentage = (currentTime / duration) * 100;
            onProgressRef.current(currentTime, percentage);
            if (percentage >= 90 && !isCompletedRef.current) {
              onCompleteRef.current("auto");
            }
          }
        } catch {}
      }, 5000);
    };

    const stopTracking = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      playerRef.current = new window.YT.Player("yt-player", {
        videoId: video.id,
        playerVars: { autoplay: 0, rel: 0, iv_load_policy: 3 },
        events: {
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              startTracking();
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              stopTracking();
            }
            if (event.data === window.YT.PlayerState.ENDED) {
              onCompleteRef.current("auto");
              onVideoEndRef.current();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [video.id]);

  const handleManualToggle = () => {
    if (!manualComplete) {
      setManualComplete(true);
      onComplete("manual");
    }
  };

  return (
    <div className="space-y-4">
      {/* Player */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        <div id="yt-player" ref={containerRef} className="h-full w-full" />
        {isCompleted && (
          <div className="pointer-events-none absolute right-3 top-3">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-medium text-white">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("course.completed")}
            </div>
          </div>
        )}
      </div>

      {/* Video title + mark as watched */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold text-white">{video.title}</h2>

        <button
          onClick={handleManualToggle}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
            manualComplete || isCompleted
              ? "bg-emerald-500/20 text-emerald-400"
              : "border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          {manualComplete || isCompleted ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
          {manualComplete || isCompleted ? t("course.watched") : t("course.markAsWatched")}
        </button>
      </div>
    </div>
  );
}
