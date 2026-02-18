"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  GraduationCap,
  LogOut,
  Trophy,
  User,
  Pencil,
  Languages,
  Trash2,
  Bug,
  Shield,
  FileText,
  Check,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCourseStore } from "@/stores/courseStore";
import { useTranslation } from "@/hooks/useTranslation";
import Modal from "@/components/ui/Modal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface NavbarProps {
  title?: string;
  achievementCount?: number;
  onAchievementsClick?: () => void;
}

export default function Navbar({ title, achievementCount, onAchievementsClick }: NavbarProps) {
  const { user, signOut, updateProfile, updateLanguage, deleteAccount } = useAuth();
  const { t } = useTranslation();
  const language = useCourseStore((s) => s.language);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync input fields when user changes
  useEffect(() => {
    setDisplayName(user?.displayName || "");
    setPhotoURL(user?.photoURL || "");
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveProfile = async () => {
    setProfileError(null);
    setIsSavingProfile(true);
    try {
      await updateProfile(displayName.trim(), photoURL.trim());
      setEditProfileOpen(false);
    } catch {
      setProfileError(t("profile.saveError"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLanguageToggle = async () => {
    const next = language === "en" ? "es" : "en";
    await updateLanguage(next);
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      setDeleteAccountOpen(false);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setDeleteError(e.message || t("account.deleteError"));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <>
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
              title={t("nav.achievements")}
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
            title={t("nav.buyMeCoffee")}
          >
            <Coffee className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.buyMeCoffee")}</span>
          </a>

          {user && (
            <>
              <div className="h-5 w-px bg-white/10" />

              {/* Profile button + dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/10"
                  title={t("nav.profile")}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="h-8 w-8 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <span className="hidden text-sm text-gray-300 sm:inline">
                    {user.displayName}
                  </span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a2e] shadow-2xl"
                    >
                      {/* User info */}
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="text-sm font-medium text-white">{user.displayName}</p>
                        <p className="truncate text-xs text-gray-500">{user.email}</p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        {/* Edit Profile */}
                        <button
                          onClick={() => { setDropdownOpen(false); setEditProfileOpen(true); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                          {t("nav.editProfile")}
                        </button>

                        {/* Language toggle */}
                        <button
                          onClick={handleLanguageToggle}
                          className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <span className="flex items-center gap-3">
                            <Languages className="h-4 w-4" />
                            {t("nav.language")}
                          </span>
                          <span className="flex items-center gap-1 rounded-full border border-white/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                            {language === "en" ? (
                              <><Check className="h-3 w-3" /> EN</>
                            ) : (
                              <><Check className="h-3 w-3" /> ES</>
                            )}
                          </span>
                        </button>

                        {/* Feedback */}
                        <a
                          href="https://github.com/debugluis/youtube-edu/issues/new"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setDropdownOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <Bug className="h-4 w-4" />
                          {t("nav.feedback")}
                        </a>

                        <div className="mx-4 my-1 border-t border-white/10" />

                        {/* Privacy */}
                        <a
                          href="/privacy"
                          onClick={() => setDropdownOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-300"
                        >
                          <Shield className="h-4 w-4" />
                          {t("nav.privacy")}
                        </a>

                        {/* Terms */}
                        <a
                          href="/terms"
                          onClick={() => setDropdownOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-300"
                        >
                          <FileText className="h-4 w-4" />
                          {t("nav.terms")}
                        </a>

                        <div className="mx-4 my-1 border-t border-white/10" />

                        {/* Delete Account */}
                        <button
                          onClick={() => { setDropdownOpen(false); setDeleteAccountOpen(true); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t("nav.deleteAccount")}
                        </button>

                        {/* Sign Out */}
                        <button
                          onClick={() => { setDropdownOpen(false); signOut(); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          <LogOut className="h-4 w-4" />
                          {t("nav.signOut")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Edit Profile Modal */}
      <Modal isOpen={editProfileOpen} onClose={() => setEditProfileOpen(false)}>
        <h2 className="mb-5 text-lg font-semibold text-white">{t("profile.title")}</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              {t("profile.displayName")}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
              placeholder={t("profile.displayNamePlaceholder")}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              {t("profile.photoURL")}
            </label>
            <input
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
              placeholder="https://..."
            />
          </div>
          {photoURL && (
            <img
              src={photoURL}
              alt="Preview"
              className="h-16 w-16 rounded-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          {profileError && <p className="text-xs text-red-400">{profileError}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setEditProfileOpen(false)}
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSavingProfile && (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {t("common.save")}
          </button>
        </div>
      </Modal>

      {/* Delete Account Confirmation */}
      <ConfirmationModal
        isOpen={deleteAccountOpen}
        title={t("account.deleteTitle")}
        message={t("account.deleteMessage")}
        confirmLabel={t("account.deleteConfirm")}
        cancelLabel={t("common.cancel")}
        onConfirm={handleDeleteAccount}
        onCancel={() => { setDeleteAccountOpen(false); setDeleteError(null); }}
        variant="danger"
        isLoading={isDeletingAccount}
      />
      {deleteError && deleteAccountOpen && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {deleteError}
        </div>
      )}
    </>
  );
}
