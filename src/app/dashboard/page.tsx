"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useCourseStore } from "@/stores/courseStore";
import Navbar from "@/components/ui/Navbar";
import PlaylistInput from "@/components/dashboard/PlaylistInput";
import CourseCard from "@/components/dashboard/CourseCard";
import StatsOverview from "@/components/dashboard/StatsOverview";
import type { Course, UserProgress } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const {
    courses,
    setCourses,
    isLoadingCourses,
    setIsLoadingCourses,
    progress,
    setProgress,
  } = useCourseStore();
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Load user courses
  useEffect(() => {
    if (!user || hasFetched) return;

    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const coursesQuery = query(
          collection(db, "courses"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(coursesQuery);
        const userCourses = snapshot.docs.map((d) => d.data() as Course);
        setCourses(userCourses);

        // Load progress for each course
        for (const course of userCourses) {
          const progressId = `${user.uid}_${course.id}`;
          const progressRef = doc(db, "progress", progressId);
          const progressSnap = await getDoc(progressRef);
          if (progressSnap.exists()) {
            setProgress(course.id, progressSnap.data() as UserProgress);
          }
        }
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setIsLoadingCourses(false);
        setHasFetched(true);
      }
    };

    fetchCourses();
  }, [user, hasFetched, setCourses, setIsLoadingCourses, setProgress]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Playlist input */}
          <PlaylistInput
            userId={user.uid}
            onCourseCreated={(courseId) => router.push(`/course/${courseId}`)}
          />

          {/* Stats */}
          {courses.length > 0 && (
            <StatsOverview courses={courses} progressMap={progress} />
          )}

          {/* Courses grid */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-white">
              My Courses
            </h2>

            {isLoadingCourses ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : courses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
                <p className="text-gray-500">
                  No courses yet. Paste a playlist URL above to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={progress[course.id] || null}
                    onClick={() => router.push(`/course/${course.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <div className="mt-12 flex justify-center pb-8">
          <a
            href="https://buymeacoffee.com/debugluis"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-base text-gray-300 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/20 hover:text-white"
          >
            <Coffee className="h-4 w-4" />
            Buy me a coffee
          </a>
        </div>
      </main>
    </div>
  );
}
