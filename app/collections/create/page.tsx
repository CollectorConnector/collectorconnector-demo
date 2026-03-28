"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CreateCollectionPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resizeImage = (file: File, maxSize: number = 1200): Promise<File> => {
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

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          } else {
            resolve(file);
          }
        }, "image/jpeg", 0.85);
      };
    });
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMsg(null);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setErrorMsg("Please enter a collection name");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMsg("You must be logged in");
        return;
      }

      let coverUrl = null;

      if (coverFile) {
        const resizedFile = await resizeImage(coverFile, 1200);

        const fileName = `${crypto.randomUUID()}.jpg`;
        const filePath = `item-photos/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("item-photos")
          .upload(filePath, resizedFile, {
            contentType: "image/jpeg",
            upsert: true,
            cacheControl: "31536000",
          });

        if (uploadError) throw new Error(`Cover upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
          .from("item-photos")
          .getPublicUrl(filePath);

        coverUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("collections").insert({
        user_id: user.id,
        title: title.trim(),
        cover_url: coverUrl,
        item_count: 0,
      });

      if (insertError) throw new Error(`Failed to create collection: ${insertError.message}`);

      alert("Collection created successfully!");
      router.push(`/profile/${user.id}`);
    } catch (err: any) {
      console.error("Create failed:", err);
      setErrorMsg(err.message || "Failed to create collection. Try a smaller image.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Create New Collection</h1>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 space-y-8">

          <div>
            <label className="block text-lg mb-3">Collection Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pokémon Cards"
              className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl text-lg"
            />
          </div>

          <div>
            <label className="block text-lg mb-3">Cover Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="w-full"
            />

            {previewUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-zinc-700">
                <img
                  src={previewUrl}
                  alt="Cover preview"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-900/30 border border-red-700 rounded-2xl text-red-400">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={saving || !title.trim()}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 rounded-2xl text-xl font-medium transition"
          >
            {saving ? "Creating Collection..." : "Create Collection"}
          </button>
        </div>
      </div>
    </div>
  );
}
