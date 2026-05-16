import type {
  AppData,
  DailyLog,
  WeeklyLog,
  HabitDay,
  LifeAreaCard,
  LifeArea,
  LooksDay,
  LooksStack,
} from "./types";
import { todayKey, weekStartKey, getWeekDays } from "./utils";

export function emptyDailyLog(date: string): DailyLog {
  return {
    date,
    intention: "",
    priorities: ["", "", ""],
    rapidLog: [],
    health: { movement: false, protein: false, water: 0, sleep: 0 },
    familyNotes: "",
    reflection: { movedForward: "", migrating: "" },
  };
}

export function emptyWeeklyLog(weekStart: string): WeeklyLog {
  const emptyArea = () => ({ checked: false, notes: "" });
  return {
    weekStart,
    focus: "",
    priorities: [],
    areas: {
      work:     emptyArea(),
      projects: emptyArea(),
      family:   emptyArea(),
      health:   emptyArea(),
      home:     emptyArea(),
      money:    emptyArea(),
      personal: emptyArea(),
    },
    parkingLot: [],
    sundayReview: "",
  };
}

export function emptyHabitDay(): HabitDay {
  return {
    movement:    false,
    protein:     false,
    water:       false,
    sleep:       false,
    supplements: false,
    mood:        0,
  };
}

export function emptyLooksDay(date: string): LooksDay {
  return {
    date,
    am: {
      cleanser:  false,
      toner:     false,
      vitaminC:  false,
      eyeSerum:  false,
      spf:       false,
      eyeDrops:  false,
    },
    pm: {
      cleanser:    false,
      toner:       false,
      retinol:     false,
      azelaic:     false,
      moisturizer: false,
      neckCream:   false,
    },
    hair: {
      minoxidilAM:    false,
      minoxidilPM:    false,
      redLightHelmet: false,
      curlStyling:    false,
    },
    grooming: {
      teeth:     false,
      floss:     false,
      beardLine: false,
      brows:     false,
    },
    physical: {
      neckCurls:      false,
      neckExtensions: false,
    },
    notes: "",
  };
}

export function emptyLooksStack(): LooksStack {
  return {
    amProducts:       "",
    pmProducts:       "",
    hairProducts:     "",
    groomingProducts: "",
    notes:            "",
    startScore:       33,
  };
}

/** Detect whether a stored LooksDay uses the old schema (pre-Qoves report) */
function isLegacyLooksDay(d: unknown): boolean {
  if (!d || typeof d !== "object") return true;
  const obj = d as Record<string, unknown>;
  // Old schema had `am.faceWash`; new has `am.cleanser`
  return !!(obj.am && typeof obj.am === "object" && "faceWash" in (obj.am as object));
}

const emptyLifeArea = (): LifeAreaCard => ({
  focus:      "",
  nextAction: "",
  stuckPoint: "",
  notes:      "",
});

export function emptyAppData(): AppData {
  const today = todayKey();
  const ws    = weekStartKey();
  const days  = getWeekDays(ws);

  const habits: Record<string, HabitDay> = {};
  days.forEach(d => { habits[d] = emptyHabitDay(); });

  const looksLogs: Record<string, LooksDay> = {};
  days.forEach(d => { looksLogs[d] = emptyLooksDay(d); });

  const lifeDashboard = {} as Record<LifeArea, LifeAreaCard>;
  const areas: LifeArea[] = ["work","projects","family","health","home","money","personal"];
  areas.forEach(a => { lifeDashboard[a] = emptyLifeArea(); });

  return {
    version:       1,
    lastUpdated:   new Date().toISOString(),
    dailyLogs:     { [today]: emptyDailyLog(today) },
    weeklyLogs:    { [ws]:    emptyWeeklyLog(ws) },
    brainDump:     [],
    lifeDashboard,
    habits,
    looksLogs,
    looksStack:    emptyLooksStack(),
  };
}

/** Ensures the current day & week keys always exist in stored data. */
export function ensureDefaults(data: AppData): AppData {
  const today = todayKey();
  const ws    = weekStartKey();
  const days  = getWeekDays(ws);

  let changed = false;
  const next  = { ...data };

  if (!next.dailyLogs[today]) {
    next.dailyLogs = { ...next.dailyLogs, [today]: emptyDailyLog(today) };
    changed = true;
  }
  if (!next.weeklyLogs[ws]) {
    next.weeklyLogs = { ...next.weeklyLogs, [ws]: emptyWeeklyLog(ws) };
    changed = true;
  }
  if (!next.looksLogs) {
    next.looksLogs = {};
    changed = true;
  }
  if (!next.looksStack) {
    next.looksStack = emptyLooksStack();
    changed = true;
  }
  // Migrate legacy looksStack that didn't have hairProducts or startScore
  if (next.looksStack && !("hairProducts" in (next.looksStack as object))) {
    next.looksStack = { ...emptyLooksStack(), ...(next.looksStack as object) } as LooksStack;
    changed = true;
  }
  // Fix startScore that was stored as 0 (never-set sentinel) — use real baseline
  if (next.looksStack && (next.looksStack as LooksStack).startScore === 0) {
    next.looksStack = { ...(next.looksStack as LooksStack), startScore: 33 };
    changed = true;
  }
  // Reset legacy looksLogs entries to new schema
  const looksLogsCopy = { ...next.looksLogs };
  let looksChanged = false;
  Object.keys(looksLogsCopy).forEach(d => {
    if (isLegacyLooksDay(looksLogsCopy[d])) {
      looksLogsCopy[d] = emptyLooksDay(d);
      looksChanged = true;
    }
  });
  if (looksChanged) { next.looksLogs = looksLogsCopy; changed = true; }
  if (!next.looksLogs[today]) {
    next.looksLogs = { ...next.looksLogs, [today]: emptyLooksDay(today) };
    changed = true;
  }

  const habitsCopy = { ...next.habits };
  days.forEach(d => {
    if (!habitsCopy[d]) { habitsCopy[d] = emptyHabitDay(); changed = true; }
  });
  if (changed) next.habits = habitsCopy;

  return changed ? next : data;
}
