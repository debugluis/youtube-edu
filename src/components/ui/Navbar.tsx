"use client";

import { useAuth } from "@/hooks/useAuth";
import { Coffee, GraduationCap, LogOut, Trophy } from "lucide-react";

interface NavbarProps {
  title?: string;
  achievementCount?: number;
  onAchievementsClick?: () => void;
}

export default function Navbar({ title, achievementCount, onAchievementsClick }: NavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#0f0f0f]/95 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        <a href="/dashboard" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-emerald-500" />
          <span className="text-lg font-bold text-white">YouTube Edu</span>
        </a>
        {title && (
          <>
            <span className="hidden text-gray-600 md:inline">/</span>
            <span className="hidden max-w-[300px] truncate text-sm text-gray-400 md:inline">
              {title}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {onAchievementsClick && (
          <button
            onClick={onAchievementsClick}
            className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            title="Achievements"
          >
            <Trophy className="h-4 w-4" />
            {achievementCount != null && achievementCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                {achievementCount}
              </span>
            )}
          </button>
        )}

        <a
          href="https://buymeacoffee.com/debugluis"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Buy me a coffee"
        >
          <Coffee className="h-4 w-4" />
          <span className="hidden sm:inline">Buy me a coffee</span>
        </a>

        {user && (
          <>
            <div className="h-5 w-px bg-white/10" />

            <div className="hidden items-center gap-2 sm:flex">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="h-8 w-8 rounded-full"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="text-sm text-gray-300">{user.displayName}</span>
            </div>
            <button
              onClick={signOut}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
