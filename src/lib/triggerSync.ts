// Call this after any IndexedDB write to trigger debounced cloud sync
export function triggerSync() {
  if (typeof window !== "undefined" && (window as any).__lifeOsSync) {
    (window as any).__lifeOsSync();
  }
}
