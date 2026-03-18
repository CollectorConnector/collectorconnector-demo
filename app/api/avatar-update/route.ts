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
  // Minimal server-side warning
  // Ensure these env vars are set in Vercel / .env.local
  // eslint-disable-next-line no-console
  console.error("Missing SUPABASE env vars for avatar-update route.");
}

export async function POST(req: Request) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const body = (await req.json().catch(() => ({} as Body))) as Body;
    const { userId, avatarUrl } = body;

    if (!userId || !avatarUrl) {
      return NextResponse.json({ error: "Missing userId or avatarUrl" }, { status: 400 });
    }

    // Extract Bearer token from Authorization header
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return NextResponse.json({ error: "Missing access token" }, { status: 401 });

    // Verify token with Supabase admin client
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid access token" }, { status: 401 });
    }
    if (userData.user.id !== userId) {
      return NextResponse.json({ error: "Token does not match userId" }, { status: 403 });
    }

    // Ensure profile row exists (insert if missing)
    const { data: existing, error: selectErr } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (selectErr) throw selectErr;

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

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("avatar-update error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
