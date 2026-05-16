"use client";

import { useState } from "react";
import { Cloud, CloudOff, Loader, Check, X, RefreshCw } from "lucide-react";
import type { SyncStatus } from "@/hooks/useAppData";
import { cn } from "@/lib/cn";

interface Props {
  syncKey: string | null;
  syncStatus: SyncStatus;
  onActivate: (key: string) => Promise<void>;
  onClear: () => void;
  onSyncNow: () => Promise<void>;
}

export default function SyncPanel({ syncKey, syncStatus, onActivate, onClear, onSyncNow }: Props) {
  const [open, setOpen]     = useState(false);
  const [input, setInput]   = useState("");
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState<string | null>(null);

  const statusIcon = () => {
    if (!syncKey)                       return <CloudOff size={13} className="text-ink-3" />;
    if (syncStatus === "syncing" || busy) return <Loader size={13} className="text-accent animate-spin" />;
    if (syncStatus === "ok")            return <Cloud size={13} className="text-sage" />;
    if (syncStatus === "error")         return <Cloud size={13} className="text-rust" />;
    return <Cloud size={13} className="text-ink-3" />;
  };

  const statusLabel = () => {
    if (!syncKey)               return "No sync";
    if (syncStatus === "syncing" || busy) return "Syncing…";
    if (syncStatus === "ok")    return "Synced";
    if (syncStatus === "error") return "Sync error";
    return "Sync off";
  };

  async function handleActivate() {
    if (input.trim().length < 4) { setErr("Key must be at least 4 characters"); return; }
    setBusy(true); setErr(null);
    try {
      await onActivate(input.trim());
      setOpen(false);
      setInput("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSyncNow() {
    setBusy(true);
    try { await onSyncNow(); } finally { setBusy(false); }
  }

  return (
    <div className="relative">
      {/* Trigger row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full text-left group"
      >
        <span className="flex items-center gap-1.5">
          {statusIcon()}
          <span className="text-[9px] font-mono text-ink-3 tracking-wider uppercase">
            {statusLabel()}
          </span>
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-surface border border-border rounded-lg shadow-card p-3 z-50">

          {syncKey ? (
            <>
              {/* Active sync key */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono text-ink-3 uppercase tracking-widest">Sync key</span>
                <button
                  onClick={() => { onClear(); setOpen(false); }}
                  className="text-ink-3 hover:text-rust transition-colors"
                  title="Disconnect sync"
                >
                  <X size={12} />
                </button>
              </div>

              <div className="bg-surface-2 rounded px-2 py-1.5 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                <span className="text-[11px] font-mono text-ink truncate">{syncKey}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSyncNow}
                  disabled={busy}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[11px] font-mono transition-colors",
                    "bg-surface-2 hover:bg-border text-ink-2 disabled:opacity-50"
                  )}
                >
                  <RefreshCw size={10} className={busy ? "animate-spin" : ""} />
                  Sync now
                </button>
              </div>

              <p className="text-[9px] font-mono text-ink-3 mt-2 leading-relaxed opacity-60">
                Changes auto-push every 2.5s. Same key on any device = same data.
              </p>
            </>
          ) : (
            <>
              {/* No key set */}
              <p className="text-[9px] font-mono text-ink-3 uppercase tracking-widest mb-2">
                Set sync key
              </p>
              <p className="text-[10px] text-ink-3 leading-relaxed mb-3">
                Enter any passphrase. Use the same key on all your devices to keep data in sync.
              </p>

              <input
                type="text"
                value={input}
                onChange={e => { setInput(e.target.value); setErr(null); }}
                onKeyDown={e => e.key === "Enter" && handleActivate()}
                placeholder="e.g. base-michael-2026"
                className={cn(
                  "w-full bg-surface-2 border rounded px-2 py-1.5 text-[11px] font-mono text-ink placeholder:text-ink-3",
                  "focus:outline-none focus:ring-1",
                  err ? "border-rust focus:ring-rust" : "border-border focus:ring-accent"
                )}
              />

              {err && (
                <p className="text-[9px] font-mono text-rust mt-1">{err}</p>
              )}

              <button
                onClick={handleActivate}
                disabled={busy || input.trim().length < 4}
                className={cn(
                  "mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-[11px] font-mono transition-colors",
                  "bg-accent text-canvas hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {busy ? <Loader size={10} className="animate-spin" /> : <Check size={10} />}
                {busy ? "Connecting…" : "Activate"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
