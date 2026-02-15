"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Module } from "@/lib/types";
import VideoItem from "./VideoItem";
import ProgressBar from "./ProgressBar";
import { calculateModulePercentage } from "@/utils/progress";

interface ModuleCardProps {
  module: Module;
  completedVideos: string[];
  currentVideoId: string | null;
  onVideoSelect: (videoId: string) => void;
}

export default function ModuleCard({
  module,
  completedVideos,
  currentVideoId,
  onVideoSelect,
}: ModuleCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const percentage = calculateModulePercentage(module, completedVideos);

  return (
    <div className="overflow-hidden rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{module.title}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <ProgressBar percentage={percentage} size="sm" />
            <span className="shrink-0 text-xs text-gray-500">{percentage}%</span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 pb-2 pl-2">
              {module.videos.map((video) => (
                <VideoItem
                  key={video.id}
                  video={video}
                  isCompleted={completedVideos.includes(video.id)}
                  isCurrent={currentVideoId === video.id}
                  onSelect={() => onVideoSelect(video.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
