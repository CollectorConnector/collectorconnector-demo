// app/profile/[id]/AvatarUpload.tsx
"use client";

import AvatarUploader from "@/components/AvatarUploader";
import { useParams } from "next/navigation";

export default function AvatarUpload() {
  const params = useParams();
  const userId = params?.id ?? null;

  if (!userId) return null;

  return <AvatarUploader userId={userId} editable={true} />;
}
