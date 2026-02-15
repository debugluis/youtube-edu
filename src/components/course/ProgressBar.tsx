"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function ProgressBar({
  percentage,
  size = "md",
  showLabel = false,
}: ProgressBarProps) {
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3" };
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <div className="w-full">
      <div className={`w-full overflow-hidden rounded-full bg-white/10 ${heights[size]}`}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>{clamped}% complete</span>
        </div>
      )}
    </div>
  );
}
