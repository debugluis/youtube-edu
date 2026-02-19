"use client";

import type { Module, VideoProgress } from "@/lib/types";
import { Clock, Video, SkipForward, X } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { calculateLiveModulePercentage, formatStudyTime } from "@/utils/progress";
import { useTranslation } from "@/hooks/useTranslation";

interface CourseHeaderProps {
  module: Module;
  completedVideos: string[];
  videoProgress: Record<string, VideoProgress>;
  isVideoCompleted: boolean;
  nextVideoId: string | null;
  countdown: number | null;
  onCancelAutoAdvance: () => void;
  onSkipNow: () => void;
}

export default function CourseHeader({
  module,
  completedVideos,
  videoProgress,
  isVideoCompleted,
  nextVideoId,
  countdown,
  onCancelAutoAdvance,
  onSkipNow,
}: CourseHeaderProps) {
  const { t } = useTranslation();
  const totalDurationSeconds = module.videos.reduce((sum, v) => sum + v.durationSeconds, 0);
  const completedInModule = module.videos.filter((v) => completedVideos.includes(v.id)).length;
  const percentage = calculateLiveModulePercentage(module, videoProgress);

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-[#1a1a2e] px-5 py-4">
      {/* Stats row — buttons slot in on the right, no height change */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1.5">
            <Video className="h-4 w-4" />
            <span>{t("course.videos", { n: String(module.videos.length) })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{formatStudyTime(totalDurationSeconds)}</span>
          </div>
        </div>

        {isVideoCompleted && (
          <div className="flex items-center gap-2">
            {countdown !== null && (
              <button
                onClick={onCancelAutoAdvance}
                className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-500 transition-colors hover:bg-white/15 hover:text-gray-300"
              >
                <X className="h-3 w-3" />
                {countdown}s
              </button>
            )}
            {nextVideoId ? (
              <button
                onClick={onSkipNow}
                className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-0.5 text-xs font-medium text-white transition-colors hover:bg-emerald-600"
              >
                {t("course.next")}
                <SkipForward className="h-3 w-3" />
              </button>
            ) : (
              <span className="text-xs font-medium text-emerald-400">
                {t("course.courseComplete")}
              </span>
            )}
          </div>
        )}
      </div>

      <ProgressBar percentage={percentage} size="lg" />

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {t("course.percentComplete", { n: String(percentage) })}
        </span>
        <span className="text-sm text-gray-400">
          {t("course.videosCompletedOf", {
            completed: String(completedInModule),
            total: String(module.videos.length),
          })}
        </span>
      </div>
    </div>
  );
}
