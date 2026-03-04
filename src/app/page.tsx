"use client";

import { useEffect, useState, useRef } from "react";
import { Wind, Dumbbell, Moon, Heart, Coffee, ListChecks, Target, ChevronRight, Leaf, Briefcase, Pencil } from "lucide-react";
import Link from "next/link";
import { db, today, weekStart } from "@/lib/db";
import { useAuthStore } from "@/stores/authStore";
import type { DailyLog, MeditationSession, Task, Goal } from "@/types";

interface DashboardData {
  // Meditation
  meditationStreak: number;
  meditatedToday: boolean;
  // Body
  sleepHours: number | null;
  sleepQuality: number | null;
  hrv: number | null;
  mood: number | null;
  // Exercise
  exerciseThisWeek: number;
  // Pomodoro
  todayFoundation: number;
  todayWork: number;
  // Tasks
  todayTasks: { text: string; priority: string | null; completed: boolean }[];
  totalTodayTasks: number;
  completedTodayTasks: number;
  // Goals (top 3 by least progress)
  topGoals: { description: string; dimension: "life" | "work"; progress: number }[];
  // Week sleep average
  weekSleepAvg: number | null; // average of days with data
}

async function loadDashboard(): Promise<DashboardData> {
  const todayStr = today();
  const weekStartStr = weekStart();

  // ── Meditation ──
  const allMed = await db.meditationSessions
    .where("completed")
    .equals(1) // Dexie stores booleans as 0/1
    .toArray()
    .catch(() => db.meditationSessions.toArray().then(arr => arr.filter(m => m.completed)));

  const medDates = [...new Set(allMed.map((m) => m.date))].sort().reverse();
  const meditatedToday = medDates.includes(todayStr);

  // Calculate streak
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().split("T")[0];
    if (medDates.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break; // Allow today to not be done yet
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }

  // ── Body (today's log) ──
  const todayLog = await db.dailyLogs.get(todayStr);

  // ── Exercise this week ──
  const weekLogs = await db.dailyLogs
    .where("date")
    .between(weekStartStr, todayStr, true, true)
    .toArray();
  const exerciseThisWeek = weekLogs.filter(
    (l) => l.exerciseType !== null && l.exerciseDuration && l.exerciseDuration > 0
  ).length;

  // ── Pomodoro today ──
  const todayPomo = await db.pomodoroSessions
    .where("date")
    .equals(todayStr)
    .toArray();
  const todayFoundation = todayPomo.filter((p) => p.domain === "foundation" && p.completed).length;
  const todayWork = todayPomo.filter((p) => p.domain === "work" && p.completed).length;

  // ── Tasks today ──
  const allTodayTasks = await db.tasks
    .where("targetDate")
    .equals(todayStr)
    .toArray();
  const completedTodayTasks = allTodayTasks.filter((t) => t.completed).length;

  // Top 3 tasks by priority
  const priorityOrder: Record<string, number> = {
    project: 0, urgent1: 1, urgent2: 2, maintain1: 3, maintain2: 4, maintain3: 5,
  };
  const sortedTasks = [...allTodayTasks]
    .filter((t) => !t.isBelowCutoffLine)
    .sort((a, b) => {
      const pa = a.priority ? priorityOrder[a.priority] ?? 99 : 99;
      const pb = b.priority ? priorityOrder[b.priority] ?? 99 : 99;
      if (pa !== pb) return pa - pb;
      return a.completed ? 1 : -1;
    })
    .slice(0, 3)
    .map((t) => ({ text: t.text, priority: t.priority, completed: t.completed }));

  // ── Goals (top 3 by least progress, not completed) ──
  const allGoals = await db.goals.toArray();
  const activeGoals = allGoals
    .filter((g) => !g.completed && g.targetValue && g.targetValue > 0)
    .map((g) => ({
      description: g.description,
      dimension: g.dimension,
      progress: Math.min(100, Math.round(((g.currentValue ?? 0) / g.targetValue!) * 100)),
    }))
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 3);

  // ── Week sleep average (only days with data) ──
  const sleepDays = weekLogs.filter((l) => l.sleepHours && l.sleepHours > 0);
  const weekSleepAvg =
    sleepDays.length > 0
      ? Math.round((sleepDays.reduce((sum, l) => sum + (l.sleepHours ?? 0), 0) / sleepDays.length) * 10) / 10
      : null;

  return {
    meditationStreak: streak,
    meditatedToday,
    sleepHours: todayLog?.sleepHours ?? null,
    sleepQuality: todayLog?.sleepQuality ?? null,
    hrv: todayLog?.hrv ?? null,
    mood: todayLog?.mood ?? null,
    exerciseThisWeek,
    todayFoundation,
    todayWork,
    todayTasks: sortedTasks,
    totalTodayTasks: allTodayTasks.length,
    completedTodayTasks,
    topGoals: activeGoals,
    weekSleepAvg,
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const { displayName, setDisplayName } = useAuthStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDashboard().then(setData);
  }, []);

  useEffect(() => {
    if (editingName && nameRef.current) nameRef.current.focus();
  }, [editingName]);

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) setDisplayName(trimmed);
    setEditingName(false);
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "早安" : hour < 18 ? "午安" : "晚安";
  const dateStr = now.toLocaleDateString("zh-TW", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const moodEmojis = ["", "😫", "😔", "😐", "😊", "🔥"];
  const qualityStars = (q: number | null) => {
    if (!q) return "";
    return "★".repeat(q) + "☆".repeat(5 - q);
  };

  const priorityLabels: Record<string, { label: string; color: string }> = {
    project: { label: "P", color: "text-accent-amber bg-accent-amber-soft" },
    urgent1: { label: "U", color: "text-accent-rose bg-accent-rose-soft" },
    urgent2: { label: "U", color: "text-accent-rose bg-accent-rose-soft" },
    maintain1: { label: "M", color: "text-accent-sky bg-accent-sky-soft" },
    maintain2: { label: "M", color: "text-accent-sky bg-accent-sky-soft" },
    maintain3: { label: "M", color: "text-accent-sky bg-accent-sky-soft" },
  };

  return (
    <div className="px-5 pt-4">
      {/* Header */}
      <div className="mb-6">
        {editingName ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{greeting}，</span>
            <input
              ref={nameRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              className="text-2xl font-bold bg-bg-elevated border border-accent-amber rounded-lg px-2 py-0.5 w-32 focus:outline-none"
            />
          </div>
        ) : (
          <h1
            className="text-2xl font-bold tracking-tight flex items-center gap-2"
            onClick={() => { setNameInput(displayName || ""); setEditingName(true); }}
          >
            {greeting}，{displayName || "點此設定名字"}
            <Pencil size={14} className="text-text-muted" />
          </h1>
        )}
        <p className="text-sm text-text-secondary mt-0.5">{dateStr}</p>
      </div>

      {!data ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Meditation */}
            <Link href="/meditation" className="rounded-2xl p-4 border border-border-subtle bg-bg-card active:scale-[0.97] transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-accent-amber-soft flex items-center justify-center">
                  <Wind size={18} className="text-accent-amber" />
                </div>
                {data.meditatedToday && (
                  <div className="w-5 h-5 rounded-full border-2 border-accent-emerald bg-accent-emerald-soft text-accent-emerald flex items-center justify-center text-xs">✓</div>
                )}
              </div>
              <div className="stat-number text-2xl font-semibold tracking-tight leading-none mb-0.5">
                {data.meditationStreak > 0 ? `Day ${data.meditationStreak}` : "—"}
              </div>
              <div className="text-xs text-text-secondary font-medium">冥想</div>
              <div className="text-[10px] text-text-muted mt-1">
                {data.meditationStreak > 0 ? "連續天數" : "開始你的連續紀錄"}
              </div>
            </Link>

            {/* Exercise */}
            <Link href="/body" className="rounded-2xl p-4 border border-border-subtle bg-bg-card active:scale-[0.97] transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="w-9 h-9 rounded-xl bg-accent-emerald-soft flex items-center justify-center mb-3">
                <Dumbbell size={18} className="text-accent-emerald" />
              </div>
              <div className="stat-number text-2xl font-semibold tracking-tight leading-none mb-0.5">
                {data.exerciseThisWeek}/7
              </div>
              <div className="text-xs text-text-secondary font-medium">運動</div>
              <div className="text-[10px] text-text-muted mt-1">本週天數</div>
            </Link>

            {/* Sleep */}
            <Link href="/body" className="rounded-2xl p-4 border border-border-subtle bg-bg-card active:scale-[0.97] transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-accent-sky-soft flex items-center justify-center">
                  <Moon size={18} className="text-accent-sky" />
                </div>
                {data.weekSleepAvg !== null && (
                  <div className="text-right">
                    <div className="stat-number text-sm font-semibold text-text-secondary">{data.weekSleepAvg}h</div>
                    <div className="text-[9px] text-text-muted">週均</div>
                  </div>
                )}
              </div>
              <div className="stat-number text-2xl font-semibold tracking-tight leading-none mb-0.5">
                {data.sleepHours ? `${data.sleepHours}h` : "—"}
              </div>
              <div className="text-xs text-text-secondary font-medium">睡眠</div>
              {data.sleepQuality && (
                <div className="text-[10px] text-text-muted mt-1">品質 {qualityStars(data.sleepQuality)}</div>
              )}
            </Link>

            {/* HRV */}
            <Link href="/body" className="rounded-2xl p-4 border border-border-subtle bg-bg-card active:scale-[0.97] transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="w-9 h-9 rounded-xl bg-accent-rose-soft flex items-center justify-center mb-3">
                <Heart size={18} className="text-accent-rose" />
              </div>
              <div className="stat-number text-2xl font-semibold tracking-tight leading-none mb-0.5">
                {data.hrv ?? "—"}
              </div>
              <div className="text-xs text-text-secondary font-medium">HRV</div>
              <div className="text-[10px] text-text-muted mt-1">ms</div>
            </Link>
          </div>

          {/* Pomodoro today */}
          {(data.todayFoundation > 0 || data.todayWork > 0) && (
            <Link
              href="/pomodoro"
              className="rounded-2xl border border-border-subtle bg-bg-card p-4 mb-4 flex items-center justify-between active:scale-[0.98] transition-all"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center gap-3">
                <Coffee size={18} className="text-accent-amber" />
                <span className="text-sm font-semibold">今日咖啡</span>
              </div>
              <div className="flex items-center gap-3">
                {data.todayFoundation > 0 && (
                  <span className="text-xs text-accent-emerald flex items-center gap-1">
                    <Leaf size={12} /> {data.todayFoundation}
                  </span>
                )}
                {data.todayWork > 0 && (
                  <span className="text-xs text-accent-sky flex items-center gap-1">
                    <Briefcase size={12} /> {data.todayWork}
                  </span>
                )}
                <span className="text-lg">
                  {Array.from({ length: data.todayFoundation + data.todayWork }).map((_, i) => "☕").join("")}
                </span>
              </div>
            </Link>
          )}

          {/* Mood */}
          {data.mood && (
            <div className="rounded-2xl border border-border-subtle bg-bg-card p-4 mb-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">今日心情</span>
                <span className="text-2xl">{moodEmojis[data.mood]}</span>
              </div>
            </div>
          )}

          {/* Task Preview */}
          {data.totalTodayTasks > 0 && (
            <div className="rounded-2xl border border-border-subtle bg-bg-card p-4 mb-4" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ListChecks size={16} className="text-accent-amber" />
                  <span className="text-sm font-semibold">今日任務</span>
                </div>
                <Link href="/tasks" className="flex items-center gap-0.5 text-xs text-text-muted hover:text-text-secondary transition-colors">
                  {data.completedTodayTasks}/{data.totalTodayTasks}
                  <ChevronRight size={14} />
                </Link>
              </div>
              <div className="h-1.5 rounded-full bg-bg-elevated mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent-amber transition-all duration-500"
                  style={{ width: `${data.totalTodayTasks > 0 ? (data.completedTodayTasks / data.totalTodayTasks) * 100 : 0}%` }}
                />
              </div>
              <div className="space-y-2">
                {data.todayTasks.map((task, i) => {
                  const p = task.priority ? priorityLabels[task.priority] : null;
                  return (
                    <div key={i} className={`flex items-center gap-3 py-1 ${task.completed ? "opacity-50" : ""}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[8px] ${
                        task.completed ? "border-accent-emerald bg-accent-emerald-soft text-accent-emerald" : "border-text-muted"
                      }`}>
                        {task.completed && "✓"}
                      </div>
                      {p && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.color}`}>{p.label}</span>}
                      <span className={`text-sm flex-1 ${task.completed ? "line-through text-text-muted" : "text-text-primary"}`}>{task.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Goal Progress */}
          {data.topGoals.length > 0 && (
            <div className="rounded-2xl border border-border-subtle bg-bg-card p-4 mb-8" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-accent-emerald" />
                  <span className="text-sm font-semibold">目標進度</span>
                </div>
                <Link href="/goals" className="flex items-center gap-0.5 text-xs text-text-muted hover:text-text-secondary transition-colors">
                  全部 <ChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-3">
                {data.topGoals.map((goal, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          goal.dimension === "life" ? "text-accent-emerald bg-accent-emerald-soft" : "text-accent-sky bg-accent-sky-soft"
                        }`}>
                          {goal.dimension === "life" ? "生活" : "工作"}
                        </span>
                        <span className="text-xs text-text-primary">{goal.description}</span>
                      </div>
                      <span className="text-xs text-text-muted stat-number">{goal.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          goal.dimension === "life" ? "bg-accent-emerald" : "bg-accent-sky"
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state if nothing yet */}
          {data.totalTodayTasks === 0 && data.topGoals.length === 0 && !data.sleepHours && (
            <div className="rounded-2xl border border-border-subtle bg-bg-card px-4 py-10 text-center mb-8" style={{ boxShadow: "var(--shadow-card)" }}>
              <p className="text-sm text-text-muted">開始記錄你的一天吧</p>
              <p className="text-[11px] text-text-muted mt-1">到各頁面輸入數據，這裡會即時顯示總覽</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
