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

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
    if (collectionId) loadCollectionData();
  }, [collectionId]);

  async function loadCollectionData() {
    try {
      setLoading(true);
      
      // 1. Fetch Collection Metadata
      const { data: coll } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (coll) setCollection(coll);

      // 2. Fetch Items - Using 'collection_id' to match your schema
      const { data: itemList, error } = await supabase
        .from("items")
        .select("*")
        .eq("collection_id", collectionId); // Targeting the column shown in image_2.png

      if (error) throw error;
      setItems(itemList || []);

    } catch (err) {
      console.error("Error loading collection vault:", err);
    } finally {
      setLoading(false);
    }
  }

  // SWIPE LOGIC
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

  // SOCIAL LOGIC
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
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', letterSpacing: '2px' }}>
        LOADING VAULT...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'inherit' }}>
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
            {collection?.title || "Collection Vault"}
          </h1>

          <div style={{ display: 'inline-block', background: '#18181b', padding: '6px 16px', borderRadius: '20px', border: '1px solid #27272a' }}>
            <p style={{ color: '#818cf8', fontWeight: '900', fontSize: '12px', letterSpacing: '1px', margin: 0 }}>
              {items.length} ITEMS — £{items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0)}
            </p>
          </div>
        </div>

        {/* GRID */}
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
                  alt={item.title || "Collection Item"} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#3f3f46', fontWeight: 'bold' }}>
            THIS VAULT IS CURRENTLY EMPTY
          </div>
        )}
      </main>

      {/* ITEM MODAL */}
      {selectedItem && (
        <div 
          onClick={() => setSelectedItem(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          {/* Close Icon - Using SVG for consistency */}
          <div style={{ position: 'absolute', top: '30px', right: '30px', color: '#fff', background: 'rgba(255,255,255,0.1)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer' }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>

          <button onClick={showPrev} style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '24px', padding: '20px', borderRadius: '50%', cursor: 'pointer' }}>‹</button>
          <button onClick={showNext} style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '24px', padding: '20px', borderRadius: '50%', cursor: 'pointer' }}>›</button>

          <img 
            src={selectedItem.image_url} 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '95%', maxHeight: '60vh', borderRadius: '16px', border: '1px solid #333', marginBottom: '20px' }} 
          />

          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', background: '#18181b', borderRadius: '24px', padding: '20px', border: '1px solid #27272a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{selectedItem.title || "Untitled Item"}</span>
              <button onClick={(e) => toggleLike(selectedItem.id, e)} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>
                {likedItems.has(selectedItem.id) ? '⭐' : '☆'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <input 
                value={commentText} 
                onChange={e => setCommentText(e.target.value)} 
                placeholder="Add a comment..." 
                style={{ flex: 1, background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', fontSize: '14px' }} 
              />
              <button onClick={() => { alert("Commented!"); setCommentText(""); }} style={{ background: '#fff', color: '#000', padding: '0 20px', borderRadius: '12px', fontWeight: 'bold' }}>SEND</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
