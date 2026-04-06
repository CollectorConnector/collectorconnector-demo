"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CollectionDetails() {
  const params = useParams();
  const collectionId = params?.id as string;

  const [collection, setCollection] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (collectionId) {
      loadCollectionData();
    }
  }, [collectionId]);

  async function loadCollectionData() {
    try {
      setLoading(true);

      // 1. Fetch Collection Info (Using 'title' instead of 'name')
      const { data: coll, error: collError } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (collError) throw collError;
      setCollection(coll);

      // 2. Fetch Items tied to this Collection
      // We check the 'collection' column in the 'items' table
      const { data: itemList, error: itemError } = await supabase
        .from("items")
        .select("*")
        .eq("collection", collectionId);

      if (itemError) throw itemError;
      setItems(itemList || []);

    } catch (err: any) {
      console.error("Error loading collection:", err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="max-w-4xl mx-auto pt-24 px-4 pb-20">
        <div className="text-center mb-12">
          {/* Using collection.title here */}
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
            {collection?.title || "Unnamed Collection"}
          </h1>
          <p className="text-indigo-400 font-bold uppercase text-sm">
            {items.length} ITEMS | £{items.reduce((sum, item) => sum + (Number(item.estimated_value) || 0), 0)}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-500 font-bold">THIS COLLECTION IS CURRENTLY EMPTY</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
                <div className="aspect-square">
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4 border-t border-zinc-800">
                  <h3 className="font-bold text-sm truncate uppercase">{item.title}</h3>
                  <p className="text-green-400 text-xs font-black">£{item.estimated_value || 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
