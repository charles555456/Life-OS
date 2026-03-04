"use client";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Demo data
const weekData = [
  { day: "Mon", sleep: 7.2, hrv: 45, mood: 4 },
  { day: "Tue", sleep: 6.5, hrv: 38, mood: 3 },
  { day: "Wed", sleep: 7.8, hrv: 52, mood: 4 },
  { day: "Thu", sleep: 6.0, hrv: 35, mood: 2 },
  { day: "Fri", sleep: 7.5, hrv: 48, mood: 4 },
  { day: "Sat", sleep: 8.2, hrv: 55, mood: 5 },
  { day: "Sun", sleep: 0, hrv: 0, mood: 0 }, // today, not yet recorded
];

const todayIndex = new Date().getDay();
const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1;

export default function WeekChart() {
  const maxSleep = 10;

  return (
    <div
      className="rounded-2xl border border-border-subtle bg-bg-card p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold">本週能量</span>
        <div className="flex gap-3 text-[10px] text-text-muted">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent-sky" />
            睡眠
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent-amber" />
            HRV
          </span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-between gap-2 h-24">
        {weekData.map((d, i) => {
          const sleepHeight = d.sleep ? (d.sleep / maxSleep) * 100 : 0;
          const isToday = i === adjustedIndex;
          const isFuture = i > adjustedIndex;

          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              <div className="w-full flex items-end justify-center h-20 gap-0.5">
                {/* Sleep bar */}
                <div
                  className={`w-2.5 rounded-t-sm transition-all duration-500 ${
                    isFuture
                      ? "bg-bg-elevated"
                      : isToday
                      ? "bg-bg-elevated border border-dashed border-text-muted"
                      : "bg-accent-sky"
                  }`}
                  style={{
                    height: isFuture ? "8%" : `${Math.max(sleepHeight, 8)}%`,
                    opacity: isFuture ? 0.3 : isToday && !d.sleep ? 0.4 : 0.8,
                  }}
                />
              </div>
              <span
                className={`text-[9px] font-medium ${
                  isToday ? "text-accent-amber" : "text-text-muted"
                }`}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mood row */}
      <div className="flex justify-between mt-3 px-1">
        {weekData.map((d, i) => {
          const moodEmoji = ["", "😫", "😔", "😐", "😊", "🔥"];
          const isFuture = i > adjustedIndex;
          return (
            <span
              key={`mood-${i}`}
              className={`text-xs flex-1 text-center ${
                isFuture ? "opacity-20" : ""
              }`}
            >
              {d.mood ? moodEmoji[d.mood] : "·"}
            </span>
          );
        })}
      </div>
    </div>
  );
}
