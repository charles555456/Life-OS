"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Pause, Play, RotateCcw, Coffee, Leaf, Briefcase, SkipForward } from "lucide-react";
import { usePomodoroStore } from "@/stores/pomodoroStore";
import { playBellStart, playBellEnd, resumeAudioContext } from "@/lib/audio";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ─── Coffee Cup SVG ─── */
function CoffeeCupSVG({
  progress,
  isBreak,
  isIdle,
  isCompleted,
}: {
  progress: number; // 0→1
  isBreak: boolean;
  isIdle: boolean;
  isCompleted: boolean;
}) {
  // Liquid color based on state
  const liquidColor = isBreak ? "#34D399" : "#F0A830";
  const liquidColorDark = isBreak ? "#2AB883" : "#D4922A";
  const glowColor = isBreak ? "rgba(52,211,153,0.35)" : "rgba(240,168,48,0.35)";

  // Cup interior dimensions (relative to viewBox)
  // The liquid fills from bottom to top inside the cup
  const cupInnerTop = 52;     // y where liquid starts (top of cup interior)
  const cupInnerBottom = 158; // y where liquid ends (bottom of cup interior)
  const liquidHeight = cupInnerBottom - cupInnerTop;
  const fillHeight = liquidHeight * Math.min(progress, 1);
  const liquidY = cupInnerBottom - fillHeight;

  // Subtle wave animation offset
  const waveId = `wave-${Math.random().toString(36).slice(2, 8)}`;
  const steamId = `steam-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg viewBox="0 0 200 220" className="w-full h-full">
      <defs>
        {/* Clip path for cup interior — liquid only shows inside */}
        <clipPath id="cup-clip">
          <path d="M 52 48 L 62 162 Q 64 172 74 174 L 126 174 Q 136 172 138 162 L 148 48 Z" />
        </clipPath>

        {/* Liquid gradient */}
        <linearGradient id="liquid-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={liquidColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={liquidColorDark} stopOpacity="1" />
        </linearGradient>

        {/* Steam gradient */}
        <linearGradient id={steamId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={liquidColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={liquidColor} stopOpacity="0" />
        </linearGradient>

        {/* Foam gradient */}
        <linearGradient id="foam-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF8E8" stopOpacity="0.5" />
          <stop offset="100%" stopColor={liquidColor} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Glow behind cup when active */}
      {!isIdle && (
        <ellipse
          cx="100"
          cy="120"
          rx="70"
          ry="55"
          fill={glowColor}
          className={isCompleted ? "animate-pulse" : ""}
        />
      )}

      {/* ── Cup body (outline) ── */}
      <path
        d="M 48 44 L 58 164 Q 62 178 76 180 L 124 180 Q 138 178 142 164 L 152 44 Z"
        fill="none"
        stroke="var(--text-muted)"
        strokeWidth="3"
        strokeLinejoin="round"
        opacity={isIdle ? "0.3" : "0.5"}
      />

      {/* Cup body fill (dark interior) */}
      <path
        d="M 52 48 L 62 162 Q 64 172 74 174 L 126 174 Q 136 172 138 162 L 148 48 Z"
        fill="var(--bg-primary)"
        opacity="0.8"
      />

      {/* ── Handle ── */}
      <path
        d="M 152 60 Q 178 62 180 100 Q 182 138 152 140"
        fill="none"
        stroke="var(--text-muted)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity={isIdle ? "0.3" : "0.5"}
      />

      {/* ── Liquid (clipped inside cup) ── */}
      <g clipPath="url(#cup-clip)">
        {/* Main liquid body */}
        {progress > 0 && (
          <>
            <rect
              x="48"
              y={liquidY}
              width="108"
              height={fillHeight + 4}
              fill="url(#liquid-grad)"
              className="transition-all duration-1000 ease-linear"
            />

            {/* Wave surface */}
            <path
              d={`
                M 48 ${liquidY}
                Q 70 ${liquidY - 4} 100 ${liquidY}
                Q 130 ${liquidY + 4} 156 ${liquidY}
                L 156 ${liquidY + 8}
                Q 130 ${liquidY + 4} 100 ${liquidY + 8}
                Q 70 ${liquidY + 12} 48 ${liquidY + 8}
                Z
              `}
              fill="url(#foam-grad)"
              className="transition-all duration-1000 ease-linear"
            >
              {!isIdle && !isCompleted && (
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 3,-1; 0,0; -3,1; 0,0"
                  dur="4s"
                  repeatCount="indefinite"
                />
              )}
            </path>
          </>
        )}
      </g>

      {/* ── Steam (only when > 30% filled and active) ── */}
      {progress > 0.3 && !isIdle && (
        <g opacity="0.6">
          <path
            d="M 85 44 Q 82 28 88 16"
            fill="none"
            stroke={`url(#${steamId})`}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -2,-3; 0,-5; 2,-3; 0,0"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.2;0.6"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M 100 42 Q 97 24 103 10"
            fill="none"
            stroke={`url(#${steamId})`}
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 2,-4; 0,-6; -2,-4; 0,0"
              dur="3.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0.15;0.5"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M 115 44 Q 118 30 112 18"
            fill="none"
            stroke={`url(#${steamId})`}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -1,-3; 0,-5; 1,-2; 0,0"
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0.1;0.4"
              dur="4s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      )}

      {/* ── Saucer ── */}
      <ellipse
        cx="100"
        cy="186"
        rx="62"
        ry="8"
        fill="none"
        stroke="var(--text-muted)"
        strokeWidth="2.5"
        opacity={isIdle ? "0.2" : "0.35"}
      />

      {/* Completed sparkles */}
      {isCompleted && (
        <>
          <circle cx="38" cy="60" r="3" fill={liquidColor} opacity="0.7" className="animate-ping" />
          <circle cx="168" cy="55" r="2.5" fill={liquidColor} opacity="0.6" className="animate-ping" style={{ animationDelay: "0.3s" }} />
          <circle cx="30" cy="110" r="2" fill={liquidColor} opacity="0.5" className="animate-ping" style={{ animationDelay: "0.6s" }} />
          <circle cx="174" cy="120" r="2" fill={liquidColor} opacity="0.5" className="animate-ping" style={{ animationDelay: "0.9s" }} />
        </>
      )}
    </svg>
  );
}

export default function PomodoroPage() {
  const store = usePomodoroStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [soundEnabled] = useState(true);

  useEffect(() => {
    store.loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer interval
  useEffect(() => {
    if (store.state === "focus" || store.state === "break") {
      intervalRef.current = setInterval(() => {
        const result = store.tick();
        if (result === "completed") {
          if (soundEnabled) playBellEnd();
          store.complete();
        } else if (result === "break_done") {
          if (soundEnabled) playBellEnd();
          store.reset();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.state, soundEnabled]);

  // Display time
  const isBreak = store.state === "break";
  const totalTarget = isBreak ? store.breakMinutes * 60 : store.focusMinutes * 60;
  const remaining = Math.max(0, totalTarget - store.elapsedSeconds);
  const displayTime =
    store.state === "idle"
      ? formatTime(store.focusMinutes * 60)
      : formatTime(remaining);

  // Progress (0 to 1)
  const progress = store.state === "idle" ? 0 : Math.min(store.elapsedSeconds / totalTarget, 1);
  const isCompleted = store.state === "completed";

  const handleStart = useCallback(() => {
    resumeAudioContext();
    if (soundEnabled) playBellStart();
    store.start();
  }, [store, soundEnabled]);

  const handleStartBreak = useCallback(() => {
    store.startBreak();
  }, [store]);

  // Coffee cups for today
  const todayTotal = store.stats.todayFoundation + store.stats.todayWork;

  return (
    <div className="px-5 pt-4 flex flex-col items-center">
      <div className="w-full mb-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Coffee size={24} className="text-accent-amber" />
          番茄鐘
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          {store.state === "focus"
            ? "專注中 — 心無旁騖"
            : store.state === "break"
            ? "休息一下 — 喝杯咖啡"
            : store.state === "completed"
            ? "做得好！一杯完成"
            : "選擇領域，開始專注"}
        </p>
      </div>

      {/* Domain selector — only when idle */}
      {store.state === "idle" && (
        <div className="w-full mb-5">
          <div className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-2">
            這杯咖啡屬於
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => store.setDomain("foundation")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95
                ${
                  store.domain === "foundation"
                    ? "bg-accent-emerald-soft text-accent-emerald ring-1 ring-accent-emerald"
                    : "bg-bg-elevated text-text-muted hover:text-text-secondary"
                }
              `}
            >
              <Leaf size={16} />
              Foundation
            </button>
            <button
              onClick={() => store.setDomain("work")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95
                ${
                  store.domain === "work"
                    ? "bg-accent-sky-soft text-accent-sky ring-1 ring-accent-sky"
                    : "bg-bg-elevated text-text-muted hover:text-text-secondary"
                }
              `}
            >
              <Briefcase size={16} />
              工作
            </button>
          </div>

          {/* Optional label */}
          <input
            type="text"
            value={store.label}
            onChange={(e) => store.setLabel(e.target.value)}
            placeholder="這次專注在什麼？（選填）"
            className="w-full mt-3 bg-bg-elevated rounded-xl px-4 py-2.5 text-sm text-text-primary
              placeholder:text-text-muted border border-border-subtle focus:border-accent-amber focus:outline-none transition-colors"
          />
        </div>
      )}

      {/* Active domain indicator when running */}
      {store.state !== "idle" && (
        <div className="mb-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              store.domain === "foundation"
                ? "bg-accent-emerald-soft text-accent-emerald"
                : "bg-accent-sky-soft text-accent-sky"
            }`}
          >
            {store.domain === "foundation" ? (
              <Leaf size={12} />
            ) : (
              <Briefcase size={12} />
            )}
            {store.domain === "foundation" ? "Foundation" : "工作"}
            {store.label && ` · ${store.label}`}
          </span>
        </div>
      )}

      {/* ─── Coffee Cup Timer ─── */}
      <div className="relative my-2" style={{ width: 240, height: 264 }}>
        <CoffeeCupSVG
          progress={isCompleted ? 1 : progress}
          isBreak={isBreak}
          isIdle={store.state === "idle"}
          isCompleted={isCompleted}
        />

        {/* Time overlay on the cup */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: 20 }}>
          {isCompleted ? (
            <>
              <span className="text-3xl mb-1">☕</span>
              <span className="text-sm font-semibold" style={{ color: "var(--accent-amber)" }}>
                +1 咖啡
              </span>
            </>
          ) : (
            <>
              <span
                className={`font-light tracking-tight stat-number text-text-primary transition-all ${
                  store.state !== "idle" ? "text-4xl" : "text-3xl opacity-60"
                }`}
                style={{
                  textShadow: store.state !== "idle" ? "0 2px 8px rgba(0,0,0,0.6)" : "none",
                }}
              >
                {displayTime}
              </span>
              <span className="text-[11px] text-text-muted mt-0.5">
                {store.state === "break"
                  ? "休息中"
                  : store.state === "idle"
                  ? "專注時間"
                  : `${Math.round(progress * 100)}%`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Duration presets — only when idle */}
      {store.state === "idle" && (
        <div className="flex gap-2 mb-5">
          {[25, 45, 60, 90].map((min) => (
            <button
              key={min}
              onClick={() => store.setFocusMinutes(min)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95
                ${
                  store.focusMinutes === min
                    ? "bg-accent-amber text-bg-primary"
                    : "bg-bg-elevated text-text-secondary hover:bg-bg-card-hover"
                }
              `}
            >
              {min}m
            </button>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 w-full max-w-xs">
        {store.state === "idle" && (
          <button
            onClick={handleStart}
            className="flex-1 py-4 rounded-2xl bg-accent-amber text-bg-primary font-semibold text-base transition-all active:scale-[0.97] hover:brightness-110 flex items-center justify-center gap-2"
            style={{ boxShadow: "0 4px 20px rgba(240, 168, 48, 0.3)" }}
          >
            <Coffee size={18} />
            開始專注
          </button>
        )}

        {store.state === "focus" && (
          <button
            onClick={() => store.pause()}
            className="flex-1 py-4 rounded-2xl bg-bg-elevated text-text-primary font-semibold text-base transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <Pause size={18} />
            暫停
          </button>
        )}

        {store.state === "paused" && (
          <>
            <button
              onClick={() => store.resume()}
              className="flex-1 py-4 rounded-2xl bg-accent-amber text-bg-primary font-semibold text-base transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              style={{ boxShadow: "0 4px 20px rgba(240, 168, 48, 0.3)" }}
            >
              <Play size={18} />
              繼續
            </button>
            <button
              onClick={async () => {
                await store.complete();
              }}
              className="py-4 px-5 rounded-2xl bg-bg-elevated text-text-primary font-semibold text-base transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            >
              結束
            </button>
          </>
        )}

        {store.state === "completed" && (
          <div className="flex gap-3 w-full">
            <button
              onClick={handleStartBreak}
              className="flex-1 py-4 rounded-2xl bg-accent-emerald-soft text-accent-emerald font-semibold text-base transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            >
              ☕ 休息 {store.breakMinutes}m
            </button>
            <button
              onClick={() => store.reset()}
              className="flex-1 py-4 rounded-2xl bg-bg-elevated text-text-primary font-semibold text-base transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              再來
            </button>
          </div>
        )}

        {store.state === "break" && (
          <button
            onClick={() => store.reset()}
            className="flex-1 py-4 rounded-2xl bg-bg-elevated text-text-primary font-semibold text-base transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <SkipForward size={16} />
            跳過休息
          </button>
        )}
      </div>

      {/* Today's coffee cups */}
      <div className="w-full mt-8 mb-2">
        <div className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-2">
          今日咖啡 · 領先指標
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {todayTotal === 0 ? (
            <span className="text-xs text-text-muted">還沒有咖啡，開始第一杯吧</span>
          ) : (
            Array.from({ length: todayTotal }).map((_, i) => (
              <span
                key={i}
                className="text-xl"
                style={{
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                }}
              >
                ☕
              </span>
            ))
          )}
        </div>
      </div>

      {/* Stats by domain */}
      <div className="w-full mt-4 grid grid-cols-2 gap-3 mb-8">
        {/* Foundation */}
        <div
          className="rounded-2xl border border-accent-emerald/20 bg-accent-emerald-soft p-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Leaf size={14} className="text-accent-emerald" />
            <span className="text-xs font-semibold text-accent-emerald">
              Foundation
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">今日</span>
              <span className="stat-number font-semibold text-text-primary">
                {store.stats.todayFoundation} 杯
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">本週</span>
              <span className="stat-number font-semibold text-text-primary">
                {store.stats.weekFoundation} 杯
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">總計</span>
              <span className="stat-number font-semibold text-text-primary">
                {store.stats.totalFoundation} 杯
              </span>
            </div>
          </div>
        </div>

        {/* Work */}
        <div
          className="rounded-2xl border border-accent-sky/20 bg-accent-sky-soft p-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Briefcase size={14} className="text-accent-sky" />
            <span className="text-xs font-semibold text-accent-sky">工作</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">今日</span>
              <span className="stat-number font-semibold text-text-primary">
                {store.stats.todayWork} 杯
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">本週</span>
              <span className="stat-number font-semibold text-text-primary">
                {store.stats.weekWork} 杯
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">總計</span>
              <span className="stat-number font-semibold text-text-primary">
                {store.stats.totalWork} 杯
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
