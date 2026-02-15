"use client";

import { CheckCircle2, PlayCircle, Circle } from "lucide-react";
import type { Video } from "@/lib/types";

interface VideoItemProps {
  video: Video;
  isCompleted: boolean;
  isCurrent: boolean;
  onSelect: () => void;
}

export default function VideoItem({
  video,
  isCompleted,
  isCurrent,
  onSelect,
}: VideoItemProps) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        isCurrent
          ? "bg-emerald-500/10 text-emerald-400"
          : "text-gray-300 hover:bg-white/5"
      }`}
    >
      <span className="shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : isCurrent ? (
          <PlayCircle className="h-4 w-4 text-emerald-400" />
        ) : (
          <Circle className="h-4 w-4 text-gray-600" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm ${
            isCompleted ? "text-gray-500 line-through" : ""
          }`}
        >
          {video.title}
        </p>
        <p className="text-xs text-gray-600">{video.duration}</p>
      </div>
    </button>
  );
}
