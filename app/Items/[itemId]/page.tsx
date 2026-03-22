"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ItemDetailPage() {
  const { itemId } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<any>(null);
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) return;

    async function loadItem() {
      // 1. Load item
      const { data: itemData, error: itemError } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (itemError) {
        console.error(itemError);
        setLoading(false);
        return;
      }

      setItem(itemData);

      // 2. Load the collection it belongs to
      const { data: colData, error: colError } = await supabase
        .from("collections")
        .select("*")
        .eq("id", itemData.collection_id)
        .single();

      if (!colError) {
        setCollection(colData);
      }

      setLoading(false);
    }

    loadItem();
  }, [itemId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        Loading item...
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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* IMAGE */}
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-96 object-cover rounded-2xl border border-zinc-800 shadow-xl"
        />

        {/* TITLE */}
        <h1 className="text-4xl font-bold">{item.title}</h1>

        {/* COLLECTION LINK */}
        {collection && (
          <p
            className="text-blue-400 underline cursor-pointer"
            onClick={() => router.push(`/collections/${collection.id}`)}
          >
            View collection: {collection.title}
          </p>
        )}

        {/* DESCRIPTION */}
        {item.description ? (
          <p className="text-lg text-zinc-300 leading-relaxed">
            {item.description}
          </p>
        ) : (
          <p className="text-zinc-500">No description provided</p>
        )}

        {/* BUTTONS */}
        <div className="flex gap-4 pt-6">
          <button
            onClick={() => router.push(`/items/${itemId}/edit`)}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-lg font-medium transition"
          >
            Edit
          </button>

          <button
            onClick={() => router.push(`/items/${itemId}/delete`)}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-lg font-medium transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
