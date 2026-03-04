"use client";

import { Plus, Trash2, Check, X, Leaf, Briefcase, CalendarCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useGoalStore } from "@/stores/goalStore";
import type { Goal } from "@/types";

const levelLabels: Record<string, string> = {
  yearly: "年度",
  quarterly: "季度",
  weekly: "每週",
};

const levelStyles: Record<string, string> = {
  yearly: "bg-bg-elevated text-text-muted",
  quarterly: "bg-bg-elevated text-text-secondary",
  weekly: "bg-accent-amber-soft text-accent-amber",
};

export default function GoalsPage() {
  const store = useGoalStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newDim, setNewDim] = useState<"life" | "work">("life");
  const [newLevel, setNewLevel] = useState<"yearly" | "quarterly" | "weekly">("quarterly");
  const [newTarget, setNewTarget] = useState("100");
  const [newTrackDaily, setNewTrackDaily] = useState(true);
  const [addingValueId, setAddingValueId] = useState<string | null>(null);
  const [addValueInput, setAddValueInput] = useState("");

  useEffect(() => {
    store.loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    const desc = newDesc.trim();
    if (!desc) return;
    await store.addGoal({
      dimension: newDim,
      level: newLevel,
      description: desc,
      targetValue: parseInt(newTarget, 10) || 100,
      currentValue: 0,
      deadline: null,
      completed: false,
      trackDaily: newTrackDaily,
    });
    setNewDesc("");
    setShowAdd(false);
  };

  const handleAddValue = async (goalId: string) => {
    const val = parseInt(addValueInput, 10);
    if (!isNaN(val) && val > 0) {
      await store.addDailyValue(goalId, val);
    }
    setAddingValueId(null);
    setAddValueInput("");
  };

  const getProgress = (g: Goal) => {
    if (!g.targetValue || g.targetValue === 0) return g.completed ? 100 : 0;
    return Math.min(100, Math.round(((g.currentValue ?? 0) / g.targetValue) * 100));
  };

  const renderGoals = (goals: Goal[], dim: "life" | "work") => {
    const dimLabel = dim === "life" ? "生活" : "工作";
    const barColor = dim === "life" ? "bg-accent-emerald" : "bg-accent-sky";
    const accentColor = dim === "life" ? "var(--accent-emerald)" : "var(--accent-sky)";
    const DimIcon = dim === "life" ? Leaf : Briefcase;
    const badgeStyle = dim === "life"
      ? "bg-accent-emerald-soft text-accent-emerald"
      : "bg-accent-sky-soft text-accent-sky";

    return (
      <div key={dim} className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${badgeStyle}`}>
            <DimIcon size={12} />
            {dimLabel}
          </span>
          <span className="text-[10px] text-text-muted">{goals.length} 個目標</span>
        </div>

        {goals.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-card px-4 py-6 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <p className="text-sm text-text-muted">還沒有{dimLabel}目標</p>
            <p className="text-[11px] text-text-muted mt-1">按右上角 + 新增</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const progress = getProgress(goal);
              const todayCheck = store.todayChecks[goal.id];
              const isCheckedToday = todayCheck?.checked ?? false;
              const todayAdded = todayCheck?.addedValue ?? 0;

              return (
                <div
                  key={goal.id}
                  className={`rounded-xl border border-border-subtle bg-bg-card p-3.5 transition-colors ${
                    goal.completed ? "opacity-50" : ""
                  }`}
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  {/* Top row: description + badges */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        onClick={() => store.toggleComplete(goal.id)}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[9px] transition-all active:scale-90
                          ${goal.completed
                            ? "border-accent-emerald bg-accent-emerald-soft text-accent-emerald"
                            : "border-text-muted hover:border-text-secondary"
                          }`}
                      >
                        {goal.completed && "✓"}
                      </button>
                      <span className={`text-sm font-medium truncate ${
                        goal.completed ? "line-through text-text-muted" : "text-text-primary"
                      }`}>
                        {goal.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${levelStyles[goal.level]}`}>
                        {levelLabels[goal.level]}
                      </span>
                      <button
                        onClick={() => store.deleteGoal(goal.id)}
                        className="text-text-muted hover:text-accent-rose transition-colors p-0.5 active:scale-90"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 rounded-full bg-bg-elevated overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-muted stat-number w-16 text-right">
                      {goal.currentValue ?? 0}/{goal.targetValue ?? 0}
                    </span>
                    <span className="text-[10px] text-text-muted stat-number w-8 text-right">
                      {progress}%
                    </span>
                  </div>

                  {/* Daily action row */}
                  {!goal.completed && (
                    <div className="flex items-center gap-2 pt-1.5 border-t border-border-subtle">
                      {/* Daily check button */}
                      <button
                        onClick={() => store.toggleDailyCheck(goal.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all active:scale-95 ${
                          isCheckedToday
                            ? "bg-accent-emerald-soft text-accent-emerald ring-1 ring-accent-emerald"
                            : "bg-bg-elevated text-text-muted hover:text-text-secondary"
                        }`}
                      >
                        <CalendarCheck size={13} />
                        {isCheckedToday ? "今日 ✓" : "今日打卡"}
                      </button>

                      {/* Add value button / input */}
                      {goal.targetValue && goal.targetValue > 0 && (
                        <>
                          {addingValueId === goal.id ? (
                            <div className="flex items-center gap-1 flex-1">
                              <input
                                type="number"
                                autoFocus
                                placeholder="次數"
                                value={addValueInput}
                                onChange={(e) => setAddValueInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleAddValue(goal.id);
                                  if (e.key === "Escape") setAddingValueId(null);
                                }}
                                className="w-16 bg-bg-elevated rounded-lg px-2 py-1.5 text-xs text-text-primary border border-border-subtle focus:border-accent-amber focus:outline-none"
                              />
                              <button
                                onClick={() => handleAddValue(goal.id)}
                                className="p-1 text-accent-emerald active:scale-90"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => { setAddingValueId(null); setAddValueInput(""); }}
                                className="p-1 text-text-muted active:scale-90"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setAddingValueId(goal.id);
                                setAddValueInput(todayAdded > 0 ? String(todayAdded) : "");
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-bg-elevated text-text-muted hover:text-text-secondary transition-all active:scale-95"
                            >
                              <Plus size={13} />
                              {todayAdded > 0 ? `今日 +${todayAdded}` : "記錄次數"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="px-5 pt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">目標</h1>
          <p className="text-sm text-text-secondary mt-0.5">生活 & 工作</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-all ${
            showAdd
              ? "bg-accent-rose-soft text-accent-rose"
              : "bg-accent-amber-soft text-accent-amber"
          }`}
        >
          {showAdd ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Add goal form */}
      {showAdd && (
        <div className="rounded-2xl border border-accent-amber/20 bg-bg-card p-4 mb-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="目標描述⋯"
            autoFocus
            className="w-full bg-bg-elevated rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted
              border border-border-subtle focus:border-accent-amber focus:outline-none transition-colors mb-3"
          />

          {/* Dimension */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setNewDim("life")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                newDim === "life"
                  ? "bg-accent-emerald-soft text-accent-emerald ring-1 ring-accent-emerald"
                  : "bg-bg-elevated text-text-muted"
              }`}
            >
              <Leaf size={13} /> 生活
            </button>
            <button
              onClick={() => setNewDim("work")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                newDim === "work"
                  ? "bg-accent-sky-soft text-accent-sky ring-1 ring-accent-sky"
                  : "bg-bg-elevated text-text-muted"
              }`}
            >
              <Briefcase size={13} /> 工作
            </button>
          </div>

          {/* Level */}
          <div className="flex gap-2 mb-3">
            {(["yearly", "quarterly", "weekly"] as const).map((lv) => (
              <button
                key={lv}
                onClick={() => setNewLevel(lv)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                  newLevel === lv
                    ? "bg-accent-amber text-bg-primary"
                    : "bg-bg-elevated text-text-muted"
                }`}
              >
                {levelLabels[lv]}
              </button>
            ))}
          </div>

          {/* Target value */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-text-muted">目標值</span>
            <input
              type="number"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="w-20 bg-bg-elevated rounded-lg px-2 py-1.5 text-xs text-text-primary border border-border-subtle focus:border-accent-amber focus:outline-none"
            />
            <span className="text-[10px] text-text-muted">（如：回測 300 次）</span>
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-2.5 rounded-xl bg-accent-amber text-bg-primary text-sm font-semibold active:scale-[0.97] transition-all"
          >
            新增目標
          </button>
        </div>
      )}

      {/* Goals by dimension */}
      {renderGoals(store.lifeGoals, "life")}
      {renderGoals(store.workGoals, "work")}

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  );
}
