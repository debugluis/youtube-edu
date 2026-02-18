"use client";

import { useCourseStore } from "@/stores/courseStore";
import { getTranslation } from "@/lib/translations";

export function useTranslation() {
  const language = useCourseStore((state) => state.language);

  const t = (key: string, vars?: Record<string, string>): string => {
    let value = getTranslation(language, key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        value = value.replace(`{${k}}`, v);
      }
    }
    return value;
  };

  return { t, language };
}
