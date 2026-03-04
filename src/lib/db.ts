import Dexie, { type EntityTable } from "dexie";
import type {
  DailyLog,
  Task,
  Goal,
  GoalDailyCheck,
  MeditationSession,
  PomodoroSession,
  WeeklyReview,
  AAR,
  CutoffLine,
} from "@/types";

class LifeOSDatabase extends Dexie {
  dailyLogs!: EntityTable<DailyLog, "date">;
  tasks!: EntityTable<Task, "id">;
  goals!: EntityTable<Goal, "id">;
  goalDailyChecks!: EntityTable<GoalDailyCheck, "id">;
  meditationSessions!: EntityTable<MeditationSession, "id">;
  pomodoroSessions!: EntityTable<PomodoroSession, "id">;
  weeklyReviews!: EntityTable<WeeklyReview, "weekStart">;
  aars!: EntityTable<AAR, "date">;
  cutoffLines!: EntityTable<CutoffLine, "date">;

  constructor() {
    super("LifeOS");

    this.version(1).stores({
      dailyLogs: "date",
      tasks: "id, targetDate, createdDate, completed, isBelowCutoffLine",
      goals: "id, dimension, level, completed",
      meditationSessions: "id, date",
      weeklyReviews: "weekStart",
      aars: "date",
      cutoffLines: "date",
    });

    this.version(2).stores({
      dailyLogs: "date",
      tasks: "id, targetDate, createdDate, completed, isBelowCutoffLine",
      goals: "id, dimension, level, completed",
      meditationSessions: "id, date",
      pomodoroSessions: "id, date, domain, completed",
      weeklyReviews: "weekStart",
      aars: "date",
      cutoffLines: "date",
    });

    this.version(3).stores({
      dailyLogs: "date",
      tasks: "id, targetDate, createdDate, completed, isBelowCutoffLine",
      goals: "id, dimension, level, completed",
      goalDailyChecks: "id, goalId, date",
      meditationSessions: "id, date",
      pomodoroSessions: "id, date, domain, completed",
      weeklyReviews: "weekStart",
      aars: "date",
      cutoffLines: "date",
    });
  }
}

export const db = new LifeOSDatabase();

// Helper: get today's date string
export function today(): string {
  return new Date().toISOString().split("T")[0];
}

// Helper: get tomorrow's date string
export function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

// Helper: get start of current week (Monday)
export function weekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}
