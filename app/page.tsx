"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Check, ArrowRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, SectionLabel, Divider } from "@/components/ui/Card";
import { useAppData } from "@/hooks/useAppData";
import { todayKey, formatLongDate, generateId } from "@/lib/utils";
import type { BulletSymbol, RapidLogItem, DailyHealth } from "@/lib/types";
import { emptyDailyLog } from "@/lib/defaults";
import { cn } from "@/lib/cn";

// ─── Bullet symbol helpers ────────────────────────────────────────────────────

const SYMBOLS: Record<BulletSymbol, { glyph: string; label: string }> = {
  task:      { glyph: "○", label: "Task" },
  note:      { glyph: "•", label: "Note" },
  completed: { glyph: "×", label: "Done" },
  migrated:  { glyph: "→", label: "Migrated" },
  canceled:  { glyph: "—", label: "Canceled" },
  event:     { glyph: "◇", label: "Event" },
};

const CYCLE: BulletSymbol[] = ["task", "completed", "migrated", "canceled", "note", "event"];

function nextSymbol(s: BulletSymbol): BulletSymbol {
  return CYCLE[(CYCLE.indexOf(s) + 1) % CYCLE.length];
}

function entryClass(symbol: BulletSymbol): string {
  if (symbol === "completed" || symbol === "canceled") return "line-through text-ink-3";
  if (symbol === "migrated") return "text-ink-2 italic";
  if (symbol === "note") return "text-ink-2";
  return "text-ink";
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))}
        className="w-7 h-7 rounded-lg border border-border text-ink-3 hover:text-ink hover:border-ink-3 flex items-center justify-center text-sm transition-colors"
      >
        −
      </button>
      <span className="text-sm text-ink w-12 text-center tabular-nums">
        {format(value)}
      </span>
      <button
        onClick={() => onChange(Math.min(max, +(value + step).toFixed(1)))}
        className="w-7 h-7 rounded-lg border border-border text-ink-3 hover:text-ink hover:border-ink-3 flex items-center justify-center text-sm transition-colors"
      >
        +
      </button>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
        checked ? "bg-sage border-sage text-white" : "border-border hover:border-ink-3"
      )}
    >
      {checked && <Check size={11} strokeWidth={3} />}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TodayPage() {
  const { data, isLoaded, updateDailyLog } = useAppData();
  const today = todayKey();
  const log = data.dailyLogs[today] ?? emptyDailyLog(today);

  const [newText, setNewText] = useState("");
  const [newSymbol, setNewSymbol] = useState<BulletSymbol>("task");
  const inputRef = useRef<HTMLInputElement>(null);
  const intentionRef = useRef<HTMLInputElement>(null);

  // Auto-focus intention when the page first loads and it's empty
  useEffect(() => {
    if (isLoaded && !log.intention) {
      intentionRef.current?.focus();
    }
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-ink-3 text-sm">
          Loading...
        </div>
      </AppLayout>
    );
  }

  // ── Derived state ────────────────────────────────────────────────────────────
  const prioritiesDone = log.prioritiesDone ?? [false, false, false];
  const filledPriorities = log.priorities.filter(p => p.trim()).length;
  const allPrioritiesSet = filledPriorities === 3;

  const doneTasks    = log.rapidLog.filter(e => e.symbol === "completed").length;
  const totalTasks   = log.rapidLog.filter(e => ["task", "completed"].includes(e.symbol)).length;
  const allTasksDone = totalTasks > 0 && doneTasks === totalTasks;

  // Is it evening? (after 5 PM local time)
  const hour = new Date().getHours();
  const isEvening = hour >= 17;

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function set<K extends keyof typeof log>(key: K, value: (typeof log)[K]) {
    updateDailyLog(today, { [key]: value } as Partial<typeof log>);
  }

  function setHealth(changes: Partial<DailyHealth>) {
    set("health", { ...log.health, ...changes });
  }

  function togglePriorityDone(i: number) {
    const next = [...prioritiesDone];
    while (next.length < 3) next.push(false);
    next[i] = !next[i];
    set("prioritiesDone", next);
  }

  function addEntry() {
    if (!newText.trim()) return;
    const entry: RapidLogItem = {
      id: generateId(),
      symbol: newSymbol,
      content: newText.trim(),
      createdAt: new Date().toISOString(),
    };
    set("rapidLog", [...log.rapidLog, entry]);
    setNewText("");
    inputRef.current?.focus();
  }

  function cycleEntry(id: string) {
    set(
      "rapidLog",
      log.rapidLog.map(e => (e.id === id ? { ...e, symbol: nextSymbol(e.symbol) } : e))
    );
  }

  function deleteEntry(id: string) {
    set("rapidLog", log.rapidLog.filter(e => e.id !== id));
  }

  function startNewDay() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tKey = tomorrow.toISOString().split("T")[0];

    const openItems = log.rapidLog
      .filter(e => e.symbol === "task")
      .map(e => ({ ...e, symbol: "migrated" as BulletSymbol, id: generateId() }));

    updateDailyLog(today, {
      rapidLog: log.rapidLog.map(e =>
        e.symbol === "task" ? { ...e, symbol: "migrated" as BulletSymbol } : e
      ),
    });

    if (openItems.length > 0) {
      updateDailyLog(tKey, {
        date: tKey,
        intention: "",
        priorities: ["", "", ""],
        rapidLog: openItems,
        health: { movement: false, protein: false, water: 0, sleep: 0 },
        familyNotes: "",
        reflection: { movedForward: "", migrating: "" },
      });
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-28 lg:pb-10 space-y-4">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[10px] tracking-widest uppercase text-ink-3 mb-1">Today</p>
          <h1 className="text-[2rem] leading-tight font-serif text-ink">
            {formatLongDate(today)}
          </h1>

          {/* Day-at-a-glance progress */}
          {(totalTasks > 0 || filledPriorities > 0) && (
            <div className="flex items-center gap-4 mt-3">
              {filledPriorities > 0 && (
                <span className={cn(
                  "text-[11px] font-mono",
                  allPrioritiesSet ? "text-sage" : "text-ink-3"
                )}>
                  {allPrioritiesSet ? "✓ " : ""}{filledPriorities}/3 priorities
                </span>
              )}
              {totalTasks > 0 && (
                <span className={cn(
                  "text-[11px] font-mono",
                  allTasksDone ? "text-sage" : "text-ink-3"
                )}>
                  {allTasksDone ? "✓ " : ""}{doneTasks}/{totalTasks} tasks
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── All-done banner ─────────────────────────────────────────────── */}
        {allTasksDone && totalTasks >= 2 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sage-light border border-sage/20">
            <span className="text-lg">✦</span>
            <div>
              <p className="text-sm font-medium text-sage">All tasks complete.</p>
              <p className="text-[11px] text-sage/70 mt-0.5">Clean slate. What else will you move forward today?</p>
            </div>
          </div>
        )}

        {/* ── Evening reflection prompt ───────────────────────────────────── */}
        {isEvening && !log.reflection.movedForward && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-2 border border-accent/20">
            <span className="text-base">🌙</span>
            <p className="text-[12px] text-ink-2 leading-relaxed">
              Evening check-in — take 2 minutes to fill in your reflection below.
            </p>
          </div>
        )}

        {/* ── Daily Intention ────────────────────────────────────────────── */}
        <Card>
          <SectionLabel>Daily Intention</SectionLabel>
          <input
            ref={intentionRef}
            value={log.intention}
            onChange={e => set("intention", e.target.value)}
            placeholder="What matters most today?"
            className="w-full bg-transparent text-base text-ink placeholder:text-ink-3 focus:outline-none leading-relaxed"
          />
        </Card>

        {/* ── Top 3 Priorities ───────────────────────────────────────────── */}
        <Card className={cn(allPrioritiesSet && prioritiesDone.every(Boolean) && "border-sage/30")}>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel className="mb-0">Top 3 Priorities</SectionLabel>
            {allPrioritiesSet && (
              <span className="text-[10px] font-mono text-ink-3">
                {prioritiesDone.filter(Boolean).length}/3 done
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-3">
                {/* Done toggle — only shown when priority has text */}
                {log.priorities[i]?.trim() ? (
                  <button
                    onClick={() => togglePriorityDone(i)}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                      prioritiesDone[i]
                        ? "bg-sage border-sage text-white"
                        : "border-border hover:border-ink-3"
                    )}
                  >
                    {prioritiesDone[i] && <Check size={9} strokeWidth={3} />}
                  </button>
                ) : (
                  <span className="w-5 h-5 shrink-0 flex items-center justify-center text-xs font-mono text-ink-3 select-none">
                    {i + 1}
                  </span>
                )}
                <input
                  value={log.priorities[i] ?? ""}
                  onChange={e => {
                    const next = [...log.priorities];
                    next[i] = e.target.value;
                    set("priorities", next);
                  }}
                  placeholder={i === 0 ? "Most important..." : `Priority ${i + 1}`}
                  className={cn(
                    "flex-1 bg-transparent text-sm placeholder:text-ink-3 focus:outline-none transition-colors",
                    prioritiesDone[i] ? "line-through text-ink-3" : "text-ink"
                  )}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* ── Rapid Log ──────────────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel className="mb-0">Rapid Log</SectionLabel>
            {totalTasks > 0 && (
              <span className={cn(
                "text-[10px] font-mono tabular-nums transition-colors",
                allTasksDone ? "text-sage" : "text-ink-3"
              )}>
                {doneTasks}/{totalTasks} done
              </span>
            )}
          </div>

          {log.rapidLog.length === 0 && (
            <p className="text-xs text-ink-3 mb-3">Nothing logged yet — add your first entry below.</p>
          )}

          <div className="space-y-0.5 mb-3">
            {log.rapidLog.map(entry => (
              <div key={entry.id} className="flex items-start gap-2.5 group py-1.5">
                <button
                  onClick={() => cycleEntry(entry.id)}
                  title={`${SYMBOLS[entry.symbol].label} — click to cycle`}
                  className="text-sm font-mono text-ink-3 hover:text-accent transition-colors mt-0.5 w-4 shrink-0 text-left leading-none"
                >
                  {SYMBOLS[entry.symbol].glyph}
                </button>
                <span className={cn("flex-1 text-sm leading-relaxed", entryClass(entry.symbol))}>
                  {entry.content}
                </span>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-ink-3 hover:text-rust transition-all px-1 shrink-0 leading-none mt-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <Divider className="mb-3" />

          {/* Input row */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setNewSymbol(nextSymbol(newSymbol))}
              title={`Symbol: ${SYMBOLS[newSymbol].label} — click to cycle`}
              className="text-sm font-mono text-ink-3 hover:text-accent transition-colors w-4 shrink-0 text-left"
            >
              {SYMBOLS[newSymbol].glyph}
            </button>
            <input
              ref={inputRef}
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addEntry()}
              placeholder="Add entry — press Enter"
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
            />
            <button
              onClick={addEntry}
              disabled={!newText.trim()}
              className="text-ink-3 hover:text-accent disabled:opacity-30 transition-colors shrink-0"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Symbol legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-3 border-t border-border-light">
            {Object.entries(SYMBOLS).map(([key, { glyph, label }]) => (
              <span key={key} className="text-[10px] text-ink-3 font-mono">
                {glyph} <span className="font-sans">{label}</span>
              </span>
            ))}
          </div>
        </Card>

        {/* ── Health Basics ──────────────────────────────────────────────── */}
        <Card>
          <SectionLabel>Health Basics</SectionLabel>
          <div className="space-y-3.5">

            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">Movement</span>
              <Toggle
                checked={log.health.movement}
                onChange={() => setHealth({ movement: !log.health.movement })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">Protein goal</span>
              <Toggle
                checked={log.health.protein}
                onChange={() => setHealth({ protein: !log.health.protein })}
              />
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">Water</span>
              <Stepper
                value={log.health.water}
                onChange={v => setHealth({ water: v })}
                min={0}
                max={10}
                format={v => `${v} / 8`}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">Sleep last night</span>
              <Stepper
                value={log.health.sleep}
                onChange={v => setHealth({ sleep: v })}
                min={0}
                max={12}
                step={0.5}
                format={v => `${v}h`}
              />
            </div>
          </div>
        </Card>

        {/* ── Family & Personal ──────────────────────────────────────────── */}
        <Card>
          <SectionLabel>Family & Personal</SectionLabel>
          <textarea
            value={log.familyNotes}
            onChange={e => set("familyNotes", e.target.value)}
            placeholder="Anything for family, home, or personal life today..."
            rows={2}
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none resize-none leading-relaxed"
          />
        </Card>

        {/* ── Evening Reflection ─────────────────────────────────────────── */}
        <Card className={cn(isEvening && !log.reflection.movedForward && "border-accent/30")}>
          <SectionLabel>Evening Reflection</SectionLabel>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] text-ink-3 mb-1.5">What moved forward today?</p>
              <textarea
                value={log.reflection.movedForward}
                onChange={e =>
                  set("reflection", { ...log.reflection, movedForward: e.target.value })
                }
                placeholder="Wins, progress, energy spent well..."
                rows={2}
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none resize-none leading-relaxed"
              />
            </div>
            <Divider />
            <div>
              <p className="text-[11px] text-ink-3 mb-1.5">What gets migrated to tomorrow?</p>
              <textarea
                value={log.reflection.migrating}
                onChange={e =>
                  set("reflection", { ...log.reflection, migrating: e.target.value })
                }
                placeholder="Open loops to carry forward..."
                rows={2}
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </Card>

        {/* ── Close Day ──────────────────────────────────────────────────── */}
        <div className="flex justify-end pt-2">
          <button
            onClick={startNewDay}
            className="flex items-center gap-1.5 text-xs text-ink-3 hover:text-accent transition-colors"
          >
            Close day & migrate tasks
            <ArrowRight size={12} />
          </button>
        </div>

      </div>
    </AppLayout>
  );
}
