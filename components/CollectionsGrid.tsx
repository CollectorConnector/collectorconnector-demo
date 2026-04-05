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
        
        // Change "user_id" below to "owner_id" or "profile_id" if your Supabase 
        // table uses a different name for the user connection.
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

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ aspectRatio: '1/1', background: '#18181b', animate: 'pulse 2s infinite' }} />
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#52525b' }}>
        <p style={{ fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          No Collections Found
        </p>
        <p style={{ fontSize: '12px', marginTop: '8px' }}>This user hasn't created any collections yet.</p>
      </div>
    );
  }

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', // Strict 3-across
        gap: '2px', // Thin Instagram-style lines
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
            backgroundColor: '#18181b',
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
          
          {/* Subtle label overlay for the name */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            padding: '8px 4px',
            textAlign: 'center'
          }}>
            <span style={{ 
              color: 'white', 
              fontSize: '10px', 
              fontWeight: '900', 
              textTransform: 'uppercase' 
            }}>
              {collection.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
