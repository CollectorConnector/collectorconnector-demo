"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function AddTenPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const uploadImage = async () => {
    if (!imageFile) return null;

    // 1. Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User not found:", userError);
      return null;
    }

    // 2. Build a clean file path
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `users/${user.id}/items/${fileName}`;

    // 3. Upload to the correct bucket
    const { error: uploadError } = await supabase.storage
      .from("item-photos")
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    // 4. Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("item-photos")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  return (
    <div>
      <h1>Add Ten</h1>
      <input
        type="file"
        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
      />
      <button onClick={uploadImage}>Upload</button>
    </div>
  );
}
