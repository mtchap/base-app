// ─── Bullet Journal Symbols ─────────────────────────────────────────────────

export type BulletSymbol =
  | "task"       // ○
  | "note"       // •
  | "completed"  // ×
  | "migrated"   // →
  | "canceled"   // —
  | "event";     // ◇

// ─── Daily Log ───────────────────────────────────────────────────────────────

export interface RapidLogItem {
  id: string;
  symbol: BulletSymbol;
  content: string;
  createdAt: string;
}

export interface DailyHealth {
  movement: boolean;
  protein: boolean;
  water: number;   // 0–8 glasses
  sleep: number;   // hours
}

export interface DailyLog {
  date: string;    // "YYYY-MM-DD"
  intention: string;
  priorities: string[];
  rapidLog: RapidLogItem[];
  health: DailyHealth;
  familyNotes: string;
  reflection: {
    movedForward: string;
    migrating: string;
  };
}

// ─── Weekly Log ──────────────────────────────────────────────────────────────

export type LifeArea =
  | "work"
  | "projects"
  | "family"
  | "health"
  | "home"
  | "money"
  | "personal";

export const LIFE_AREAS: { key: LifeArea; label: string; icon: string }[] = [
  { key: "work",     label: "Work",           icon: "💼" },
  { key: "projects", label: "Projects",       icon: "🔨" },
  { key: "family",   label: "Family",         icon: "🏠" },
  { key: "health",   label: "Health",         icon: "🌿" },
  { key: "home",     label: "Home & Admin",   icon: "📋" },
  { key: "money",    label: "Money",          icon: "💰" },
  { key: "personal", label: "Personal",       icon: "✦" },
];

export interface WeeklyAreaEntry {
  checked: boolean;
  notes: string;
}

export interface WeeklyLog {
  weekStart: string;   // "YYYY-MM-DD" (Monday)
  focus: string;
  priorities: string[];
  areas: Record<LifeArea, WeeklyAreaEntry>;
  parkingLot: string[];
  sundayReview: string;
}

// ─── Brain Dump ───────────────────────────────────────────────────────────────

export type BrainDumpLabel =
  | "unprocessed"
  | "do-now"
  | "schedule"
  | "delegate"
  | "waiting"
  | "someday"
  | "delete";

export const BRAIN_DUMP_LABELS: {
  key: BrainDumpLabel;
  label: string;
  color: string;
}[] = [
  { key: "unprocessed", label: "Unprocessed", color: "text-ink-3" },
  { key: "do-now",      label: "Do Now",      color: "text-rust" },
  { key: "schedule",    label: "Schedule",    color: "text-accent" },
  { key: "delegate",    label: "Delegate",    color: "text-ink-2" },
  { key: "waiting",     label: "Waiting",     color: "text-ink-2" },
  { key: "someday",     label: "Someday",     color: "text-ink-3" },
  { key: "delete",      label: "Delete",      color: "text-rust" },
];

export interface BrainDumpItem {
  id: string;
  content: string;
  label: BrainDumpLabel;
  createdAt: string;
  convertedToTask: boolean;
}

// ─── Life Dashboard ──────────────────────────────────────────────────────────

export interface LifeAreaCard {
  focus: string;
  nextAction: string;
  stuckPoint: string;
  notes: string;
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export interface HabitDay {
  movement: boolean;
  protein: boolean;
  water: boolean;
  sleep: boolean;
  supplements: boolean;
  gooning: boolean;
  mood: number;   // 0 = unset, 1–5
}

export const HABITS: { key: keyof Omit<HabitDay, "mood">; label: string; icon: string; negative?: boolean }[] = [
  { key: "movement",    label: "Movement",    icon: "🏃" },
  { key: "protein",     label: "Protein",     icon: "🥩" },
  { key: "water",       label: "Water",       icon: "💧" },
  { key: "sleep",       label: "Sleep",       icon: "🌙" },
  { key: "supplements", label: "Supplements", icon: "💊" },
  { key: "gooning",     label: "Gooning",     icon: "🌀", negative: true },
];

// ─── Looksmaxxing — Qoves Protocol (Feb 2026) ────────────────────────────────
// Personalised to report findings: score 33, Norwood 6, skin texture primary issue

export interface LooksDay {
  date: string;

  /** AM skincare — Qoves prescribed order */
  am: {
    cleanser:  boolean;  // Gentle non-drying face wash
    toner:     boolean;  // Hydrating toner / light essence
    vitaminC:  boolean;  // Vitamin C serum — face + neck
    eyeSerum:  boolean;  // Vitamin C eye serum — under eyes
    spf:       boolean;  // SPF 50 — face + neck, NON-NEGOTIABLE
    eyeDrops:  boolean;  // Whitening drops (doctor-guided for redness)
  };

  /** PM skincare — Qoves prescribed order */
  pm: {
    cleanser:    boolean;  // Gentle cleanser
    toner:       boolean;  // Hydrating toner
    retinol:     boolean;  // 0.25–0.5% retinol — start 3×/wk, build up
    azelaic:     boolean;  // Azelaic acid on red / pigmented patches
    moisturizer: boolean;  // Barrier moisturizer
    neckCream:   boolean;  // Retinol neck cream
  };

  /** Hair protocol — Norwood 6 intervention plan */
  hair: {
    minoxidilAM:    boolean;  // 5% minoxidil — AM application
    minoxidilPM:    boolean;  // 5% minoxidil — PM application
    redLightHelmet: boolean;  // Red light hair helmet session
    curlStyling:    boolean;  // Curl cream + diffuse to define curls
  };

  /** Grooming — Qoves recommendations */
  grooming: {
    teeth:    boolean;  // Brush teeth
    floss:    boolean;  // Floss / Waterpik
    beardLine: boolean; // Define jaw line, shave neck beard clean
    brows:    boolean;  // Thread upper/outer borders + dark brow gel
  };

  /** Physical — neck strengthening protocol from report */
  physical: {
    neckCurls:      boolean;  // 3 sets × 15–20 reps, 3×/wk
    neckExtensions: boolean;  // 3 sets × 20–25 reps, 3×/wk
  };

  notes: string;
}

/** Product stack — persisted separately, updated whenever */
export interface LooksStack {
  amProducts:        string;
  pmProducts:        string;
  hairProducts:      string;
  groomingProducts:  string;
  notes:             string;
  /** Starting Qoves aesthetic score for reference */
  startScore:        number;
}

// ─── Root App Data ────────────────────────────────────────────────────────────

export interface AppData {
  version: number;
  lastUpdated: string;
  dailyLogs:     Record<string, DailyLog>;
  weeklyLogs:    Record<string, WeeklyLog>;
  brainDump:     BrainDumpItem[];
  lifeDashboard: Record<LifeArea, LifeAreaCard>;
  habits:        Record<string, HabitDay>;
  looksLogs:     Record<string, LooksDay>;
  looksStack:    LooksStack;
}
