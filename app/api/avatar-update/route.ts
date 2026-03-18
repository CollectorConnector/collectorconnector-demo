// app/api/avatar-update/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Body = {
  userId?: string;
  avatarUrl?: string;
  filePath?: string; // "<bucket>/<path/to/object>"
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SIGNED_URL_EXPIRES = 60; // seconds

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Minimal server-side warning
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
    const { userId, avatarUrl, filePath } = body;

    if (!userId || (!avatarUrl && !filePath)) {
      return NextResponse.json({ error: "Missing userId and/or filePath/avatarUrl" }, { status: 400 });
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

    // Update avatar_url in DB (store canonical value or path)
    const dbAvatarValue = avatarUrl ?? filePath;
    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update({ avatar_url: dbAvatarValue })
      .eq("id", userId);

    if (updateErr) throw updateErr;

    // If filePath provided, generate a short-lived signed URL for client display
    let signedUrl: string | null = null;
    if (filePath) {
      const [bucket, ...rest] = filePath.split("/");
      const objectPath = rest.join("/");
      if (!bucket || !objectPath) {
        return NextResponse.json({ error: "filePath must be '<bucket>/<path>'" }, { status: 400 });
      }

      const { data: signed, error: signedErr } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(objectPath, SIGNED_URL_EXPIRES);

      if (signedErr) {
        // eslint-disable-next-line no-console
        console.error("createSignedUrl error:", signedErr);
        throw signedErr;
      }
      signedUrl = signed.signedUrl;
    }

    return NextResponse.json({ ok: true, avatarUrl: dbAvatarValue, signedUrl }, { status: 200 });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("avatar-update error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
