// pages/api/avatar-update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

type Body = {
  userId?: string;
  avatarUrl?: string;
  filePath?: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Keep message minimal on server import
  // Ensure these are set in Vercel / .env.local
  // eslint-disable-next-line no-console
  console.error("Missing SUPABASE env vars for avatar-update route.");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: "Server misconfigured" });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const body = (req.body || {}) as Body;
    const { userId, avatarUrl } = body;

    if (!userId || !avatarUrl) {
      return res.status(400).json({ error: "Missing userId or avatarUrl" });
    }

    // Extract Bearer token from Authorization header
    const authHeader = (req.headers.authorization || "") as string;
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return res.status(401).json({ error: "Missing access token" });

    // Verify token with Supabase (ensures request is from the authenticated user)
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return res.status(401).json({ error: "Invalid access token" });
    }
    if (userData.user.id !== userId) {
      return res.status(403).json({ error: "Token does not match userId" });
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

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("avatar-update error:", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
