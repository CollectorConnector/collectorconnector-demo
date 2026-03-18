// app/api/avatar-update/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing required Supabase environment variables");
}

// Admin client (service role) used for DB updates and signed URLs
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Lightweight client (anon) used only to verify the incoming access token
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export async function POST(request: Request) {
  try {
    // 1) Parse body
    const body = await request.json().catch(() => ({}));
    const { userId, filePath } = body ?? {};

    if (!userId || !filePath) {
      return NextResponse.json({ error: "Missing userId or filePath" }, { status: 400 });
    }

    // 2) Extract bearer token from Authorization header
    const authHeader = request.headers.get("authorization") || "";
    const tokenMatch = authHeader.match(/^Bearer (.+)$/);
    const accessToken = tokenMatch ? tokenMatch[1] : null;
    if (!accessToken) {
      return NextResponse.json({ error: "Missing Authorization bearer token" }, { status: 401 });
    }

    // 3) Verify token and get user
    const {
      data: { user },
      error: userErr,
    } = await supabaseAnon.auth.getUser(accessToken);

    if (userErr || !user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // 4) Ensure the token owner matches the requested userId
    if (user.id !== userId) {
      return NextResponse.json({ error: "Token user does not match userId" }, { status: 403 });
    }

    // 5) Parse bucket and path from filePath
    // Expect filePath like "bucket/path/to/file.jpg" or "bucket/userid/filename.jpg"
    const parts = filePath.split("/");
    if (parts.length < 2) {
      return NextResponse.json({ error: "Invalid filePath format" }, { status: 400 });
    }
    const bucket = parts[0];
    const objectPath = parts.slice(1).join("/");

    // 6) If bucket is public, you may want to use getPublicUrl; otherwise create signed URL
    // Try to create a signed URL (works for both public and private; public URL still accessible)
    const expiresInSeconds = 60; // short-lived preview URL
    const { data: signedData, error: signedErr } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(objectPath, expiresInSeconds);

    if (signedErr) {
      // If signed URL creation fails, still attempt to get public URL as fallback
      const { data: pubData } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath);
      const avatarUrl = pubData?.publicUrl ?? null;

      // Update profiles.avatar_url with the public URL (or the raw path if you prefer)
      const { error: updateErr } = await supabaseAdmin
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", userId);

      if (updateErr) {
        return NextResponse.json({ error: "Failed to update profile: " + updateErr.message }, { status: 500 });
      }

      return NextResponse.json({ signedUrl: null, avatarUrl }, { status: 200 });
    }

    const signedUrl = signedData?.signedUrl ?? null;

    // 7) Persist the avatar_url in profiles table (store the signed URL or a canonical public URL/path)
    // It's common to store the storage path (e.g., "avatars/userid/filename.jpg") or a public URL.
    // Here we store the public URL if available; otherwise store the storage path.
    const { data: pubData } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath);
    const publicUrl = pubData?.publicUrl ?? null;
    const avatarValueToStore = publicUrl ?? filePath;

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ avatar_url: avatarValueToStore })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update profile: " + updateError.message }, { status: 500 });
    }

    // 8) Return signed URL for immediate preview and the stored avatarUrl
    return NextResponse.json({ signedUrl, avatarUrl: avatarValueToStore }, { status: 200 });
  } catch (err: any) {
    console.error("avatar-update error:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
