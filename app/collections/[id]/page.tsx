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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
    if (collectionId) loadCollectionData();
  }, [collectionId]);

  async function loadCollectionData() {
    try {
      setLoading(true);

      // Fetch collection metadata
      const { data: coll } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (coll) setCollection(coll);

      // ⭐ FINAL FIX: Use ONLY the correct FK column
      const { data: itemList, error } = await supabase
        .from("items")
        .select("*")
        .eq("collection", collectionId);

      if (error) throw error;
      setItems(itemList || []);

    } catch (err) {
      console.error("Error loading collection vault:", err);
    } finally {
      setLoading(false);
    }
  }

  const showNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (items.length === 0 || !selectedItem) return;
    const currentIndex = items.findIndex(i => i.id === selectedItem.id);
    setSelectedItem(items[(currentIndex + 1) % items.length]);
  };

  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (items.length === 0 || !selectedItem) return;
    const currentIndex = items.findIndex(i => i.id === selectedItem.id);
    setSelectedItem(items[(currentIndex - 1 + items.length) % items.length]);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", letterSpacing: "2px" }}>
        LOADING VAULT...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <Header />

      <main style={{ maxWidth: "800px", margin: "0 auto", paddingTop: "110px", paddingLeft: "16px", paddingRight: "16px", paddingBottom: "100px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <button 
            onClick={() => router.back()} 
            style={{ color: "#71717a", fontSize: "11px", fontWeight: "900", marginBottom: "16px", border: "1px solid #27272a", background: "#09090b", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", textTransform: "uppercase" }}
          >
            ← Back
          </button>

          <h1 style={{ fontSize: "28px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-1px", marginBottom: "8px" }}>
            {collection?.title || "Collection Vault"}
          </h1>

          <div style={{ display: "inline-block", background: "#18181b", padding: "6px 16px", borderRadius: "20px", border: "1px solid #27272a" }}>
            <p style={{ color: "#818cf8", fontWeight: "900", fontSize: "12px", letterSpacing: "1px", margin: 0 }}>
              {items.length} ITEMS — £{items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0)}
            </p>
          </div>
        </div>

        {items.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "14px" }}>
            {items.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{ aspectRatio: "1/1", cursor: "pointer", position: "relative", overflow: "hidden", borderRadius: "24%", border: "1px solid #27272a", background: "#09090b" }}
              >
                <img 
                  src={item.image_url} 
                  alt={item.title || "Collection Item"} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#3f3f46", fontWeight: "bold" }}>
            THIS VAULT IS CURRENTLY EMPTY
          </div>
        )}

        {/* LIGHTBOX */}
        {selectedItem && (
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setSelectedItem(null)}
          >
            <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', color: '#fff', fontSize: '30px', cursor: 'pointer' }}>✕</button>
            
            <button 
              onClick={showPrev} 
              style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '40px', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', zIndex: 1001 }}
            >‹</button>

            <div style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
              <img 
                src={selectedItem.image_url} 
                style={{ maxHeight: '80vh', maxWidth: '90vw', objectFit: 'contain', borderRadius: '12px' }} 
              />
              <p style={{ marginTop: '15px', fontWeight: '900', textTransform: 'uppercase', color: '#fff' }}>
                {selectedItem.name || selectedItem.title}
              </p>
            </div>

            <button 
              onClick={showNext} 
              style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '40px', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', zIndex: 1001 }}
            >›</button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
