"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ACHIEVEMENTS } from "@/utils/achievements";
import type { AchievementType } from "@/lib/types";
import { useTranslation } from "@/hooks/useTranslation";

interface AchievementBadgeProps {
  type: AchievementType;
  isNew?: boolean;
}

export function AchievementBadge({ type, isNew }: AchievementBadgeProps) {
  const { t } = useTranslation();
  const achievement = ACHIEVEMENTS[type];

  return (
    <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1.5">
      <achievement.icon className="h-4 w-4 shrink-0 text-emerald-400" />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-white">
          {t(`achievement.${type}.title`)}
        </p>
        <p className="truncate text-[11px] leading-tight text-gray-400">
          {t(`achievement.${type}.description`)}
        </p>
      </div>
      {isNew && (
        <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
          {t("achievement.new")}
        </span>
      )}
    </div>
  );
}

interface AchievementToastProps {
  type: AchievementType | null;
  onDismiss: () => void;
}

export function AchievementToast({ type, onDismiss }: AchievementToastProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (type) {
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    }
  }, [type, onDismiss]);

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="fixed bottom-6 right-6 z-[100] w-80 overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f0f] p-6 shadow-2xl shadow-emerald-500/20"
        >
          <div className="absolute -right-2 -top-2 h-20 w-20 animate-pulse rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="absolute -bottom-2 -left-2 h-16 w-16 animate-pulse rounded-full bg-emerald-500/10 blur-2xl" />

          <div className="relative">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-500">
              {t("achievement.unlocked")}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <motion.div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20"
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {(() => { const Icon = ACHIEVEMENTS[type].icon; return <Icon className="h-6 w-6 text-emerald-400" />; })()}
              </motion.div>
              <div>
                <p className="text-lg font-bold text-white">{t(`achievement.${type}.title`)}</p>
                <p className="text-sm text-gray-400">{t(`achievement.${type}.description`)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
