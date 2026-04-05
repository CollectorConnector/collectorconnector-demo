"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!params.id) return;
      const { data: coll } = await supabase.from("collections").select("*").eq("id", params.id).single();
      const { data: collItems } = await supabase.from("items").select("*").eq("collection_id", params.id).order("created_at", { ascending: false });
      setCollection(coll);
      setItems(collItems || []);
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  if (loading) return <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>OPENING VAULT...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      <Header />
      <main style={{ maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', paddingBottom: '100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '900', textTransform: 'uppercase' }}>{collection?.title}</h1>
            <p style={{ color: '#818cf8', fontWeight: 'bold' }}>{items.length} ITEMS | £{items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0).toLocaleString()}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {items.map((item) => (
            <div key={item.id} onClick={() => router.push(`/items/${item.id}`)} style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '40px', overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ aspectRatio: '1/1', background: '#18181b' }}>
                    <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ fontWeight: '900', margin: '0 0 4px 0' }}>{item.title}</p>
                    <p style={{ color: '#4ade80', fontWeight: 'bold' }}>£{Number(item.estimated_value).toLocaleString()}</p>
                </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
