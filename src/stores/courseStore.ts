import { create } from "zustand";
import type { Course, UserProgress, Achievement } from "@/lib/types";

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  currentVideoId: string | null;
  progress: Record<string, UserProgress>;
  isLoadingCourses: boolean;
  isProcessingPlaylist: boolean;
  sidebarOpen: boolean;
  newAchievement: Achievement | null;

  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  setCurrentCourse: (course: Course | null) => void;
  setCurrentVideoId: (videoId: string | null) => void;
  setProgress: (courseId: string, progress: UserProgress) => void;
  setIsLoadingCourses: (loading: boolean) => void;
  setIsProcessingPlaylist: (processing: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setNewAchievement: (achievement: Achievement | null) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  currentCourse: null,
  currentVideoId: null,
  progress: {},
  isLoadingCourses: false,
  isProcessingPlaylist: false,
  sidebarOpen: true,
  newAchievement: null,

  setCourses: (courses) => set({ courses }),
  addCourse: (course) =>
    set((state) => ({ courses: [...state.courses, course] })),
  setCurrentCourse: (course) => set({ currentCourse: course }),
  setCurrentVideoId: (videoId) => set({ currentVideoId: videoId }),
  setProgress: (courseId, progress) =>
    set((state) => ({
      progress: { ...state.progress, [courseId]: progress },
    })),
  setIsLoadingCourses: (loading) => set({ isLoadingCourses: loading }),
  setIsProcessingPlaylist: (processing) =>
    set({ isProcessingPlaylist: processing }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setNewAchievement: (achievement) => set({ newAchievement: achievement }),
}));
