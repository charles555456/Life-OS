"use client";

import { Target, ChevronRight } from "lucide-react";
import Link from "next/link";

interface GoalItem {
  label: string;
  dimension: "life" | "work";
  progress: number; // 0-100
}

// Demo data
const demoGoals: GoalItem[] = [
  { label: "體脂 → 15%", dimension: "life", progress: 40 },
  { label: "完成交易系統", dimension: "work", progress: 65 },
  { label: "冥想 30 天連續", dimension: "life", progress: 73 },
];

export default function GoalProgress() {
  return (
    <div
      className="rounded-2xl border border-border-subtle bg-bg-card p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-accent-emerald" />
          <span className="text-sm font-semibold">目標進度</span>
        </div>
        <Link
          href="/goals"
          className="flex items-center gap-0.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          全部
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {demoGoals.map((goal, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    goal.dimension === "life"
                      ? "text-accent-emerald bg-accent-emerald-soft"
                      : "text-accent-sky bg-accent-sky-soft"
                  }`}
                >
                  {goal.dimension === "life" ? "生活" : "工作"}
                </span>
                <span className="text-xs text-text-primary">{goal.label}</span>
              </div>
              <span className="text-xs text-text-muted stat-number">
                {goal.progress}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  goal.dimension === "life"
                    ? "bg-accent-emerald"
                    : "bg-accent-sky"
                }`}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
