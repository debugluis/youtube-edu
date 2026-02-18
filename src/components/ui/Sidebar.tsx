"use client";

import { useCourseStore } from "@/stores/courseStore";
import { PanelLeft, PanelLeftClose, Check } from "lucide-react";
import type { Course, UserProgress } from "@/lib/types";
import ModuleCard from "@/components/course/ModuleCard";
import ProgressBar from "@/components/course/ProgressBar";
import { calculateModulePercentage } from "@/utils/progress";
import { useTranslation } from "@/hooks/useTranslation";

interface SidebarProps {
  course: Course;
  progress: UserProgress | null;
}

export default function Sidebar({ course, progress }: SidebarProps) {
  const { t } = useTranslation();
  const {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    currentVideoId,
    setCurrentVideoId,
  } = useCourseStore();
  const completedVideos = progress?.completedVideos || [];

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] shrink-0 overflow-x-hidden overflow-y-auto border-r border-white/10 bg-[#0f0f0f] transition-all duration-300 lg:sticky lg:z-0 ${
          sidebarOpen ? "w-80" : "w-14"
        }`}
      >
        {sidebarOpen ? (
          <div className="w-80">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                {t("sidebar.overallProgress")}
              </p>
              <button
                onClick={toggleSidebar}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-white/10 px-4 py-3">
              <ProgressBar percentage={progress?.overallPercentage || 0} size="lg" />
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
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-3">
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Expand sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>

            <div className="mt-4 flex flex-col gap-1.5">
              {course.modules.map((module, i) => {
                const percentage = calculateModulePercentage(module, completedVideos);
                const isComplete = percentage === 100;
                const isCurrentModule = module.videos.some((v) => v.id === currentVideoId);

                return (
                  <button
                    key={module.id}
                    onClick={() => {
                      const firstVideo = module.videos[0];
                      if (firstVideo) setCurrentVideoId(firstVideo.id);
                      setSidebarOpen(true);
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                      isCurrentModule
                        ? "bg-emerald-500/20 text-emerald-400"
                        : isComplete
                          ? "bg-emerald-500/10 text-emerald-500/70"
                          : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                    }`}
                    title={module.title}
                  >
                    {isComplete ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
