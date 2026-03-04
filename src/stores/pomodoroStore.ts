import { create } from "zustand";
import { db, today, weekStart } from "@/lib/db";
import { triggerSync } from "@/lib/triggerSync";
import type { PomodoroSession } from "@/types";

export type PomodoroState = "idle" | "focus" | "paused" | "break" | "completed";

interface PomodoroStats {
  todayFoundation: number;
  todayWork: number;
  weekFoundation: number;
  weekWork: number;
  totalFoundation: number;
  totalWork: number;
}

interface PomodoroStore {
  // Timer
  state: PomodoroState;
  focusMinutes: number; // 25 default
  breakMinutes: number; // 5 default
  elapsedSeconds: number;
  domain: "foundation" | "work";
  label: string;

  // Stats
  stats: PomodoroStats;

  // Actions
  setDomain: (d: "foundation" | "work") => void;
  setLabel: (l: string) => void;
  setFocusMinutes: (m: number) => void;
  setBreakMinutes: (m: number) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  tick: () => "completed" | "break_done" | null;
  startBreak: () => void;
  complete: () => Promise<void>;
  reset: () => void;
  loadStats: () => Promise<void>;
}

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  state: "idle",
  focusMinutes: 25,
  breakMinutes: 5,
  elapsedSeconds: 0,
  domain: "foundation",
  label: "",

  stats: {
    todayFoundation: 0,
    todayWork: 0,
    weekFoundation: 0,
    weekWork: 0,
    totalFoundation: 0,
    totalWork: 0,
  },

  setDomain: (d) => set({ domain: d }),
  setLabel: (l) => set({ label: l }),
  setFocusMinutes: (m) => set({ focusMinutes: m }),
  setBreakMinutes: (m) => set({ breakMinutes: m }),

  start: () => {
    set({ state: "focus", elapsedSeconds: 0 });
  },

  pause: () => {
    set({ state: "paused" });
  },

  resume: () => {
    const { state } = get();
    // Resume to whatever was running before pause
    set({ state: state === "paused" ? "focus" : state });
  },

  tick: () => {
    const { elapsedSeconds, focusMinutes, breakMinutes, state } = get();
    const newElapsed = elapsedSeconds + 1;
    set({ elapsedSeconds: newElapsed });

    if (state === "focus" && newElapsed >= focusMinutes * 60) {
      return "completed";
    }
    if (state === "break" && newElapsed >= breakMinutes * 60) {
      return "break_done";
    }
    return null;
  },

  startBreak: () => {
    set({ state: "break", elapsedSeconds: 0 });
  },

  complete: async () => {
    const { elapsedSeconds, domain, label } = get();

    const session: PomodoroSession = {
      id: `pomo-${Date.now()}`,
      date: today(),
      domain,
      duration: elapsedSeconds,
      label: label || "",
      completed: true,
      startedAt: new Date().toISOString(),
    };

    await db.pomodoroSessions.put(session);
    triggerSync();
    set({ state: "completed" });
    await get().loadStats();
  },

  reset: () => {
    set({ state: "idle", elapsedSeconds: 0, label: "" });
  },

  loadStats: async () => {
    try {
      const all = await db.pomodoroSessions
        .where("completed")
        .equals(1)
        .toArray();

      const todayStr = today();
      const weekStartStr = weekStart();

      const todaySessions = all.filter((s) => s.date === todayStr);
      const weekSessions = all.filter((s) => s.date >= weekStartStr);

      const count = (arr: PomodoroSession[], d: string) =>
        arr.filter((s) => s.domain === d).length;

      set({
        stats: {
          todayFoundation: count(todaySessions, "foundation"),
          todayWork: count(todaySessions, "work"),
          weekFoundation: count(weekSessions, "foundation"),
          weekWork: count(weekSessions, "work"),
          totalFoundation: count(all, "foundation"),
          totalWork: count(all, "work"),
        },
      });
    } catch {
      // DB not ready
    }
  },
}));
