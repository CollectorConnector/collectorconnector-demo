"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddItemPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.collectionId as string;

  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [collection, setCollection] = useState<any>(null);
  const [loadingCollection, setLoadingCollection] = useState(true);

  // Load collection info
  useEffect(() => {
    if (!collectionId) {
      setLoadingCollection(false);
      return;
    }

    async function loadCollection() {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (error) {
        console.error("Failed to load collection:", error);
      } else {
        setCollection(data);
      }
      setLoadingCollection(false);
    }

    loadCollection();
  }, [collectionId]);

  // Resize image before upload
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

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  }

  async function addItem() {
    if (!title.trim()) {
      alert("Please enter an item name.");
      return;
    }
    if (!imageFile) {
      alert("Please choose an image.");
      return;
    }
    if (!collectionId) {
      alert("Invalid collection — please try again.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You must be logged in to add items.");

      // Resize image
      const resized = await resizeImage(imageFile, 512);

      // Upload image
      const timestamp = Date.now();
      const ext = imageFile.name.split(".").pop() || "jpg";
      const fileName = `item-${timestamp}.${ext}`;
      const filePath = `${user.id}/collections/${collectionId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(filePath, resized, { upsert: true });

      if (uploadError) throw new Error("Image upload failed: " + uploadError.message);

      const { data: urlData } = supabase.storage
        .from("item-images")
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      // Insert item into database
      const { error: insertError } = await supabase.from("items").insert({
        user_id: user.id,
        collection_id: collectionId,
        title: title.trim(),
        image_url: imageUrl,
      });

      if (insertError) throw new Error("Failed to save item: " + insertError.message);

      alert("Item added successfully!");
      router.push(`/collections/${collectionId}`);   // ← Better UX: back to collection
    } catch (err: any) {
      console.error("Add item failed:", err);
      alert(err.message || "Failed to add item. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingCollection) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading collection...
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
        <p className="text-xl text-red-400">Collection not found</p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-6 py-3 bg-zinc-800 rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 max-w-md mx-auto space-y-10">
      <h1 className="text-4xl font-bold text-center">
        Add Item to {collection.title}
      </h1>

      <label htmlFor="item-upload" className="cursor-pointer w-full flex flex-col items-center">
        <div className="w-full flex justify-center">
          <img
            src={previewImage || "/CC-main-logo.png"}
            alt="Upload preview"
            className="object-contain opacity-90 hover:opacity-100 transition"
            style={{ width: "360px", height: "auto" }}
          />
        </div>
        <div className="text-center mt-3 text-blue-400 hover:underline">
          Tap to choose item image
        </div>
      </label>

      <input
        id="item-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />

      <div>
        <label className="block text-lg mb-2">Item Name</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white"
          placeholder="e.g. Charizard VMAX"
        />
      </div>

      <button
        onClick={addItem}
        disabled={saving || !imageFile || !title.trim()}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 rounded-full text-xl font-medium transition"
      >
        {saving ? "Adding Item..." : "Add Item"}
      </button>
    </div>
  );
}
