"use client";

import { useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddItemPage() {
  const { collectionId } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Client-side resize - same reliable function that fixed the avatar
  const resizeImage = (file: File, maxSize: number = 800): Promise<File> => {
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

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMsg(null);
  };

  const handleSave = async () => {
    if (!imageFile) {
      setErrorMsg("Please select an image");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Please enter a title");
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

      // Resize first (this is the key fix)
      const resizedFile = await resizeImage(imageFile, 800);

      // Upload
      const fileName = `${crypto.randomUUID()}.jpg`;
      const filePath = `items/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("items")
        .upload(filePath, resizedFile, {
          contentType: "image/jpeg",
          upsert: true,
          cacheControl: "31536000",
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from("items")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) throw new Error("Failed to get public URL");

      // Save to database
      const { error: insertError } = await supabase.from("items").insert({
        user_id: user.id,
        collection_id: collectionId,
        title: title.trim(),
        description: description.trim() || null,
        image_url: urlData.publicUrl,
      });

      if (insertError) throw new Error(`Database error: ${insertError.message}`);

      alert("Item added successfully!");
      router.push(`/collections/${collectionId}`);
    } catch (err: any) {
      console.error("Save failed:", err);
      setErrorMsg(err.message || "Failed to save item. Try a smaller image.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Add New Item</h1>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 space-y-8">

          {/* Image Upload */}
          <div>
            <label className="block text-lg mb-3">Item Photo (required)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />

            {previewUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-zinc-700">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-lg mb-3">Title (required)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 1st Edition Charizard"
              className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl text-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-lg mb-3">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any extra details..."
              className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl h-32 resize-y"
            />
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-900/30 border border-red-700 rounded-2xl text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !imageFile || !title.trim()}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 rounded-2xl text-xl font-medium transition"
          >
            {saving ? "Adding Item..." : "Add Item to Collection"}
          </button>
        </div>
      </div>
    </div>
  );
}
