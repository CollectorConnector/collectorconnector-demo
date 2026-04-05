"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Collection = {
  id: string;
  title: string;
  cover_url: string | null;
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
        
        // Updated to match your Supabase columns: title, cover_url, user_id
        const { data, error } = await supabase
          .from("collections")
          .select("id, title, cover_url")
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
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px' // Matches the expanded gap
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            style={{ 
              aspectRatio: '1/1', 
              backgroundColor: '#18181b',
              borderRadius: '24px' // SQUIRCLE SHAPE (Loading)
            }} 
            className="animate-pulse" 
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
        gap: '16px', // EXPANDED GAP for professional look
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
            overflow: 'hidden',
            // BRINGING IN THE BRAND IDENTITY (SQUIRCLE SHAPE)
            borderRadius: '24px' 
          }}
        >
          <img
            src={collection.cover_url || "/default-collection.png"}
            alt={collection.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            // Clean gradient for text readability
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%)',
            padding: '16px 12px' // Spaced out for the new shape
          }}>
            <span style={{ 
              color: 'white', 
              fontSize: '11px', 
              fontWeight: '900', 
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              // Subtle drop shadow for premium depth
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              {collection.title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
