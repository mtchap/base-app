// ─── Date Utilities ───────────────────────────────────────────────────────────

export function todayKey(): string {
  const d = new Date();
  return toDateKey(d);
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Returns the ISO date string of the Monday starting the current week. */
export function weekStartKey(from: Date = new Date()): string {
  const d = new Date(from);
  const dayOfWeek = d.getDay(); // 0 = Sun
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + diff);
  return toDateKey(d);
}

/** Returns 7 date-key strings starting from Monday of the given week. */
export function getWeekDays(weekStart: string): string[] {
  const start = parseDateKey(weekStart);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toDateKey(d);
  });
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatLongDate(key: string): string {
  return parseDateKey(key).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(key: string): string {
  return parseDateKey(key).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatWeekRange(weekStart: string): string {
  const start = parseDateKey(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startStr} – ${endStr}`;
}

export function getDayLabel(key: string): string {
  return parseDateKey(key).toLocaleDateString("en-US", { weekday: "short" });
}

export function isToday(key: string): boolean {
  return key === todayKey();
}

export function isFuture(key: string): boolean {
  return key > todayKey();
}

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
