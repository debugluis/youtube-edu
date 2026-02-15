import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
}

export interface Course {
  id: string;
  userId: string;
  playlistId: string;
  playlistUrl: string;
  title: string;
  displayName: string;
  description: string;
  thumbnailUrl: string;
  totalVideos: number;
  totalDuration: string;
  modules: Module[];
  isMonothematic: boolean;
  createdAt: Timestamp;
  lastAccessedAt: Timestamp;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  videos: Video[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  durationSeconds: number;
  order: number;
  moduleId: string;
}

export interface VideoProgress {
  watchedSeconds: number;
  percentage: number;
  lastWatchedAt: Timestamp;
  completedAt?: Timestamp;
  completionMethod: "auto" | "manual";
}

export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  completedVideos: string[];
  videoProgress: Record<string, VideoProgress>;
  achievements: Achievement[];
  overallPercentage: number;
  startedAt: Timestamp;
  lastActivityAt: Timestamp;
}

export interface Achievement {
  id: string;
  type: AchievementType;
  unlockedAt: Timestamp;
  courseId: string;
}

export type AchievementType =
  | "first_video"
  | "module_complete"
  | "half_course"
  | "course_complete"
  | "streak_3"
  | "streak_7"
  | "night_owl"
  | "early_bird"
  | "speed_learner"
  | "dedicated";

export interface AchievementDefinition {
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
}

export interface PlaylistProcessRequest {
  playlistUrl: string;
}

export interface PlaylistProcessResponse {
  course: Course;
}

export interface ClaudeModuleResponse {
  slug: string;
  displayName: string;
  isMonothematic: boolean;
  modules: {
    id: string;
    title: string;
    description: string;
    videoIndices: number[];
  }[];
}
