"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Link2, Layers, CheckCircle2, Bug, Shield, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import LoginButton from "@/components/auth/LoginButton";

export default function Home() {
  const { user, loading, error } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) router.push("/dashboard");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (user) return null;

  const steps = [
    { icon: Link2,        number: "1", titleKey: "landing.step1Title", descKey: "landing.step1Desc" },
    { icon: Layers,       number: "2", titleKey: "landing.step2Title", descKey: "landing.step2Desc" },
    { icon: CheckCircle2, number: "3", titleKey: "landing.step3Title", descKey: "landing.step3Desc" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8 pt-0">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl bg-emerald-500/10 p-3">
              <GraduationCap className="h-10 w-10 text-emerald-500" />
            </div>
          </div>

          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
            YouTube{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Edu
            </span>
          </h1>

          <p className="mx-auto mb-2 max-w-lg text-xl font-medium text-white md:text-2xl">
            {t("landing.headline")}
          </p>

          <p className="mx-auto mb-7 max-w-md text-sm text-gray-400">
            {t("landing.subheadline")}
          </p>

          <LoginButton />

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-12 w-full max-w-3xl"
        >
          <h2 className="mb-5 text-center text-sm font-semibold uppercase tracking-widest text-gray-500">
            {t("landing.howItWorks")}
          </h2>
          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4">
            {/* Connector line — desktop only */}
            <div className="absolute left-[16.67%] right-[16.67%] top-6 hidden h-px bg-emerald-500/35 md:block" />

            {steps.map((step) => (
              <div key={step.number} className="relative z-10 text-center">
                <div className="mb-3 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f0f0f] ring-1 ring-emerald-500/25">
                    <step.icon className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">{t(step.titleKey)}</h3>
                <p className="text-xs text-gray-500">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-xs text-gray-600">
          <a href="/privacy" className="flex items-center gap-1.5 transition-colors hover:text-gray-400">
            <Shield className="h-3.5 w-3.5" />
            {t("footer.privacy")}
          </a>
          <a href="/terms" className="flex items-center gap-1.5 transition-colors hover:text-gray-400">
            <FileText className="h-3.5 w-3.5" />
            {t("footer.terms")}
          </a>
          <a
            href="https://github.com/debugluis/youtube-edu/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-gray-400"
          >
            <Bug className="h-3.5 w-3.5" />
            {t("footer.feedback")}
          </a>
        </div>
      </footer>
    </div>
  );
}
