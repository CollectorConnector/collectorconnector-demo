// lib/uploadAvatar.ts
import { supabase } from "./supabase";

type UploadResult = {
  displayUrl: string | null;
  rawResponse: any;
};

export async function uploadAvatarAndUpdateProfile(
  file: File,
  userId: string,
  options?: { bucket?: string }
): Promise<UploadResult> {
  const bucket = options?.bucket ?? "avatars";
  const filename = `${userId}/${Date.now()}-${file.name}`;
  const filePath = `${bucket}/${filename}`;

  // 1) Upload to Supabase Storage
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { cacheControl: "3600", upsert: false });

  if (uploadErr) {
    throw new Error(`Storage upload failed: ${uploadErr.message}`);
  }

  // 2) Get current access token
  const sessionResp = await supabase.auth.getSession();
  const token = sessionResp?.data?.session?.access_token;
  if (!token) {
    throw new Error("No access token; user not signed in");
  }

  // 3) Call server endpoint to update profile and request signed URL
  const resp = await fetch("/api/avatar-update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
      filePath, // server expects "<bucket>/<path>"
    }),
  });

  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = json?.error || `avatar-update failed (status ${resp.status})`;
    throw new Error(msg);
  }

  // 4) Prefer signedUrl (short-lived) for immediate display, fallback to avatarUrl
  const displayUrl = json.signedUrl ?? json.avatarUrl ?? null;
  return { displayUrl, rawResponse: json };
}
