"use client";

import { useEffect, useState } from "react";
import { db, today } from "@/lib/db";
import type { DailyLog, MeditationSession } from "@/types";

// Health score: 4 metrics, each boolean
export interface HealthMetrics {
  exercise: boolean;   // 7天內運動 > 3天
  sleep: boolean;      // 最近記錄睡眠 > 7小時
  hrv: boolean;        // HRV > 個人基準值 (預設 40ms)
  meditation: boolean; // 7天內冥想 > 4次
}

export type AvatarState = "low" | "ok" | "great";

function getAvatarState(metrics: HealthMetrics): AvatarState {
  const score = [metrics.exercise, metrics.sleep, metrics.hrv, metrics.meditation].filter(Boolean).length;
  if (score >= 3) return "great";  // >= 75%
  if (score >= 2) return "ok";     // >= 50%
  return "low";                     // < 50%
}

function getStateConfig(state: AvatarState) {
  switch (state) {
    case "great":
      return {
        label: "精神飽滿",
        color: "#34D399",      // emerald
        bgGlow: "rgba(52, 211, 153, 0.12)",
        emoji: "💪",
        bodyColor: "#34D399",
        headGlow: "rgba(52, 211, 153, 0.25)",
      };
    case "ok":
      return {
        label: "狀態良好",
        color: "#F0A830",      // amber
        bgGlow: "rgba(240, 168, 48, 0.12)",
        emoji: "😊",
        bodyColor: "#F0A830",
        headGlow: "rgba(240, 168, 48, 0.2)",
      };
    case "low":
      return {
        label: "需要加油",
        color: "#F471B5",      // rose
        bgGlow: "rgba(244, 113, 181, 0.12)",
        emoji: "😴",
        bodyColor: "#F471B5",
        headGlow: "rgba(244, 113, 181, 0.15)",
      };
  }
}

// SVG Avatar Component
function AvatarSVG({ state }: { state: AvatarState }) {
  const config = getStateConfig(state);

  // Posture and expression change by state
  const isGreat = state === "great";
  const isLow = state === "low";

  return (
    <svg viewBox="0 0 120 160" className="w-full h-full" style={{ filter: `drop-shadow(0 0 12px ${config.headGlow})` }}>
      {/* Background aura */}
      <circle
        cx="60"
        cy="70"
        r={isGreat ? 52 : 45}
        fill={config.bgGlow}
        className={isGreat ? "animate-pulse" : ""}
      />

      {/* Body */}
      <g transform={isLow ? "translate(0, 4)" : "translate(0, 0)"}>
        {/* Legs */}
        <line
          x1={isGreat ? "48" : "52"}
          y1="108"
          x2={isGreat ? "40" : "48"}
          y2="140"
          stroke={config.bodyColor}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
        />
        <line
          x1={isGreat ? "72" : "68"}
          y1="108"
          x2={isGreat ? "80" : "72"}
          y2="140"
          stroke={config.bodyColor}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Torso */}
        <path
          d={isLow
            ? "M 45 68 Q 42 90 48 110 L 72 110 Q 78 90 75 68 Z"     // slouched
            : isGreat
              ? "M 42 65 Q 40 88 46 108 L 74 108 Q 80 88 78 65 Z"   // tall & proud
              : "M 44 66 Q 42 88 47 108 L 73 108 Q 78 88 76 66 Z"   // normal
          }
          fill={config.bodyColor}
          opacity="0.2"
          stroke={config.bodyColor}
          strokeWidth="2"
        />

        {/* Arms */}
        {isGreat ? (
          <>
            {/* Arms up! celebrating */}
            <line x1="42" y1="74" x2="24" y2="52" stroke={config.bodyColor} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            <line x1="78" y1="74" x2="96" y2="52" stroke={config.bodyColor} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            {/* Hands - small circles */}
            <circle cx="22" cy="50" r="3" fill={config.bodyColor} opacity="0.9" />
            <circle cx="98" cy="50" r="3" fill={config.bodyColor} opacity="0.9" />
          </>
        ) : isLow ? (
          <>
            {/* Arms hanging down */}
            <line x1="45" y1="76" x2="34" y2="104" stroke={config.bodyColor} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
            <line x1="75" y1="76" x2="86" y2="104" stroke={config.bodyColor} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          </>
        ) : (
          <>
            {/* Arms relaxed at sides */}
            <line x1="44" y1="74" x2="30" y2="98" stroke={config.bodyColor} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            <line x1="76" y1="74" x2="90" y2="98" stroke={config.bodyColor} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
          </>
        )}

        {/* Head */}
        <circle
          cx="60"
          cy={isLow ? "52" : "48"}
          r="18"
          fill="var(--bg-elevated)"
          stroke={config.bodyColor}
          strokeWidth="2.5"
        />

        {/* Face - Eyes */}
        {isGreat ? (
          <>
            {/* Happy squint eyes */}
            <path d="M 52 46 Q 54 43 56 46" stroke={config.bodyColor} strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 64 46 Q 66 43 68 46" stroke={config.bodyColor} strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        ) : isLow ? (
          <>
            {/* Tired droopy eyes */}
            <circle cx="54" cy="50" r="2" fill={config.bodyColor} opacity="0.6" />
            <circle cx="66" cy="50" r="2" fill={config.bodyColor} opacity="0.6" />
            {/* Droopy eyelids */}
            <path d="M 51 48 Q 54 49 57 48" stroke={config.bodyColor} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
            <path d="M 63 48 Q 66 49 69 48" stroke={config.bodyColor} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
          </>
        ) : (
          <>
            {/* Normal eyes */}
            <circle cx="54" cy="46" r="2.5" fill={config.bodyColor} opacity="0.9" />
            <circle cx="66" cy="46" r="2.5" fill={config.bodyColor} opacity="0.9" />
          </>
        )}

        {/* Mouth */}
        {isGreat ? (
          <path d="M 53 54 Q 60 60 67 54" stroke={config.bodyColor} strokeWidth="2" strokeLinecap="round" fill="none" />
        ) : isLow ? (
          <path d="M 54 56 Q 60 53 66 56" stroke={config.bodyColor} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
        ) : (
          <path d="M 54 54 Q 60 57 66 54" stroke={config.bodyColor} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        )}

        {/* Great state: sparkles around */}
        {isGreat && (
          <>
            <circle cx="20" cy="36" r="2" fill={config.bodyColor} opacity="0.6" className="animate-ping" />
            <circle cx="100" cy="36" r="2" fill={config.bodyColor} opacity="0.6" className="animate-ping" style={{ animationDelay: "0.5s" }} />
            <circle cx="14" cy="70" r="1.5" fill={config.bodyColor} opacity="0.4" className="animate-ping" style={{ animationDelay: "1s" }} />
            <circle cx="106" cy="70" r="1.5" fill={config.bodyColor} opacity="0.4" className="animate-ping" style={{ animationDelay: "0.7s" }} />
          </>
        )}
      </g>
    </svg>
  );
}

// Metric indicator dot
function MetricDot({ label, active, color }: { label: string; active: boolean; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-3 h-3 rounded-full transition-all duration-500 ${active ? "scale-110" : "opacity-30"}`}
        style={{ backgroundColor: active ? color : "var(--text-muted)" }}
      />
      <span className="text-[10px] text-text-muted">{label}</span>
    </div>
  );
}

export default function HealthAvatar({ hrvBaseline = 40 }: { hrvBaseline?: number }) {
  const [metrics, setMetrics] = useState<HealthMetrics>({
    exercise: false,
    sleep: false,
    hrv: false,
    meditation: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const todayStr = today();
      // Calculate 7 days ago
      const d = new Date();
      d.setDate(d.getDate() - 6);
      const sevenDaysAgo = d.toISOString().split("T")[0];

      // Get last 7 days of daily logs
      const logs = await db.dailyLogs
        .where("date")
        .between(sevenDaysAgo, todayStr, true, true)
        .toArray();

      // Get last 7 days of meditation sessions
      const meditations = await db.meditationSessions
        .where("date")
        .between(sevenDaysAgo, todayStr, true, true)
        .toArray();

      // 1. Exercise: days with exercise in last 7 days > 3
      const exerciseDays = logs.filter(
        (l) => l.exerciseType !== null && l.exerciseDuration !== null && l.exerciseDuration > 0
      ).length;

      // 2. Sleep: most recent log with sleep data > 7 hours
      const logsWithSleep = logs
        .filter((l) => l.sleepHours !== null && l.sleepHours > 0)
        .sort((a, b) => b.date.localeCompare(a.date));
      const latestSleep = logsWithSleep.length > 0 ? logsWithSleep[0].sleepHours! : 0;

      // 3. HRV: most recent log with HRV > baseline
      const logsWithHRV = logs
        .filter((l) => l.hrv !== null && l.hrv > 0)
        .sort((a, b) => b.date.localeCompare(a.date));
      const latestHRV = logsWithHRV.length > 0 ? logsWithHRV[0].hrv! : 0;

      // 4. Meditation: completed sessions in last 7 days > 4
      const completedMeditations = meditations.filter((m) => m.completed).length;

      setMetrics({
        exercise: exerciseDays > 3,
        sleep: latestSleep >= 7,
        hrv: latestHRV > hrvBaseline,
        meditation: completedMeditations > 4,
      });
    } catch (err) {
      console.error("Failed to load health metrics:", err);
    } finally {
      setLoading(false);
    }
  }

  const state = getAvatarState(metrics);
  const config = getStateConfig(state);
  const score = [metrics.exercise, metrics.sleep, metrics.hrv, metrics.meditation].filter(Boolean).length;

  if (loading) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="h-48 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">身體狀態</div>
        <div
          className="text-xs font-medium px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: config.bgGlow, color: config.color }}
        >
          {config.label}
        </div>
      </div>

      {/* Avatar + Score */}
      <div className="flex items-center gap-4">
        <div className="w-28 h-36 flex-shrink-0">
          <AvatarSVG state={state} />
        </div>
        <div className="flex-1 space-y-3">
          {/* Score ring */}
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="var(--bg-elevated)" strokeWidth="4" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke={config.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 4) * 125.66} 125.66`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: config.color }}>
                  {score}/4
                </span>
              </div>
            </div>
            <div className="text-[11px] text-text-secondary leading-relaxed">
              {state === "great" && "所有指標都很棒，繼續保持！"}
              {state === "ok" && "狀態穩定，再努力一點就更好"}
              {state === "low" && "多休息、多運動，照顧好自己"}
            </div>
          </div>

          {/* Metric dots */}
          <div className="flex justify-between px-1">
            <MetricDot label="運動" active={metrics.exercise} color="#34D399" />
            <MetricDot label="睡眠" active={metrics.sleep} color="#38BDF8" />
            <MetricDot label="HRV" active={metrics.hrv} color="#F471B5" />
            <MetricDot label="冥想" active={metrics.meditation} color="#F0A830" />
          </div>
        </div>
      </div>
    </div>
  );
}
