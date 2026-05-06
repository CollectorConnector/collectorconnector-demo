"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CollectionVaultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 'id' from the URL path: /collections/[id]
  const pathId = params?.id as string;
  // 'collection' from the URL query: ?collection=[uuid]
  const collectionFilter = searchParams.get("collection");

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (pathId) {
      loadVaultData();
    }
  }, [pathId, collectionFilter]);

  async function loadVaultData() {
    try {
      setLoading(true);
      
      let query = supabase.from("items").select("*");

      if (collectionFilter) {
        // Case A: User clicked a specific folder in the grid
        query = query.eq("collection", collectionFilter);
      } else {
        // Case B: User clicked "View All" or accessed via profile
        query = query.eq("user_id", pathId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setItems(data);
        const total = data.reduce((sum, item) => sum + (Number(item.estimated_value) || 0), 0);
        setTotalValue(total);
      }
    } catch (err) {
      console.error("Vault Query Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main style={{ marginTop: '100px', padding: '0 16px', maxWidth: '800px', margin: '100px auto 0', minHeight: '70vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <button 
            onClick={() => router.back()} 
            style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '8px 20px', borderRadius: '12px', fontSize: '12px', fontWeight: '900', marginBottom: '24px', cursor: 'pointer' }}
          >
            ← BACK
          </button>
          
          <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase' }}>
            {collectionFilter ? "FOLDER CONTENT" : "COLLECTION VAULT"}
          </h1>
          
          <div style={{ display: 'inline-block', background: 'rgba(129, 140, 248, 0.1)', padding: '8px 20px', borderRadius: '24px', marginTop: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '900', color: '#818cf8' }}>
              {items.length} ITEMS — £{totalValue}
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#a1a1aa' }}>LOADING...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', border: '1px dashed #27272a', borderRadius: '24px' }}>
            <p style={{ color: '#52525b', fontWeight: '900' }}>THIS VAULT IS CURRENTLY EMPTY</p>
            <p style={{ fontSize: '12px', color: '#3f3f46', marginTop: '8px' }}>ID: {pathId}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {items.map((item) => (
              <div key={item.id} style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '1/1', background: '#18181b' }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '16px' }}>
                  <p style={{ fontWeight: '900', fontSize: '14px' }}>{item.title}</p>
                  <p style={{ color: '#4ade80', fontWeight: '900', fontSize: '12px' }}>£{item.estimated_value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
