"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddItemPage() {
  const { collectionId } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!imageFile) {
      alert("Please select an image");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    setSaving(true);

    // 1. Get user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in");
      setSaving(false);
      return;
    }

    // 2. Upload image
    const ext = imageFile.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `users/${user.id}/items/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("items")
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error(uploadError);
      alert("Image upload failed");
      setSaving(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("items")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // 3. Insert item
    const { error: insertError } = await supabase.from("items").insert({
      user_id: user.id,
      collection_id: collectionId,
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl,
    });

    if (insertError) {
      console.error(insertError);
      alert("Failed to save item");
      setSaving(false);
      return;
    }

    // 4. Redirect back to the collection
    router.push(`/collections/${collectionId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Add Item</h1>

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

          {imageFile && (
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className="mt-4 w-full h-64 object-cover rounded-xl border border-zinc-700"
            />
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block mb-2 text-lg">Title</label>
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Charizard Holo"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 text-lg">Description</label>
          <textarea
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 h-32"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xl font-medium transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Item"}
        </button>
      </div>
    </div>
  );
}
