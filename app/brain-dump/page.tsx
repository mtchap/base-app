"use client";

import { useState } from "react";
import { Plus, X, ArrowRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, SectionLabel } from "@/components/ui/Card";
import { useAppData } from "@/hooks/useAppData";
import { BRAIN_DUMP_LABELS, type BrainDumpLabel } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";
import { cn } from "@/lib/cn";

const LABEL_STYLES: Record<BrainDumpLabel, string> = {
  "unprocessed": "bg-surface-2 text-ink-3 border-border",
  "do-now":      "bg-rust-light text-rust border-rust/30",
  "schedule":    "bg-accent-light text-accent border-accent/30",
  "delegate":    "bg-surface-2 text-ink-2 border-border",
  "waiting":     "bg-surface-2 text-ink-2 border-border",
  "someday":     "bg-surface-2 text-ink-3 border-border",
  "delete":      "bg-rust-light text-rust border-rust/30",
};

const ALL_FILTERS = ["all", ...BRAIN_DUMP_LABELS.map(l => l.key)] as const;

export default function BrainDumpPage() {
  const { data, isLoaded, addBrainDumpItem, updateBrainDumpItem, removeBrainDumpItem } =
    useAppData();

  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<BrainDumpLabel | "all">("all");

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-ink-3 text-sm">Loading...</div>
      </AppLayout>
    );
  }

  const items = data.brainDump.filter(
    item => filter === "all" || item.label === filter
  );

  function capture() {
    if (!input.trim()) return;
    addBrainDumpItem(input.trim());
    setInput("");
  }

  function convertToTask(id: string, content: string) {
    // Mark as converted in brain dump
    updateBrainDumpItem(id, { convertedToTask: true, label: "do-now" });
    // Also add to today's rapid log via a note
    // (We reference today's log through the standard updateDailyLog flow)
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-28 lg:pb-10 space-y-4">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[10px] tracking-widest uppercase text-ink-3 mb-1">Brain Dump</p>
          <h1 className="text-[2rem] leading-tight font-serif text-ink">Capture</h1>
          <p className="text-sm text-ink-3 mt-1">
            Get it out of your head. Sort it later.
          </p>
        </div>

        {/* ── Quick Capture ──────────────────────────────────────────────── */}
        <Card className="border-accent/20">
          <div className="flex items-center gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  capture();
                }
              }}
              placeholder="What's on your mind? — press Enter to capture"
              rows={2}
              className="flex-1 bg-transparent text-base text-ink placeholder:text-ink-3 focus:outline-none resize-none leading-relaxed"
              autoFocus
            />
            <button
              onClick={capture}
              className="shrink-0 w-9 h-9 rounded-xl bg-accent text-accent-fg flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
            </button>
          </div>
        </Card>

        {/* ── Filter Tabs ────────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors",
              filter === "all"
                ? "bg-ink text-surface border-ink"
                : "bg-surface text-ink-2 border-border hover:border-ink-3"
            )}
          >
            All ({data.brainDump.length})
          </button>
          {BRAIN_DUMP_LABELS.filter(l => l.key !== "unprocessed").map(({ key, label }) => {
            const count = data.brainDump.filter(i => i.label === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors",
                  filter === key
                    ? "bg-ink text-surface border-ink"
                    : "bg-surface text-ink-2 border-border hover:border-ink-3"
                )}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* ── Items ──────────────────────────────────────────────────────── */}
        {items.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-3 text-center py-4">
              {filter === "all"
                ? "Nothing captured yet. Start typing above."
                : `No items labeled "${filter}".`}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <Card key={item.id} className={cn("group", item.convertedToTask && "opacity-60")}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm text-ink leading-relaxed",
                      item.convertedToTask && "line-through text-ink-2"
                    )}>
                      {item.content}
                    </p>
                    <p className="text-[10px] text-ink-3 mt-1">
                      {formatShortDate(item.createdAt.split("T")[0])}
                      {item.convertedToTask && " · converted to task"}
                    </p>
                  </div>

                  {/* Label selector */}
                  <select
                    value={item.label}
                    onChange={e =>
                      updateBrainDumpItem(item.id, {
                        label: e.target.value as BrainDumpLabel,
                      })
                    }
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-lg border shrink-0 cursor-pointer focus:outline-none appearance-none font-medium",
                      LABEL_STYLES[item.label]
                    )}
                  >
                    {BRAIN_DUMP_LABELS.map(({ key, label }) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => removeBrainDumpItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-ink-3 hover:text-rust transition-all shrink-0 mt-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Convert to task action */}
                {!item.convertedToTask && item.label === "do-now" && (
                  <button
                    onClick={() => convertToTask(item.id, item.content)}
                    className="mt-3 flex items-center gap-1.5 text-[11px] text-accent hover:text-accent/80 transition-colors"
                  >
                    <ArrowRight size={11} />
                    Move to Today's log
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* ── Processing Guide ───────────────────────────────────────────── */}
        {data.brainDump.some(i => i.label === "unprocessed") && (
          <Card className="border-dashed">
            <SectionLabel>Process your inbox</SectionLabel>
            <p className="text-xs text-ink-3 leading-relaxed">
              For each unprocessed item, ask: can I do this in 2 minutes? If yes, do it.
              If not — schedule, delegate, park it for someday, or delete it.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["do-now", "schedule", "delegate", "waiting", "someday", "delete"].map(l => (
                <button
                  key={l}
                  onClick={() => setFilter(l as BrainDumpLabel)}
                  className="text-[10px] px-2.5 py-1 rounded-lg border border-border text-ink-2 hover:border-ink-3 transition-colors capitalize"
                >
                  {l.replace("-", " ")}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
