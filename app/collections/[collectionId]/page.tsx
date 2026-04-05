"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CollectionDetailPage() {
  const params = useParams();
  const [collection, setCollection] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollectionData() {
      const { data: coll } = await supabase.from("collections").select("*").eq("id", params.id).single();
      const { data: collItems } = await supabase.from("items").select("*").eq("collection_id", params.id);
      
      setCollection(coll);
      setItems(collItems || []);
      setLoading(false);
    }
    if (params.id) loadCollectionData();
  }, [params.id]);

  if (loading) return <div style={{ background: '#000', minHeight: '100vh' }} />;

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <Header />
      <main style={{ maxWidth: '800px', margin: '100px auto 0', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>{collection?.title || collection?.name}</h1>
            <p style={{ color: '#818cf8', fontWeight: 'bold' }}>{items.length} ITEMS IN VAULT</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {items.map((item) => (
            <div key={item.id} style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '32px', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '1/1', background: '#18181b' }}>
                    <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '16px', textAlign: 'center' }}>
                    <p style={{ fontWeight: '900', margin: '0 0 4px 0', fontSize: '14px' }}>{item.title}</p>
                    <p style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '12px', margin: 0 }}>£{item.estimated_value}</p>
                </div>
            </div>
          ))}
        </div>
        
        {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#52525b' }}>
                <p>This collection is currently empty.</p>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
