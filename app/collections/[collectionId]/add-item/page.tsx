"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddItemPage() {
  const router = useRouter();
  const params = useParams<{ collectionId: string }>();
  const collectionId = Array.isArray(params?.collectionId)
    ? params.collectionId[0]
    : params?.collectionId || "";

  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [collection, setCollection] = useState<any>(null);

  // ⭐ Load collection info
  useEffect(() => {
    if (!collectionId) return;

    async function loadCollection() {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (!error && data) setCollection(data);
    }

    loadCollection();
  }, [collectionId]);

  // ⭐ Resize image (same as avatar, but 512px)
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

  // ⭐ Handle image selection
  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  }

  // ⭐ Add item
  async function addItem() {
    if (!name.trim()) {
      alert("Please enter an item name.");
      return;
    }

    if (!imageFile) {
      alert("Please choose an image.");
      return;
    }

    setSaving(true);

    try {
      // Get user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not logged in");

      // ⭐ Resize image
      const resized = await resizeImage(imageFile, 512);

      // ⭐ Upload to storage
      const timestamp = Date.now();
      const ext = imageFile.name.split(".").pop() || "jpg";
      const fileName = `item-${timestamp}.${ext}`;
      const filePath = `${user.id}/collections/${collectionId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(filePath, resized, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("item-images")
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      // ⭐ Insert item row
      const { error: insertError } = await supabase.from("items").insert({
        user_id: user.id,
        collection_id: collectionId,
        name: name.trim(),
        image_url: imageUrl,
      });

      if (insertError) throw insertError;

      // ⭐ Update collection item count
      await supabase.rpc("increment_item_count", {
        collection_id_input: collectionId,
      });

      // Redirect back to profile
      router.push(`/profile/${user.id}`);
    } catch (err: any) {
      console.error("Add item failed:", err);
      alert("Failed to add item: " + (err.message || "Check console"));
    } finally {
      setSaving(false);
    }
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 max-w-xl mx-auto space-y-10">

      <h1 className="text-4xl font-bold text-center mb-6">
        Add Item to {collection.title}
      </h1>

      {/* IMAGE PREVIEW */}
      <div className="flex flex-col items-center">
        <label htmlFor="item-upload" className="cursor-pointer group">
          <div className="w-40 h-40 rounded-2xl overflow-hidden border border-zinc-700 shadow-xl bg-zinc-900">
            <img
              src={previewImage || "/default-item.png"}
              alt="Item Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center mt-3 text-blue-400 group-hover:underline">
            Choose Item Image
          </div>
        </label>

        <input
          id="item-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* ITEM NAME */}
      <div>
        <label className="block text-lg mb-2">Item Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700"
        />
      </div>

      {/* ADD BUTTON */}
      <button
        onClick={addItem}
        disabled={saving}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-medium transition disabled:opacity-50"
      >
        {saving ? "Adding..." : "Add Item"}
      </button>
    </div>
  );
}
