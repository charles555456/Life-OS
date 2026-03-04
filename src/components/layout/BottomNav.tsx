"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Wind,
  Coffee,
  Activity,
  Target,
  ListChecks,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "總覽" },
  { href: "/meditation", icon: Wind, label: "冥想" },
  { href: "/pomodoro", icon: Coffee, label: "專注" },
  { href: "/body", icon: Activity, label: "身體" },
  { href: "/goals", icon: Target, label: "目標" },
  { href: "/tasks", icon: ListChecks, label: "任務" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      {/* Frosted glass background */}
      <div
        className="mx-3 mb-2 rounded-2xl border border-border-subtle"
        style={{
          background: "rgba(20, 20, 24, 0.85)",
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          boxShadow: "0 -2px 20px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl
                  transition-all duration-200 min-w-[48px]
                  ${
                    isActive
                      ? "text-accent-amber"
                      : "text-text-muted hover:text-text-secondary"
                  }
                `}
              >
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.6}
                  />
                  {isActive && (
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-amber"
                      style={{
                        boxShadow: "0 0 6px var(--accent-amber)",
                      }}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] leading-tight ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
