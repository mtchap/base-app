"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  CalendarDays,
  Zap,
  LayoutGrid,
  Activity,
  Archive,
  Sparkles,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppData } from "@/hooks/useAppData";
import SyncPanel from "@/components/ui/SyncPanel";

const NAV = [
  { href: "/",            label: "Today",      Icon: Sun },
  { href: "/week",        label: "Week",       Icon: CalendarDays },
  { href: "/brain-dump",  label: "Capture",    Icon: Zap },
  { href: "/dashboard",   label: "Areas",      Icon: LayoutGrid },
  { href: "/habits",      label: "Habits",     Icon: Activity },
  { href: "/looks",       label: "Aesthetic",  Icon: Sparkles },
  { href: "/discipline",  label: "Discipline", Icon: Shield },
  { href: "/archive",     label: "Archive",    Icon: Archive },
] as const;

function DesktopNavItem({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.FC<{ size?: number; strokeWidth?: number }>;
  active: boolean;
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
      <span
        className={cn(
          "w-0.5 h-4 rounded-full transition-all",
          active ? "bg-accent" : "bg-transparent"
        )}
      />
      <Icon size={14} strokeWidth={active ? 2 : 1.5} />
      <span className="tracking-wide">{label}</span>
    </Link>
  );
}

function MobileNavItem({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.FC<{ size?: number; strokeWidth?: number }>;
  active: boolean;
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { syncKey, syncStatus, activateSyncKey, clearSyncKey, syncNow } = useAppData();

  const isActive = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

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

        {/* Footer — sync status */}
        <div className="px-4 py-4 border-t border-border-light">
          <SyncPanel
            syncKey={syncKey}
            syncStatus={syncStatus}
            onActivate={activateSyncKey}
            onClear={clearSyncKey}
            onSyncNow={syncNow}
          />
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-52 overflow-y-auto min-h-full">
        {children}
      </main>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border">
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
    </div>
  );
}
