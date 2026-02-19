"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useCourseStore } from "@/stores/courseStore";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { getNextVideo } from "@/utils/progress";
import { Trophy } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Sidebar from "@/components/ui/Sidebar";
import AchievementsSidebar from "@/components/ui/AchievementsSidebar";
import VideoPlayer from "@/components/course/VideoPlayer";
import CourseHeader from "@/components/course/CourseHeader";
import { AchievementToast } from "@/components/course/AchievementBadge";
import { useTranslation } from "@/hooks/useTranslation";
import type { Course } from "@/lib/types";

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
    setSidebarOpen,
    newAchievement,
    setNewAchievement,
    rightSidebarOpen,
    setRightSidebarOpen,
  } = useCourseStore();

  const { t } = useTranslation();
  const { progress, updateVideoProgress, markVideoComplete } =
    useCourseProgress(user?.uid, currentCourse);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

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

  // Restore sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yt-edu-sidebar");
      if (saved !== null) setSidebarOpen(JSON.parse(saved));
    } catch {}
  }, [setSidebarOpen]);

  // Restore right sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yt-edu-right-sidebar");
      if (saved !== null) setRightSidebarOpen(JSON.parse(saved));
    } catch {}
  }, [setRightSidebarOpen]);

  // Dynamic browser tab title
  useEffect(() => {
    if (currentCourse) {
      document.title = `${currentCourse.displayName || currentCourse.title} | YouTube Edu`;
    }
    return () => {
      document.title = "YouTube Edu - Learn with YouTube";
    };
  }, [currentCourse]);

  // Find current video object and its parent module
  const { currentVideo, currentModule } = useMemo(() => {
    if (!currentCourse || !currentVideoId)
      return { currentVideo: null, currentModule: null };
    for (const module of currentCourse.modules) {
      const video = module.videos.find((v) => v.id === currentVideoId);
      if (video) return { currentVideo: video, currentModule: module };
    }
    return { currentVideo: null, currentModule: null };
  }, [currentCourse, currentVideoId]);

  const isVideoCompleted = useMemo(
    () =>
      currentVideoId
        ? progress?.completedVideos.includes(currentVideoId) || false
        : false,
    [currentVideoId, progress]
  );

  // Find the next sequential video across all modules
  const nextVideoId = useMemo(() => {
    if (!currentCourse || !currentVideoId) return null;
    const allVideos = currentCourse.modules.flatMap((m) => m.videos);
    const currentIndex = allVideos.findIndex((v) => v.id === currentVideoId);
    if (currentIndex === -1 || currentIndex >= allVideos.length - 1) return null;
    return allVideos[currentIndex + 1].id;
  }, [currentCourse, currentVideoId]);

  const handleProgress = useCallback(
    (watchedSeconds: number, percentage: number) => {
      if (currentVideoId) {
        updateVideoProgress(currentVideoId, watchedSeconds, percentage);
      }
    },
    [currentVideoId, updateVideoProgress]
  );

  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);

  const handleComplete = useCallback(
    (method: "auto" | "manual") => {
      if (currentVideoId) {
        markVideoComplete(currentVideoId, method);
      }
    },
    [currentVideoId, markVideoComplete]
  );

  const handleVideoEnd = useCallback(() => {
    if (nextVideoId) {
      setAutoAdvanceCountdown(5);
    }
  }, [nextVideoId]);

  // Countdown tick
  useEffect(() => {
    if (autoAdvanceCountdown === null) return;
    if (autoAdvanceCountdown === 0) {
      if (nextVideoId) setCurrentVideoId(nextVideoId);
      setAutoAdvanceCountdown(null);
      return;
    }
    const timer = setTimeout(() => setAutoAdvanceCountdown((n) => (n !== null ? n - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [autoAdvanceCountdown, nextVideoId, setCurrentVideoId]);

  // Reset countdown on video change
  useEffect(() => {
    setAutoAdvanceCountdown(null);
  }, [currentVideoId]);

  const handleCancelAutoAdvance = useCallback(() => setAutoAdvanceCountdown(null), []);

  const handleSkipNow = useCallback(() => {
    if (nextVideoId) setCurrentVideoId(nextVideoId);
    setAutoAdvanceCountdown(null);
  }, [nextVideoId, setCurrentVideoId]);

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
      <Navbar
        title={currentCourse.displayName || currentCourse.title}
        achievementCount={progress?.achievements.length}
        onAchievementsClick={() => setRightSidebarOpen(true)}
      />

      <div className="flex">
        <Sidebar course={currentCourse} progress={progress} videoProgress={progress?.videoProgress || {}} />

        <main
          className={`min-w-0 flex-1 transition-all duration-300 ${
            !sidebarOpen ? "pl-14 lg:pl-0" : ""
          }`}
        >
          <div className="mx-auto max-w-[1200px] px-2 pt-4 md:px-4">
            {/* Video player */}
            {currentVideo && (
              <VideoPlayer
                video={currentVideo}
                isCompleted={isVideoCompleted}
                onProgress={handleProgress}
                onComplete={handleComplete}
                onVideoEnd={handleVideoEnd}
              />
            )}

            {/* Course content */}
            <div className="mt-6 space-y-6">
              {currentModule && (
                <CourseHeader
                  module={currentModule}
                  completedVideos={progress?.completedVideos || []}
                  videoProgress={progress?.videoProgress || {}}
                  isVideoCompleted={isVideoCompleted}
                  nextVideoId={nextVideoId}
                  countdown={autoAdvanceCountdown}
                  onCancelAutoAdvance={handleCancelAutoAdvance}
                  onSkipNow={handleSkipNow}
                />
              )}

            </div>

          </div>
        </main>

        <AchievementsSidebar progress={progress} />
      </div>

      {/* Mobile floating trophy button */}
      <button
        onClick={() => setRightSidebarOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-600 lg:hidden ${
          rightSidebarOpen ? "hidden" : ""
        }`}
      >
        <Trophy className="h-5 w-5 text-white" />
        {progress && progress.achievements.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-600">
            {progress.achievements.length}
          </span>
        )}
      </button>

      {/* Achievement toast */}
      <AchievementToast
        type={newAchievement?.type || null}
        onDismiss={() => setNewAchievement(null)}
      />
    </div>
  );
}
