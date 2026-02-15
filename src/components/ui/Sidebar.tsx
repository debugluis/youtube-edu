"use client";

import { useCourseStore } from "@/stores/courseStore";
import { X } from "lucide-react";
import type { Course, UserProgress } from "@/lib/types";
import ModuleCard from "@/components/course/ModuleCard";
import ProgressBar from "@/components/course/ProgressBar";

interface SidebarProps {
  course: Course;
  progress: UserProgress | null;
}

export default function Sidebar({ course, progress }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen, currentVideoId, setCurrentVideoId } =
    useCourseStore();
  const completedVideos = progress?.completedVideos || [];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-80 transform overflow-y-auto border-r border-white/10 bg-[#0f0f0f] transition-transform duration-300 lg:static lg:z-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-sm font-medium text-white">Contents</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-white/10 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
            Overall Progress
          </p>
          <ProgressBar
            percentage={progress?.overallPercentage || 0}
            size="lg"
          />
        </div>

        <div className="space-y-1 p-3">
          {course.modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              completedVideos={completedVideos}
              currentVideoId={currentVideoId}
              onVideoSelect={(videoId) => {
                setCurrentVideoId(videoId);
                setSidebarOpen(false);
              }}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
