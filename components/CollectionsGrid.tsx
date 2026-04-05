"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Collection = {
  id: string;
  name: string;
  image_url: string | null;
};

export default function CollectionsGrid({ userId }: { userId: string }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchCollections() {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Fetching collections for this specific user
        const { data, error } = await supabase
          .from("collections")
          .select("id, name, image_url")
          .eq("user_id", userId) 
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        setCollections(data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, [userId]);

  // Loading state with fixed CSS
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            style={{ 
              aspectRatio: '1/1', 
              backgroundColor: '#18181b',
              borderRadius: '4px'
            }} 
            className="animate-pulse" // Using the Tailwind class here instead of inline style
          />
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#52525b' }}>
        <p style={{ fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>
          EMPTY VAULT
        </p>
        <p style={{ fontSize: '13px', marginTop: '8px', opacity: 0.6 }}>This collector hasn't curated any collections yet.</p>
      </div>
    );
  }

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2px',
        width: '100%',
        backgroundColor: '#000'
      }}
    >
      {collections.map((collection) => (
        <div
          key={collection.id}
          onClick={() => router.push(`/collections/${collection.id}`)}
          style={{
            position: 'relative',
            aspectRatio: '1 / 1',
            backgroundColor: '#09090b',
            cursor: 'pointer',
            overflow: 'hidden'
          }}
        >
          <img
            src={collection.image_url || "/default-collection.png"}
            alt={collection.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          
          {/* Instagram-style name overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)',
            padding: '8px'
          }}>
            <span style={{ 
              color: 'white', 
              fontSize: '10px', 
              fontWeight: '900', 
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {collection.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
