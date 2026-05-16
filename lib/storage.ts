import type { AppData } from "./types";

const KEY = "traction_v1";

export function loadData(): AppData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppData) : null;
  } catch {
    return null;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (e) {
    console.error("Traction: could not save to localStorage", e);
  }
}

export function clearData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
