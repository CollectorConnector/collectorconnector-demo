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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionId) {
      setError("No collection ID provided");
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);

        // Load collection
        const { data: colData, error: colError } = await supabase
          .from("collections")
          .select("*")
          .eq("id", collectionId)
          .single();

        if (colError) throw colError;
        if (!colData) throw new Error("Collection not found");

        setCollection(colData);

        // Load items in this collection
        const { data: itemData, error: itemError } = await supabase
          .from("items")
          .select("*")
          .eq("collection_id", collectionId)
          .order("created_at", { ascending: false });

        if (itemError) {
          console.error("Items load error:", itemError);
        } else {
          setItems(itemData || []);
        }
      } catch (err: any) {
        console.error("Collection load error:", err);
        setError(err.message || "Failed to load collection");
      } finally {
        setLoading(false);
      }
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

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-xl">
        <h1 className="text-3xl mb-4">Error</h1>
        <p className="text-white/70 mb-6">{error || "Collection not found"}</p>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Cover Image */}
        {collection.cover_url ? (
          <img
            src={collection.cover_url}
            alt={collection.title}
            className="w-full h-80 object-cover rounded-3xl border border-zinc-800 shadow-2xl"
          />
        ) : (
          <div className="w-full h-80 bg-zinc-900 rounded-3xl border border-zinc-800 flex items-center justify-center">
            <p className="text-zinc-500 text-xl">No cover image yet</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2">{collection.title}</h1>
            <p className="text-zinc-400 text-xl">{collection.nichem || "Collection"}</p>
          </div>

          <button
            onClick={() => router.push(`/collections/${collectionId}/add-item`)}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-lg font-medium transition flex items-center gap-2"
          >
            + Add Item
          </button>
        </div>

        {/* Stats */}
        <p className="text-zinc-400 text-lg">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </p>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center">
            <p className="text-2xl text-zinc-400 mb-4">This collection is empty</p>
            <p className="text-zinc-500 mb-8">Add your first item to get started</p>
            <button
              onClick={() => router.push(`/collections/${collectionId}/add-item`)}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-lg font-medium"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/items/${item.id}`)}
                className="bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden hover:border-zinc-500 transition cursor-pointer group"
              >
                <div className="relative aspect-square">
                  <img
                    src={item.image_url}
                    alt={item.title || "Item"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <p className="font-medium line-clamp-2">{item.title || "Untitled Item"}</p>
                  {item.caption && (
                    <p className="text-sm text-zinc-400 line-clamp-2 mt-1">{item.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
