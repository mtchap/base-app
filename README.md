# Traction — Personal Life Journal

A calm, elegant bullet journal app for desktop and iPhone. Built on the principles of bullet journaling: fast capture, intentional planning, honest reflection.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — no database, no accounts.

## What's inside

| Route | Purpose |
|---|---|
| `/` | **Today** — intention, top 3, rapid log, health basics, reflection |
| `/week` | **Week** — weekly focus, priorities, life areas checklist, parking lot |
| `/brain-dump` | **Capture** — fast idea dump with sorting labels |
| `/dashboard` | **Life Areas** — current focus, next action, stuck point for each area |
| `/habits` | **Habits** — weekly tracker for movement, protein, water, sleep, supplements, mood |
| `/archive` | **Archive** — past daily logs, expandable |

## How it works

All data lives in `localStorage` under the key `traction_v1`. There's no server, no login, no cloud. If you clear browser storage, your data clears too — so export manually if needed.

On first load, the app seeds realistic sample data so you can see how everything works. You can wipe it with:

```js
// In browser console:
localStorage.removeItem('traction_v1')
```

## Bullet Journal symbols

| Symbol | Meaning |
|---|---|
| `○` | Task — something to do |
| `•` | Note — something to remember |
| `×` | Completed — done |
| `→` | Migrated — moved forward |
| `—` | Canceled — no longer relevant |
| `◇` | Event — time-bound thing |

Click any symbol in the Rapid Log to cycle through states.

## Project structure

```
app/             # Next.js App Router pages
  page.tsx       # Today
  week/          # Week
  brain-dump/    # Capture
  dashboard/     # Life Areas
  habits/        # Habit Tracker
  archive/       # Archive
components/
  layout/        # AppLayout (Sidebar + BottomNav)
  ui/            # Card, SectionLabel, Divider
hooks/
  useAppData.ts  # Central data hook (localStorage)
lib/
  types.ts       # All TypeScript interfaces
  utils.ts       # Date helpers, ID generation
  storage.ts     # localStorage read/write
  defaults.ts    # Empty data constructors
  seed.ts        # Sample data for first load
  cn.ts          # Classname utility
```

## Extending it later

### Add cloud sync
Replace `lib/storage.ts` with a backend call. The data shape (`AppData`) stays identical — just swap the read/write layer. A good path: use a Supabase table with a single JSONB column per user.

### Add authentication
Wrap the app in a simple auth provider (NextAuth.js or Clerk). Gate the layout behind a session check. The data hook then fetches from the server instead of localStorage.

### Add a real database
The `AppData` type is a natural document — it maps directly to a single MongoDB document or a Postgres JSONB row. For multi-device sync, store a `userId + data` pair and merge on load.

### Add export / backup
Add a button that calls `JSON.stringify(loadData())` and triggers a file download. Import reverses this. Simple and reliable for v1 sync.

### Make habits configurable
The `HABITS` array in `lib/types.ts` is the source of truth. Replace it with a user-editable list stored in `AppData`.

## Stack

- [Next.js 16](https://nextjs.org) — App Router
- [TypeScript](https://typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Lucide React](https://lucide.dev) — icons
- [next/font](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) — Inter + Lora
- `localStorage` — client-side persistence

## PWA

The app ships a `public/manifest.json` so it can be installed on iPhone via Safari → Share → Add to Home Screen. No service worker in v1, so it won't work fully offline, but the installed shell loads instantly.
