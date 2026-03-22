"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CreateCollectionPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Please enter a collection name");
      return;
    }

    setSaving(true);

    // 1. Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in");
      setSaving(false);
      return;
    }

    let coverUrl = null;

    // 2. Upload cover image if provided
    if (coverFile) {
      const ext = coverFile.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `users/${user.id}/collections/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("collections")
        .upload(filePath, coverFile);

      if (uploadError) {
        console.error(uploadError);
        alert("Cover upload failed");
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("collections")
        .getPublicUrl(filePath);

      coverUrl = publicUrlData.publicUrl;
    }

    // 3. Insert into DB
    const { error: insertError } = await supabase.from("collections").insert({
      user_id: user.id,
      title: title.trim(),
      cover_url: coverUrl,
      item_count: 0,
    });

    if (insertError) {
      console.error(insertError);
      alert("Failed to create collection");
      setSaving(false);
      return;
    }

    // 4. Redirect back to profile
    router.push(`/profile/${user.id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Create Collection</h1>

      <div className="max-w-xl mx-auto space-y-6">

        <div>
          <label className="block mb-2 text-lg">Collection Name</label>
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Pokémon Cards"
          />
        </div>

        <div>
          <label className="block mb-2 text-lg">Cover Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="w-full"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={saving}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xl font-medium transition disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Collection"}
        </button>
      </div>
    </div>
  );
}

