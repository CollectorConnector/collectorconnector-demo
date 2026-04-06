"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CollectionsGrid({ userId }: { userId: string }) {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("collections").select(`*, items (image_url)`).eq("user_id", userId);
      setCollections(data || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) return <div className="text-center py-20 font-black text-[#27272a]">SYNCING VAULTS...</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      {collections.map((col) => (
        <div 
          key={col.id} 
          onClick={() => router.push(`/collections/${col.id}`)} 
          style={{ 
            background: '#18181b', 
            aspectRatio: '1/1', 
            borderRadius: '32px', // THE SQUIRCLE
            border: '1px solid #27272a', 
            position: 'relative', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          {col.items?.[0] && (
            <img src={col.items[0].image_url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
          )}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 10px' }}>
            <p style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{col.name}</p>
            <p style={{ 
              fontSize: '8px', 
              color: '#818cf8', 
              fontWeight: '900', 
              textTransform: 'uppercase', 
              background: 'rgba(0,0,0,0.8)', 
              padding: '2px 8px', 
              borderRadius: '10px', 
              marginTop: '4px',
              border: '1px solid #27272a',
              display: 'inline-block'
            }}>
              {col.niche || "COLLECTOR"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
