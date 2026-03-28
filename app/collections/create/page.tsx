"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CreateCollectionPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [niche, setNiche] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ⭐ Resize image exactly like avatar, but max 512px
  async function resizeImage(file: File, maxSize: number): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              resolve(file);
            }
          },
          file.type,
          0.85
        );
      };
    });
  }

  // ⭐ Handle cover image selection
  function handleCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverFile(file);
    setPreviewImage(URL.createObjectURL(file));
  }

  // ⭐ Create collection
  async function createCollection() {
    if (!title.trim()) {
      alert("Please enter a collection title.");
      return;
    }

    setSaving(true);

    try {
      // Get user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not logged in");

      let coverUrl: string | null = null;

      // ⭐ Upload cover if provided
      if (coverFile) {
        const resized = await resizeImage(coverFile, 512);

        const timestamp = Date.now();
        const ext = coverFile.name.split(".").pop() || "jpg";
        const fileName = `cover-${timestamp}.${ext}`;
        const filePath = `${user.id}/collections/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("collection-covers")
          .upload(filePath, resized, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("collection-covers")
          .getPublicUrl(filePath);

        coverUrl = urlData.publicUrl;
      }

      // ⭐ Insert collection row
      const { data, error: insertError } = await supabase
        .from("collections")
        .insert({
          user_id: user.id,
          title: title.trim(),
          niche: niche.trim() || null,
          cover_url: coverUrl,
          item_count: 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Redirect to add-item page
      router.push(`/collections/${data.id}/add-item`);
    } catch (err: any) {
      console.error("Create collection failed:", err);
      alert("Failed to create collection: " + (err.message || "Check console"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 max-w-xl mx-auto space-y-10">

      <h1 className="text-4xl font-bold text-center mb-6">Create Collection</h1>

      {/* COVER PREVIEW */}
      <div className="flex flex-col items-center">
        <label htmlFor="cover-upload" className="cursor-pointer group">
          <div className="w-40 h-40 rounded-2xl overflow-hidden border border-zinc-700 shadow-xl bg-zinc-900">
            <img
              src={previewImage || "/default-cover.png"}
              alt="Cover Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center mt-3 text-blue-400 group-hover:underline">
            Choose Cover Image
          </div>
        </label>

        <input
          id="cover-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />
      </div>

      {/* TITLE */}
      <div>
        <label className="block text-lg mb-2">Collection Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700"
        />
      </div>

      {/* NICHE */}
      <div>
        <label className="block text-lg mb-2">Niche (optional)</label>
        <input
          type="text"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700"
        />
      </div>

      {/* CREATE BUTTON */}
      <button
        onClick={createCollection}
        disabled={saving}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-medium transition disabled:opacity-50"
      >
        {saving ? "Creating..." : "Create Collection"}
      </button>
    </div>
  );
}
