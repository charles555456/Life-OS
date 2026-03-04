import { supabase } from "./supabase";
import { db } from "./db";
import type { DailyLog, Task, Goal, GoalDailyCheck, MeditationSession, PomodoroSession } from "@/types";

// ── Push local data to Supabase ──
export async function pushToCloud(userId: string) {
  const dailyLogs = await db.dailyLogs.toArray();
  const tasks = await db.tasks.toArray();
  const goals = await db.goals.toArray();
  const goalDailyChecks = await db.goalDailyChecks.toArray();
  const meditationSessions = await db.meditationSessions.toArray();
  const pomodoroSessions = await db.pomodoroSessions.toArray();
  const cutoffLines = await db.cutoffLines.toArray();

  // Upsert all tables
  if (dailyLogs.length > 0) {
    await supabase.from("daily_logs").upsert(
      dailyLogs.map((d) => ({ ...d, user_id: userId })),
      { onConflict: "user_id,date" }
    );
  }

  if (tasks.length > 0) {
    await supabase.from("tasks").upsert(
      tasks.map((t) => ({ ...t, user_id: userId })),
      { onConflict: "user_id,id" }
    );
  }

  if (goals.length > 0) {
    await supabase.from("goals").upsert(
      goals.map((g) => ({ ...g, user_id: userId })),
      { onConflict: "user_id,id" }
    );
  }

  if (goalDailyChecks.length > 0) {
    await supabase.from("goal_daily_checks").upsert(
      goalDailyChecks.map((c) => ({ ...c, user_id: userId })),
      { onConflict: "user_id,id" }
    );
  }

  if (meditationSessions.length > 0) {
    await supabase.from("meditation_sessions").upsert(
      meditationSessions.map((m) => ({ ...m, user_id: userId })),
      { onConflict: "user_id,id" }
    );
  }

  if (pomodoroSessions.length > 0) {
    await supabase.from("pomodoro_sessions").upsert(
      pomodoroSessions.map((p) => ({ ...p, user_id: userId })),
      { onConflict: "user_id,id" }
    );
  }

  if (cutoffLines.length > 0) {
    await supabase.from("cutoff_lines").upsert(
      cutoffLines.map((c) => ({ ...c, user_id: userId })),
      { onConflict: "user_id,date" }
    );
  }
}

// ── Pull cloud data to local IndexedDB ──
export async function pullFromCloud(userId: string) {
  const { data: dailyLogs } = await supabase
    .from("daily_logs").select("*").eq("user_id", userId);
  const { data: tasks } = await supabase
    .from("tasks").select("*").eq("user_id", userId);
  const { data: goals } = await supabase
    .from("goals").select("*").eq("user_id", userId);
  const { data: goalDailyChecks } = await supabase
    .from("goal_daily_checks").select("*").eq("user_id", userId);
  const { data: meditationSessions } = await supabase
    .from("meditation_sessions").select("*").eq("user_id", userId);
  const { data: pomodoroSessions } = await supabase
    .from("pomodoro_sessions").select("*").eq("user_id", userId);
  const { data: cutoffLines } = await supabase
    .from("cutoff_lines").select("*").eq("user_id", userId);

  // Clear and repopulate local DB
  if (dailyLogs) {
    await db.dailyLogs.clear();
    await db.dailyLogs.bulkPut(dailyLogs.map(({ user_id, ...rest }) => rest));
  }
  if (tasks) {
    await db.tasks.clear();
    await db.tasks.bulkPut(tasks.map(({ user_id, ...rest }) => rest));
  }
  if (goals) {
    await db.goals.clear();
    await db.goals.bulkPut(goals.map(({ user_id, ...rest }) => rest));
  }
  if (goalDailyChecks) {
    await db.goalDailyChecks.clear();
    await db.goalDailyChecks.bulkPut(goalDailyChecks.map(({ user_id, ...rest }) => rest));
  }
  if (meditationSessions) {
    await db.meditationSessions.clear();
    await db.meditationSessions.bulkPut(meditationSessions.map(({ user_id, ...rest }) => rest));
  }
  if (pomodoroSessions) {
    await db.pomodoroSessions.clear();
    await db.pomodoroSessions.bulkPut(pomodoroSessions.map(({ user_id, ...rest }) => rest));
  }
  if (cutoffLines) {
    await db.cutoffLines.clear();
    await db.cutoffLines.bulkPut(cutoffLines.map(({ user_id, ...rest }) => rest));
  }
}

// ── Auto-sync: push after each local write ──
export async function syncAfterWrite(userId: string | null) {
  if (!userId) return;
  try {
    await pushToCloud(userId);
  } catch (e) {
    console.warn("Sync failed, will retry later:", e);
  }
}
