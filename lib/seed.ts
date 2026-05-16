import type { AppData, RapidLogItem, BrainDumpItem, HabitDay, LooksDay } from "./types";
import { todayKey, weekStartKey, getWeekDays, generateId } from "./utils";
import { emptyDailyLog, emptyWeeklyLog, emptyHabitDay, emptyLooksDay } from "./defaults";

function item(
  symbol: RapidLogItem["symbol"],
  content: string,
  offsetMin = 0
): RapidLogItem {
  const d = new Date();
  d.setMinutes(d.getMinutes() - offsetMin);
  return { id: generateId(), symbol, content, createdAt: d.toISOString() };
}

function dump(
  content: string,
  label: BrainDumpItem["label"],
  daysAgo = 0
): BrainDumpItem {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: generateId(),
    content,
    label,
    createdAt: d.toISOString(),
    convertedToTask: false,
  };
}

export function createSeedData(): AppData {
  const today = todayKey();
  const ws = weekStartKey();
  const days = getWeekDays(ws);

  // ── Today log ──────────────────────────────────────────────────────────────
  const todayLog = {
    ...emptyDailyLog(today),
    intention: "Ship the client proposal and protect the morning for deep work.",
    priorities: [
      "Send finalized proposal to Acme Corp",
      "45-min workout before noon",
      "Call mom — overdue",
    ],
    rapidLog: [
      item("completed", "Reviewed overnight emails", 90),
      item("note", "Great angle for the positioning: lead with outcomes, not features", 75),
      item("task", "Send client proposal"),
      item("task", "Write weekly review"),
      item("migrated", "Renew car insurance — moved from yesterday"),
      item("event", "Team standup at 10am"),
    ],
    health: { movement: true, protein: true, water: 5, sleep: 7 },
    familyNotes: "Mom's birthday is next Saturday — order something this week.",
    reflection: { movedForward: "", migrating: "" },
  };

  // ── Weekly log ─────────────────────────────────────────────────────────────
  const weekLog = {
    ...emptyWeeklyLog(ws),
    focus: "Ship client work and keep home life stable — no heroics.",
    priorities: [
      "Finalize and send Acme Corp proposal",
      "Three workouts — no negotiating",
      "Sunday: family time, no laptop",
      "Meal prep Sunday evening",
    ],
    areas: {
      work:     { checked: true,  notes: "Proposal is the one thing." },
      projects: { checked: false, notes: "On hold until proposal ships." },
      family:   { checked: true,  notes: "Mom's birthday gift + Sunday together." },
      health:   { checked: true,  notes: "3 workouts, protein on track." },
      home:     { checked: false, notes: "HVAC service still not scheduled." },
      money:    { checked: false, notes: "" },
      personal: { checked: true,  notes: "20 pages/day on The Creative Act." },
    },
    parkingLot: [
      "Research new CRM tools",
      "Check old 401k rollover status",
      "Look into standing desk for office",
    ],
    sundayReview: "",
  };

  // ── Brain dump ─────────────────────────────────────────────────────────────
  const brainDump: BrainDumpItem[] = [
    dump("Buy birthday gift for Mom — she mentioned wanting the Le Creuset pan", "do-now", 1),
    dump("Research HELOC rates — house equity is there, worth exploring", "someday", 2),
    dump("Fix the dripping kitchen faucet", "schedule", 0),
    dump("Quarterly estimated tax payment due June 15", "schedule", 1),
    dump("Look into new accounting software — QuickBooks feels bloated", "someday", 3),
    dump("Finish reading Atomic Habits before starting next book", "someday", 4),
    dump("Ask Jake to handle the vendor onboarding calls next week", "delegate", 0),
    dump("Chase up invoice #1042 from March — still unpaid", "do-now", 2),
  ];

  // ── Life dashboard ─────────────────────────────────────────────────────────
  const lifeDashboard = {
    work: {
      focus: "Q2 client acquisition — close Acme Corp this week",
      nextAction: "Send finalized proposal by Thursday EOD",
      stuckPoint: "Waiting on case study approval from design team",
      notes: "Focus on 3 key verticals this quarter. Don't spread thin.",
    },
    projects: {
      focus: "Personal site redesign",
      nextAction: "Wireframe homepage layout in Figma",
      stuckPoint: "",
      notes: "New portfolio pieces ready. Use them as the anchor.",
    },
    family: {
      focus: "Summer trip planning + mom's birthday",
      nextAction: "Research Airbnbs in Colorado for late July",
      stuckPoint: "",
      notes: "Need to book accommodations before June — prices go up.",
    },
    health: {
      focus: "Consistent morning workouts + hit protein goal",
      nextAction: "30 min lift tomorrow before 7am — set alarm tonight",
      stuckPoint: "Staying consistent on travel weeks",
      notes: "Protein target: 160g/day. Sleep is the real lever right now.",
    },
    home: {
      focus: "Kitchen organization + HVAC service",
      nextAction: "Call HVAC company — last service was over a year ago",
      stuckPoint: "",
      notes: "Also: order cabinet organizers, replace hall light fixture.",
    },
    money: {
      focus: "Build 6-month emergency fund ($18k target)",
      nextAction: "Set up automatic $800/mo transfer to high-yield savings",
      stuckPoint: "Need to close old savings account at Chase first",
      notes: "On track for December target if auto-transfer is live by June.",
    },
    personal: {
      focus: "Read more consistently — 20 pages/day",
      nextAction: "20 pages of The Creative Act before bed tonight",
      stuckPoint: "",
      notes: "Also: get outside for a walk twice a week — underrated.",
    },
  };

  // ── Habits ─────────────────────────────────────────────────────────────────
  const habits: Record<string, HabitDay> = {};
  days.forEach(d => { habits[d] = emptyHabitDay(); });

  // Fill past days with plausible data (don't fill future or today)
  const seedHabits: [boolean, boolean, boolean, boolean, boolean, boolean, number][] = [
    [true,  true,  true,  true,  true,  false, 4],
    [false, true,  true,  false, true,  true,  3],
    [true,  false, true,  true,  true,  false, 4],
    [true,  true,  false, true,  false, false, 5],
    [false, true,  true,  true,  true,  true,  4],
    [true,  true,  true,  true,  true,  false, 5],
  ];
  days.slice(0, 6).forEach((d, i) => {
    if (d >= today) return;
    const [movement, protein, water, sleep, supplements, gooning, mood] = seedHabits[i];
    habits[d] = { movement, protein, water, sleep, supplements, gooning, mood };
  });

  // ── Looks — Qoves Protocol ──────────────────────────────────────────────────
  const looksLogs: Record<string, LooksDay> = {};
  days.forEach(d => { looksLogs[d] = emptyLooksDay(d); });

  // Today: AM partially done (morning routine in progress)
  looksLogs[today] = {
    ...emptyLooksDay(today),
    am: {
      cleanser:  true,
      toner:     true,
      vitaminC:  true,
      eyeSerum:  true,
      spf:       false,   // not yet
      eyeDrops:  false,
    },
    hair: {
      minoxidilAM:    true,
      minoxidilPM:    false,
      redLightHelmet: false,
      curlStyling:    false,
    },
    grooming: {
      teeth:     true,
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

  // Past days — plausible compliance data
  type SeedRow = { am: boolean[]; pm: boolean[]; hair: boolean[]; gr: boolean[]; ph: boolean[] };
  const seedLooks: SeedRow[] = [
    { am: [true,true,true,true,true,false],  pm: [true,true,true,false,true,true],  hair:[true,true,false,true],  gr:[true,true,true,false],  ph:[true,false] },
    { am: [true,true,false,true,true,false], pm: [true,false,false,false,true,false],hair:[true,true,true,false],  gr:[true,true,false,false], ph:[false,false] },
    { am: [true,true,true,true,true,false],  pm: [true,true,true,true,true,true],   hair:[true,true,true,true],   gr:[true,false,true,false], ph:[true,true] },
    { am: [true,false,true,false,true,false],pm: [true,true,false,false,true,true], hair:[true,true,false,false],  gr:[true,true,false,false], ph:[false,false] },
    { am: [true,true,true,true,true,false],  pm: [true,true,true,false,true,true],  hair:[true,true,true,false],  gr:[true,true,true,false],  ph:[true,false] },
    { am: [true,true,false,true,false,false],pm: [true,false,false,false,true,false],hair:[true,true,false,false], gr:[true,false,true,false], ph:[false,false] },
  ];
  days.slice(0, 6).forEach((d, i) => {
    if (d >= today) return;
    const s = seedLooks[i];
    looksLogs[d] = {
      date: d,
      am: { cleanser: s.am[0], toner: s.am[1], vitaminC: s.am[2], eyeSerum: s.am[3], spf: s.am[4], eyeDrops: s.am[5] },
      pm: { cleanser: s.pm[0], toner: s.pm[1], retinol: s.pm[2], azelaic: s.pm[3], moisturizer: s.pm[4], neckCream: s.pm[5] },
      hair: { minoxidilAM: s.hair[0], minoxidilPM: s.hair[1], redLightHelmet: s.hair[2], curlStyling: s.hair[3] },
      grooming: { teeth: s.gr[0], floss: s.gr[1], beardLine: s.gr[2], brows: s.gr[3] },
      physical: { neckCurls: s.ph[0], neckExtensions: s.ph[1] },
      notes: "",
    };
  });

  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    dailyLogs: { [today]: todayLog },
    weeklyLogs: { [ws]: weekLog },
    brainDump,
    lifeDashboard,
    habits,
    looksLogs,
    looksStack: {
      // Products from Qoves skin protocol
      amProducts:
        "Gentle non-drying face wash (CeraVe Hydrating Cleanser)\n" +
        "Hydrating toner / light essence\n" +
        "Vitamin C serum (Timeless Vit C + E Ferulic) — face + neck\n" +
        "Vitamin C eye serum — under eyes\n" +
        "SPF 50 broad spectrum — face + neck (EltaMD UV Clear SPF 46)",
      pmProducts:
        "Gentle cleanser (same as AM)\n" +
        "Hydrating toner\n" +
        "Retinol 0.25–0.5% — start 3×/wk, work up slowly\n" +
        "Azelaic acid cream — red + pigmented patches only\n" +
        "Barrier moisturizer (CeraVe Moisturizing Cream)\n" +
        "Retinol neck cream",
      hairProducts:
        "Minoxidil 5% foam or solution — AM + PM (clear with doctor)\n" +
        "Curl cream — apply to damp hair before diffusing\n" +
        "Red light hair helmet — multiple sessions per week\n" +
        "PRP sessions — discuss with trichologist",
      groomingProducts:
        "Wahl trimmer — guard #2 sides, scissors top\n" +
        "Dark brow gel — brush through after threading\n" +
        "Oral-B electric brush + whitening toothpaste\n" +
        "Waterpik / floss",
      notes:
        "Qoves aesthetic score: 33 (Feb 2026). " +
        "Main issues: skin texture (T-zone pores, chin/cheek coarseness), " +
        "uneven pigmentation, Norwood 6 recession. " +
        "Strong bone structure is the asset — protocol focuses on refining surface. " +
        "Retinol: start 3×/wk, purging expected for 6–8 wks. " +
        "Neck work: 3×/wk. In-clinic targets: RF tightening, tear trough filler, polynucleotide injections.",
      startScore: 33,
    },
  };
}
