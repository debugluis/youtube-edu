"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Trophy, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LoginButton from "@/components/auth/LoginButton";

export default function Home() {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (user) return null;

  const features = [
    {
      icon: BookOpen,
      title: "Cursos Estructurados",
      description:
        "La IA organiza tus playlists en módulos lógicos para un aprendizaje ordenado",
    },
    {
      icon: BarChart3,
      title: "Progreso Detallado",
      description:
        "Rastrea tu avance por video, módulo y curso con estadísticas en tiempo real",
    },
    {
      icon: Trophy,
      title: "Sistema de Logros",
      description:
        "Desbloquea logros mientras aprendes y mantén tu motivación al máximo",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-emerald-500/10 p-4">
            <GraduationCap className="h-12 w-12 text-emerald-500" />
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
          YouTube{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            Edu
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-md text-lg text-gray-400">
          Transforma cualquier playlist de YouTube en un curso estructurado con
          progreso, módulos y logros
        </p>

        <LoginButton />

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-20 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3"
      >
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6 text-center"
          >
            <div className="mb-3 flex justify-center">
              <feature.icon className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="mb-2 text-sm font-semibold text-white">
              {feature.title}
            </h3>
            <p className="text-xs text-gray-400">{feature.description}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
