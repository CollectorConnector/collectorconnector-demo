"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CollectionDetails() {
  const params = useParams();
  const router = useRouter();

  const rawParam = params?.id as string;

  const [collection, setCollection] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });

    if (rawParam) loadCollectionData();
  }, [rawParam]);

  async function loadCollectionData() {
    try {
      setLoading(true);

      console.log("Incoming route param:", rawParam);

      // Detect if param is UUID or slug
      const isUUID = /^[0-9a-fA-F-]{36}$/.test(rawParam);

      let collQuery;
      if (isUUID) {
        collQuery = supabase.from("collections").select("*").eq("id", rawParam).single();
      } else {
        collQuery = supabase.from("collections").select("*").eq("slug", rawParam).single();
      }

      const { data: coll, error: collError } = await collQuery;

      if (collError || !coll) {
        console.error("Collection Fetch Error:", collError);
        return;
      }

      setCollection(coll);
      console.log("Collection loaded:", coll);

      // Now fetch items using the REAL collection ID
      const { data: itemList, error: itemError } = await supabase
        .from("items")
        .select("*")
        .eq("collection_id", coll.id);

      if (itemError) {
        console.error("Item Fetch Error:", itemError);
      } else {
        console.log("Items found:", itemList?.length || 0);
        setItems(itemList || []);
      }

    } catch (err) {
      console.error("Critical Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Swipe logic
  const showNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (items.length === 0) return;
    const currentIndex = items.findIndex(i => i.id === selectedItem.id);
    setSelectedItem(items[(currentIndex + 1) % items.length]);
  };

  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (items.length === 0) return;
    const currentIndex = items.findIndex(i => i.id === selectedItem.id);
    setSelectedItem(items[(currentIndex - 1 + items.length) % items.length]);
  };

  async function toggleLike(itemId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!currentUserId) return alert("Log in to like items!");
    setLikedItems(prev => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
        LOADING VAULT...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <Header />

      <main style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '110px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '100px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <button 
            onClick={() => router.back()} 
            style={{ color: '#71717a', fontSize: '11px', fontWeight: '900', marginBottom: '16px', border: '1px solid #27272a', background: '#09090b', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', textTransform: 'uppercase' }}
          >
            ← Back
          </button>

          <h1 style={{ fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px', marginBottom: '8px' }}>
            {collection?.title || collection?.name || "Collection Vault"}
          </h1>

          <div style={{ display: 'inline-block', background: '#18181b', padding: '6px 16px', borderRadius: '20px', border: '1px solid #27272a' }}>
            <p style={{ color: '#818cf8', fontWeight: '900', fontSize: '12px', letterSpacing: '1px', margin: 0 }}>
              {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'} — £{items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0)}
            </p>
          </div>
        </div>

        {items.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '14px' }}>
            {items.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{ aspectRatio: '1/1', cursor: 'pointer', position: 'relative', overflow: 'hidden', borderRadius: '24%', border: '1px solid #27272a', background: '#09090b' }}
              >
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#52525b', fontWeight: 'bold' }}>
            THIS VAULT IS EMPTY
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
