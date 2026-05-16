"use client";

import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, SectionLabel, Divider } from "@/components/ui/Card";
import { useAppData } from "@/hooks/useAppData";
import { weekStartKey, formatWeekRange, getDayLabel, getWeekDays, isToday, isFuture } from "@/lib/utils";
import { LIFE_AREAS, type LifeArea, type WeeklyAreaEntry } from "@/lib/types";
import { emptyWeeklyLog } from "@/lib/defaults";
import { cn } from "@/lib/cn";

export default function WeekPage() {
  const { data, isLoaded, updateWeeklyLog } = useAppData();
  const ws = weekStartKey();
  const log = data.weeklyLogs[ws] ?? emptyWeeklyLog(ws);
  const days = getWeekDays(ws);

  const [newPriority, setNewPriority] = useState("");
  const [newParkingItem, setNewParkingItem] = useState("");

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-ink-3 text-sm">Loading...</div>
      </AppLayout>
    );
  }

  function set<K extends keyof typeof log>(key: K, value: (typeof log)[K]) {
    updateWeeklyLog(ws, { [key]: value } as Partial<typeof log>);
  }

  function addPriority() {
    if (!newPriority.trim()) return;
    set("priorities", [...log.priorities, newPriority.trim()]);
    setNewPriority("");
  }

  function removePriority(i: number) {
    set("priorities", log.priorities.filter((_, idx) => idx !== i));
  }

  function toggleArea(area: LifeArea) {
    set("areas", {
      ...log.areas,
      [area]: { ...log.areas[area], checked: !log.areas[area].checked },
    });
  }

  function setAreaNotes(area: LifeArea, notes: string) {
    set("areas", {
      ...log.areas,
      [area]: { ...log.areas[area], notes },
    });
  }

  function addParkingItem() {
    if (!newParkingItem.trim()) return;
    set("parkingLot", [...log.parkingLot, newParkingItem.trim()]);
    setNewParkingItem("");
  }

  function removeParkingItem(i: number) {
    set("parkingLot", log.parkingLot.filter((_, idx) => idx !== i));
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-28 lg:pb-10 space-y-4">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[10px] tracking-widest uppercase text-ink-3 mb-1">Week</p>
          <h1 className="text-[2rem] leading-tight font-serif text-ink">
            {formatWeekRange(ws)}
          </h1>
        </div>

        {/* ── Mini Calendar Strip ────────────────────────────────────────── */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {days.map(day => {
            const today = isToday(day);
            const future = isFuture(day);
            return (
              <div
                key={day}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-center shrink-0 transition-colors",
                  today
                    ? "bg-accent text-accent-fg"
                    : future
                    ? "bg-surface border border-border-light text-ink-3"
                    : "bg-surface-2 text-ink-2"
                )}
              >
                <span className="text-[9px] tracking-widest uppercase font-medium">
                  {getDayLabel(day)}
                </span>
                <span className="text-base font-serif leading-none">
                  {parseInt(day.split("-")[2])}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Weekly Focus ───────────────────────────────────────────────── */}
        <Card>
          <SectionLabel>Weekly Focus</SectionLabel>
          <input
            value={log.focus}
            onChange={e => set("focus", e.target.value)}
            placeholder="What is the one theme or intention for this week?"
            className="w-full bg-transparent text-base text-ink placeholder:text-ink-3 focus:outline-none leading-relaxed"
          />
        </Card>

        {/* ── Weekly Priorities ──────────────────────────────────────────── */}
        <Card>
          <SectionLabel>Weekly Priorities</SectionLabel>

          {log.priorities.length === 0 && (
            <p className="text-xs text-ink-3 mb-3">What are your 3–5 must-moves this week?</p>
          )}

          <div className="space-y-1.5 mb-3">
            {log.priorities.map((p, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <span className="text-xs font-mono text-ink-3 w-4 text-center shrink-0 select-none">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-ink leading-relaxed">{p}</span>
                <button
                  onClick={() => removePriority(i)}
                  className="opacity-0 group-hover:opacity-100 text-ink-3 hover:text-rust transition-all shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {log.priorities.length < 5 && (
            <div className="flex items-center gap-2.5 pt-2 border-t border-border-light">
              <span className="text-xs font-mono text-ink-3 w-4 text-center shrink-0">
                {log.priorities.length + 1}
              </span>
              <input
                value={newPriority}
                onChange={e => setNewPriority(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addPriority()}
                placeholder="Add priority — press Enter"
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
              />
              <button onClick={addPriority} className="text-ink-3 hover:text-accent transition-colors">
                <Plus size={14} />
              </button>
            </div>
          )}
        </Card>

        {/* ── Areas of Life Checklist ────────────────────────────────────── */}
        <Card>
          <SectionLabel>Areas of Life</SectionLabel>
          <div className="space-y-3">
            {LIFE_AREAS.map(({ key, label, icon }) => {
              const area = log.areas[key];
              return (
                <div key={key}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleArea(key)}
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0",
                        area.checked
                          ? "bg-sage border-sage text-white"
                          : "border-border hover:border-ink-3"
                      )}
                    >
                      {area.checked && <Check size={10} strokeWidth={3} />}
                    </button>
                    <span className={cn(
                      "text-sm flex-1",
                      area.checked ? "text-ink-2" : "text-ink"
                    )}>
                      <span className="mr-1.5">{icon}</span>
                      {label}
                    </span>
                  </div>
                  <div className="pl-8 mt-1">
                    <input
                      value={area.notes}
                      onChange={e => setAreaNotes(key, e.target.value)}
                      placeholder="Notes..."
                      className="w-full bg-transparent text-xs text-ink-2 placeholder:text-ink-3 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Parking Lot ─────────────────────────────────────────────────── */}
        <Card>
          <SectionLabel>Parking Lot</SectionLabel>
          <p className="text-[11px] text-ink-3 mb-3">Ideas and tasks that came up — not for this week.</p>

          <div className="space-y-1.5 mb-3">
            {log.parkingLot.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 group">
                <span className="text-ink-3 text-xs mt-0.5 font-mono shrink-0">–</span>
                <span className="flex-1 text-sm text-ink-2 leading-relaxed">{item}</span>
                <button
                  onClick={() => removeParkingItem(i)}
                  className="opacity-0 group-hover:opacity-100 text-ink-3 hover:text-rust transition-all shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2.5 pt-2 border-t border-border-light">
            <span className="text-ink-3 text-xs font-mono shrink-0">–</span>
            <input
              value={newParkingItem}
              onChange={e => setNewParkingItem(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addParkingItem()}
              placeholder="Park an idea — press Enter"
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
            />
            <button onClick={addParkingItem} className="text-ink-3 hover:text-accent transition-colors">
              <Plus size={14} />
            </button>
          </div>
        </Card>

        {/* ── Sunday Review ──────────────────────────────────────────────── */}
        <Card>
          <SectionLabel>Sunday Review</SectionLabel>
          <textarea
            value={log.sundayReview}
            onChange={e => set("sundayReview", e.target.value)}
            placeholder="What worked? What didn't? What's the intention going into next week?"
            rows={4}
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none resize-none leading-relaxed"
          />
        </Card>

      </div>
    </AppLayout>
  );
}
