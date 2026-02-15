"use client";

import { useEffect, useState } from "react";

export function useYouTubePlayer() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsReady(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    if (!existingScript) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const originalCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      setIsReady(true);
      if (originalCallback) originalCallback();
    };

    return () => {
      if (window.onYouTubeIframeAPIReady === arguments.callee) {
        window.onYouTubeIframeAPIReady = originalCallback || (() => {});
      }
    };
  }, []);

  return { isReady };
}
