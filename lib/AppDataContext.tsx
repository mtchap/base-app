"use client";

import {
  createContext, useContext, useState, useEffect, useCallback, useRef,
  type ReactNode,
} from "react";
import type {
  AppData, DailyLog, WeeklyLog, BrainDumpItem,
  LifeArea, LifeAreaCard, HabitDay, LooksDay, LooksStack,
} from "@/lib/types";
import { loadData, saveData } from "@/lib/storage";
import { createSeedData } from "@/lib/seed";
import { emptyAppData, ensureDefaults } from "@/lib/defaults";
import { generateId } from "@/lib/utils";
import { getSyncKey, storeSyncKey, pullFromCloud, pushToCloud, mergeAppData } from "@/lib/sync";

export type SyncStatus = "idle" | "syncing" | "ok" | "error";

// ─── Context shape ────────────────────────────────────────────────────────────

export interface AppDataContextValue {
  data: AppData;
  isLoaded: boolean;
  // sync
  syncKey: string | null;
  syncStatus: SyncStatus;
  activateSyncKey: (key: string) => Promise<void>;
  clearSyncKey: () => void;
  syncNow: () => Promise<void>;
  forcePush: () => Promise<void>;
  // data updaters
  updateDailyLog: (date: string, changes: Partial<DailyLog>) => void;
  updateWeeklyLog: (weekStart: string, changes: Partial<WeeklyLog>) => void;
  addBrainDumpItem: (content: string) => void;
  updateBrainDumpItem: (id: string, changes: Partial<BrainDumpItem>) => void;
  removeBrainDumpItem: (id: string) => void;
  updateLifeArea: (area: LifeArea, changes: Partial<LifeAreaCard>) => void;
  updateHabitDay: (date: string, changes: Partial<HabitDay>) => void;
  updateLooksDay: (date: string, changes: Partial<LooksDay>) => void;
  updateLooksStack: (changes: Partial<LooksStack>) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData]             = useState<AppData>(() => emptyAppData());
  const [isLoaded, setIsLoaded]     = useState(false);
  const [syncKey, setSyncKey]       = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncKeyRef = useRef<string | null>(null);

  // ── Sync: debounced push ──────────────────────────────────────────────────
  const schedulePush = useCallback((key: string, appData: AppData) => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      setSyncStatus("syncing");
      try {
        await pushToCloud(key, appData);
        setSyncStatus("ok");
      } catch {
        setSyncStatus("error");
      }
    }, 2500);
  }, []);

  // ── Core updater ──────────────────────────────────────────────────────────
  const update = useCallback((fn: (prev: AppData) => AppData) => {
    setData(prev => {
      const next = { ...fn(prev), lastUpdated: new Date().toISOString() };
      saveData(next);
      const key = syncKeyRef.current;
      if (key) schedulePush(key, next);
      return next;
    });
  }, [schedulePush]);

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedKey = getSyncKey();
    if (storedKey) {
      setSyncKey(storedKey);
      syncKeyRef.current = storedKey;
    }

    const stored = loadData();
    let local: AppData;
    if (stored) {
      local = ensureDefaults(stored);
      if (local !== stored) saveData(local);
    } else {
      local = createSeedData();
      saveData(local);
    }
    setData(local);
    setIsLoaded(true);

    if (storedKey) {
      setSyncStatus("syncing");
      pullFromCloud(storedKey)
        .then(cloud => {
          if (!cloud) { setSyncStatus("ok"); return; }
          // Merge cloud + local, then re-run ensureDefaults so migration
          // isn't lost if the cloud copy was newer and didn't have it yet
          const merged   = mergeAppData(local, cloud);
          const ready    = ensureDefaults(merged);
          if (ready !== local) {
            setData(ready);
            saveData(ready);
          }
          setSyncStatus("ok");
        })
        .catch(() => setSyncStatus("error"));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync management ───────────────────────────────────────────────────────
  const activateSyncKey = useCallback(async (key: string) => {
    const norm = key.trim().toLowerCase();
    storeSyncKey(norm);
    setSyncKey(norm);
    syncKeyRef.current = norm;
    setSyncStatus("syncing");

    const cloud = await pullFromCloud(norm); // throws on network error
    setData(prev => {
      const merged = cloud ? mergeAppData(prev, cloud) : prev;
      saveData(merged);
      return merged;
    });
    const latest = loadData()!;
    await pushToCloud(norm, latest);
    setSyncStatus("ok");
  }, []);

  const clearSyncKey = useCallback(() => {
    storeSyncKey(null);
    setSyncKey(null);
    syncKeyRef.current = null;
    setSyncStatus("idle");
    if (pushTimer.current) clearTimeout(pushTimer.current);
  }, []);

  const syncNow = useCallback(async () => {
    const key = syncKeyRef.current;
    if (!key) return;
    setSyncStatus("syncing");
    try {
      const cloud = await pullFromCloud(key);
      setData(prev => {
        const merged = cloud ? mergeAppData(prev, cloud) : prev;
        if (merged !== prev) saveData(merged);
        return merged;
      });
      const latest = loadData()!;
      await pushToCloud(key, latest);
      setSyncStatus("ok");
    } catch {
      setSyncStatus("error");
    }
  }, []);

  // Overwrite cloud with whatever is on this device — ignores cloud timestamp
  const forcePush = useCallback(async () => {
    const key = syncKeyRef.current;
    if (!key) return;
    setSyncStatus("syncing");
    try {
      const local = loadData();
      if (!local) return;
      // Bump lastUpdated so this device wins any future merge
      const stamped = { ...local, lastUpdated: new Date().toISOString() };
      saveData(stamped);
      setData(stamped);
      await pushToCloud(key, stamped);
      setSyncStatus("ok");
    } catch {
      setSyncStatus("error");
    }
  }, []);

  // ── Daily log ─────────────────────────────────────────────────────────────
  const updateDailyLog = useCallback(
    (date: string, changes: Partial<DailyLog>) =>
      update(prev => ({
        ...prev,
        dailyLogs: { ...prev.dailyLogs, [date]: { ...prev.dailyLogs[date], ...changes } },
      })),
    [update]
  );

  // ── Weekly log ────────────────────────────────────────────────────────────
  const updateWeeklyLog = useCallback(
    (weekStart: string, changes: Partial<WeeklyLog>) =>
      update(prev => ({
        ...prev,
        weeklyLogs: { ...prev.weeklyLogs, [weekStart]: { ...prev.weeklyLogs[weekStart], ...changes } },
      })),
    [update]
  );

  // ── Brain dump ────────────────────────────────────────────────────────────
  const addBrainDumpItem = useCallback(
    (content: string) => {
      const newItem: BrainDumpItem = {
        id: generateId(), content, label: "unprocessed",
        createdAt: new Date().toISOString(), convertedToTask: false,
      };
      update(prev => ({ ...prev, brainDump: [newItem, ...prev.brainDump] }));
    },
    [update]
  );

  const updateBrainDumpItem = useCallback(
    (id: string, changes: Partial<BrainDumpItem>) =>
      update(prev => ({
        ...prev,
        brainDump: prev.brainDump.map(item => item.id === id ? { ...item, ...changes } : item),
      })),
    [update]
  );

  const removeBrainDumpItem = useCallback(
    (id: string) =>
      update(prev => ({ ...prev, brainDump: prev.brainDump.filter(item => item.id !== id) })),
    [update]
  );

  // ── Life dashboard ────────────────────────────────────────────────────────
  const updateLifeArea = useCallback(
    (area: LifeArea, changes: Partial<LifeAreaCard>) =>
      update(prev => ({
        ...prev,
        lifeDashboard: { ...prev.lifeDashboard, [area]: { ...prev.lifeDashboard[area], ...changes } },
      })),
    [update]
  );

  // ── Habits ────────────────────────────────────────────────────────────────
  const updateHabitDay = useCallback(
    (date: string, changes: Partial<HabitDay>) =>
      update(prev => ({
        ...prev,
        habits: { ...prev.habits, [date]: { ...prev.habits[date], ...changes } },
      })),
    [update]
  );

  // ── Looks ─────────────────────────────────────────────────────────────────
  const updateLooksDay = useCallback(
    (date: string, changes: Partial<LooksDay>) =>
      update(prev => ({
        ...prev,
        looksLogs: { ...prev.looksLogs, [date]: { ...prev.looksLogs[date], ...changes } },
      })),
    [update]
  );

  const updateLooksStack = useCallback(
    (changes: Partial<LooksStack>) =>
      update(prev => ({ ...prev, looksStack: { ...prev.looksStack, ...changes } })),
    [update]
  );

  return (
    <AppDataContext.Provider
      value={{
        data, isLoaded,
        syncKey, syncStatus, activateSyncKey, clearSyncKey, syncNow, forcePush,
        updateDailyLog, updateWeeklyLog,
        addBrainDumpItem, updateBrainDumpItem, removeBrainDumpItem,
        updateLifeArea,
        updateHabitDay,
        updateLooksDay, updateLooksStack,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppDataContext() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppDataContext must be used within AppDataProvider");
  return ctx;
}
