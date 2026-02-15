"use client";

import { BookOpen, CheckCircle2, Clock } from "lucide-react";
import type { Course, UserProgress } from "@/lib/types";
import { formatStudyTime, getTotalWatchedSeconds } from "@/utils/progress";

interface StatsOverviewProps {
  courses: Course[];
  progressMap: Record<string, UserProgress>;
}

export default function StatsOverview({ courses, progressMap }: StatsOverviewProps) {
  const totalCourses = courses.length;
  const totalCompletedVideos = Object.values(progressMap).reduce(
    (total, p) => total + p.completedVideos.length,
    0
  );
  const totalStudyTime = Object.values(progressMap).reduce(
    (total, p) => total + getTotalWatchedSeconds(p),
    0
  );

  const stats = [
    {
      icon: BookOpen,
      label: "Courses",
      value: totalCourses.toString(),
    },
    {
      icon: CheckCircle2,
      label: "Videos completed",
      value: totalCompletedVideos.toString(),
    },
    {
      icon: Clock,
      label: "Study time",
      value: formatStudyTime(totalStudyTime),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#1a1a2e] p-4"
        >
          <div className="rounded-lg bg-emerald-500/10 p-3">
            <stat.icon className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
