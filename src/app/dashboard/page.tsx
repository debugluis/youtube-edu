"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useCourseStore } from "@/stores/courseStore";
import Navbar from "@/components/ui/Navbar";
import PlaylistInput from "@/components/dashboard/PlaylistInput";
import CourseCard from "@/components/dashboard/CourseCard";
import StatsOverview from "@/components/dashboard/StatsOverview";
import type { Course, UserProgress } from "@/lib/types";
import { useTranslation } from "@/hooks/useTranslation";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const {
    courses,
    setCourses,
    removeCourse,
    isLoadingCourses,
    setIsLoadingCourses,
    progress,
    setProgress,
  } = useCourseStore();
  const { t } = useTranslation();
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

  const handleDeleteCourse = async (courseId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "courses", courseId));
    await deleteDoc(doc(db, "progress", `${user.uid}_${courseId}`));
    removeCourse(courseId);
  };

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
              {t("dashboard.myCourses")}
            </h2>

            {isLoadingCourses ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : courses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
                <p className="text-gray-500">{t("dashboard.noCourses")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={progress[course.id] || null}
                    onClick={() => router.push(`/course/${course.id}`)}
                    onDelete={handleDeleteCourse}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </main>
    </div>
  );
}
