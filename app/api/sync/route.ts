import { NextRequest, NextResponse } from "next/server";

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(cmd: unknown[]) {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cmd),
  });
  if (!res.ok) throw new Error(`Upstash error: ${res.status}`);
  return res.json() as Promise<{ result: string | null }>;
}

export async function POST(req: NextRequest) {
  if (!REDIS_URL || !REDIS_TOKEN) {
    return NextResponse.json(
      { error: "Sync not configured — set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN" },
      { status: 503 }
    );
  }

  let body: { action?: string; syncKey?: string; data?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, syncKey, data } = body;

  if (!syncKey || typeof syncKey !== "string" || syncKey.trim().length < 4) {
    return NextResponse.json({ error: "Sync key must be at least 4 characters" }, { status: 400 });
  }

  // Namespaced key so multiple apps can share one Redis instance
  const key = `base_app:${syncKey.trim().toLowerCase()}`;

  if (action === "pull") {
    const { result } = await redis(["GET", key]);
    const stored = result ? JSON.parse(result) : null;
    return NextResponse.json({ data: stored });
  }

  if (action === "push") {
    if (!data) return NextResponse.json({ error: "No data provided" }, { status: 400 });
    // Store with 90-day TTL (in seconds) so orphaned keys expire
    await redis(["SET", key, JSON.stringify(data), "EX", 7_776_000]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action — use pull or push" }, { status: 400 });
}
