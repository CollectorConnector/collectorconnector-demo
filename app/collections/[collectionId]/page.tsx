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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!collectionId) return;

    async function loadData() {
      const { data: colData } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      setCollection(colData);

      const { data: itemData } = await supabase
        .from("items")
        .select("*")
        .eq("collection_id", collectionId)
        .order("created_at", { ascending: false });

      setItems(itemData || []);
      setLoading(false);
    }

    loadData();
  }, [collectionId]);

  const goToHome = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) router.push(`/profile/${user.id}`);
    else router.push("/auth/login");
  };

  const deleteCollection = async () => {
    if (!confirm("Delete this entire collection and all items?")) return;

    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collectionId);

    if (!error) router.push("/profile/" + currentUserId);
    else alert("Failed to delete collection");
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm("Delete this item?")) return;

    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", itemId);

    if (!error) {
      setItems(items.filter(item => item.id !== itemId));
    } else {
      alert("Failed to delete item");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  if (!collection) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Collection not found</div>;
  }

  const isOwnCollection = currentUserId === collection.user_id;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <button onClick={goToHome} className="text-indigo-400 hover:text-white">← Home</button>
        <h1 className="text-3xl font-bold">{collection.title}</h1>
        <div className="w-8" />
      </div>

      {collection.cover_url && (
        <div className="mb-8 rounded-2xl overflow-hidden border border-zinc-700">
          <img src={collection.cover_url} alt="Cover" className="w-full h-auto object-cover" />
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <p className="text-xl text-zinc-400">{items.length} items</p>
        
        {isOwnCollection && (
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/collections/${collectionId}/add-item`)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl"
            >
              + Add Item
            </button>
            <button
              onClick={deleteCollection}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 rounded-xl"
            >
              Delete Collection
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-center text-zinc-500 py-12">No items yet. Add some!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden group">
              <div className="aspect-square relative">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex justify-between items-center">
                <p className="font-medium truncate">{item.title}</p>
                {isOwnCollection && (
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
