"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CollectionsGrid({ userId }: { userId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadItems() {
      const { data } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      setItems(data || []);
      setLoading(false);
    }
    loadItems();
  }, [userId]);

  if (loading) return <div className="text-center py-10 text-zinc-500 font-bold">LOADING ARCHIVE...</div>;

  return (
    <div className="grid grid-cols-2 gap-4 p-2">
      {items.map((item) => (
        <div 
          key={item.id} 
          onClick={() => router.push(`/items/${item.id}`)}
          className="bg-[#18181b] rounded-[24px] border border-[#27272a] overflow-hidden cursor-pointer hover:border-[#818cf8] transition-all"
        >
          {/* IMAGE SECTION */}
          <div className="aspect-square relative">
            <img 
              src={item.image_url || "/default-item.png"} 
              className="absolute inset-0 w-full h-full object-cover" 
              alt="" 
            />
          </div>

          {/* ACTION SECTION - No more "Untitled" or "£0" labels */}
          <div className="p-3">
            <div className="w-full bg-black/40 py-2 rounded-xl text-[10px] font-black text-center uppercase tracking-widest border border-[#27272a] text-zinc-400">
              VIEW ITEM ↗
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
