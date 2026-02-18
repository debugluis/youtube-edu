"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Clock, Trash2 } from "lucide-react";
import type { Course, UserProgress } from "@/lib/types";
import ProgressBar from "@/components/course/ProgressBar";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useTranslation } from "@/hooks/useTranslation";

interface CourseCardProps {
  course: Course;
  progress: UserProgress | null;
  onClick: () => void;
  onDelete?: (courseId: string) => Promise<void>;
}

export default function CourseCard({ course, progress, onClick, onDelete }: CourseCardProps) {
  const { t } = useTranslation();
  const percentage = progress?.overallPercentage || 0;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(course.id);
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#1a1a2e] transition-colors hover:border-emerald-500/30"
        onClick={onClick}
      >
        {/* Delete button */}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
            className="absolute right-2 top-2 z-10 rounded-lg p-1.5 text-gray-500 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
            title={t("course.deleteTitle")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {percentage === 100 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-4xl">🎓</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-2 line-clamp-2 text-sm font-medium text-white group-hover:text-emerald-400">
            {course.displayName || course.title}
          </h3>

          <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              <span>{course.totalVideos} videos</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{course.totalDuration}</span>
            </div>
          </div>

          <ProgressBar percentage={percentage} size="sm" />
          <p className="mt-1.5 text-xs text-gray-500">
            {percentage}% {t("dashboard.complete")}
          </p>
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={confirmOpen}
        title={t("course.deleteTitle")}
        message={t("course.deleteMessage", { name: course.displayName || course.title })}
        confirmLabel={t("course.deleteConfirm")}
        cancelLabel={t("common.cancel")}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
