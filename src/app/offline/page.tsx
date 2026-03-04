"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mb-6">
        <WifiOff size={32} className="text-text-muted" />
      </div>
      <h1 className="text-xl font-bold mb-2">目前離線</h1>
      <p className="text-sm text-text-secondary mb-6">
        連線恢復後即可繼續使用 Life OS
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 rounded-xl bg-accent-amber text-bg-primary text-sm font-semibold active:scale-95 transition-all"
      >
        重新連線
      </button>
    </div>
  );
}
