"use client";

import { useEffect, useRef, useCallback } from "react";
import { Wind, Pause, Play, RotateCcw, Square, Volume2, VolumeX } from "lucide-react";
import { useMeditationStore } from "@/stores/meditationStore";
import { playBellStart, playBellEnd, resumeAudioContext } from "@/lib/audio";
import { useState } from "react";

// Inspirational quotes for meditation
const quotes = [
  "專注於呼吸，觀察內在所發生的一切",
  "讓思緒如雲般飄過，不需抓住任何一朵",
  "此刻，你只需要在這裡",
  "呼吸是連結身心的橋樑",
  "放下所有期待，只是觀察",
  "每一次呼吸都是全新的開始",
];

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MeditationPage() {
  const store = useMeditationStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [quoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));

  // Load stats on mount
  useEffect(() => {
    store.loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer interval
  useEffect(() => {
    if (store.timerState === "running") {
      intervalRef.current = setInterval(() => {
        const completed = store.tick();
        if (completed) {
          if (soundEnabled) playBellEnd();
          store.complete();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.timerState, soundEnabled]);

  // Calculate display time
  const displayTime = store.isFreeMode
    ? formatTime(store.elapsedSeconds)
    : formatTime(
        store.timerState === "idle"
          ? store.presetSeconds
          : Math.max(0, store.presetSeconds - store.elapsedSeconds)
      );

  // Progress for SVG ring (0 to 1)
  const progress =
    store.isFreeMode || store.presetSeconds === 0
      ? 0
      : store.elapsedSeconds / store.presetSeconds;

  // SVG circle params
  const size = 256;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const handleStart = useCallback(() => {
    resumeAudioContext();
    if (soundEnabled) playBellStart();
    store.start();
  }, [store, soundEnabled]);

  const handleFinishFree = useCallback(async () => {
    if (soundEnabled) playBellEnd();
    await store.complete();
  }, [store, soundEnabled]);

  const isActive = store.timerState === "running" || store.timerState === "paused";

  // Status text
  const statusText =
    store.timerState === "idle"
      ? "準備開始"
      : store.timerState === "running"
      ? store.isFreeMode
        ? "自由冥想中..."
        : "冥想中..."
      : store.timerState === "paused"
      ? "已暫停"
      : "完成 ✓";

  return (
    <div className="px-5 pt-4 flex flex-col items-center">
      <div className="w-full mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">冥想</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {store.timerState === "idle" ? quotes[quoteIndex] : statusText}
            </p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Timer circle */}
      <div className="relative my-6" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          {!store.isFreeMode && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--accent-amber)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: "stroke-dashoffset 1s linear",
                filter: isActive ? "drop-shadow(0 0 8px rgba(240, 168, 48, 0.4))" : "none",
              }}
            />
          )}
          {/* Free mode — pulsing ring */}
          {store.isFreeMode && isActive && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--accent-amber)"
              strokeWidth={strokeWidth}
              opacity={0.4}
              style={{
                animation: "pulse-ring 4s ease-in-out infinite",
              }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {store.timerState === "completed" ? (
            <>
              <div className="text-4xl mb-2">🧘</div>
              <span className="text-3xl font-light tracking-tight stat-number text-accent-amber">
                {formatTime(store.elapsedSeconds)}
              </span>
              <span className="text-xs text-accent-emerald mt-1 font-medium">
                冥想完成
              </span>
            </>
          ) : (
            <>
              {!isActive && (
                <Wind
                  size={28}
                  className="text-accent-amber mb-2 opacity-50"
                />
              )}
              <span
                className={`font-light tracking-tight stat-number text-text-primary transition-all ${
                  isActive ? "text-5xl" : "text-4xl"
                }`}
              >
                {displayTime}
              </span>
              <span className="text-xs text-text-muted mt-1">{statusText}</span>
            </>
          )}
        </div>
      </div>

      {/* Duration presets — only show when idle */}
      {store.timerState === "idle" && (
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          {[5, 10, 15, 20].map((min) => (
            <button
              key={min}
              onClick={() => store.setPreset(min * 60)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95
                ${
                  !store.isFreeMode && store.presetSeconds === min * 60
                    ? "bg-accent-amber text-bg-primary"
                    : "bg-bg-elevated text-text-secondary hover:bg-bg-card-hover"
                }
              `}
            >
              {min}m
            </button>
          ))}
          <button
            onClick={() => store.setFreeMode()}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95
              ${
                store.isFreeMode
                  ? "bg-accent-amber text-bg-primary"
                  : "bg-bg-elevated text-text-secondary hover:bg-bg-card-hover"
              }
            `}
          >
            自由
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 w-full max-w-xs">
        {store.timerState === "idle" && (
          <button
            onClick={handleStart}
            className="flex-1 py-4 rounded-2xl bg-accent-amber text-bg-primary font-semibold text-base
              transition-all active:scale-[0.97] hover:brightness-110"
            style={{ boxShadow: "0 4px 20px rgba(240, 168, 48, 0.3)" }}
          >
            開始冥想
          </button>
        )}

        {store.timerState === "running" && (
          <>
            <button
              onClick={() => store.pause()}
              className="flex-1 py-4 rounded-2xl bg-bg-elevated text-text-primary font-semibold text-base
                transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            >
              <Pause size={18} />
              暫停
            </button>
            {store.isFreeMode && (
              <button
                onClick={handleFinishFree}
                className="py-4 px-6 rounded-2xl bg-accent-amber text-bg-primary font-semibold text-base
                  transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                style={{ boxShadow: "0 4px 20px rgba(240, 168, 48, 0.3)" }}
              >
                <Square size={16} />
                結束
              </button>
            )}
          </>
        )}

        {store.timerState === "paused" && (
          <>
            <button
              onClick={() => store.resume()}
              className="flex-1 py-4 rounded-2xl bg-accent-amber text-bg-primary font-semibold text-base
                transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              style={{ boxShadow: "0 4px 20px rgba(240, 168, 48, 0.3)" }}
            >
              <Play size={18} />
              繼續
            </button>
            <button
              onClick={handleFinishFree}
              className="py-4 px-6 rounded-2xl bg-bg-elevated text-text-primary font-semibold text-base
                transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            >
              <Square size={16} />
              結束
            </button>
          </>
        )}

        {store.timerState === "completed" && (
          <button
            onClick={() => store.reset()}
            className="flex-1 py-4 rounded-2xl bg-bg-elevated text-text-primary font-semibold text-base
              transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            再來一次
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="w-full mt-8 grid grid-cols-3 gap-3 mb-8">
        <div className="rounded-xl bg-bg-card border border-border-subtle p-3 text-center">
          <div className="text-lg font-semibold stat-number">
            {store.todayCompleted ? `🔥 ${store.streak}` : store.streak || 0}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">連續天數</div>
        </div>
        <div className="rounded-xl bg-bg-card border border-border-subtle p-3 text-center">
          <div className="text-lg font-semibold stat-number">
            {store.monthTotal}m
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">本月累計</div>
        </div>
        <div className="rounded-xl bg-bg-card border border-border-subtle p-3 text-center">
          <div className="text-lg font-semibold stat-number">
            {store.totalSessions}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">總次數</div>
        </div>
      </div>

    </div>
  );
}
