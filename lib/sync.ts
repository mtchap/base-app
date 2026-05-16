import type { AppData } from "./types";

const SYNC_KEY_LS = "base_sync_key";

// ─── Key persistence ──────────────────────────────────────────────────────────

export function getSyncKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SYNC_KEY_LS) || null;
}

export function storeSyncKey(key: string | null) {
  if (typeof window === "undefined") return;
  if (key) {
    localStorage.setItem(SYNC_KEY_LS, key.trim().toLowerCase());
  } else {
    localStorage.removeItem(SYNC_KEY_LS);
  }
}

// ─── Cloud operations ─────────────────────────────────────────────────────────

async function syncRequest(body: object): Promise<Response> {
  return fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function pullFromCloud(syncKey: string): Promise<AppData | null> {
  const res = await syncRequest({ action: "pull", syncKey });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(error ?? `Pull failed (${res.status})`);
  }
  const { data } = await res.json();
  return data ?? null;
}

export async function pushToCloud(syncKey: string, data: AppData): Promise<void> {
  const res = await syncRequest({ action: "push", syncKey, data });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(error ?? `Push failed (${res.status})`);
  }
}

// ─── Merge strategy: last write wins ─────────────────────────────────────────

export function mergeAppData(local: AppData, cloud: AppData): AppData {
  const localTs = new Date(local.lastUpdated).getTime();
  const cloudTs = new Date(cloud.lastUpdated).getTime();
  return cloudTs > localTs ? cloud : local;
}
