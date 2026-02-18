import { create } from "zustand";
import type { Course, UserProgress, Achievement, AchievementType } from "@/lib/types";

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  currentVideoId: string | null;
  progress: Record<string, UserProgress>;
  isLoadingCourses: boolean;
  isProcessingPlaylist: boolean;
  sidebarOpen: boolean;
  newAchievement: Achievement | null;
  rightSidebarOpen: boolean;
  selectedAchievement: AchievementType | null;
  language: "en" | "es";

  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  removeCourse: (courseId: string) => void;
  setCurrentCourse: (course: Course | null) => void;
  setCurrentVideoId: (videoId: string | null) => void;
  setProgress: (courseId: string, progress: UserProgress) => void;
  setIsLoadingCourses: (loading: boolean) => void;
  setIsProcessingPlaylist: (processing: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setNewAchievement: (achievement: Achievement | null) => void;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
  setSelectedAchievement: (type: AchievementType | null) => void;
  setLanguage: (language: "en" | "es") => void;
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
  rightSidebarOpen: false,
  selectedAchievement: null,
  language: "en",

  setCourses: (courses) => set({ courses }),
  addCourse: (course) =>
    set((state) => ({ courses: [...state.courses, course] })),
  removeCourse: (courseId) =>
    set((state) => ({
      courses: state.courses.filter((c) => c.id !== courseId),
      progress: Object.fromEntries(
        Object.entries(state.progress).filter(([key]) => key !== courseId)
      ),
    })),
  setCurrentCourse: (course) => set({ currentCourse: course }),
  setCurrentVideoId: (videoId) => set({ currentVideoId: videoId }),
  setProgress: (courseId, progress) =>
    set((state) => ({
      progress: { ...state.progress, [courseId]: progress },
    })),
  setIsLoadingCourses: (loading) => set({ isLoadingCourses: loading }),
  setIsProcessingPlaylist: (processing) =>
    set({ isProcessingPlaylist: processing }),
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarOpen;
      try { localStorage.setItem("yt-edu-sidebar", JSON.stringify(next)); } catch {}
      return { sidebarOpen: next };
    }),
  setSidebarOpen: (open) => {
    try { localStorage.setItem("yt-edu-sidebar", JSON.stringify(open)); } catch {}
    set({ sidebarOpen: open });
  },
  setNewAchievement: (achievement) => set({ newAchievement: achievement }),
  toggleRightSidebar: () =>
    set((state) => {
      const next = !state.rightSidebarOpen;
      try { localStorage.setItem("yt-edu-right-sidebar", JSON.stringify(next)); } catch {}
      return { rightSidebarOpen: next };
    }),
  setRightSidebarOpen: (open) => {
    try { localStorage.setItem("yt-edu-right-sidebar", JSON.stringify(open)); } catch {}
    set({ rightSidebarOpen: open });
  },
  setSelectedAchievement: (type) => set({ selectedAchievement: type }),
  setLanguage: (language) => set({ language }),
}));
