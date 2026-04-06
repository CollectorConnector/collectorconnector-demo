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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (collectionId) loadCollectionData();
  }, [collectionId]);

  async function loadCollectionData() {
    try {
      setLoading(true);
      // Fetch collection details
      const { data: coll } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();
      if (coll) setCollection(coll);

      // Fetch items linked to this collection
      const { data: itemList } = await supabase
        .from("items")
        .select("*")
        .eq("collection", collectionId);
      setItems(itemList || []);
    } catch (err) {
      console.error("Error loading collection vault:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100 screen', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
        LOADING VAULT...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'sans-serif' }}>
      <Header />
      
      <main style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '110px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '100px' }}>
        
        {/* HEADER SECTION */}
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

        {/* THE SQUIRCLE GRID */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', border: '2px dashed #18181b', borderRadius: '32px' }}>
            <p style={{ color: '#52525b', fontWeight: 'bold', fontSize: '14px' }}>THIS VAULT IS CURRENTLY EMPTY</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
            gap: '14px',
            justifyContent: 'center'
          }}>
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedImage(item.image_url)}
                style={{ 
                  aspectRatio: '1/1', 
                  cursor: 'pointer', 
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '24%', // Squircle
                  border: '1px solid #27272a',
                  background: '#09090b',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FULL SCREEN ZOOM PREVIEW */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.95)', 
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '20px',
            cursor: 'zoom-out'
          }}
        >
          <img 
            src={selectedImage} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '85vh', 
              borderRadius: '16px', 
              boxShadow: '0 0 40px rgba(0,0,0,0.5)',
              border: '1px solid #333'
            }} 
          />
          <div style={{ position: 'absolute', top: '30px', right: '30px', color: '#fff', fontSize: '20px', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
            ✕
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
