// app/profile/[id]/AvatarUpload.tsx
"use client";

import AvatarUploader from "@/components/AvatarUploader";
import { useParams } from "next/navigation";

export default function AvatarUpload() {
  const params = useParams();
  const rawId = params?.id;
  const userId = Array.isArray(rawId) ? rawId[0] : typeof rawId === "string" ? rawId : undefined;

  if (!userId) return null;

  return <AvatarUploader userId={userId} editable={false} />;
}
