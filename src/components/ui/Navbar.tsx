"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCourseStore } from "@/stores/courseStore";
import { Menu, GraduationCap, LogOut } from "lucide-react";

interface NavbarProps {
  title?: string;
  showMenuButton?: boolean;
}

export default function Navbar({ title, showMenuButton = false }: NavbarProps) {
  const { user, signOut } = useAuth();
  const toggleSidebar = useCourseStore((s) => s.toggleSidebar);

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#0f0f0f]/95 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
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

      {user && (
        <div className="flex items-center gap-3">
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
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
