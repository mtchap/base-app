"use client";

import { useState, useRef } from "react";
import { ChevronDown, ChevronRight, Download, Upload, AlertCircle, Search, X } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, SectionLabel, Divider } from "@/components/ui/Card";
import { useAppData } from "@/hooks/useAppData";
import { todayKey, formatLongDate, formatShortDate } from "@/lib/utils";
import { saveData } from "@/lib/storage";
import type { AppData } from "@/lib/types";
import { cn } from "@/lib/cn";

const SYMBOLS: Record<string, string> = {
  task: "○", note: "•", completed: "×", migrated: "→", canceled: "—", event: "◇",
};

function entryStyle(symbol: string): string {
  if (symbol === "completed" || symbol === "canceled") return "text-ink-3 line-through";
  if (symbol === "migrated") return "text-ink-2 italic";
  if (symbol === "note") return "text-ink-2";
  return "text-ink";
}

export default function ArchivePage() {
  const { data, isLoaded } = useAppData();
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [importError, setImportError]   = useState<string | null>(null);
  const [importOk, setImportOk]         = useState(false);
  const [search, setSearch]             = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function exportData() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `base-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as AppData;
        if (!parsed.version || !parsed.dailyLogs) throw new Error("Invalid backup file");
        saveData(parsed);
        setImportOk(true);
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "Could not read file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-ink-3 text-sm">Loading...</div>
      </AppLayout>
    );
  }

  const today = todayKey();
  const allPastDates = Object.keys(data.dailyLogs)
    .filter(d => d < today)
    .sort((a, b) => b.localeCompare(a));

  // Apply search filter
  const q = search.trim().toLowerCase();
  const pastDates = q
    ? allPastDates.filter(date => {
        const log = data.dailyLogs[date];
        return (
          date.includes(q) ||
          formatLongDate(date).toLowerCase().includes(q) ||
          log.intention?.toLowerCase().includes(q) ||
          log.priorities.some(p => p.toLowerCase().includes(q)) ||
          log.rapidLog.some(e => e.content.toLowerCase().includes(q)) ||
          log.reflection?.movedForward?.toLowerCase().includes(q) ||
          log.reflection?.migrating?.toLowerCase().includes(q)
        );
      })
    : allPastDates;

  const toggleExpand = (date: string) => {
    setExpandedDate(prev => (prev === date ? null : date));
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-28 lg:pb-10 space-y-4">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[10px] tracking-widest uppercase text-ink-3 mb-1">Archive</p>
          <h1 className="text-[2rem] leading-tight font-serif text-ink">Past Days</h1>
          <p className="text-sm text-ink-3 mt-1">
            {allPastDates.length === 0
              ? "Your past logs will appear here."
              : `${allPastDates.length} day${allPastDates.length === 1 ? "" : "s"} logged.`}
          </p>
        </div>

        {/* ── Search ─────────────────────────────────────────────────────── */}
        {allPastDates.length > 0 && (
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by date, intention, or keyword…"
              className={cn(
                "w-full bg-surface-2 border border-border rounded-lg pl-9 pr-9 py-2.5",
                "text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              )}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}

        {/* Search results count */}
        {q && (
          <p className="text-[11px] font-mono text-ink-3">
            {pastDates.length === 0
              ? "No results"
              : `${pastDates.length} result${pastDates.length !== 1 ? "s" : ""} for "${search}"`}
          </p>
        )}

        {/* ── Backup / Restore ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportData}
            className="flex items-center gap-1.5 text-[11px] font-mono text-ink-3 hover:text-ink border border-border hover:border-ink-3 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download size={11} /> Export backup
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-[11px] font-mono text-ink-3 hover:text-ink border border-border hover:border-ink-3 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Upload size={11} /> Restore backup
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>

        {importError && (
          <div className="flex items-center gap-2 text-[11px] text-rust font-mono">
            <AlertCircle size={11} /> {importError}
          </div>
        )}
        {importOk && (
          <div className="text-[11px] text-sage font-mono">Backup restored — reloading…</div>
        )}

        {/* ── Empty states ───────────────────────────────────────────────── */}
        {allPastDates.length === 0 && (
          <Card>
            <p className="text-sm text-ink-3 text-center py-6">
              Nothing archived yet. Come back tomorrow — your first entry will appear here.
            </p>
          </Card>
        )}

        {allPastDates.length > 0 && pastDates.length === 0 && (
          <Card>
            <p className="text-sm text-ink-3 text-center py-4">
              No entries match &ldquo;{search}&rdquo;.
            </p>
          </Card>
        )}

        {/* ── Log list ───────────────────────────────────────────────────── */}
        <div className="space-y-2">
          {pastDates.map(date => {
            const log        = data.dailyLogs[date];
            const isExpanded = expandedDate === date;
            const doneCount  = log.rapidLog.filter(e => e.symbol === "completed").length;
            const totalTasks = log.rapidLog.filter(e => ["task", "completed", "migrated"].includes(e.symbol)).length;

            return (
              <Card key={date} className="overflow-hidden">
                {/* Summary row */}
                <button
                  onClick={() => toggleExpand(date)}
                  className="w-full flex items-start justify-between gap-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-ink-3 mb-0.5">{formatLongDate(date)}</p>
                    {log.intention ? (
                      <p className="text-sm text-ink leading-snug line-clamp-1">{log.intention}</p>
                    ) : (
                      <p className="text-sm text-ink-3 italic">No intention set</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      {totalTasks > 0 && (
                        <span className="text-[10px] text-ink-3">
                          {doneCount}/{totalTasks} tasks done
                        </span>
                      )}
                      {log.health.movement && <span className="text-[10px] text-sage">🏃 Moved</span>}
                      {log.health.protein  && <span className="text-[10px] text-sage">🥩 Protein</span>}
                      {log.health.sleep > 0 && (
                        <span className="text-[10px] text-ink-3">🌙 {log.health.sleep}h</span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 mt-1 text-ink-3">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border-light space-y-4">

                    {/* Top 3 */}
                    {log.priorities.some(p => p) && (
                      <div>
                        <SectionLabel>Top 3</SectionLabel>
                        <div className="space-y-1">
                          {log.priorities.filter(p => p).map((p, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className={cn(
                                "text-[10px] font-mono mt-0.5 w-3",
                                log.prioritiesDone?.[i] ? "text-sage" : "text-ink-3"
                              )}>
                                {log.prioritiesDone?.[i] ? "×" : String(i + 1)}
                              </span>
                              <span className={cn(
                                "text-sm",
                                log.prioritiesDone?.[i] ? "text-ink-3 line-through" : "text-ink-2"
                              )}>
                                {p}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rapid Log */}
                    {log.rapidLog.length > 0 && (
                      <div>
                        <SectionLabel>Rapid Log</SectionLabel>
                        <div className="space-y-1">
                          {log.rapidLog.map(entry => (
                            <div key={entry.id} className="flex items-start gap-2">
                              <span className="text-xs font-mono text-ink-3 mt-0.5 w-4 shrink-0">
                                {SYMBOLS[entry.symbol] ?? "•"}
                              </span>
                              <span className={cn("text-sm leading-relaxed", entryStyle(entry.symbol))}>
                                {entry.content}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reflection */}
                    {(log.reflection.movedForward || log.reflection.migrating) && (
                      <div>
                        <SectionLabel>Reflection</SectionLabel>
                        {log.reflection.movedForward && (
                          <div className="mb-2">
                            <p className="text-[10px] text-ink-3 mb-0.5">What moved forward</p>
                            <p className="text-sm text-ink-2 leading-relaxed">{log.reflection.movedForward}</p>
                          </div>
                        )}
                        {log.reflection.migrating && (
                          <div>
                            <p className="text-[10px] text-ink-3 mb-0.5">Migrated</p>
                            <p className="text-sm text-ink-2 leading-relaxed">{log.reflection.migrating}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
