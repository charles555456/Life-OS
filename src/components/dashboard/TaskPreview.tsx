"use client";

import { ListChecks, ChevronRight } from "lucide-react";
import Link from "next/link";

interface TaskItem {
  text: string;
  priority: string | null;
  completed: boolean;
}

const priorityLabels: Record<string, { label: string; color: string }> = {
  project: { label: "P", color: "text-accent-amber bg-accent-amber-soft" },
  urgent1: { label: "U", color: "text-accent-rose bg-accent-rose-soft" },
  urgent2: { label: "U", color: "text-accent-rose bg-accent-rose-soft" },
  maintain1: { label: "M", color: "text-accent-sky bg-accent-sky-soft" },
  maintain2: { label: "M", color: "text-accent-sky bg-accent-sky-soft" },
  maintain3: { label: "M", color: "text-accent-sky bg-accent-sky-soft" },
};

// Demo data for static dashboard
const demoTasks: TaskItem[] = [
  { text: "完成交易系統回測", priority: "project", completed: false },
  { text: "回覆客戶郵件", priority: "urgent1", completed: true },
  { text: "整理本週學習筆記", priority: "maintain1", completed: false },
];

export default function TaskPreview() {
  const tasks = demoTasks;
  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div
      className="rounded-2xl border border-border-subtle bg-bg-card p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListChecks size={16} className="text-accent-amber" />
          <span className="text-sm font-semibold">今日 1-2-3</span>
        </div>
        <Link
          href="/tasks"
          className="flex items-center gap-0.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          全部
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-bg-elevated mb-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent-amber transition-all duration-500"
          style={{ width: `${(completed / tasks.length) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {tasks.map((task, i) => {
          const p = task.priority ? priorityLabels[task.priority] : null;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 py-1.5 ${
                task.completed ? "opacity-50" : ""
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[8px]
                  ${
                    task.completed
                      ? "border-accent-emerald bg-accent-emerald-soft text-accent-emerald"
                      : "border-text-muted"
                  }
                `}
              >
                {task.completed && "✓"}
              </div>
              {p && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.color}`}
                >
                  {p.label}
                </span>
              )}
              <span
                className={`text-sm flex-1 ${
                  task.completed
                    ? "line-through text-text-muted"
                    : "text-text-primary"
                }`}
              >
                {task.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
