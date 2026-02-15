"use client";

import { useCallback, useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCourseStore } from "@/stores/courseStore";
import { checkAchievements, ACHIEVEMENTS } from "@/utils/achievements";
import { calculateOverallPercentage } from "@/utils/progress";
import type { UserProgress, Course, Achievement } from "@/lib/types";

export function useCourseProgress(userId: string | undefined, course: Course | null) {
  const { progress, setProgress, setNewAchievement } = useCourseStore();
  const courseProgress = course ? progress[course.id] : null;

  // Load progress from Firestore
  useEffect(() => {
    if (!userId || !course || !course.id) return;

    const progressId = `${userId}_${course.id}`;
    const progressRef = doc(db, "progress", progressId);

    getDoc(progressRef).then((snap) => {
      if (snap.exists()) {
        setProgress(course.id, snap.data() as UserProgress);
      } else {
        const initial: UserProgress = {
          id: progressId,
          userId,
          courseId: course.id,
          completedVideos: [],
          videoProgress: {},
          achievements: [],
          overallPercentage: 0,
          startedAt: Timestamp.now(),
          lastActivityAt: Timestamp.now(),
        };
        setDoc(progressRef, initial);
        setProgress(course.id, initial);
      }
    });
  }, [userId, course, setProgress]);

  const updateVideoProgress = useCallback(
    async (videoId: string, watchedSeconds: number, percentage: number) => {
      if (!userId || !course || !courseProgress) return;

      const progressId = `${userId}_${course.id}`;
      const progressRef = doc(db, "progress", progressId);

      const updated: UserProgress = {
        ...courseProgress,
        videoProgress: {
          ...courseProgress.videoProgress,
          [videoId]: {
            ...(courseProgress.videoProgress[videoId] || {}),
            watchedSeconds,
            percentage,
            lastWatchedAt: Timestamp.now(),
            completionMethod:
              courseProgress.videoProgress[videoId]?.completionMethod || "auto",
          },
        },
        lastActivityAt: Timestamp.now(),
      };

      setProgress(course.id, updated);
      await updateDoc(progressRef, {
        [`videoProgress.${videoId}.watchedSeconds`]: watchedSeconds,
        [`videoProgress.${videoId}.percentage`]: percentage,
        [`videoProgress.${videoId}.lastWatchedAt`]: Timestamp.now(),
        lastActivityAt: Timestamp.now(),
      });
    },
    [userId, course, courseProgress, setProgress]
  );

  const markVideoComplete = useCallback(
    async (videoId: string, method: "auto" | "manual") => {
      if (!userId || !course || !courseProgress) return;
      if (courseProgress.completedVideos.includes(videoId)) return;

      const progressId = `${userId}_${course.id}`;
      const progressRef = doc(db, "progress", progressId);

      const newCompleted = [...courseProgress.completedVideos, videoId];
      const overallPercentage = calculateOverallPercentage(course, newCompleted);

      const updated: UserProgress = {
        ...courseProgress,
        completedVideos: newCompleted,
        videoProgress: {
          ...courseProgress.videoProgress,
          [videoId]: {
            watchedSeconds:
              courseProgress.videoProgress[videoId]?.watchedSeconds || 0,
            percentage: 100,
            lastWatchedAt: Timestamp.now(),
            completedAt: Timestamp.now(),
            completionMethod: method,
          },
        },
        overallPercentage,
        lastActivityAt: Timestamp.now(),
      };

      // Check for new achievements
      const newAchievementTypes = checkAchievements(updated, course);
      if (newAchievementTypes.length > 0) {
        const newAchievements: Achievement[] = newAchievementTypes.map((type) => ({
          id: `${course.id}_${type}`,
          type,
          unlockedAt: Timestamp.now(),
          courseId: course.id,
        }));

        updated.achievements = [...updated.achievements, ...newAchievements];

        // Show toast for first new achievement
        setNewAchievement(newAchievements[0]);
      }

      setProgress(course.id, updated);
      await setDoc(progressRef, updated);
    },
    [userId, course, courseProgress, setProgress, setNewAchievement]
  );

  return {
    progress: courseProgress,
    updateVideoProgress,
    markVideoComplete,
  };
}
