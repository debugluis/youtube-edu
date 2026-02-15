"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useCourseStore } from "@/stores/courseStore";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { getNextVideo } from "@/utils/progress";
import Navbar from "@/components/ui/Navbar";
import Sidebar from "@/components/ui/Sidebar";
import VideoPlayer from "@/components/course/VideoPlayer";
import CourseHeader from "@/components/course/CourseHeader";
import ProgressBar from "@/components/course/ProgressBar";
import { AchievementBadge, AchievementToast } from "@/components/course/AchievementBadge";
import { calculateModulePercentage } from "@/utils/progress";
import type { Course, Video } from "@/lib/types";

export default function CoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    currentCourse,
    setCurrentCourse,
    currentVideoId,
    setCurrentVideoId,
    sidebarOpen,
    newAchievement,
    setNewAchievement,
  } = useCourseStore();

  const { progress, updateVideoProgress, markVideoComplete } =
    useCourseProgress(user?.uid, currentCourse);

  // Load course
  useEffect(() => {
    if (!user || !courseId) return;

    const loadCourse = async () => {
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        const course = courseSnap.data() as Course;
        setCurrentCourse(course);

        // Update last accessed
        await updateDoc(courseRef, { lastAccessedAt: Timestamp.now() });
      } else {
        router.push("/dashboard");
      }
    };

    loadCourse();

    return () => {
      setCurrentCourse(null);
      setCurrentVideoId(null);
    };
  }, [user, courseId, setCurrentCourse, setCurrentVideoId, router]);

  // Set initial video
  useEffect(() => {
    if (currentCourse && !currentVideoId && progress) {
      const nextVideo = getNextVideo(
        currentCourse,
        progress.completedVideos
      );
      if (nextVideo) {
        setCurrentVideoId(nextVideo);
      } else if (currentCourse.modules[0]?.videos[0]) {
        setCurrentVideoId(currentCourse.modules[0].videos[0].id);
      }
    }
  }, [currentCourse, currentVideoId, progress, setCurrentVideoId]);

  // Find current video object
  const currentVideo = useMemo((): Video | null => {
    if (!currentCourse || !currentVideoId) return null;
    for (const module of currentCourse.modules) {
      const video = module.videos.find((v) => v.id === currentVideoId);
      if (video) return video;
    }
    return null;
  }, [currentCourse, currentVideoId]);

  const isVideoCompleted = useMemo(
    () =>
      currentVideoId
        ? progress?.completedVideos.includes(currentVideoId) || false
        : false,
    [currentVideoId, progress]
  );

  const handleProgress = useCallback(
    (watchedSeconds: number, percentage: number) => {
      if (currentVideoId) {
        updateVideoProgress(currentVideoId, watchedSeconds, percentage);
      }
    },
    [currentVideoId, updateVideoProgress]
  );

  const handleComplete = useCallback(
    (method: "auto" | "manual") => {
      if (currentVideoId) {
        markVideoComplete(currentVideoId, method);
      }
    },
    [currentVideoId, markVideoComplete]
  );

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar title={currentCourse.title} showMenuButton />

      <div className="flex">
        <Sidebar course={currentCourse} progress={progress} />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "lg:ml-0" : ""
          }`}
        >
          <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
            {/* Video player */}
            {currentVideo && (
              <VideoPlayer
                video={currentVideo}
                isCompleted={isVideoCompleted}
                onProgress={handleProgress}
                onComplete={handleComplete}
              />
            )}

            {/* Course info */}
            <div className="mt-8 space-y-6">
              <CourseHeader course={currentCourse} progress={progress} />

              {/* Module progress */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400">
                  Progreso por Módulo
                </h3>
                {currentCourse.modules.map((module) => {
                  const pct = calculateModulePercentage(
                    module,
                    progress?.completedVideos || []
                  );
                  return (
                    <div
                      key={module.id}
                      className="rounded-lg border border-white/5 bg-[#1a1a2e] p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-white">
                          {module.title}
                        </span>
                        <span className="text-xs text-gray-500">{pct}%</span>
                      </div>
                      <ProgressBar percentage={pct} size="sm" />
                    </div>
                  );
                })}
              </div>

              {/* Achievements */}
              {progress && progress.achievements.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-400">
                    Logros Desbloqueados
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {progress.achievements.map((achievement) => (
                      <AchievementBadge
                        key={achievement.id}
                        type={achievement.type}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Achievement toast */}
      <AchievementToast
        type={newAchievement?.type || null}
        onDismiss={() => setNewAchievement(null)}
      />
    </div>
  );
}
