"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

const { collectionId } = useParams();

export default function AddTenPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);

  // ⭐ REPLACE your old uploadImage with this one
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
      .from("items") // <-- make sure this matches your bucket name
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    // 4. Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("items")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // 5. Insert into the database
    const { error: insertError } = await supabase.from("items").insert({
      user_id: user.id,
      title: "Untitled Item", // replace later with real inputs
      description: "",
      image_url: imageUrl,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return null;
    }

    return imageUrl;
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
