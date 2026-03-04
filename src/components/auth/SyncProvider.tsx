"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { pushToCloud, pullFromCloud } from "@/lib/sync";

export default function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSync = useRef<number>(0);

  // Debounced sync — pushes to cloud 2s after last local change
  const scheduleSync = useCallback(() => {
    if (!user) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      try {
        await pushToCloud(user.id);
        lastSync.current = Date.now();
      } catch (e) {
        console.warn("Sync push failed:", e);
      }
    }, 2000);
  }, [user]);

  // Pull from cloud on mount (login)
  useEffect(() => {
    if (!user) return;
    pullFromCloud(user.id).catch(console.warn);
  }, [user]);

  // Listen for IndexedDB changes via storage events and periodic sync
  useEffect(() => {
    if (!user) return;

    // Sync every 30 seconds if there are changes
    const interval = setInterval(() => {
      scheduleSync();
    }, 30000);

    // Also listen for visibility change — sync when app comes back to foreground
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && user) {
        pullFromCloud(user.id).catch(console.warn);
      } else if (document.visibilityState === "hidden" && user) {
        pushToCloud(user.id).catch(console.warn);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user, scheduleSync]);

  // Expose sync trigger globally so stores can call it
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__lifeOsSync = scheduleSync;
    }
  }, [scheduleSync]);

  return <>{children}</>;
}
