"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DeleteItemPage() {
  const { itemId } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadItem() {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (!error && data) {
        setItem(data);
      }

      setLoading(false);
    }

    loadItem();
  }, [itemId]);

  const handleDelete = async () => {
    if (!item) return;

    setDeleting(true);

    // Delete the item
    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", itemId);

    if (error) {
      alert("Failed to delete item");
      setDeleting(false);
      return;
    }

    // Redirect back to the collection
    router.push(`/collections/${item.collection_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        Item not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="max-w-xl mx-auto space-y-8 text-center">

        <h1 className="text-4xl font-bold text-red-500">Delete Item</h1>

        <p className="text-zinc-400 text-lg">
          This action cannot be undone.
        </p>

        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-64 object-cover rounded-xl border border-zinc-800 shadow-xl"
        />

        <h2 className="text-2xl font-semibold">{item.title}</h2>

        {item.description && (
          <p className="text-zinc-400">{item.description}</p>
        )}

        <div className="space-y-4 pt-6">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-xl text-xl font-medium transition disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Item"}
          </button>

          <button
            onClick={() => router.push(`/items/${itemId}`)}
            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xl font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
