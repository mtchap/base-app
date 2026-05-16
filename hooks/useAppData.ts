"use client";

/**
 * Thin re-export — all state lives in AppDataContext.
 * Pages import this hook as usual; nothing in them needs to change.
 */
export { useAppDataContext as useAppData } from "@/lib/AppDataContext";
export type { SyncStatus } from "@/lib/AppDataContext";
