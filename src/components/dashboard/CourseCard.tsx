"use client";

import { motion } from "framer-motion";
import { Video, Clock } from "lucide-react";
import type { Course, UserProgress } from "@/lib/types";
import ProgressBar from "@/components/course/ProgressBar";

interface CourseCardProps {
  course: Course;
  progress: UserProgress | null;
  onClick: () => void;
}

export default function CourseCard({ course, progress, onClick }: CourseCardProps) {
  const percentage = progress?.overallPercentage || 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#1a1a2e] transition-colors hover:border-emerald-500/30"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {percentage === 100 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-4xl">🎓</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-sm font-medium text-white group-hover:text-emerald-400">
          {course.displayName || course.title}
        </h3>

        <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Video className="h-3 w-3" />
            <span>{course.totalVideos} videos</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{course.totalDuration}</span>
          </div>
        </div>

        <ProgressBar percentage={percentage} size="sm" />
        <p className="mt-1.5 text-xs text-gray-500">{percentage}% complete</p>
      </div>
    </motion.div>
  );
}
