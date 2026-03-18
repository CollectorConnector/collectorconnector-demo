// app/api/avatar-update/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Body = {
  userId?: string;
  avatarUrl?: string;
  filePath?: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // This will run at import time on the server; keep message minimal.
  // In production, ensure both env vars are set.
  // eslint-disable-next-line no-console
  console.error("Missing SUPABASE env vars for avatar-update route.");
}

export async function POST(req: Request) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const body: Body = await req.json().catch(() => ({} as Body));
    const { userId, avatarUrl } = body;

    if (!userId || !avatarUrl) {
      return NextResponse.json({ error: "Missing userId or avatarUrl" }, { status: 400 });
    }

    // Optional: add simple rate limiting, logging, or origin checks here.
    // IMPORTANT: In production you should verify the request is legitimate
    // (for example, require a short-lived client token and validate it).
    // This endpoint runs with the service role key and must be protected.

    // Ensure profile row exists (insert if missing)
    const { data: existing, error: selectErr } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (selectErr) {
      throw selectErr;
    }

    if (!existing) {
      const { error: insertErr } = await supabaseAdmin
        .from("profiles")
        .insert({ id: userId, created_at: new Date().toISOString() });
      if (insertErr) throw insertErr;
    }

    // Update avatar_url
    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (updateErr) throw updateErr;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("avatar-update error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

