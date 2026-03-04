"use client";

import { useEffect, useRef } from "react";
import { Moon, Heart, Dumbbell, Smile, Pill, Check } from "lucide-react";
import HealthAvatar from "@/components/body/HealthAvatar";
import { useBodyStore } from "@/stores/bodyStore";
import type { ExerciseType } from "@/types";

const exerciseTypes: { id: ExerciseType; label: string }[] = [
  { id: "weights", label: "重訓" },
  { id: "running", label: "跑步" },
  { id: "cycling", label: "公路車" },
  { id: "yoga", label: "瑜伽" },
  { id: "stretching", label: "拉筋" },
  { id: "other", label: "其他" },
];

const morningSupps = ["B群", "魚油", "Q10"];
const nightSupps = ["Inositol", "L-Theanine"];

export default function BodyPage() {
  const store = useBodyStore();
  const avatarRef = useRef<{ reload: () => void }>(null);

  useEffect(() => {
    store.loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSleepBlur = (val: string) => {
    const n = parseFloat(val);
    store.setSleepHours(isNaN(n) ? null : n);
  };

  const handleHRVBlur = (val: string) => {
    const n = parseInt(val, 10);
    store.setHRV(isNaN(n) ? null : n);
  };

  const handleDurationBlur = (val: string) => {
    const n = parseInt(val, 10);
    store.setExerciseDuration(isNaN(n) ? null : n);
  };

  return (
    <div className="px-5 pt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">身體追蹤</h1>
          <p className="text-sm text-text-secondary mt-0.5">記錄身體狀態，覺察趨勢</p>
        </div>
        {/* Save indicator */}
        {store.saved && (
          <div className="flex items-center gap-1 text-accent-emerald text-xs font-medium animate-pulse">
            <Check size={14} />
            已儲存
          </div>
        )}
      </div>

      {/* Health Avatar */}
      <div className="mb-4">
        <HealthAvatar hrvBaseline={40} />
      </div>

      {/* Quick entry cards */}
      <div className="space-y-3">
        {/* Sleep */}
        <div className="rounded-2xl border border-border-subtle bg-bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent-sky-soft flex items-center justify-center">
              <Moon size={18} className="text-accent-sky" />
            </div>
            <div>
              <div className="text-sm font-semibold">睡眠</div>
              <div className="text-[10px] text-text-muted">時數 & 品質</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="number"
                placeholder="7.5"
                step="0.5"
                defaultValue={store.sleepHours ?? ""}
                onBlur={(e) => handleSleepBlur(e.target.value)}
                className="w-full bg-bg-elevated rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border-subtle focus:border-accent-sky focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-text-muted mt-1 block">小時</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((q) => (
                <button
                  key={q}
                  onClick={() => store.setSleepQuality(store.sleepQuality === q ? null : q)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all active:scale-90
                    ${store.sleepQuality === q
                      ? "bg-accent-sky-soft text-accent-sky ring-1 ring-accent-sky"
                      : "bg-bg-elevated text-text-muted hover:text-text-secondary"}
                  `}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* HRV */}
        <div className="rounded-2xl border border-border-subtle bg-bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent-rose-soft flex items-center justify-center">
              <Heart size={18} className="text-accent-rose" />
            </div>
            <div>
              <div className="text-sm font-semibold">HRV</div>
              <div className="text-[10px] text-text-muted">心率變異度</div>
            </div>
          </div>
          <input
            type="number"
            placeholder="45"
            defaultValue={store.hrv ?? ""}
            onBlur={(e) => handleHRVBlur(e.target.value)}
            className="w-full bg-bg-elevated rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border-subtle focus:border-accent-rose focus:outline-none transition-colors"
          />
          <span className="text-[10px] text-text-muted mt-1 block">ms</span>
        </div>

        {/* Exercise */}
        <div className="rounded-2xl border border-border-subtle bg-bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent-emerald-soft flex items-center justify-center">
              <Dumbbell size={18} className="text-accent-emerald" />
            </div>
            <div>
              <div className="text-sm font-semibold">運動</div>
              <div className="text-[10px] text-text-muted">類型 & 時長</div>
            </div>
          </div>
          <div className="flex gap-2 mb-3 flex-wrap">
            {exerciseTypes.map((type) => (
              <button
                key={type.id}
                onClick={() =>
                  store.setExerciseType(store.exerciseType === type.id ? null : type.id)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95
                  ${store.exerciseType === type.id
                    ? "bg-accent-emerald-soft text-accent-emerald ring-1 ring-accent-emerald"
                    : "bg-bg-elevated text-text-muted hover:text-text-secondary"}
                `}
              >
                {type.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="60"
            defaultValue={store.exerciseDuration ?? ""}
            onBlur={(e) => handleDurationBlur(e.target.value)}
            className="w-full bg-bg-elevated rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted border border-border-subtle focus:border-accent-emerald focus:outline-none transition-colors"
          />
          <span className="text-[10px] text-text-muted mt-1 block">分鐘</span>
        </div>

        {/* Mood */}
        <div className="rounded-2xl border border-border-subtle bg-bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent-amber-soft flex items-center justify-center">
              <Smile size={18} className="text-accent-amber" />
            </div>
            <span className="text-sm font-semibold">心情</span>
          </div>
          <div className="flex justify-between">
            {["😫", "😔", "😐", "😊", "🔥"].map((emoji, i) => (
              <button
                key={i}
                onClick={() => store.setMood(store.mood === i + 1 ? null : i + 1)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl
                  transition-all active:scale-90
                  ${store.mood === i + 1
                    ? "bg-accent-amber-soft ring-1 ring-accent-amber scale-105"
                    : "bg-bg-elevated hover:bg-bg-card-hover"}
                `}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Supplements */}
        <div className="rounded-2xl border border-border-subtle bg-bg-card p-4 mb-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent-sky-soft flex items-center justify-center">
              <Pill size={18} className="text-accent-sky" />
            </div>
            <span className="text-sm font-semibold">補充品</span>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1">早上</div>
            <div className="flex gap-2 flex-wrap">
              {morningSupps.map((s) => {
                const taken = store.supplementsTaken.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => store.toggleSupplement(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                      taken
                        ? "bg-accent-emerald-soft text-accent-emerald ring-1 ring-accent-emerald"
                        : "bg-bg-elevated text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {taken ? "✓ " : ""}{s}
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1 mt-3">睡前</div>
            <div className="flex gap-2 flex-wrap">
              {nightSupps.map((s) => {
                const taken = store.supplementsTaken.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => store.toggleSupplement(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                      taken
                        ? "bg-accent-emerald-soft text-accent-emerald ring-1 ring-accent-emerald"
                        : "bg-bg-elevated text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {taken ? "✓ " : ""}{s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
