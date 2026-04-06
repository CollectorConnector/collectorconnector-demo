"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CollectionsGrid({ userId }: { userId: string }) {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadCollections() {
      // Query collections and include the image of the first item as the cover
      const { data } = await supabase
        .from("collections")
        .select(`*, items (image_url)`)
        .eq("user_id", userId);
      
      setCollections(data || []);
      setLoading(false);
    }
    loadCollections();
  }, [userId]);

  if (loading) return <div className="text-center py-10 font-bold text-[#52525b]">SYNCING VAULTS...</div>;

  return (
    <div className="grid grid-cols-2 gap-4 p-2">
      {collections.map((col) => (
        <div 
          key={col.id} 
          onClick={() => router.push(`/collections/${col.id}`)} 
          className="bg-[#18181b] rounded-[32px] border border-[#27272a] overflow-hidden cursor-pointer relative aspect-square flex flex-col items-center justify-center group"
        >
          {col.items?.[0] && (
            <img 
              src={col.items[0].image_url} 
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" 
            />
          )}
          <div className="relative z-10 text-center px-4">
            <p className="text-[14px] font-black uppercase tracking-tighter leading-none mb-1 text-white">
              {col.name || "Untitled Vault"}
            </p>
            <p className="text-[9px] text-[#818cf8] font-black uppercase tracking-widest bg-black/60 px-2 py-1 rounded-full border border-[#27272a] inline-block">
              {col.niche || "COLLECTOR"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
