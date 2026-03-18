// lib/uploadAvatar.ts
import { supabase } from "./supabase";

type UploadResult = {
  displayUrl: string | null;
  avatarUrl?: string | null;
  raw?: any;
};

export async function uploadAvatarAndUpdateProfile(
  file: File,
  userId: string,
  options?: { bucket?: string; folder?: string; expiresInSeconds?: number }
): Promise<UploadResult> {
  const bucket = options?.bucket ?? "avatars";
  const folder = options?.folder ?? userId;
  const expiresInSeconds = options?.expiresInSeconds ?? 60;

  // sanitize filename and build storage path
  const safeName = file.name.replace(/\s+/g, "-");
  const filename = `${Date.now()}-${safeName}`;
  const objectPath = `${folder}/${filename}`; // path inside bucket

  // 1) Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // 2) Get current access token for server verification
  const sessionResp = await supabase.auth.getSession();
  const token = sessionResp?.data?.session?.access_token;
  if (!token) {
    throw new Error("No access token; user not signed in");
  }

  // 3) Notify server to update DB and request a signed URL
  //    server expects { userId, filePath } where filePath = "<bucket>/<objectPath>"
  const filePath = `${bucket}/${objectPath}`;

  const resp = await fetch("/api/avatar-update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, filePath, expiresInSeconds }),
  });

  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = json?.error || `avatar-update failed (status ${resp.status})`;
    throw new Error(msg);
  }

  // 4) Prefer signedUrl for immediate preview, fallback to avatarUrl or public URL
  const displayUrl = json.signedUrl ?? json.avatarUrl ?? null;
  return { displayUrl, avatarUrl: json.avatarUrl ?? null, raw: json };
}
