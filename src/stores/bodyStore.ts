import { create } from "zustand";
import { db, today } from "@/lib/db";
import { triggerSync } from "@/lib/triggerSync";
import type { DailyLog, ExerciseType } from "@/types";

interface BodyState {
  // Today's log
  sleepHours: number | null;
  sleepQuality: number | null;
  hrv: number | null;
  exerciseType: ExerciseType | null;
  exerciseDuration: number | null;
  mood: number | null;
  supplementsTaken: string[];
  saved: boolean; // shows a brief "saved" indicator

  // Actions
  loadToday: () => Promise<void>;
  setSleepHours: (v: number | null) => void;
  setSleepQuality: (v: number | null) => void;
  setHRV: (v: number | null) => void;
  setExerciseType: (v: ExerciseType | null) => void;
  setExerciseDuration: (v: number | null) => void;
  setMood: (v: number | null) => void;
  toggleSupplement: (name: string) => void;
  save: () => Promise<void>;
}

export const useBodyStore = create<BodyState>((set, get) => ({
  sleepHours: null,
  sleepQuality: null,
  hrv: null,
  exerciseType: null,
  exerciseDuration: null,
  mood: null,
  supplementsTaken: [],
  saved: false,

  loadToday: async () => {
    const todayStr = today();
    const log = await db.dailyLogs.get(todayStr);
    if (log) {
      set({
        sleepHours: log.sleepHours,
        sleepQuality: log.sleepQuality,
        hrv: log.hrv,
        exerciseType: log.exerciseType,
        exerciseDuration: log.exerciseDuration,
        mood: log.mood,
        supplementsTaken: log.supplementsTaken ?? [],
      });
    }
  },

  setSleepHours: (v) => { set({ sleepHours: v }); get().save(); },
  setSleepQuality: (v) => { set({ sleepQuality: v }); get().save(); },
  setHRV: (v) => { set({ hrv: v }); get().save(); },
  setExerciseType: (v) => { set({ exerciseType: v }); get().save(); },
  setExerciseDuration: (v) => { set({ exerciseDuration: v }); get().save(); },
  setMood: (v) => { set({ mood: v }); get().save(); },
  toggleSupplement: (name: string) => {
    const current = get().supplementsTaken;
    const next = current.includes(name)
      ? current.filter((s) => s !== name)
      : [...current, name];
    set({ supplementsTaken: next });
    get().save();
  },

  save: async () => {
    const state = get();
    const todayStr = today();
    const log: DailyLog = {
      date: todayStr,
      sleepHours: state.sleepHours,
      sleepQuality: state.sleepQuality,
      hrv: state.hrv,
      weight: null,
      bodyFat: null,
      mood: state.mood,
      exerciseType: state.exerciseType,
      exerciseDuration: state.exerciseDuration,
      supplementsTaken: state.supplementsTaken,
      meditationDuration: null,
      meditationCompleted: false,
    };
    await db.dailyLogs.put(log);
    triggerSync();
    set({ saved: true });
    setTimeout(() => set({ saved: false }), 1500);
  },
}));
