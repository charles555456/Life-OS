"use client";

import { Calendar, Clock, MapPin } from "lucide-react";

// Demo data
const demoEvents = [
  { time: "09:00", duration: "1h", title: "Team Standup", location: "Google Meet" },
  { time: "11:00", duration: "30m", title: "1-on-1 with Mark", location: "Office" },
  { time: "14:00", duration: "2h", title: "Deep Work Block", location: null },
  { time: "17:00", duration: "1h", title: "重訓", location: "Gym" },
];

export default function CalendarPage() {
  const dateStr = new Date().toLocaleDateString("zh-TW", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="px-5 pt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">行事曆</h1>
        <p className="text-sm text-text-secondary mt-0.5">{dateStr}</p>
      </div>

      {/* Google Calendar connect CTA */}
      <div
        className="rounded-2xl border border-border-medium bg-bg-card p-5 mb-5 text-center"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <Calendar size={32} className="text-accent-amber mx-auto mb-3 opacity-60" />
        <p className="text-sm font-medium text-text-primary mb-1">連接 Google Calendar</p>
        <p className="text-xs text-text-muted mb-4">唯讀讀取行程，不會修改你的日曆</p>
        <button
          className="px-6 py-2.5 rounded-xl bg-accent-amber text-bg-primary text-sm font-semibold
            active:scale-95 transition-all hover:brightness-110"
          style={{ boxShadow: "0 2px 12px rgba(240, 168, 48, 0.25)" }}
        >
          連接 Google 帳號
        </button>
      </div>

      {/* Demo timeline */}
      <div className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-3">
        預覽 · 今日行程
      </div>
      <div className="space-y-1 mb-8">
        {demoEvents.map((event, i) => (
          <div key={i} className="flex gap-3">
            {/* Time column */}
            <div className="w-12 text-right pt-3 flex-shrink-0">
              <span className="text-xs text-text-muted stat-number">{event.time}</span>
            </div>

            {/* Line */}
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-amber border-2 border-bg-primary mt-3.5 flex-shrink-0" />
              {i < demoEvents.length - 1 && (
                <div className="w-px flex-1 bg-border-medium" />
              )}
            </div>

            {/* Event card */}
            <div
              className="flex-1 rounded-xl border border-border-subtle bg-bg-card p-3 mb-2 active:bg-bg-card-hover transition-colors"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="text-sm font-medium text-text-primary">{event.title}</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[10px] text-text-muted">
                  <Clock size={10} />
                  {event.duration}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1 text-[10px] text-text-muted">
                    <MapPin size={10} />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
