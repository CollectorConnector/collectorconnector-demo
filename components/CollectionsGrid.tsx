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
      try {
        setLoading(true);
        // Fetching collections belonging to the specific profile user
        const { data, error } = await supabase
          .from("collections")
          .select("id, name, image_url")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCollections(data || []);
      } catch (err) {
        console.error("Error fetching collections:", err);
      } finally {
        setLoading(false);
      }
    }

    if (userId) fetchCollections();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-zinc-900 animate-pulse rounded-sm" />
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-500 font-medium">No collections shared yet.</p>
      </div>
    );
  }

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', // The "Instagram" 3-across
        gap: '4px', // Tight spacing like IG
        width: '100%'
      }}
    >
      {collections.map((collection) => (
        <div
          key={collection.id}
          onClick={() => router.push(`/collections/${collection.id}`)}
          style={{
            position: 'relative',
            aspectRatio: '1 / 1', // Forces perfect squares
            backgroundColor: '#18181b',
            cursor: 'pointer',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
          className="group"
        >
          {/* Collection Image */}
          <img
            src={collection.image_url || "/default-collection.png"}
            alt={collection.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover', // Ensures image fills the square without stretching
              transition: 'transform 0.3s ease'
            }}
            className="group-hover:scale-110"
          />

          {/* Hover Overlay with Name */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s ease'
            }}
            className="group-hover:opacity-100"
          >
            <span style={{ 
              color: 'white', 
              fontSize: '12px', 
              fontWeight: '900', 
              textTransform: 'uppercase',
              textAlign: 'center',
              padding: '0 4px'
            }}>
              {collection.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
