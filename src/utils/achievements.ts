import {
  Play,
  BookCheck,
  Target,
  GraduationCap,
  Flame,
  Zap,
  Moon,
  Sunrise,
  FastForward,
  Trophy,
} from "lucide-react";
import type {
  AchievementType,
  AchievementDefinition,
  UserProgress,
  Course,
} from "@/lib/types";

export const ACHIEVEMENTS: Record<AchievementType, AchievementDefinition> = {
  first_video: {
    type: "first_video",
    title: "First Step",
    description: "Completed your first video",
    icon: Play,
  },
  module_complete: {
    type: "module_complete",
    title: "Module Mastered",
    description: "Completed an entire module",
    icon: BookCheck,
  },
  half_course: {
    type: "half_course",
    title: "Halfway There",
    description: "Completed 50% of the course",
    icon: Target,
  },
  course_complete: {
    type: "course_complete",
    title: "Graduate",
    description: "Completed the entire course!",
    icon: GraduationCap,
  },
  streak_3: {
    type: "streak_3",
    title: "On a Roll",
    description: "3 consecutive days studying",
    icon: Flame,
  },
  streak_7: {
    type: "streak_7",
    title: "Unstoppable",
    description: "7 consecutive days studying",
    icon: Zap,
  },
  night_owl: {
    type: "night_owl",
    title: "Night Owl",
    description: "Studied after 11pm",
    icon: Moon,
  },
  early_bird: {
    type: "early_bird",
    title: "Early Bird",
    description: "Studied before 7am",
    icon: Sunrise,
  },
  speed_learner: {
    type: "speed_learner",
    title: "Speed Learner",
    description: "5 videos in a single day",
    icon: FastForward,
  },
  dedicated: {
    type: "dedicated",
    title: "Fully Dedicated",
    description: "10 total hours of study",
    icon: Trophy,
  },
};

export function checkAchievements(
  progress: UserProgress,
  course: Course
): AchievementType[] {
  const unlocked = progress.achievements.map((a) => a.type);
  const newAchievements: AchievementType[] = [];

  const checks: Record<AchievementType, () => boolean> = {
    first_video: () => progress.completedVideos.length >= 1,
    module_complete: () =>
      course.modules.some((module) =>
        module.videos.every((v) => progress.completedVideos.includes(v.id))
      ),
    half_course: () => progress.overallPercentage >= 50,
    course_complete: () => progress.overallPercentage >= 100,
    streak_3: () => calculateStreak(progress) >= 3,
    streak_7: () => calculateStreak(progress) >= 7,
    night_owl: () => new Date().getHours() >= 23,
    early_bird: () => new Date().getHours() < 7,
    speed_learner: () => getVideosCompletedToday(progress) >= 5,
    dedicated: () => getTotalWatchTime(progress) >= 36000,
  };

  for (const [type, check] of Object.entries(checks)) {
    const achievementType = type as AchievementType;
    if (!unlocked.includes(achievementType) && check()) {
      newAchievements.push(achievementType);
    }
  }

  return newAchievements;
}

function calculateStreak(progress: UserProgress): number {
  const dates = Object.values(progress.videoProgress)
    .filter((vp) => vp.completedAt)
    .map((vp) => {
      const date = vp.completedAt!.toDate();
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    });

  const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);

  if (uniqueDates.length === 0) return 0;

  let streak = 1;
  const oneDay = 86400000;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    if (uniqueDates[i] - uniqueDates[i + 1] === oneDay) {
      streak++;
    } else {
      break;
    }
  }

  // Check if the streak includes today or yesterday
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const diff = todayStart - uniqueDates[0];

  if (diff > oneDay) return 0; // streak is broken

  return streak;
}

function getVideosCompletedToday(progress: UserProgress): number {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  return Object.values(progress.videoProgress).filter((vp) => {
    if (!vp.completedAt) return false;
    return vp.completedAt.toDate().getTime() >= todayStart;
  }).length;
}

function getTotalWatchTime(progress: UserProgress): number {
  return Object.values(progress.videoProgress).reduce(
    (total, vp) => total + vp.watchedSeconds,
    0
  );
}
