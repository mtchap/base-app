"use client";

import { useState, useRef } from "react";
import { Plus, Check, ArrowRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, SectionLabel, Divider } from "@/components/ui/Card";
import { useAppData } from "@/hooks/useAppData";
import { todayKey, formatLongDate, generateId } from "@/lib/utils";
import type { BulletSymbol, RapidLogItem, DailyHealth } from "@/lib/types";
import { emptyDailyLog } from "@/lib/defaults";

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
        className="w-7 h-7 rounded-lg border border-border text-ink-3 hover:text-ink hover:border-border flex items-center justify-center text-sm transition-colors"
      >
        −
      </button>
      <span className="text-sm text-ink w-12 text-center tabular-nums">
        {format(value)}
      </span>
      <button
        onClick={() => onChange(Math.min(max, +(value + step).toFixed(1)))}
        className="w-7 h-7 rounded-lg border border-border text-ink-3 hover:text-ink hover:border-border flex items-center justify-center text-sm transition-colors"
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
      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
        checked
          ? "bg-sage border-sage text-white"
          : "border-border hover:border-ink-3"
      }`}
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

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-ink-3 text-sm">
          Loading...
        </div>
      </AppLayout>
    );
  }

  function set<K extends keyof typeof log>(key: K, value: (typeof log)[K]) {
    updateDailyLog(today, { [key]: value } as Partial<typeof log>);
  }

  function setHealth(changes: Partial<DailyHealth>) {
    set("health", { ...log.health, ...changes });
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
    // Migrate open tasks to tomorrow's log
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tKey = tomorrow.toISOString().split("T")[0];

    const openItems = log.rapidLog
      .filter(e => e.symbol === "task")
      .map(e => ({ ...e, symbol: "migrated" as BulletSymbol, id: generateId() }));

    // Mark today's open tasks as migrated
    updateDailyLog(today, {
      rapidLog: log.rapidLog.map(e =>
        e.symbol === "task" ? { ...e, symbol: "migrated" as BulletSymbol } : e
      ),
    });

    // Seed tomorrow's log with migrated items
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
        </div>

        {/* ── Daily Intention ────────────────────────────────────────────── */}
        <Card>
          <SectionLabel>Daily Intention</SectionLabel>
          <input
            value={log.intention}
            onChange={e => set("intention", e.target.value)}
            placeholder="What matters most today?"
            className="w-full bg-transparent text-base text-ink placeholder:text-ink-3 focus:outline-none leading-relaxed"
          />
        </Card>

        {/* ── Top 3 ──────────────────────────────────────────────────────── */}
        <Card>
          <SectionLabel>Top 3 Priorities</SectionLabel>
          <div className="space-y-2.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-mono text-ink-3 w-4 shrink-0 text-center select-none">
                  {i + 1}
                </span>
                <input
                  value={log.priorities[i] ?? ""}
                  onChange={e => {
                    const next = [...log.priorities];
                    next[i] = e.target.value;
                    set("priorities", next);
                  }}
                  placeholder={i === 0 ? "Most important..." : `Priority ${i + 1}`}
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* ── Rapid Log ──────────────────────────────────────────────────── */}
        <Card>
          <SectionLabel>Rapid Log</SectionLabel>

          {log.rapidLog.length === 0 && (
            <p className="text-xs text-ink-3 mb-3">Nothing logged yet. Add your first entry below.</p>
          )}

          <div className="space-y-0.5 mb-3">
            {log.rapidLog.map(entry => (
              <div key={entry.id} className="flex items-start gap-2.5 group py-1.5">
                <button
                  onClick={() => cycleEntry(entry.id)}
                  title={`${SYMBOLS[entry.symbol].label} — click to change`}
                  className="text-sm font-mono text-ink-3 hover:text-accent transition-colors mt-0.5 w-4 shrink-0 text-left leading-none"
                >
                  {SYMBOLS[entry.symbol].glyph}
                </button>
                <span className={`flex-1 text-sm leading-relaxed ${entryClass(entry.symbol)}`}>
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
              title="Cycle symbol"
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
              className="text-ink-3 hover:text-accent transition-colors shrink-0"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Legend */}
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

            {/* Movement */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">Movement</span>
              <Toggle
                checked={log.health.movement}
                onChange={() => setHealth({ movement: !log.health.movement })}
              />
            </div>

            {/* Protein */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">Protein goal</span>
              <Toggle
                checked={log.health.protein}
                onChange={() => setHealth({ protein: !log.health.protein })}
              />
            </div>

            <Divider />

            {/* Water */}
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

            {/* Sleep */}
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
        <Card>
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

        {/* ── New Day ────────────────────────────────────────────────────── */}
        <div className="flex justify-end pt-2">
          <button
            onClick={startNewDay}
            className="flex items-center gap-1.5 text-xs text-ink-3 hover:text-accent transition-colors"
          >
            Start New Day
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
