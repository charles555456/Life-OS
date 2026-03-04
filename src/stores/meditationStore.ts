import { create } from "zustand";
import { db, today } from "@/lib/db";
import { triggerSync } from "@/lib/triggerSync";
import type { MeditationSession } from "@/types";

export type TimerState = "idle" | "running" | "paused" | "completed";

interface MeditationStore {
  // Timer state
  timerState: TimerState;
  presetSeconds: number; // 0 = free mode
  elapsedSeconds: number;
  isFreeMode: boolean;

  // Stats
  streak: number;
  monthTotal: number; // minutes
  totalSessions: number;
  todayCompleted: boolean;

  // Actions
  setPreset: (seconds: number) => void;
  setFreeMode: () => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  tick: () => boolean; // returns true if timer completed
  complete: () => Promise<void>;
  reset: () => void;
  loadStats: () => Promise<void>;
}

export const useMeditationStore = create<MeditationStore>((set, get) => ({
  timerState: "idle",
  presetSeconds: 5 * 60, // default 5 min
  elapsedSeconds: 0,
  isFreeMode: false,

  streak: 0,
  monthTotal: 0,
  totalSessions: 0,
  todayCompleted: false,

  setPreset: (seconds: number) => {
    set({ presetSeconds: seconds, isFreeMode: false, elapsedSeconds: 0, timerState: "idle" });
  },

  setFreeMode: () => {
    set({ isFreeMode: true, presetSeconds: 0, elapsedSeconds: 0, timerState: "idle" });
  },

  start: () => {
    set({ timerState: "running", elapsedSeconds: 0 });
  },

  pause: () => {
    set({ timerState: "paused" });
  },

  resume: () => {
    set({ timerState: "running" });
  },

  tick: () => {
    const { elapsedSeconds, presetSeconds, isFreeMode } = get();
    const newElapsed = elapsedSeconds + 1;
    set({ elapsedSeconds: newElapsed });

    // In preset mode, check if time is up
    if (!isFreeMode && newElapsed >= presetSeconds) {
      set({ timerState: "completed" });
      return true;
    }
    return false;
  },

  complete: async () => {
    const { elapsedSeconds, isFreeMode } = get();

    const session: MeditationSession = {
      id: `med-${Date.now()}`,
      date: today(),
      duration: elapsedSeconds,
      presetOrFree: isFreeMode ? "free" : "preset",
      completed: true,
    };

    await db.meditationSessions.put(session);
    triggerSync();

    set({ timerState: "completed" });

    // Reload stats
    await get().loadStats();
  },

  reset: () => {
    set({
      timerState: "idle",
      elapsedSeconds: 0,
    });
  },

  loadStats: async () => {
    try {
      const allSessions = await db.meditationSessions
        .where("completed")
        .equals(1)
        .toArray();

      // Total sessions
      const totalSessions = allSessions.length;

      // This month total (minutes)
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const monthSessions = allSessions.filter((s) => s.date >= monthStart);
      const monthTotal = Math.round(
        monthSessions.reduce((sum, s) => sum + s.duration, 0) / 60
      );

      // Today completed?
      const todayStr = today();
      const todayCompleted = allSessions.some((s) => s.date === todayStr);

      // Streak calculation
      let streak = 0;
      const dateSet = new Set(allSessions.map((s) => s.date));
      const d = new Date();

      // If today not done yet, start checking from yesterday
      if (!todayCompleted) {
        d.setDate(d.getDate() - 1);
      }

      while (true) {
        const dateStr = d.toISOString().split("T")[0];
        if (dateSet.has(dateStr)) {
          streak++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }

      // If today is completed, add it to streak
      if (todayCompleted && !dateSet.has(today())) {
        streak++;
      }

      set({ streak, monthTotal, totalSessions, todayCompleted });
    } catch {
      // DB not ready yet (SSR), silently ignore
    }
  },
}));
