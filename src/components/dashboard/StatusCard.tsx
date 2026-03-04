"use client";

import type { ReactNode } from "react";

interface StatusCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  accentColor: "amber" | "emerald" | "rose" | "sky";
  done?: boolean;
}

const accentMap = {
  amber: {
    bg: "bg-accent-amber-soft",
    text: "text-accent-amber",
    glow: "var(--accent-amber)",
  },
  emerald: {
    bg: "bg-accent-emerald-soft",
    text: "text-accent-emerald",
    glow: "var(--accent-emerald)",
  },
  rose: {
    bg: "bg-accent-rose-soft",
    text: "text-accent-rose",
    glow: "var(--accent-rose)",
  },
  sky: {
    bg: "bg-accent-sky-soft",
    text: "text-accent-sky",
    glow: "var(--accent-sky)",
  },
};

export default function StatusCard({
  icon,
  label,
  value,
  subtext,
  accentColor,
  done,
}: StatusCardProps) {
  const accent = accentMap[accentColor];

  return (
    <div
      className={`
        relative rounded-2xl p-4 border border-border-subtle
        bg-bg-card transition-all duration-200
        active:scale-[0.97] active:bg-bg-card-hover
      `}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-xl ${accent.bg} flex items-center justify-center`}
        >
          <span className={accent.text}>{icon}</span>
        </div>
        {done !== undefined && (
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs
              ${
                done
                  ? `border-accent-emerald bg-accent-emerald-soft text-accent-emerald`
                  : `border-text-muted`
              }
            `}
          >
            {done && "✓"}
          </div>
        )}
      </div>

      <div className="stat-number text-2xl font-semibold tracking-tight leading-none mb-0.5">
        {value}
      </div>
      <div className="text-xs text-text-secondary font-medium">{label}</div>
      {subtext && (
        <div className="text-[10px] text-text-muted mt-1">{subtext}</div>
      )}
    </div>
  );
}
