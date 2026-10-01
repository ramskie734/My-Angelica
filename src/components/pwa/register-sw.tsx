"use client";

import { useEffect } from "react";

/** Registers the service worker that powers offline mode and notifications. */
export function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is progressive - ignore registration failures.
    });
  }, []);
  return null;
}
