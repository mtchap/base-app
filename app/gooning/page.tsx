"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Shield, ShieldOff } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAppData } from "@/hooks/useAppData";
import { todayKey, toDateKey, parseDateKey } from "@/lib/utils";
import { emptyHabitDay } from "@/lib/defaults";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  // 0 = Mon … 6 = Sun
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatMonthYear(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function dateKey(year: number, month: number, day: number) {
  return toDateKey(new Date(year, month, day));
}

export default function GooningPage() {
  const { data, isLoaded, updateHabitDay } = useAppData();
  const today = todayKey();

  const now = parseDateKey(today);
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  // ── Navigation ──────────────────────────────────────────────────────────────
  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  // ── Toggle today ─────────────────────────────────────────────────────────────
  function toggleToday() {
    const day = data.habits[today] ?? emptyHabitDay();
    updateHabitDay(today, { gooning: !day.gooning });
  }

  const todayData    = data.habits[today] ?? emptyHabitDay();
  const gooned_today = todayData.gooning;

  // ── Streak (consecutive clean days ending today) ───────────────────────────
  const currentStreak = useMemo(() => {
    let count = 0;
    const d = new Date(now);
    while (true) {
      const key = toDateKey(d);
      const day = data.habits[key];
      if (!day) break;
      if (day.gooning) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [data.habits, today]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Longest streak ever ───────────────────────────────────────────────────
  const longestStreak = useMemo(() => {
    const keys = Object.keys(data.habits).sort();
    let best = 0;
    let run  = 0;
    for (const k of keys) {
      if (!data.habits[k].gooning) { run++; best = Math.max(best, run); }
      else run = 0;
    }
    return best;
  }, [data.habits]);

  // ── This month stats ──────────────────────────────────────────────────────
  const { cleanThisMonth, relapseThisMonth } = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    let clean = 0; let relapse = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const k = dateKey(viewYear, viewMonth, d);
      if (k > today) continue;
      const day = data.habits[k];
      if (!day) continue;
      day.gooning ? relapse++ : clean++;
    }
    return { cleanThisMonth: clean, relapseThisMonth: relapse };
  }, [data.habits, viewYear, viewMonth, today]);

  // ── Calendar grid ─────────────────────────────────────────────────────────
  const daysInMonth  = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-ink-3 text-sm">Loading…</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-28 lg:pb-10 space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div>
          <p className="text-[10px] tracking-widest uppercase text-ink-3 mb-1">Gooning</p>
          <h1 className="text-[2rem] leading-tight font-serif text-ink">Goon Log</h1>
        </div>

        {/* ── Streak Hero ────────────────────────────────────────────────── */}
        <div className={cn(
          "rounded-2xl border p-8 text-center transition-colors",
          gooned_today
            ? "bg-rust/10 border-rust/30"
            : currentStreak >= 7
            ? "bg-sage/10 border-sage/30"
            : "bg-surface border-border"
        )}>
          <p className={cn(
            "text-[10px] font-mono tracking-widest uppercase mb-2",
            gooned_today ? "text-rust" : "text-ink-3"
          )}>
            {gooned_today ? "— relapsed today —" : "— current clean streak —"}
          </p>

          <p className={cn(
            "text-[7rem] leading-none font-serif font-bold tabular-nums",
            gooned_today ? "text-rust" : currentStreak === 0 ? "text-ink-3" : "text-sage"
          )}>
            {currentStreak}
          </p>

          <p className={cn(
            "text-sm font-mono mt-1",
            gooned_today ? "text-rust/70" : "text-ink-3"
          )}>
            {currentStreak === 1 ? "day clean" : "days clean"}
          </p>

          {longestStreak > 0 && (
            <p className="text-[10px] font-mono text-ink-3 mt-3">
              Personal best: <span className="text-ink-2">{longestStreak}d</span>
            </p>
          )}
        </div>

        {/* ── Today's check-in ───────────────────────────────────────────── */}
        <button
          onClick={toggleToday}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 font-mono text-sm tracking-wider uppercase transition-all",
            gooned_today
              ? "bg-rust/10 border-rust text-rust hover:bg-rust/20"
              : "bg-surface border-border text-ink-3 hover:border-sage hover:text-sage"
          )}
        >
          {gooned_today
            ? <><ShieldOff size={16} /> Mark as clean (undo)</>
            : <><Shield size={16} /> Log a relapse today</>
          }
        </button>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Clean this month", value: cleanThisMonth, color: "text-sage" },
            { label: "Relapses",         value: relapseThisMonth, color: relapseThisMonth > 0 ? "text-rust" : "text-ink-3" },
            { label: "Best streak",      value: longestStreak, color: "text-accent" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface border border-border-light rounded-xl p-4 text-center shadow-card">
              <p className={cn("text-2xl font-serif", color)}>{value}</p>
              <p className="text-[9px] font-mono text-ink-3 uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Monthly heatmap calendar ────────────────────────────────────── */}
        <div className="bg-surface border border-border-light rounded-2xl p-5 shadow-card">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="text-sm font-mono text-ink-2">{formatMonthYear(viewYear, viewMonth)}</p>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d, i) => (
              <p key={i} className="text-center text-[9px] font-mono text-ink-3 uppercase">{d}</p>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const key    = dateKey(viewYear, viewMonth, dayNum);
              const isT    = key === today;
              const future = key > today;
              const dayData = data.habits[key];
              const gooned  = dayData?.gooning ?? false;
              const hasData = !!dayData && !future;

              return (
                <button
                  key={dayNum}
                  onClick={() => {
                    if (future) return;
                    const d = data.habits[key] ?? emptyHabitDay();
                    updateHabitDay(key, { gooning: !d.gooning });
                  }}
                  disabled={future}
                  title={key}
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center text-[11px] font-mono transition-all",
                    future
                      ? "text-ink-3/30 cursor-not-allowed"
                      : gooned
                      ? "bg-rust/80 text-white font-bold"
                      : hasData
                      ? "bg-sage/25 text-sage hover:bg-sage/40"
                      : "text-ink-3 hover:bg-surface-2",
                    isT && !gooned && !hasData && "ring-1 ring-accent text-accent"
                  )}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border-light">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sage/25" />
              <span className="text-[9px] font-mono text-ink-3">Clean</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rust/80" />
              <span className="text-[9px] font-mono text-ink-3">Relapse</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border border-border" />
              <span className="text-[9px] font-mono text-ink-3">No data</span>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
