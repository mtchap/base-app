"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, SectionLabel, Divider } from "@/components/ui/Card";
import { useAppData } from "@/hooks/useAppData";
import { LIFE_AREAS, type LifeArea, type LifeAreaCard } from "@/lib/types";

// ─── Life Area Card ───────────────────────────────────────────────────────────

function AreaCard({
  areaKey,
  label,
  icon,
  data,
  onUpdate,
}: {
  areaKey: LifeArea;
  label: string;
  icon: string;
  data: LifeAreaCard;
  onUpdate: (changes: Partial<LifeAreaCard>) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasContent = data.focus || data.nextAction || data.stuckPoint || data.notes;

  return (
    <Card className="h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer select-none mb-3"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <h3 className="text-sm font-medium text-ink">{label}</h3>
        </div>
        <span className="text-[10px] text-ink-3">
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {/* Focus — always visible */}
      <input
        value={data.focus}
        onChange={e => onUpdate({ focus: e.target.value })}
        onClick={e => e.stopPropagation()}
        placeholder="Current focus..."
        className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none mb-1 font-medium"
      />

      {/* Next action — always visible */}
      {(data.nextAction || hasContent) && (
        <p className="text-xs text-ink-3 leading-relaxed">
          {data.nextAction ? (
            <>→ <span className="text-ink-2">{data.nextAction}</span></>
          ) : (
            <span className="italic">No next action set</span>
          )}
        </p>
      )}

      {/* Expanded fields */}
      {expanded && (
        <div className="mt-4 space-y-4">
          <Divider />

          <div>
            <p className="text-[10px] text-ink-3 uppercase tracking-widest mb-1.5">Next Action</p>
            <input
              value={data.nextAction}
              onChange={e => onUpdate({ nextAction: e.target.value })}
              placeholder="The very next physical action..."
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
            />
          </div>

          <div>
            <p className="text-[10px] text-ink-3 uppercase tracking-widest mb-1.5">Stuck Point</p>
            <input
              value={data.stuckPoint}
              onChange={e => onUpdate({ stuckPoint: e.target.value })}
              placeholder="What's blocking you? Leave blank if clear."
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
            />
          </div>

          <div>
            <p className="text-[10px] text-ink-3 uppercase tracking-widest mb-1.5">Notes</p>
            <textarea
              value={data.notes}
              onChange={e => onUpdate({ notes: e.target.value })}
              placeholder="Context, constraints, reminders..."
              rows={2}
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoaded, updateLifeArea } = useAppData();

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-ink-3 text-sm">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-28 lg:pb-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <p className="text-[10px] tracking-widest uppercase text-ink-3 mb-1">Overview</p>
          <h1 className="text-[2rem] leading-tight font-serif text-ink">Life Dashboard</h1>
          <p className="text-sm text-ink-3 mt-1">
            Where are you in each area? Click to expand and edit.
          </p>
        </div>

        {/* ── Area Cards Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LIFE_AREAS.map(({ key, label, icon }) => (
            <AreaCard
              key={key}
              areaKey={key}
              label={label}
              icon={icon}
              data={data.lifeDashboard[key]}
              onUpdate={changes => updateLifeArea(key, changes)}
            />
          ))}
        </div>

        {/* ── Reflection prompt ──────────────────────────────────────────── */}
        <div className="mt-8 px-1">
          <p className="text-xs text-ink-3 leading-relaxed text-center">
            Review each area monthly. The goal isn't to be active in all 7 at once — <br className="hidden md:block" />
            it's to know where you stand and have a clear next move.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
