import type {
  AchievementType,
  AchievementDefinition,
  UserProgress,
  Course,
} from "@/lib/types";

export const ACHIEVEMENTS: Record<AchievementType, AchievementDefinition> = {
  first_video: {
    type: "first_video",
    title: "Primer Paso",
    description: "Completaste tu primer video",
    icon: "🎬",
  },
  module_complete: {
    type: "module_complete",
    title: "Módulo Dominado",
    description: "Completaste un módulo entero",
    icon: "📦",
  },
  half_course: {
    type: "half_course",
    title: "A Medio Camino",
    description: "Completaste el 50% del curso",
    icon: "⚡",
  },
  course_complete: {
    type: "course_complete",
    title: "Graduado",
    description: "¡Completaste el curso entero!",
    icon: "🎓",
  },
  streak_3: {
    type: "streak_3",
    title: "En Racha",
    description: "3 días seguidos estudiando",
    icon: "🔥",
  },
  streak_7: {
    type: "streak_7",
    title: "Imparable",
    description: "7 días seguidos estudiando",
    icon: "💪",
  },
  night_owl: {
    type: "night_owl",
    title: "Búho Nocturno",
    description: "Estudiaste después de las 11pm",
    icon: "🦉",
  },
  early_bird: {
    type: "early_bird",
    title: "Madrugador",
    description: "Estudiaste antes de las 7am",
    icon: "🌅",
  },
  speed_learner: {
    type: "speed_learner",
    title: "Aprendiz Veloz",
    description: "5 videos en un solo día",
    icon: "⚡",
  },
  dedicated: {
    type: "dedicated",
    title: "Dedicación Total",
    description: "10 horas totales de estudio",
    icon: "🏆",
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
