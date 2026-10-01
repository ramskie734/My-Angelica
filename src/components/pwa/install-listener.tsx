"use client";

import { useEffect } from "react";

/** Captures the browser's install prompt so Settings can trigger it later. */
export function InstallListener() {
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      (window as unknown as { angelicaInstallPrompt?: Event }).angelicaInstallPrompt = e;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  return null;
}
