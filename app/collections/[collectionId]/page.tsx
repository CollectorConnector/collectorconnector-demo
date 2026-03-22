"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CollectionViewPage() {
  const { collectionId } = useParams();
  const router = useRouter();

  const [collection, setCollection] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collectionId) return;

    async function loadData() {
      // 1. Load collection
      const { data: colData, error: colError } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (colError) {
        console.error(colError);
        setLoading(false);
        return;
      }

      setCollection(colData);

      // 2. Load items inside this collection
      const { data: itemData, error: itemError } = await supabase
        .from("items")
        .select("*")
        .eq("collection_id", collectionId);

      if (itemError) {
        console.error(itemError);
      } else {
        setItems(itemData || []);
      }

      setLoading(false);
    }

    loadData();
  }, [collectionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        Loading collection...
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xl">
        Collection not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* HEADER */}
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Cover Image */}
        {collection.cover_url && (
          <img
            src={collection.cover_url}
            alt="Cover"
            className="w-full h-64 object-cover rounded-2xl border border-zinc-800 shadow-xl"
          />
        )}

        {/* Title + Add Item */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">{collection.title}</h1>

          <button
            onClick={() => router.push(`/collections/${collectionId}/add-item`)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-medium transition"
          >
            + Add Item
          </button>
        </div>

        {/* Item Count */}
        <p className="text-zinc-400">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </p>

        {/* ITEMS GRID */}
        {items.length === 0 ? (
          <p className="text-zinc-500 text-lg mt-10">No items yet</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 hover:bg-zinc-800 transition cursor-pointer"
                onClick={() => router.push(`/items/${item.id}`)}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <p className="text-lg font-medium">{item.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
