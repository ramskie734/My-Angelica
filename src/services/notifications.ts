/**
 * PWA notifications. Uses the Notification API through the registered service
 * worker when possible, falling back to in-app notifications.
 */

export async function ensurePermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export async function showNotification(title: string, body: string): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      await reg.showNotification(title, { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png" });
      return;
    }
  }
  new Notification(title, { body, icon: "/icons/icon-192.png" });
}

/** Minutes until the next occurrence of the given HH:MM local time. */
export function minutesUntil(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((v) => parseInt(v, 10));
  const now = new Date();
  const target = new Date();
  target.setHours(h || 19, m || 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return Math.round((target.getTime() - now.getTime()) / 60000);
}
