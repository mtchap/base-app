"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, SectionLabel } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

// ─── Collapsible section ──────────────────────────────────────────────────────

function Section({
  title,
  emoji,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  emoji: string;
  subtitle: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden p-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-2 transition-colors"
      >
        <span className="text-lg shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="text-[11px] text-ink-3 mt-0.5 leading-snug">{subtitle}</p>
        </div>
        {open
          ? <ChevronDown size={14} className="text-ink-3 shrink-0" />
          : <ChevronRight size={14} className="text-ink-3 shrink-0" />
        }
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border-light pt-4 space-y-4">
          {children}
        </div>
      )}
    </Card>
  );
}

// ─── Reusable content blocks ──────────────────────────────────────────────────

function Field({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-mono font-semibold text-accent uppercase tracking-widest mb-1">{name}</p>
      <div className="text-sm text-ink-2 leading-relaxed space-y-1">{children}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 bg-surface-2 rounded-lg px-3 py-2.5 border border-border-light">
      <span className="text-accent shrink-0 text-sm">✦</span>
      <p className="text-[12px] text-ink-2 leading-relaxed">{children}</p>
    </div>
  );
}

function Row({ symbol, label, desc }: { symbol: string; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="font-mono text-sm text-ink-3 w-5 shrink-0 mt-0.5">{symbol}</span>
      <div>
        <span className="text-sm text-ink font-medium">{label}</span>
        <span className="text-sm text-ink-3"> — {desc}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-28 lg:pb-10 space-y-3">

        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] tracking-widest uppercase text-ink-3 mb-1">Guide</p>
          <h1 className="text-[2rem] leading-tight font-serif text-ink">How Base Works</h1>
          <p className="text-sm text-ink-3 mt-1">
            Every page, every feature — explained. Tap a section to expand it.
          </p>
        </div>

        {/* ── Global features ─────────────────────────────────────────────── */}
        <Section
          emoji="⚡"
          title="Quick Capture — the floating + button"
          subtitle="Add a task to today from anywhere in the app"
          defaultOpen
        >
          <p className="text-sm text-ink-2 leading-relaxed">
            The amber <strong className="text-ink">+</strong> button floats in the bottom-right corner on every page.
            Tap it, type what you need to do, and press <kbd className="font-mono text-[11px] bg-surface-2 border border-border rounded px-1.5 py-0.5">Enter</kbd>.
            It drops the item directly into today&apos;s Rapid Log as a task — no need to navigate anywhere.
          </p>
          <Tip>Use this anytime something pops into your head mid-day. Get it captured, stay in flow.</Tip>
        </Section>

        <Section
          emoji="☁️"
          title="Sync Key — cross-device sync"
          subtitle="Use the same passphrase on every device to keep data in sync"
        >
          <Field name="What it is">
            <p>The sync key is a passphrase you choose (e.g. <span className="font-mono text-ink bg-surface-2 px-1 rounded">michael-base-2026</span>). Any device using the same key shares the same data stored in the cloud.</p>
          </Field>
          <Field name="How to set it">
            <p>Tap the sync indicator at the top-right (mobile) or bottom-left (desktop sidebar). Enter your passphrase and tap Activate. Your data uploads immediately.</p>
          </Field>
          <Field name="Auto-sync">
            <p>Every change you make is pushed to the cloud automatically within ~2.5 seconds. You don&apos;t need to manually sync.</p>
          </Field>
          <Field name="Force push">
            <p>If the cloud has stale or wrong data, use <strong className="text-ink">Overwrite cloud with local</strong> to replace it with exactly what&apos;s on your current device.</p>
          </Field>
          <Tip>If sync goes offline, your data is still saved locally. It will sync automatically when you&apos;re back online.</Tip>
        </Section>

        {/* ── Today ───────────────────────────────────────────────────────── */}
        <Section
          emoji="☀️"
          title="Today"
          subtitle="Your daily log — open this every morning and every evening"
        >
          <Field name="Daily Intention">
            <p>One sentence for the day. What matters most? What&apos;s the theme? This appears in the Archive so you can look back and see what you were focused on each day.</p>
          </Field>

          <Field name="Top 3 Priorities">
            <p>The three things that must happen today. Once you type a priority, the number badge turns into a <strong className="text-ink">checkbox</strong> — tick it when it&apos;s done. Checked priorities show strikethrough and the done count updates in the card header.</p>
          </Field>

          <Field name="Rapid Log">
            <p>A running log of everything that happens in your day — tasks, notes, events, ideas. Each entry has a <strong className="text-ink">bullet symbol</strong> you can click to cycle through:</p>
            <div className="space-y-1.5 mt-2">
              <Row symbol="○" label="Task" desc="something to do" />
              <Row symbol="×" label="Done" desc="task completed" />
              <Row symbol="→" label="Migrated" desc="moved to another day" />
              <Row symbol="—" label="Canceled" desc="decided not to do it" />
              <Row symbol="•" label="Note" desc="information, not an action" />
              <Row symbol="◇" label="Event" desc="something that happened or is scheduled" />
            </div>
            <p className="mt-2">Press <kbd className="font-mono text-[11px] bg-surface-2 border border-border rounded px-1.5 py-0.5">Enter</kbd> to add an entry. Hover an entry to reveal the × delete button.</p>
          </Field>

          <Field name="Health Basics">
            <p><strong className="text-ink">Movement</strong> and <strong className="text-ink">Protein goal</strong> are toggles — tap the circle to check them off for the day.</p>
            <p><strong className="text-ink">Water</strong> — tap + each time you finish a glass. Goal is 8.</p>
            <p><strong className="text-ink">Sleep last night</strong> — log how many hours you slept before waking up today. Adjusts in 0.5h steps.</p>
          </Field>

          <Field name="Family & Personal">
            <p>A freeform note for anything related to family, home, or your personal life today. Not a task list — just context and reminders.</p>
          </Field>

          <Field name="Evening Reflection">
            <p>Fill this in at the end of the day. <strong className="text-ink">What moved forward</strong> — your wins and good energy. <strong className="text-ink">What gets migrated</strong> — open loops you&apos;re carrying to tomorrow. After 5 PM the reflection card gets highlighted as a reminder to complete it.</p>
          </Field>

          <Field name="Close day & migrate tasks">
            <p>The small link at the bottom manually marks all open ○ tasks as → migrated and seeds tomorrow&apos;s log with them. Tasks also migrate automatically overnight when you open the app the next day.</p>
          </Field>

          <Tip>Open Today first thing in the morning: set your intention, confirm your top 3, and check what migrated in from yesterday.</Tip>
        </Section>

        {/* ── Week ────────────────────────────────────────────────────────── */}
        <Section
          emoji="📅"
          title="Week"
          subtitle="Weekly planning — set focus, priorities, and review each life area"
        >
          <Field name="Navigation">
            <p>Use the ‹ › arrows to browse past weeks. Tap <strong className="text-ink">Now</strong> to jump back to the current week. Past weeks are fully readable and editable.</p>
          </Field>
          <Field name="Weekly Focus">
            <p>The single theme or intention for the week. One sentence — what does winning this week look like?</p>
          </Field>
          <Field name="Weekly Priorities">
            <p>Your 3–5 must-move items for the week. Different from daily priorities — these are the week-level bets. Press Enter to add, hover and click × to remove.</p>
          </Field>
          <Field name="Areas of Life">
            <p>Seven life areas (Work, Projects, Family, Health, Home, Money, Personal). Check the box when you&apos;ve given that area attention this week. Add a note for context — what&apos;s the focus, what&apos;s the next action.</p>
          </Field>
          <Field name="Parking Lot">
            <p>Ideas and tasks that surfaced this week but aren&apos;t for this week. Park them here so they&apos;re not lost and not distracting you right now.</p>
          </Field>
          <Field name="Sunday Review">
            <p>A freeform reflection at the end of the week. What worked? What didn&apos;t? What&apos;s the intention going into next week? Best done Sunday evening.</p>
          </Field>
        </Section>

        {/* ── Brain Dump ──────────────────────────────────────────────────── */}
        <Section
          emoji="⚡"
          title="Capture (Brain Dump)"
          subtitle="Get everything out of your head, then sort it"
        >
          <Field name="Quick capture box">
            <p>Type anything that&apos;s on your mind and press Enter (or Shift+Enter for a new line). It lands as an <strong className="text-ink">Unprocessed</strong> item. Speed matters here — don&apos;t judge it, just capture it.</p>
          </Field>
          <Field name="Labels">
            <p>Each item has a dropdown to assign a label:</p>
            <div className="space-y-1 mt-1">
              <Row symbol="→" label="Do Now" desc="can you do it in 2 minutes? Do it immediately" />
              <Row symbol="→" label="Schedule" desc="needs a specific time slot" />
              <Row symbol="→" label="Delegate" desc="someone else should handle this" />
              <Row symbol="→" label="Waiting" desc="blocked on someone else" />
              <Row symbol="→" label="Someday" desc="good idea, not now" />
              <Row symbol="→" label="Delete" desc="not worth doing" />
            </div>
          </Field>
          <Field name="Move to Today's log">
            <p>Every item has a <strong className="text-ink">Move to Today&apos;s log</strong> button. Tap it to instantly add it as a ○ task in today&apos;s Rapid Log. The item gets marked as converted so you know it&apos;s been actioned.</p>
          </Field>
          <Field name="Filter tabs">
            <p>Filter your inbox by label to process one category at a time. The count on each tab shows how many items need attention.</p>
          </Field>
          <Tip>Process your inbox weekly. For each unprocessed item ask: can I do it in 2 minutes? If yes — do it. If not — label it and move on.</Tip>
        </Section>

        {/* ── Dashboard ───────────────────────────────────────────────────── */}
        <Section
          emoji="🗂"
          title="Areas (Life Dashboard)"
          subtitle="High-level view of the 7 areas of your life"
        >
          <p className="text-sm text-ink-2 leading-relaxed">
            Each of the seven life areas (Work, Projects, Family, Health, Home, Money, Personal) gets a card with four fields:
          </p>
          <Field name="Focus">
            <p>What&apos;s the current objective or theme for this area? One sentence.</p>
          </Field>
          <Field name="Next Action">
            <p>The single most important physical next step. Be specific — vague next actions don&apos;t get done.</p>
          </Field>
          <Field name="Stuck Point">
            <p>What&apos;s blocking you or causing friction in this area right now? Naming it helps you address it.</p>
          </Field>
          <Field name="Notes">
            <p>Anything else relevant — context, links, reminders, longer-form thinking.</p>
          </Field>
          <Tip>Review this page weekly during your Sunday review. Update what&apos;s changed, clear stuck points you&apos;ve resolved.</Tip>
        </Section>

        {/* ── Habits ──────────────────────────────────────────────────────── */}
        <Section
          emoji="📊"
          title="Habits"
          subtitle="Daily habit tracking with streaks and weekly overview"
        >
          <Field name="Daily check-ins">
            <p>Five habits tracked each day: Movement, Protein, Water, Sleep, Supplements. Tap the circle to mark a habit done for that day. The current week is shown as a row of day columns.</p>
          </Field>
          <Field name="Streaks">
            <p>Each habit shows your current consecutive-day streak. A streak breaks if you miss a day. The streak counter updates automatically as you check habits off.</p>
          </Field>
          <Field name="Mood">
            <p>Each day has a mood rating 1–5 (😔 → 😁). Tap the emoji on any day to set it. This gives you a pattern view of how your energy tracks with your habits over the week.</p>
          </Field>
          <Field name="Weekly completion %">
            <p>Each habit row shows what % of this week&apos;s days you&apos;ve hit that habit, so you can see at a glance where you&apos;re consistent and where you&apos;re slipping.</p>
          </Field>
        </Section>

        {/* ── Aesthetic ───────────────────────────────────────────────────── */}
        <Section
          emoji="✦"
          title="Aesthetic (Qoves Protocol)"
          subtitle="Your personalised skincare, hair, and grooming routine"
        >
          <p className="text-sm text-ink-2 leading-relaxed">
            Built from your February 2026 Qoves report (score: 33/100). Everything is tailored to your specific findings.
          </p>
          <Field name="Daily completion bar">
            <p>Shows the overall % of today&apos;s protocol steps you&apos;ve completed across all five categories combined.</p>
          </Field>
          <Field name="Checklists">
            <p>Five sections to check off each day: AM Skincare → PM Skincare → Hair Protocol → Grooming → Neck Protocol. Items with an amber border are the highest-priority steps from your report (SPF, retinol, minoxidil × 2).</p>
          </Field>
          <Field name="7-day compliance bars">
            <p>Each skincare/hair section shows a minibar for the past 7 days — amber = partial, green = full compliance. Lets you spot consistency at a glance.</p>
          </Field>
          <Field name="Skin Log">
            <p>A daily note field for observations — reactions, purging, breakouts, product swaps. Useful to track as retinol does its work over 6–8 weeks.</p>
          </Field>
          <Field name="Qoves Key Findings">
            <p>A reference card with the full report summary — score, hair situation, skin targets, eye recommendations, jaw/beard guidance — so the context is always in front of you.</p>
          </Field>
          <Field name="Product Stack">
            <p>Tap to expand. Edit your actual product list for AM, PM, hair, and grooming. This is your reference — update it whenever you swap a product.</p>
          </Field>
          <Tip>SPF + retinol + minoxidil twice daily — the three non-negotiables. Everything else accelerates, these are the foundation.</Tip>
        </Section>

        {/* ── Gooning ─────────────────────────────────────────────────────── */}
        <Section
          emoji="🛡"
          title="Gooning"
          subtitle="Streak tracker for breaking a negative habit"
        >
          <Field name="Streak counter">
            <p>The large number at the top is your current clean streak — how many consecutive days you&apos;ve gone without a relapse. It counts up from the last time you logged a relapse.</p>
          </Field>
          <Field name="Relapse button">
            <p>If you relapsed today, tap <strong className="text-ink">Log relapse today</strong>. You&apos;ll be asked to confirm. This resets your streak counter back to 0 and logs today as a relapse day.</p>
          </Field>
          <Field name="Stats cards">
            <p>Three summary stats: clean days this month, total relapses on record, and your best streak ever.</p>
          </Field>
          <Field name="Monthly heatmap">
            <p>A calendar showing every day of the month. Green = clean day, red = relapse, dark = no data. Use the arrows to navigate between months.</p>
          </Field>
          <Tip>The streak is the game. Every clean day makes the next one easier. Use this page to build momentum, not to shame yourself — relapses are data, not failure.</Tip>
        </Section>

        {/* ── Archive ─────────────────────────────────────────────────────── */}
        <Section
          emoji="🗃"
          title="Archive"
          subtitle="Every past day's log — searchable and expandable"
        >
          <Field name="Log list">
            <p>All past days shown newest-first. Each row shows the date, your daily intention, task completion, and health badges. Tap any row to expand the full log — priorities, rapid log, and reflection.</p>
          </Field>
          <Field name="Search">
            <p>The search bar filters across date, intention, priorities, rapid log entries, and reflection text simultaneously. Type any keyword — e.g. a person&apos;s name, a project, a word from a note — and matching days appear instantly.</p>
          </Field>
          <Field name="Export backup">
            <p>Downloads a full JSON backup of all your data to your device. Do this periodically to keep a local copy safe.</p>
          </Field>
          <Field name="Restore backup">
            <p>Upload a previously exported JSON file to restore your data. <strong className="text-rust">This replaces your current data</strong> — the page reloads automatically after a successful restore.</p>
          </Field>
          <Tip>Export a backup before restoring. And if you use sync, do a Force Push after restoring so the cloud matches your restored data.</Tip>
        </Section>

        {/* Footer */}
        <p className="text-center text-[11px] font-mono text-ink-3 pt-4 pb-2">
          BASE v1 · Personal OS · Built for daily use
        </p>

      </div>
    </AppLayout>
  );
}
