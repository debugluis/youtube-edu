"use client";

import { useState } from "react";
import { useCourseStore } from "@/stores/courseStore";
import { Link, Loader2, Sparkles } from "lucide-react";

interface PlaylistInputProps {
  userId: string;
  onCourseCreated: (courseId: string) => void;
}

export default function PlaylistInput({ userId, onCourseCreated }: PlaylistInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const { isProcessingPlaylist, setIsProcessingPlaylist, addCourse } =
    useCourseStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Ingresa una URL de playlist de YouTube");
      return;
    }

    const playlistPattern = /[?&]list=([a-zA-Z0-9_-]+)/;
    if (!playlistPattern.test(url)) {
      setError("URL no válida. Asegúrate de que sea una playlist de YouTube");
      return;
    }

    setIsProcessingPlaylist(true);

    try {
      const response = await fetch("/api/process-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistUrl: url, userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al procesar la playlist");
      }

      const { course } = await response.json();
      addCourse(course);
      setUrl("");
      onCourseCreated(course.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsProcessingPlaylist(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-emerald-500" />
        <h2 className="text-lg font-semibold text-white">Crear nuevo curso</h2>
      </div>
      <p className="mb-4 text-sm text-gray-400">
        Pega la URL de una playlist de YouTube y la IA la organizará en módulos
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/playlist?list=..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
              disabled={isProcessingPlaylist}
            />
          </div>
          <button
            type="submit"
            disabled={isProcessingPlaylist}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {isProcessingPlaylist ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Crear Curso"
            )}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
}
