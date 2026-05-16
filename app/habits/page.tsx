"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, SectionLabel } from "@/components/ui/Card";
import { useAppData } from "@/hooks/useAppData";
import { HABITS, type HabitDay } from "@/lib/types";
import {
  weekStartKey,
  getWeekDays,
  getDayLabel,
  formatShortDate,
  parseDateKey,
  toDateKey,
  todayKey,
  isFuture,
} from "@/lib/utils";
import { emptyHabitDay } from "@/lib/defaults";
import { cn } from "@/lib/cn";

const MOOD_LABELS: Record<number, { emoji: string; label: string }> = {
  0: { emoji: "–",  label: "Not set" },
  1: { emoji: "😔", label: "Rough" },
  2: { emoji: "😕", label: "Low" },
  3: { emoji: "😐", label: "OK" },
  4: { emoji: "🙂", label: "Good" },
  5: { emoji: "😊", label: "Great" },
};

export default function HabitsPage() {
  const { data, isLoaded, updateHabitDay } = useAppData();
  const today = todayKey();

  const [viewWeekStart, setViewWeekStart] = useState(() => weekStartKey());

  const days = getWeekDays(viewWeekStart);

  function prevWeek() {
    const d = parseDateKey(viewWeekStart);
    d.setDate(d.getDate() - 7);
    setViewWeekStart(toDateKey(d));
  }

  function nextWeek() {
    const d = parseDateKey(viewWeekStart);
    d.setDate(d.getDate() + 7);
    setViewWeekStart(toDateKey(d));
  }

  const isCurrentWeek = viewWeekStart === weekStartKey();

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-ink-3 text-sm">Loading...</div>
      </AppLayout>
    );
  }

  function toggleHabit(date: string, key: keyof Omit<HabitDay, "mood">) {
    if (isFuture(date)) return;
    const day = data.habits[date] ?? emptyHabitDay();
    updateHabitDay(date, { [key]: !day[key] });
  }

  function setMood(date: string, mood: number) {
    if (isFuture(date)) return;
    updateHabitDay(date, { mood });
  }

  // ── Streak helper ─────────────────────────────────────────────────────────
  // For positive habits: consecutive days WITH the habit
  // For negative habits: consecutive days WITHOUT the habit (clean streak)
  function getStreak(habitKey: keyof Omit<HabitDay, "mood">, negative = false): number {
    let count = 0;
    const d = new Date(parseDateKey(today));
    while (true) {
      const key = toDateKey(d);
      const day = data.habits[key];
      const done = day?.[habitKey] ?? false;
      const good = negative ? !done : done;
      if (!good) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }

  // ── Completion % for the week ─────────────────────────────────────────────
  // Positive habits: checked = good. Negative habits: unchecked = good.
  function weekCompletionPercent(): number {
    const pastDays = days.filter(d => !isFuture(d));
    if (pastDays.length === 0) return 0;
    let total = 0;
    let done = 0;
    pastDays.forEach(d => {
      const day = data.habits[d] ?? emptyHabitDay();
      HABITS.forEach(h => {
        total++;
        const checked = day[h.key];
        if (h.negative ? !checked : checked) done++;
      });
    });
    return Math.round((done / total) * 100);
  }

  const completion = weekCompletionPercent();

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-28 lg:pb-10 space-y-4">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[10px] tracking-widest uppercase text-ink-3 mb-1">Habits</p>
          <h1 className="text-[2rem] leading-tight font-serif text-ink">Health Tracker</h1>
        </div>

        {/* ── Week Navigation ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevWeek}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="text-center">
            <p className="text-xs text-ink-2 font-medium">
              {formatShortDate(days[0])} – {formatShortDate(days[6])}
            </p>
            {isCurrentWeek && (
              <p className="text-[10px] text-ink-3">This week · {completion}% complete</p>
            )}
          </div>

          <button
            onClick={nextWeek}
            disabled={isCurrentWeek}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Habit Grid ─────────────────────────────────────────────────── */}
        <Card className="overflow-hidden p-0">
          {/* Day headers */}
          <div className="grid grid-cols-[160px_repeat(7,1fr)] border-b border-border-light">
            <div className="p-3" />
            {days.map(day => {
              const isT = day === today;
              const future = isFuture(day);
              return (
                <div
                  key={day}
                  className={cn(
                    "p-2 text-center border-l border-border-light",
                    isT && "bg-accent-light"
                  )}
                >
                  <p className={cn(
                    "text-[9px] tracking-widest uppercase font-medium",
                    isT ? "text-accent" : "text-ink-3"
                  )}>
                    {getDayLabel(day)}
                  </p>
                  <p className={cn(
                    "text-sm font-serif mt-0.5",
                    isT ? "text-accent font-medium" : future ? "text-ink-3" : "text-ink-2"
                  )}>
                    {parseInt(day.split("-")[2])}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Habit rows */}
          {HABITS.map(({ key, label, icon, negative }, rowIdx) => {
            const streak = getStreak(key, negative);
            return (
              <div
                key={key}
                className={cn(
                  "grid grid-cols-[160px_repeat(7,1fr)]",
                  rowIdx !== HABITS.length - 1 && "border-b border-border-light"
                )}
              >
                {/* Habit label */}
                <div className="flex items-center gap-2 p-3 border-r border-border-light">
                  <span className="text-base">{icon}</span>
                  <div>
                    <p className="text-xs font-medium text-ink">{label}</p>
                    {streak > 0 && (
                      <p className={cn("text-[9px]", negative ? "text-sage" : "text-accent")}>
                        {streak}d {negative ? "clean" : "streak"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Day cells */}
                {days.map(day => {
                  const dayData = data.habits[day] ?? emptyHabitDay();
                  const checked = dayData[key];
                  const future = isFuture(day);
                  const isT = day === today;

                  return (
                    <div
                      key={day}
                      className={cn(
                        "flex items-center justify-center border-l border-border-light",
                        isT && "bg-accent-light/40"
                      )}
                    >
                      <button
                        onClick={() => toggleHabit(day, key)}
                        disabled={future}
                        className={cn(
                          "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                          future
                            ? "border-border-light opacity-30 cursor-not-allowed"
                            : negative
                            ? checked
                              ? "bg-rust border-rust text-white"       // bad: did it
                              : "border-sage/40 hover:border-sage/70"  // good: clean day
                            : checked
                            ? "bg-sage border-sage text-white"         // good: completed
                            : "border-border hover:border-ink-3"
                        )}
                      >
                        {checked && <Check size={10} strokeWidth={3} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Mood row */}
          <div className="grid grid-cols-[160px_repeat(7,1fr)] border-t border-border-light bg-surface-2/50">
            <div className="flex items-center gap-2 p-3 border-r border-border-light">
              <span className="text-base">✦</span>
              <p className="text-xs font-medium text-ink">Mood / Energy</p>
            </div>
            {days.map(day => {
              const dayData = data.habits[day] ?? emptyHabitDay();
              const mood = dayData.mood;
              const future = isFuture(day);
              const isT = day === today;

              return (
                <div
                  key={day}
                  className={cn(
                    "flex items-center justify-center border-l border-border-light py-2",
                    isT && "bg-accent-light/40"
                  )}
                >
                  {future ? (
                    <span className="text-xs text-ink-3">–</span>
                  ) : (
                    <div className="relative group">
                      <button
                        className="text-lg leading-none"
                        title={MOOD_LABELS[mood]?.label}
                      >
                        {MOOD_LABELS[mood]?.emoji}
                      </button>
                      {/* Mood picker tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex bg-surface border border-border rounded-xl shadow-card p-1.5 gap-1 z-10">
                        {[1, 2, 3, 4, 5].map(m => (
                          <button
                            key={m}
                            onClick={() => setMood(day, m)}
                            className={cn(
                              "text-base p-0.5 rounded transition-transform hover:scale-125",
                              mood === m && "scale-125"
                            )}
                          >
                            {MOOD_LABELS[m].emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Week Summary ───────────────────────────────────────────────── */}
        {isCurrentWeek && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {HABITS.map(({ key, label, icon, negative }) => {
              const streak = getStreak(key, negative);
              const pastDays = days.filter(d => !isFuture(d));
              const checkedCount = pastDays.filter(d => (data.habits[d] ?? emptyHabitDay())[key]).length;
              // For negative habits, "good" count = days clean (not checked)
              const displayCount = negative ? pastDays.length - checkedCount : checkedCount;

              return (
                <div key={key} className="bg-surface rounded-xl border border-border-light p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{icon}</span>
                    <span className="text-xs font-medium text-ink-2">{label}</span>
                  </div>
                  <p className="text-2xl font-serif text-ink">
                    {displayCount}
                    <span className="text-base text-ink-3">/{pastDays.length}</span>
                  </p>
                  {negative ? (
                    <p className="text-[10px] text-ink-3 mt-1">days clean</p>
                  ) : streak > 1 ? (
                    <p className="text-[10px] text-accent mt-1">{streak}d streak</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
