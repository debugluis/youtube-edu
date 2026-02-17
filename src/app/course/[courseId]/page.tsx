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
import { AchievementBadge, AchievementToast } from "@/components/course/AchievementBadge";
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

  // Restore sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yt-edu-sidebar");
      if (saved !== null) setSidebarOpen(JSON.parse(saved));
    } catch {}
  }, [setSidebarOpen]);

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
      <Navbar title={currentCourse.displayName || currentCourse.title} />

      <div className="flex">
        <Sidebar course={currentCourse} progress={progress} />

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
              />
            )}

            {/* Course content */}
            <div className="mt-6 space-y-6">
              {currentModule && (
                <CourseHeader
                  module={currentModule}
                  completedVideos={progress?.completedVideos || []}
                  isVideoCompleted={isVideoCompleted}
                  nextVideoId={nextVideoId}
                  onNextVideo={() => nextVideoId && setCurrentVideoId(nextVideoId)}
                />
              )}

              {/* Achievements */}
              {progress && progress.achievements.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-400">
                    Achievements Unlocked
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-4">
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
