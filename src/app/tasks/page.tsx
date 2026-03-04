"use client";

import {
  Plus,
  Inbox,
  ListChecks,
  Clock,
  Minus,
  Trash2,
  Zap,
  Sunrise,
  X,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useTaskStore } from "@/stores/taskStore";
import type { TaskPriority } from "@/types";

const priorityConfig: Record<
  string,
  { label: string; fullLabel: string; color: string }
> = {
  project: {
    label: "P",
    fullLabel: "1 重要計畫",
    color: "text-accent-amber bg-accent-amber-soft",
  },
  urgent1: {
    label: "U1",
    fullLabel: "2 緊急要務",
    color: "text-accent-rose bg-accent-rose-soft",
  },
  urgent2: {
    label: "U2",
    fullLabel: "2 緊急要務",
    color: "text-accent-rose bg-accent-rose-soft",
  },
  maintain1: {
    label: "M1",
    fullLabel: "3 維護項目",
    color: "text-accent-sky bg-accent-sky-soft",
  },
  maintain2: {
    label: "M2",
    fullLabel: "3 維護項目",
    color: "text-accent-sky bg-accent-sky-soft",
  },
  maintain3: {
    label: "M3",
    fullLabel: "3 維護項目",
    color: "text-accent-sky bg-accent-sky-soft",
  },
};

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "project", label: "1 重要計畫" },
  { value: "urgent1", label: "2 緊急要務 #1" },
  { value: "urgent2", label: "2 緊急要務 #2" },
  { value: "maintain1", label: "3 維護 #1" },
  { value: "maintain2", label: "3 維護 #2" },
  { value: "maintain3", label: "3 維護 #3" },
];

export default function TasksPage() {
  const store = useTaskStore();
  const [activeTab, setActiveTab] = useState<"today" | "inbox">("today");
  const [newTaskText, setNewTaskText] = useState("");
  const [priorityMenuId, setPriorityMenuId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    store.loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddTask = async () => {
    const text = newTaskText.trim();
    if (!text) return;
    await store.addTask(text);
    setNewTaskText("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddTask();
  };

  // Stats
  const totalToday = store.todayTasks.length + store.urgentTasks.length;
  const completedToday =
    store.todayTasks.filter((t) => t.completed).length +
    store.urgentTasks.filter((t) => t.completed).length;

  return (
    <div className="px-5 pt-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">任務</h1>
          <p className="text-sm text-text-secondary mt-0.5">明天再做引擎</p>
        </div>
        {totalToday > 0 && (
          <div className="text-right">
            <div className="text-lg font-bold stat-number text-text-primary">
              {completedToday}/{totalToday}
            </div>
            <div className="text-[10px] text-text-muted">已完成</div>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab("today")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
            activeTab === "today"
              ? "bg-accent-amber text-bg-primary"
              : "bg-bg-elevated text-text-muted hover:text-text-secondary"
          }`}
        >
          <ListChecks size={16} />
          今日任務
        </button>
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
            activeTab === "inbox"
              ? "bg-accent-amber text-bg-primary"
              : "bg-bg-elevated text-text-muted hover:text-text-secondary"
          }`}
        >
          <Inbox size={16} />
          收集箱
          {store.inboxTasks.length > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-accent-rose-soft text-accent-rose text-[10px] font-bold flex items-center justify-center">
              {store.inboxTasks.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "today" ? (
        <>
          {/* Today's closed list */}
          <div className="mb-4">
            <div className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock size={10} />
              封閉清單 · 1-2-3 排序
            </div>

            {store.todayTasks.length === 0 ? (
              <div className="rounded-xl border border-border-subtle bg-bg-card px-4 py-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
                <Sunrise size={28} className="text-text-muted mx-auto mb-2 opacity-50" />
                <p className="text-sm text-text-muted">今天還沒有任務</p>
                <p className="text-[11px] text-text-muted mt-1">
                  昨天收集箱的任務會自動出現在這裡
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {store.todayTasks.map((task) => {
                  const p = task.priority
                    ? priorityConfig[task.priority]
                    : null;
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-2.5 rounded-xl border border-border-subtle bg-bg-card px-3 py-3
                        active:bg-bg-card-hover transition-all ${
                          task.completed ? "opacity-50" : ""
                        }`}
                      style={{ boxShadow: "var(--shadow-card)" }}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => store.toggleComplete(task.id)}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[9px] transition-all active:scale-90
                          ${
                            task.completed
                              ? "border-accent-emerald bg-accent-emerald-soft text-accent-emerald"
                              : "border-text-muted hover:border-text-secondary"
                          }
                        `}
                      >
                        {task.completed && "✓"}
                      </button>

                      {/* Priority badge — tap to change */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() =>
                            setPriorityMenuId(
                              priorityMenuId === task.id ? null : task.id
                            )
                          }
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all active:scale-90 ${
                            p
                              ? p.color
                              : "text-text-muted bg-bg-elevated border border-border-subtle"
                          }`}
                        >
                          {p ? p.label : "排序"}
                        </button>

                        {/* Priority dropdown */}
                        {priorityMenuId === task.id && (
                          <div
                            className="absolute left-0 top-7 z-50 w-40 rounded-xl border border-border-medium bg-bg-card py-1"
                            style={{ boxShadow: "var(--shadow-elevated)" }}
                          >
                            {priorityOptions.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={async () => {
                                  await store.setPriority(
                                    task.id,
                                    task.priority === opt.value
                                      ? null
                                      : opt.value
                                  );
                                  setPriorityMenuId(null);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-bg-elevated flex items-center justify-between ${
                                  task.priority === opt.value
                                    ? "text-accent-amber font-semibold"
                                    : "text-text-secondary"
                                }`}
                              >
                                {opt.label}
                                {task.priority === opt.value && (
                                  <span className="text-accent-amber">✓</span>
                                )}
                              </button>
                            ))}
                            {task.priority && (
                              <button
                                onClick={async () => {
                                  await store.setPriority(task.id, null);
                                  setPriorityMenuId(null);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-text-muted hover:bg-bg-elevated border-t border-border-subtle"
                              >
                                清除優先
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Task text */}
                      <span
                        className={`text-sm flex-1 ${
                          task.completed
                            ? "line-through text-text-muted"
                            : "text-text-primary"
                        }`}
                      >
                        {task.text}
                      </span>

                      {/* Delete */}
                      <button
                        onClick={() => store.deleteTask(task.id)}
                        className="text-text-muted hover:text-accent-rose transition-colors p-1 active:scale-90"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Draw cutoff line button */}
          {!store.cutoffExists && store.todayTasks.length > 0 && (
            <button
              onClick={() => store.drawCutoffLine()}
              className="w-full flex items-center justify-center gap-2 py-2.5 mb-4 rounded-xl border border-dashed border-accent-rose/30 text-accent-rose text-xs font-medium
                hover:bg-accent-rose-soft/30 active:scale-[0.98] transition-all"
            >
              <Minus size={14} />
              畫出終止線（封閉清單）
            </button>
          )}

          {/* Cutoff line */}
          {store.cutoffExists && (
            <div className="flex items-center gap-3 my-4 px-2">
              <div className="flex-1 border-t-2 border-dashed border-accent-rose/40" />
              <span className="text-[10px] text-accent-rose font-semibold uppercase tracking-wider flex items-center gap-1">
                <Minus size={12} />
                終止線
              </span>
              <div className="flex-1 border-t-2 border-dashed border-accent-rose/40" />
            </div>
          )}

          {/* Urgent / below cutoff */}
          {store.urgentTasks.length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] text-accent-rose font-medium uppercase tracking-wider mb-2">
                當天緊急
              </div>
              <div className="space-y-2">
                {store.urgentTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 rounded-xl border border-accent-rose/20 bg-accent-rose-soft px-3.5 py-3 transition-all ${
                      task.completed ? "opacity-50" : ""
                    }`}
                  >
                    <button
                      onClick={() => store.toggleComplete(task.id)}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[9px] transition-all active:scale-90
                        ${
                          task.completed
                            ? "border-accent-emerald bg-accent-emerald-soft text-accent-emerald"
                            : "border-accent-rose"
                        }`}
                    >
                      {task.completed && "✓"}
                    </button>
                    <span
                      className={`text-sm flex-1 ${
                        task.completed
                          ? "line-through text-text-muted"
                          : "text-text-primary"
                      }`}
                    >
                      {task.text}
                    </span>
                    <button
                      onClick={() => store.deleteTask(task.id)}
                      className="text-text-muted hover:text-accent-rose transition-colors p-1 active:scale-90"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Inbox - collect tasks for tomorrow */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="快速記錄任務..."
                className="flex-1 bg-bg-elevated rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted
                  border border-border-subtle focus:border-accent-amber focus:outline-none transition-colors"
              />
              <button
                onClick={handleAddTask}
                className="w-12 rounded-xl bg-accent-amber text-bg-primary flex items-center justify-center active:scale-90 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-1.5 px-1">
              記錄下來 → 明天處理。除非非常緊急，否則不要今天做。
            </p>
          </div>

          {store.inboxTasks.length === 0 ? (
            <div className="rounded-xl border border-border-subtle bg-bg-card px-4 py-8 text-center mb-8" style={{ boxShadow: "var(--shadow-card)" }}>
              <Inbox size={28} className="text-text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm text-text-muted">收集箱是空的</p>
              <p className="text-[11px] text-text-muted mt-1">
                想到什麼就記下來，明天再處理
              </p>
            </div>
          ) : (
            <div className="space-y-2 mb-8">
              {store.inboxTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-card px-3.5 py-3
                    active:bg-bg-card-hover transition-all"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="w-2 h-2 rounded-full bg-accent-amber flex-shrink-0" />
                  <span className="text-sm text-text-primary flex-1">
                    {task.text}
                  </span>

                  {/* Promote to today (urgent) */}
                  <button
                    onClick={() => store.promoteToToday(task.id)}
                    className="text-accent-rose/50 hover:text-accent-rose transition-colors p-1 active:scale-90"
                    title="移到今天（緊急）"
                  >
                    <Zap size={15} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => store.deleteTask(task.id)}
                    className="text-text-muted hover:text-accent-rose transition-colors p-1 active:scale-90"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Close dropdown when clicking outside */}
      {priorityMenuId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setPriorityMenuId(null)}
        />
      )}

      {/* Shutdown */}
      <button
        onClick={async () => {
          await store.moveToTomorrow();
        }}
        className="w-full py-3.5 rounded-2xl border border-border-medium bg-bg-card text-sm font-medium text-text-secondary
          hover:bg-bg-card-hover active:scale-[0.98] transition-all mb-2 flex items-center justify-center gap-2"
      >
        <Sunrise size={16} />
        結束今天，交給明天
      </button>

      {/* Bottom spacing for nav */}
      <div className="h-4" />
    </div>
  );
}
