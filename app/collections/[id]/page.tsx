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

  // LIGHTBOX STATE
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
    if (collectionId) loadCollectionData();
  }, [collectionId]);

  async function loadCollectionData() {
    try {
      setLoading(true);

      // 1. Fetch collection metadata using the ID from the URL
      const { data: coll } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (coll) {
        setCollection(coll);

        // 2. Fetch items 
        // We match by the collection_id (UUID) OR the collection name (Title)
        // CRITICAL: We wrap the title in double quotes so names like "Retro Games" work!
        const { data: itemList, error } = await supabase
          .from("items")
          .select("*")
          .or(`collection_id.eq.${coll.id},collection.eq."${coll.title}"`);

        if (error) throw error;
        setItems(itemList || []);
      }

    } catch (err) {
      console.error("Error loading collection vault:", err);
    } finally {
      setLoading(false);
    }
  }

  // Arrow Navigation Logic
  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (items.length === 0) return;
    setSelectedIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (items.length === 0) return;
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", letterSpacing: "2px" }}>
        LOADING VAULT...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "inherit" }}>
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
            {items.map((item, index) => (
              <div 
                key={item.id}
                onClick={() => setSelectedIndex(index)}
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

        {/* LIGHTBOX OVERLAY */}
        {selectedIndex !== null && items[selectedIndex] && (
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setSelectedIndex(null)}
          >
            <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', color: '#fff', fontSize: '32px', cursor: 'pointer' }}>✕</button>
            
            <button 
                onClick={showPrev}
                style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '40px', padding: '15px', borderRadius: '50%', cursor: 'pointer', zIndex: 1001 }}
            >‹</button>
            
            <div style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
              <img 
                src={items[selectedIndex].image_url} 
                style={{ maxHeight: '80vh', maxWidth: '90vw', objectFit: 'contain', borderRadius: '8px', marginBottom: '10px' }} 
              />
              <p style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '14px', color: '#fff' }}>
                {items[selectedIndex].name || items[selectedIndex].title}
              </p>
            </div>

            <button 
                onClick={showNext}
                style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '40px', padding: '15px', borderRadius: '50%', cursor: 'pointer', zIndex: 1001 }}
            >›</button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
