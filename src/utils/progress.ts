import type { Course, UserProgress, Module } from "@/lib/types";

export function calculateOverallPercentage(
  course: Course,
  completedVideos: string[]
): number {
  if (course.totalVideos === 0) return 0;
  return Math.round((completedVideos.length / course.totalVideos) * 100);
}

export function calculateModulePercentage(
  module: Module,
  completedVideos: string[]
): number {
  if (module.videos.length === 0) return 0;
  const completed = module.videos.filter((v) =>
    completedVideos.includes(v.id)
  ).length;
  return Math.round((completed / module.videos.length) * 100);
}

export function isModuleComplete(
  module: Module,
  completedVideos: string[]
): boolean {
  return module.videos.every((v) => completedVideos.includes(v.id));
}

export function getNextVideo(
  course: Course,
  completedVideos: string[]
): string | null {
  for (const module of course.modules) {
    for (const video of module.videos) {
      if (!completedVideos.includes(video.id)) {
        return video.id;
      }
    }
  }
  return null;
}

export function getTotalWatchedSeconds(
  progress: UserProgress
): number {
  return Object.values(progress.videoProgress).reduce(
    (total, vp) => total + vp.watchedSeconds,
    0
  );
}

export function formatStudyTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
