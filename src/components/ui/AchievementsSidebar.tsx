"use client";

import { useCourseStore } from "@/stores/courseStore";
import { PanelRight, PanelRightClose, Lock } from "lucide-react";
import { ACHIEVEMENTS } from "@/utils/achievements";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProgress, AchievementType } from "@/lib/types";
import { Timestamp } from "firebase/firestore";
import { useTranslation } from "@/hooks/useTranslation";

const ALL_ACHIEVEMENT_TYPES: AchievementType[] = [
  "first_video",
  "module_complete",
  "half_course",
  "course_complete",
  "streak_3",
  "streak_7",
  "night_owl",
  "early_bird",
  "speed_learner",
  "dedicated",
];

interface AchievementsSidebarProps {
  progress: UserProgress | null;
}

function formatUnlockDate(unlockedAt: Timestamp | { seconds: number; nanoseconds: number }): string {
  const date =
    unlockedAt instanceof Timestamp
      ? unlockedAt.toDate()
      : new Date(unlockedAt.seconds * 1000);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AchievementsSidebar({ progress }: AchievementsSidebarProps) {
  const { t } = useTranslation();
  const {
    rightSidebarOpen,
    setRightSidebarOpen,
    toggleRightSidebar,
    selectedAchievement,
    setSelectedAchievement,
  } = useCourseStore();

  const unlockedTypes = new Set(progress?.achievements.map((a) => a.type) || []);
  const achievementMap = new Map(progress?.achievements.map((a) => [a.type, a]) || []);

  const sorted = [...ALL_ACHIEVEMENT_TYPES].sort((a, b) => {
    return (unlockedTypes.has(a) ? 0 : 1) - (unlockedTypes.has(b) ? 0 : 1);
  });

  return (
    <>
      {rightSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setRightSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed right-0 top-16 z-40 h-[calc(100vh-4rem)] shrink-0 overflow-x-hidden overflow-y-auto border-l border-white/10 bg-[#0f0f0f] transition-all duration-300 lg:sticky lg:z-0 ${
          rightSidebarOpen ? "w-72" : "w-14"
        } ${rightSidebarOpen ? "block" : "hidden lg:block"}`}
      >
        {rightSidebarOpen ? (
          <div className="w-72">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                {t("course.achievements")}
              </p>
              <button
                onClick={toggleRightSidebar}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                title="Collapse sidebar"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 p-3">
              {sorted.map((type) => {
                const def = ACHIEVEMENTS[type];
                const Icon = def.icon;
                const isUnlocked = unlockedTypes.has(type);
                const achievement = achievementMap.get(type);
                const isSelected = selectedAchievement === type;

                if (!isUnlocked) {
                  return (
                    <div key={type} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                        <Lock className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-500">
                          {t(`achievement.${type}.title`)}
                        </p>
                        <p className="truncate text-xs text-gray-600">
                          {t(`achievement.${type}.description`)}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={type}>
                    <button
                      onClick={() => setSelectedAchievement(isSelected ? null : type)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5 ${
                        isSelected ? "bg-white/5" : ""
                      }`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Icon className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {t(`achievement.${type}.title`)}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {t(`achievement.${type}.description`)}
                        </p>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isSelected && achievement && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-14 pb-2 pr-3">
                            <p className="text-xs text-gray-500">
                              {t("achievement.unlockedOn", { date: formatUnlockDate(achievement.unlockedAt) })}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-3">
            <button
              onClick={toggleRightSidebar}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Expand achievements"
            >
              <PanelRight className="h-4 w-4" />
            </button>

            <div className="mt-4 flex flex-col gap-1.5">
              {sorted.map((type) => {
                const def = ACHIEVEMENTS[type];
                const Icon = def.icon;
                const isUnlocked = unlockedTypes.has(type);

                return (
                  <button
                    key={type}
                    onClick={() => {
                      if (isUnlocked) {
                        setRightSidebarOpen(true);
                        setSelectedAchievement(type);
                      }
                    }}
                    disabled={!isUnlocked}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                      isUnlocked
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-white/5 text-gray-500"
                    }`}
                    title={t(`achievement.${type}.title`)}
                  >
                    {isUnlocked ? <Icon className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
