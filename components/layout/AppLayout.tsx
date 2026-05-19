"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun, CalendarDays, Zap, LayoutGrid, Activity,
  Archive, Sparkles, Shield, Plus, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppData } from "@/hooks/useAppData";
import { todayKey, generateId } from "@/lib/utils";
import type { RapidLogItem } from "@/lib/types";
import SyncPanel from "@/components/ui/SyncPanel";

const NAV = [
  { href: "/",            label: "Today",     Icon: Sun },
  { href: "/week",        label: "Week",      Icon: CalendarDays },
  { href: "/brain-dump",  label: "Capture",   Icon: Zap },
  { href: "/dashboard",   label: "Areas",     Icon: LayoutGrid },
  { href: "/habits",      label: "Habits",    Icon: Activity },
  { href: "/looks",       label: "Aesthetic", Icon: Sparkles },
  { href: "/gooning",     label: "Gooning",   Icon: Shield },
  { href: "/archive",     label: "Archive",   Icon: Archive },
  { href: "/help",        label: "Guide",     Icon: HelpCircle },
] as const;

// ─── Nav items ────────────────────────────────────────────────────────────────

function DesktopNavItem({
  href, label, Icon, active,
}: {
  href: string; label: string;
  Icon: React.FC<{ size?: number; strokeWidth?: number }>; active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all w-full group",
        active
          ? "text-accent bg-accent-light font-medium"
          : "text-ink-3 hover:text-ink hover:bg-surface-2"
      )}
    >
      <span className={cn(
        "w-0.5 h-4 rounded-full transition-all",
        active ? "bg-accent" : "bg-transparent"
      )} />
      <Icon size={14} strokeWidth={active ? 2 : 1.5} />
      <span className="tracking-wide">{label}</span>
    </Link>
  );
}

function MobileNavItem({
  href, label, Icon, active,
}: {
  href: string; label: string;
  Icon: React.FC<{ size?: number; strokeWidth?: number }>; active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors min-w-[52px] shrink-0",
        active ? "text-accent" : "text-ink-3 hover:text-ink-2"
      )}
    >
      <Icon size={18} strokeWidth={active ? 2 : 1.5} />
      <span className="text-[9px] font-medium tracking-wide font-sans">{label}</span>
    </Link>
  );
}

// ─── Quick Capture Overlay ────────────────────────────────────────────────────

function QuickCapture({ onClose }: { onClose: () => void }) {
  const { data, updateDailyLog } = useAppData();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) { onClose(); return; }
    const today = todayKey();
    const existing = data.dailyLogs[today];
    const newItem: RapidLogItem = {
      id: generateId(),
      symbol: "task",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    updateDailyLog(today, {
      rapidLog: [...(existing?.rapidLog ?? []), newItem],
    });
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-canvas/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="bg-surface border border-border rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-ink-3 uppercase tracking-widest">Quick capture</span>
            <span className="text-[10px] font-mono text-ink-3 ml-auto">→ Today&apos;s log</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-mono text-ink-3">○</span>
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") onClose();
              }}
              placeholder="What do you need to do?"
              className="flex-1 bg-transparent text-base text-ink placeholder:text-ink-3 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-light">
            <span className="text-[10px] text-ink-3 font-mono">Enter to add · Esc to cancel</span>
            <button
              onClick={submit}
              disabled={!text.trim()}
              className="px-4 py-1.5 rounded-lg bg-accent text-canvas text-[12px] font-mono disabled:opacity-40 hover:bg-accent/90 transition-colors"
            >
              Add task
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { syncKey, syncStatus, activateSyncKey, clearSyncKey, syncNow, forcePush } = useAppData();
  const [captureOpen, setCaptureOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  const closeCapture = useCallback(() => setCaptureOpen(false), []);

  return (
    <div className="flex h-full bg-grid">

      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-border bg-surface h-full fixed top-0 left-0 z-30">

        {/* Wordmark */}
        <div className="px-5 pt-7 pb-5 border-b border-border-light">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-serif font-bold text-ink tracking-tight">BASE</span>
            <span className="text-[9px] font-mono text-ink-3 tracking-[0.15em]">v1</span>
          </div>
          <p className="text-[9px] font-mono text-ink-3 mt-0.5 tracking-[0.12em] uppercase">
            Personal OS
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, Icon }) => (
            <DesktopNavItem
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              active={isActive(href)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border-light space-y-3">
          <SyncPanel
            syncKey={syncKey}
            syncStatus={syncStatus}
            onActivate={activateSyncKey}
            onClear={clearSyncKey}
            onSyncNow={syncNow}
            onForcePush={forcePush}
          />
          <p className="text-[9px] font-mono text-ink-3/50 leading-relaxed">
            Add to Home Screen in your browser for the full app experience.
          </p>
        </div>
      </aside>

      {/* ── Mobile Top Bar ────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-surface border-b border-border flex items-center justify-between px-4 h-11 safe-top">
        <span className="text-sm font-serif font-bold text-ink tracking-tight">BASE</span>
        <SyncPanel
          syncKey={syncKey}
          syncStatus={syncStatus}
          onActivate={activateSyncKey}
          onClear={clearSyncKey}
          onSyncNow={syncNow}
          onForcePush={forcePush}
          dropDirection="down"
        />
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-52 overflow-y-auto min-h-full pt-11 lg:pt-0">
        {children}
      </main>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border safe-bottom">
        <div className="flex items-center overflow-x-auto px-2 py-1 gap-0.5 scrollbar-none">
          {NAV.map(({ href, label, Icon }) => (
            <MobileNavItem
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              active={isActive(href)}
            />
          ))}
        </div>
      </nav>

      {/* ── Floating Quick-Capture Button ─────────────────────────────────── */}
      {!captureOpen && (
        <button
          onClick={() => setCaptureOpen(true)}
          className={cn(
            "fixed z-40 w-12 h-12 rounded-full bg-accent text-canvas shadow-card",
            "flex items-center justify-center hover:bg-accent/90 active:scale-95 transition-all",
            // Desktop: above bottom-right; Mobile: above bottom nav
            "bottom-20 right-5 lg:bottom-8 lg:right-8"
          )}
          title="Quick capture (add task to today)"
          aria-label="Quick capture"
        >
          <Plus size={20} strokeWidth={2} />
        </button>
      )}

      {/* ── Quick Capture Overlay ─────────────────────────────────────────── */}
      {captureOpen && <QuickCapture onClose={closeCapture} />}
    </div>
  );
}
