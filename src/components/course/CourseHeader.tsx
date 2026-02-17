"use client";

import type { Module } from "@/lib/types";
import { Clock, Video, SkipForward } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { calculateModulePercentage } from "@/utils/progress";
import { formatStudyTime } from "@/utils/progress";

interface CourseHeaderProps {
  module: Module;
  completedVideos: string[];
  isVideoCompleted: boolean;
  nextVideoId: string | null;
  onNextVideo: () => void;
}

export default function CourseHeader({
  module,
  completedVideos,
  isVideoCompleted,
  nextVideoId,
  onNextVideo,
}: CourseHeaderProps) {
  const totalDurationSeconds = module.videos.reduce(
    (sum, v) => sum + v.durationSeconds,
    0
  );
  const completedInModule = module.videos.filter((v) =>
    completedVideos.includes(v.id)
  ).length;
  const percentage = calculateModulePercentage(module, completedVideos);

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-[#1a1a2e] px-5 py-4">
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <Video className="h-4 w-4" />
          <span>{module.videos.length} videos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{formatStudyTime(totalDurationSeconds)}</span>
        </div>
      </div>

      <ProgressBar percentage={percentage} size="lg" />

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{percentage}% complete</span>
        <span className="text-sm text-gray-400">
          {completedInModule} of {module.videos.length} videos completed
        </span>
      </div>

      {isVideoCompleted && nextVideoId && (
        <div className="flex justify-end">
          <button
            onClick={onNextVideo}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Next
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
