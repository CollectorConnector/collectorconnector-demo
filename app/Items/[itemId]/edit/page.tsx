"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditItemPage() {
  const { itemId } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadItem() {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (!error && data) {
        setItem(data);
        setTitle(data.title);
        setDescription(data.description || "");
      }
    }

    loadItem();
  }, [itemId]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setSaving(true);

    let imageUrl = item.image_url;

    // If user selected a new image, upload it
    if (imageFile) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const ext = imageFile.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `users/${user.id}/items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("items")
        .upload(filePath, imageFile);

      if (uploadError) {
        alert("Image upload failed");
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("items")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    // Update item
    const { error: updateError } = await supabase
      .from("items")
      .update({
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl,
      })
      .eq("id", itemId);

    if (updateError) {
      alert("Failed to update item");
      setSaving(false);
      return;
    }

    router.push(`/items/${itemId}`);
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Edit Item</h1>

      <div className="max-w-xl mx-auto space-y-6">

        {/* Image Upload */}
        <div>
          <label className="block mb-2 text-lg">Item Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full"
          />

          <img
            src={imageFile ? URL.createObjectURL(imageFile) : item.image_url}
            alt="Preview"
            className="mt-4 w-full h-64 object-cover rounded-xl border border-zinc-700"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block mb-2 text-lg">Title</label>
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 text-lg">Description</label>
          <textarea
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 h-32"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xl font-medium transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
