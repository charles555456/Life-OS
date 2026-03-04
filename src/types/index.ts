// ============================================
// Life OS — Core Data Types
// ============================================

export interface DailyLog {
  date: string; // YYYY-MM-DD
  sleepHours: number | null;
  sleepQuality: number | null; // 1-5
  hrv: number | null;
  weight: number | null;
  bodyFat: number | null;
  mood: number | null; // 1-5
  exerciseType: ExerciseType | null;
  exerciseDuration: number | null; // minutes
  supplementsTaken: string[];
  meditationDuration: number | null; // seconds
  meditationCompleted: boolean;
}

export type ExerciseType =
  | "weights"
  | "running"
  | "cycling"
  | "yoga"
  | "stretching"
  | "other";

export interface Task {
  id: string;
  text: string;
  category: TaskCategory;
  createdDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  priority: TaskPriority | null;
  completed: boolean;
  completedDate: string | null;
  isBelowCutoffLine: boolean;
  isRoutine: boolean;
}

export type TaskCategory =
  | "email"
  | "document"
  | "call"
  | "task"
  | "learning"
  | "other";

export type TaskPriority =
  | "project" // 1 重要計畫
  | "urgent1" // 2 緊急且重要 #1
  | "urgent2" // 2 緊急且重要 #2
  | "maintain1" // 3 維護項目 #1
  | "maintain2" // 3 維護項目 #2
  | "maintain3"; // 3 維護項目 #3

export interface Goal {
  id: string;
  dimension: "life" | "work";
  level: "yearly" | "quarterly" | "weekly";
  description: string;
  targetValue: number | null;  // e.g. 300 (回測300次)
  currentValue: number | null; // e.g. 45 (已做45次)
  deadline: string | null; // YYYY-MM-DD
  completed: boolean;
  trackDaily: boolean; // 是否啟用每日打卡
}

// 每日打卡紀錄：某個 goal 在某天有沒有做 + 當天增加的數量
export interface GoalDailyCheck {
  id: string;        // goalId + "_" + date
  goalId: string;
  date: string;      // YYYY-MM-DD
  checked: boolean;  // 今天有做
  addedValue: number; // 今天增加的量（e.g. 回測了 15 次）
}

export interface MeditationSession {
  id: string;
  date: string; // YYYY-MM-DD
  duration: number; // seconds
  presetOrFree: "preset" | "free";
  completed: boolean;
}

export interface WeeklyReview {
  weekStart: string; // YYYY-MM-DD (Monday)
  highlights: string;
  lowlights: string;
  learnings: string;
  gratitude: string;
  nextWeekTop3: string[];
}

export interface AAR {
  date: string; // YYYY-MM-DD
  completedItems: string;
  inspiringThing: string;
  learning: string;
  shutdownCompleted: boolean;
}

export interface CalendarEvent {
  id: string;
  googleEventId: string;
  title: string;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  location: string | null;
  description: string | null;
  isAllDay: boolean;
}

export interface PomodoroSession {
  id: string;
  date: string; // YYYY-MM-DD
  domain: "foundation" | "work"; // 領域
  duration: number; // seconds
  label: string; // optional task label
  completed: boolean;
  startedAt: string; // ISO datetime
}

export interface CutoffLine {
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO datetime
}
