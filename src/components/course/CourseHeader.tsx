"use client";

import type { Course, UserProgress } from "@/lib/types";
import { BookOpen, Clock, Video } from "lucide-react";
import ProgressBar from "./ProgressBar";

interface CourseHeaderProps {
  course: Course;
  progress: UserProgress | null;
}

export default function CourseHeader({ course, progress }: CourseHeaderProps) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          <span>{course.modules.length} módulos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Video className="h-4 w-4" />
          <span>{course.totalVideos} videos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{course.totalDuration}</span>
        </div>
      </div>

      <ProgressBar
        percentage={progress?.overallPercentage || 0}
        size="lg"
        showLabel
      />

      {progress && progress.completedVideos.length > 0 && (
        <p className="text-sm text-gray-500">
          {progress.completedVideos.length} de {course.totalVideos} videos completados
        </p>
      )}
    </div>
  );
}
