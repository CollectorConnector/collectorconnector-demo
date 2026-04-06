"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CollectionDetails() {
  const params = useParams();
  const collectionId = params?.id as string;
  const router = useRouter();

  const [collection, setCollection] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (collectionId) loadCollectionData();
  }, [collectionId]);

  async function loadCollectionData() {
    try {
      setLoading(true);
      const { data: coll } = await supabase.from("collections").select("*").eq("id", collectionId).single();
      if (coll) setCollection(coll);

      const { data: itemList } = await supabase.from("items").select("*").eq("collection", collectionId);
      setItems(itemList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold">LOADING VAULT...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="max-w-4xl mx-auto pt-28 px-6 pb-20">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <button 
            onClick={() => router.back()}
            className="mb-4 text-zinc-500 text-xs font-bold hover:text-white transition-colors"
          >
            ← BACK TO COLLECTIONS
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-1">
            {collection?.title}
          </h1>
          <div className="bg-zinc-900 px-4 py-1 rounded-full border border-zinc-800">
            <p className="text-indigo-400 font-black text-xs uppercase tracking-widest">
              {items.length} ITEMS — £{items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0)}
            </p>
          </div>
        </div>

        {/* The Grid: Squircles */}
        {items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-3xl">
            <p className="text-zinc-600 font-bold uppercase text-sm">Vault is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedImage(item.image_url)}
                className="relative aspect-square cursor-pointer group"
              >
                <div className="w-full h-full overflow-hidden rounded-[24%] border border-zinc-800 bg-zinc-900 transition-all duration-300 group-hover:scale-95 group-hover:border-indigo-500">
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Optional Mini-Label on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                   <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold border border-white/10">
                     VIEW
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ZOOM PREVIEW MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <img 
              src={selectedImage} 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
            <button 
              className="absolute top-0 right-0 m-4 bg-zinc-800 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold hover:bg-white hover:text-black transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
