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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (collectionId) loadCollectionData();
  }, [collectionId]);

  async function loadCollectionData() {
    try {
      setLoading(true);
      // Fetch collection
      const { data: coll } = await supabase
        .from("collections")
        .select("*")
        .or(`id.eq.${collectionId},title.eq.${decodeURIComponent(collectionId)}`)
        .maybeSingle();

      if (coll) {
        setCollection(coll);
        // Fetch items - using the quoted string fix to ensure "Retro Games" works
        const { data: itemList } = await supabase
          .from("items")
          .select("*")
          .or(`collection_id.eq.${coll.id},collection.eq."${coll.title}"`);
        
        setItems(itemList || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Navigation logic for the arrows
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
  };

  if (loading) return <div style={{background: "#000", color: "#fff", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center"}}>LOADING...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <Header />
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 16px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <button onClick={() => router.back()} style={{ background: "#18181b", color: "#fff", border: "1px solid #27272a", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginBottom: "20px" }}>← BACK</button>
          <h1 style={{ fontSize: "32px", fontWeight: "900", textTransform: "uppercase" }}>{collection?.title}</h1>
          <p style={{ color: "#818cf8", fontWeight: "bold" }}>{items.length} ITEMS</p>
        </div>

        {/* The Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px" }}>
          {items.map((item, index) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedIndex(index)} // This triggers the enlarge
              style={{ aspectRatio: "1/1", borderRadius: "12px", overflow: "hidden", border: "1px solid #27272a", cursor: "pointer" }}
            >
              <img src={item.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>

        {/* The Enlarge Overlay (Lightbox) */}
        {selectedIndex !== null && (
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close Button */}
            <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', color: '#fff', fontSize: '40px', cursor: 'pointer' }}>✕</button>
            
            {/* Left Arrow */}
            <button 
                onClick={prevImage}
                style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '50px', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
            >‹</button>
            
            <img 
              src={items[selectedIndex].image_url} 
              style={{ maxHeight: '85vh', maxWidth: '85vw', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} 
              onClick={(e) => e.stopPropagation()}
            />

            {/* Right Arrow */}
            <button 
                onClick={nextImage}
                style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '50px', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
            >›</button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
