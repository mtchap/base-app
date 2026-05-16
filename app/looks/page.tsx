"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Info } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, SectionLabel, Divider } from "@/components/ui/Card";
import { useAppData } from "@/hooks/useAppData";
import {
  todayKey, weekStartKey, getWeekDays, isFuture,
  getDayLabel, formatShortDate,
} from "@/lib/utils";
import type { LooksDay, LooksStack } from "@/lib/types";
import { emptyLooksDay } from "@/lib/defaults";
import { cn } from "@/lib/cn";

// ─── Check row ────────────────────────────────────────────────────────────────

function CheckRow({
  label,
  sub,
  checked,
  onToggle,
  muted,
  warn,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onToggle: () => void;
  muted?: boolean;
  warn?: boolean;     // amber highlight — high priority item
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-start gap-3 w-full py-2 group text-left transition-colors",
        "-mx-2 px-2 rounded hover:bg-surface-2"
      )}
    >
      <div
        className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 mt-0.5",
          checked
            ? "bg-sage border-sage text-canvas"
            : warn
            ? "border-accent group-hover:border-accent/80"
            : "border-border group-hover:border-ink-3"
        )}
      >
        {checked && <Check size={10} strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm leading-snug transition-colors",
          checked ? "line-through text-ink-3" : muted ? "text-ink-2" : "text-ink"
        )}>
          {label}
        </p>
        {sub && (
          <p className={cn(
            "text-[10px] font-mono mt-0.5 leading-snug",
            checked ? "text-ink-3" : "text-ink-3"
          )}>
            {sub}
          </p>
        )}
      </div>
    </button>
  );
}

// ─── Section header with count ────────────────────────────────────────────────

function SectionHeader({
  label,
  done,
  total,
}: {
  label: string;
  done: number;
  total: number;
}) {
  const pct   = total === 0 ? 0 : done / total;
  const color = pct === 1 ? "text-sage" : pct > 0.5 ? "text-accent" : "text-ink-3";
  return (
    <div className="flex items-center mb-3">
      <SectionLabel mono className="mb-0 flex-1">{label}</SectionLabel>
      <span className={cn("font-mono text-xs shrink-0", color)}>
        {done}/{total}
      </span>
    </div>
  );
}

// ─── 7-day compliance bar ─────────────────────────────────────────────────────

function WeekBar({
  days,
  looksLogs,
  ratio,
}: {
  days:      string[];
  looksLogs: Record<string, LooksDay>;
  ratio:     (d: LooksDay) => number;   // 0..1
}) {
  return (
    <div className="flex items-end gap-1.5 mt-3 pt-3 border-t border-border-light">
      {days.map(d => {
        const log    = looksLogs[d] ?? emptyLooksDay(d);
        const r      = ratio(log);
        const future = isFuture(d);
        return (
          <div key={d} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full rounded-sm overflow-hidden h-1.5 bg-surface-3">
              {!future && r > 0 && (
                <div
                  className={cn("h-full rounded-sm transition-all", r === 1 ? "bg-sage" : "bg-accent")}
                  style={{ width: `${r * 100}%` }}
                />
              )}
            </div>
            <span className="text-[8px] font-mono text-ink-3">{getDayLabel(d).slice(0,1)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stack collapsible ────────────────────────────────────────────────────────

function StackSection({
  stack,
  onUpdate,
}: {
  stack:    LooksStack;
  onUpdate: (c: Partial<LooksStack>) => void;
}) {
  const [open, setOpen] = useState(false);

  const fieldCls = "w-full bg-surface-2 rounded border border-border text-xs font-mono text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent resize-none leading-relaxed p-3 transition-colors";

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-surface hover:bg-surface-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-semibold tracking-widest uppercase text-ink-3">
            Product Stack
          </span>
          <span className="text-[9px] font-mono text-ink-3 opacity-50">— edit anytime</span>
        </div>
        {open ? <ChevronUp size={14} className="text-ink-3" /> : <ChevronDown size={14} className="text-ink-3" />}
      </button>

      {open && (
        <div className="bg-surface border-t border-border-light px-5 py-4 space-y-4">
          {[
            { key: "amProducts",       label: "AM Products",       rows: 5 },
            { key: "pmProducts",       label: "PM Products",       rows: 6 },
            { key: "hairProducts",     label: "Hair Protocol",     rows: 4 },
            { key: "groomingProducts", label: "Grooming Products", rows: 4 },
          ].map(({ key, label, rows }) => (
            <div key={key}>
              <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-2">{label}</p>
              <textarea
                value={(stack as unknown as Record<string, string>)[key]}
                onChange={e => onUpdate({ [key]: e.target.value } as Partial<LooksStack>)}
                rows={rows}
                className={fieldCls}
              />
            </div>
          ))}
          <Divider />
          <div>
            <p className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-2">Notes</p>
            <textarea
              value={stack.notes}
              onChange={e => onUpdate({ notes: e.target.value })}
              rows={4}
              className={cn(fieldCls, "font-sans")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LooksPage() {
  const { data, isLoaded, updateLooksDay, updateLooksStack } = useAppData();

  const today = todayKey();
  const ws    = weekStartKey();
  const days  = getWeekDays(ws);

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-ink-3 text-sm font-mono">
          LOADING PROTOCOL...
        </div>
      </AppLayout>
    );
  }

  const looksLogs = data.looksLogs  ?? {};
  const stack     = data.looksStack ?? { amProducts: "", pmProducts: "", hairProducts: "", groomingProducts: "", notes: "", startScore: 33 };
  const log       = looksLogs[today] ?? emptyLooksDay(today);

  // Toggle helpers
  const toggleAm       = (k: keyof LooksDay["am"])       => updateLooksDay(today, { am:       { ...log.am,       [k]: !log.am[k] } });
  const togglePm       = (k: keyof LooksDay["pm"])       => updateLooksDay(today, { pm:       { ...log.pm,       [k]: !log.pm[k] } });
  const toggleHair     = (k: keyof LooksDay["hair"])     => updateLooksDay(today, { hair:     { ...log.hair,     [k]: !log.hair[k] } });
  const toggleGrooming = (k: keyof LooksDay["grooming"]) => updateLooksDay(today, { grooming: { ...log.grooming, [k]: !log.grooming[k] } });
  const togglePhysical = (k: keyof LooksDay["physical"]) => updateLooksDay(today, { physical: { ...log.physical, [k]: !log.physical[k] } });

  // Completion counts
  const amVals  = Object.values(log.am);
  const pmVals  = Object.values(log.pm);
  const hairVals = Object.values(log.hair);
  const grVals  = Object.values(log.grooming);
  const phVals  = Object.values(log.physical);

  const amDone   = amVals.filter(Boolean).length;
  const pmDone   = pmVals.filter(Boolean).length;
  const hairDone = hairVals.filter(Boolean).length;
  const grDone   = grVals.filter(Boolean).length;
  const phDone   = phVals.filter(Boolean).length;

  const totalDone  = amDone + pmDone + hairDone + grDone + phDone;
  const totalItems = amVals.length + pmVals.length + hairVals.length + grVals.length + phVals.length;
  const pct        = Math.round((totalDone / totalItems) * 100);

  // Week ratio helpers
  const amRatio   = (d: LooksDay) => { const v = Object.values(d.am);   return v.filter(Boolean).length / v.length; };
  const pmRatio   = (d: LooksDay) => { const v = Object.values(d.pm);   return v.filter(Boolean).length / v.length; };
  const hairRatio = (d: LooksDay) => { const v = Object.values(d.hair); return v.filter(Boolean).length / v.length; };

  const startScore = stack.startScore || 33;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-28 lg:pb-10 space-y-4">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-ink-3 mb-1 font-mono">
                Qoves · Feb 2026
              </p>
              <h1 className="text-[2rem] leading-tight font-serif text-ink">
                Aesthetic Protocol
              </h1>
            </div>

            {/* Qoves score callout */}
            <div className="shrink-0 border border-border rounded-lg px-4 py-3 text-center bg-surface-2 min-w-[88px]">
              <p className="text-[8px] font-mono text-ink-3 uppercase tracking-widest leading-none mb-1">
                Qoves Score
              </p>
              <p className="text-4xl font-serif text-accent leading-none">{startScore}</p>
              <p className="text-[8px] font-mono text-ink-3 mt-1 leading-none">/ 100 baseline</p>
            </div>
          </div>

          {/* Daily protocol completion bar */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-1 bg-surface-3 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  pct === 100 ? "bg-sage" : "bg-accent"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={cn("text-xs font-mono shrink-0", pct === 100 ? "text-sage" : "text-accent")}>
              {pct}% today
            </span>
          </div>

          <p className="text-[10px] font-mono text-ink-3 mt-2 leading-relaxed">
            Primary issue: skin texture + pores · Norwood 6 ·
            Strong bone structure — refine surface to unlock it
          </p>
        </div>

        {/* ── AM Skincare ─────────────────────────────────────────────────── */}
        <Card accent>
          <SectionHeader label="AM Skincare" done={amDone} total={amVals.length} />

          <CheckRow
            label="Gentle cleanser"
            sub="Non-drying face wash — remove overnight oil"
            checked={log.am.cleanser}
            onToggle={() => toggleAm("cleanser")}
          />
          <CheckRow
            label="Hydrating toner"
            sub="Light essence — calm + prime for oilier skin"
            checked={log.am.toner}
            onToggle={() => toggleAm("toner")}
          />
          <CheckRow
            label="Vitamin C serum — face + neck"
            sub="Brighten pigment, support collagen, fade uneven tone"
            checked={log.am.vitaminC}
            onToggle={() => toggleAm("vitaminC")}
          />
          <CheckRow
            label="Vitamin C eye serum — under eyes"
            sub="Gradually brighten hollowness + pigment shadow"
            checked={log.am.eyeSerum}
            onToggle={() => toggleAm("eyeSerum")}
          />
          <CheckRow
            label="SPF 50 — face + neck"
            sub="NON-NEGOTIABLE · highest ROI skincare step, full stop"
            checked={log.am.spf}
            onToggle={() => toggleAm("spf")}
            warn
          />
          <CheckRow
            label="Whitening eye drops"
            sub="Clear scleral redness — use under doctor guidance"
            checked={log.am.eyeDrops}
            onToggle={() => toggleAm("eyeDrops")}
            muted
          />

          <WeekBar days={days} looksLogs={looksLogs} ratio={amRatio} />
        </Card>

        {/* ── PM Skincare ─────────────────────────────────────────────────── */}
        <Card>
          <SectionHeader label="PM Skincare" done={pmDone} total={pmVals.length} />

          <CheckRow
            label="Gentle cleanser"
            sub="Remove sunscreen, sweat, pollution buildup"
            checked={log.pm.cleanser}
            onToggle={() => togglePm("cleanser")}
          />
          <CheckRow
            label="Hydrating toner"
            checked={log.pm.toner}
            onToggle={() => togglePm("toner")}
          />
          <CheckRow
            label="Retinol 0.25–0.5%"
            sub="START: 3×/wk · stimulate cell turnover, smooth texture, fine lines"
            checked={log.pm.retinol}
            onToggle={() => togglePm("retinol")}
            warn
          />
          <CheckRow
            label="Azelaic acid — red / pigmented patches"
            sub="Reduce inflammation + hyperpigmentation around eyes + lower face"
            checked={log.pm.azelaic}
            onToggle={() => togglePm("azelaic")}
          />
          <CheckRow
            label="Barrier moisturizer"
            sub="Lock in hydration over retinol — never skip"
            checked={log.pm.moisturizer}
            onToggle={() => togglePm("moisturizer")}
          />
          <CheckRow
            label="Retinol neck cream"
            sub="Daily SPF on neck too — treat same as face"
            checked={log.pm.neckCream}
            onToggle={() => togglePm("neckCream")}
            muted
          />

          <WeekBar days={days} looksLogs={looksLogs} ratio={pmRatio} />
        </Card>

        {/* ── Hair Protocol ───────────────────────────────────────────────── */}
        <Card>
          <SectionHeader label="Hair Protocol — Norwood 6" done={hairDone} total={hairVals.length} />

          <p className="text-[10px] font-mono text-ink-3 mb-3 leading-relaxed">
            Proactive now preserves coverage long-term.
            Grow top longer → defined curls → reduce temple attention.
          </p>

          <CheckRow
            label="Minoxidil 5% — AM application"
            sub="Apply to thinning + receding areas · must be twice daily"
            checked={log.hair.minoxidilAM}
            onToggle={() => toggleHair("minoxidilAM")}
            warn
          />
          <CheckRow
            label="Minoxidil 5% — PM application"
            sub="Second daily dose — consistency is everything"
            checked={log.hair.minoxidilPM}
            onToggle={() => toggleHair("minoxidilPM")}
            warn
          />
          <CheckRow
            label="Red light hair helmet"
            sub="Multiple sessions/wk · encourage follicle activity"
            checked={log.hair.redLightHelmet}
            onToggle={() => toggleHair("redLightHelmet")}
          />
          <CheckRow
            label="Curl cream + diffuse"
            sub="Apply to damp hair · define curls, reduce frizz, add intentional shape"
            checked={log.hair.curlStyling}
            onToggle={() => toggleHair("curlStyling")}
            muted
          />

          <WeekBar days={days} looksLogs={looksLogs} ratio={hairRatio} />
        </Card>

        {/* ── Grooming ────────────────────────────────────────────────────── */}
        <Card>
          <SectionHeader label="Grooming" done={grDone} total={grVals.length} />

          <CheckRow
            label="Brush teeth"
            sub="Electric brush · whitening toothpaste"
            checked={log.grooming.teeth}
            onToggle={() => toggleGrooming("teeth")}
          />
          <CheckRow
            label="Floss / Waterpik"
            checked={log.grooming.floss}
            onToggle={() => toggleGrooming("floss")}
          />
          <CheckRow
            label="Beard line — jaw defined, neck shaved clean"
            sub="Define jaw angles · shave below beard line to separate jaw from neck"
            checked={log.grooming.beardLine}
            onToggle={() => toggleGrooming("beardLine")}
            warn
          />
          <CheckRow
            label="Brow maintenance — thread + gel"
            sub="Thread upper + outer borders · dark brow gel to set and deepen"
            checked={log.grooming.brows}
            onToggle={() => toggleGrooming("brows")}
            muted
          />
        </Card>

        {/* ── Physical — Neck ─────────────────────────────────────────────── */}
        <Card>
          <SectionHeader label="Neck Protocol — 3×/wk" done={phDone} total={phVals.length} />

          <p className="text-[10px] font-mono text-ink-3 mb-3 leading-relaxed">
            Thicker neck reinforces jaw–torso transition.
            Keep neck beard clean to expose full vertical length.
          </p>

          <CheckRow
            label="Neck curls"
            sub="3 sets × 15–20 reps · build deep flexors, thicken front"
            checked={log.physical.neckCurls}
            onToggle={() => togglePhysical("neckCurls")}
          />
          <CheckRow
            label="Neck extensions"
            sub="3 sets × 20–25 reps · target rear extensors"
            checked={log.physical.neckExtensions}
            onToggle={() => togglePhysical("neckExtensions")}
          />
        </Card>

        {/* ── Daily Skin Log ──────────────────────────────────────────────── */}
        <Card>
          <SectionLabel mono>Skin Log</SectionLabel>
          <textarea
            value={log.notes}
            onChange={e => updateLooksDay(today, { notes: e.target.value })}
            placeholder="Reactions, purging, breakouts, observations, product swaps..."
            rows={3}
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none resize-none leading-relaxed"
          />
        </Card>

        {/* ── Report Callouts ─────────────────────────────────────────────── */}
        <div className="border border-border rounded-lg bg-surface overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border-light">
            <Info size={12} className="text-ink-3 shrink-0" />
            <span className="text-[10px] font-mono text-ink-3 uppercase tracking-widest">
              Qoves Key Findings
            </span>
          </div>
          <div className="px-5 py-4 space-y-2.5">
            {[
              ["Score", "33/100 · primarily surface factors, strong underlying bone structure"],
              ["Hair", "Norwood 6 · minoxidil + PRP + red light helmet · grow top longer, defined curls"],
              ["Skin", "Coarse texture (chin + left cheek), large pores T-zone, uneven pigmentation — highest leverage area"],
              ["Eyes", "Mild redness reduces clarity · whitening drops + Vit C eye serum · consider tear trough filler"],
              ["Jaw + Beard", "Fuller, shaped beard + keep neck shaved · consider jawline filler at angles"],
              ["Cheeks", "Define beard line on upper cheek · RF/HIFU for mild laxity"],
              ["Chin", "Good height, slightly narrow · consider lateral filler + beard shaping"],
              ["Neck", "Broad with muscle · neck curls 3×/wk · keep neck beard shaved"],
              ["No changes", "Nose · lips · ears — already strong, leave alone"],
            ].map(([key, val]) => (
              <div key={key} className="flex gap-3">
                <span className="text-[10px] font-mono text-accent shrink-0 w-24">{key}</span>
                <span className="text-[11px] text-ink-2 leading-relaxed">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Product stack ────────────────────────────────────────────────── */}
        <StackSection stack={stack} onUpdate={updateLooksStack} />

        {/* Footer note */}
        <p className="text-[10px] font-mono text-ink-3 text-center leading-relaxed pb-4">
          SPF + retinol + minoxidil twice daily — the three non-negotiables.
          Everything else accelerates, these are the foundation.
        </p>
      </div>
    </AppLayout>
  );
}
