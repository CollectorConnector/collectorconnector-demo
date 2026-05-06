"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CollectionVaultPage() {
  const params = useParams();
  const router = useRouter();
  
  // The [id] from the URL
  const vaultId = params?.id as string;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (vaultId) {
      console.log("Fetching vault for ID:", vaultId);
      loadVaultData();
    }
  }, [vaultId]);

  async function loadVaultData() {
    try {
      setLoading(true);
      
      // Attempt 1: Fetch items where user_id matches the URL ID
      let { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", vaultId)
        .order("created_at", { ascending: false });

      // Attempt 2: If empty, check if the ID refers to a specific Collection ID instead of a User ID
      if (!data || data.length === 0) {
        const { data: collData } = await supabase
          .from("items")
          .select("*")
          .eq("collection", vaultId)
          .order("created_at", { ascending: false });
        
        if (collData && collData.length > 0) {
          data = collData;
        }
      }

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
            style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '8px 20px', borderRadius: '12px', fontSize: '12px', fontWeight: '900', marginBottom: '24px', cursor: 'pointer', letterSpacing: '1px' }}
          >
            ← BACK
          </button>
          
          <h1 style={{ fontSize: '38px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px', marginBottom: '8px' }}>
            COLLECTION VAULT
          </h1>
          
          <div style={{ display: 'inline-block', background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.2)', padding: '8px 20px', borderRadius: '24px' }}>
            <span style={{ fontSize: '14px', fontWeight: '900', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {items.length} ITEMS — £{totalValue}
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
            <p style={{ marginTop: '16px', color: '#a1a1aa', fontWeight: 'bold' }}>ACCESSING VAULT...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', background: '#09090b', borderRadius: '24px', border: '1px dashed #27272a' }}>
            <p style={{ color: '#52525b', fontWeight: '900', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              THIS VAULT IS CURRENTLY EMPTY
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {items.map((item) => (
              <div key={item.id} style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', overflow: 'hidden', transition: 'transform 0.2s' }}>
                <div style={{ aspectRatio: '1/1', background: '#18181b', position: 'relative' }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontWeight: '900', fontSize: '15px', marginBottom: '6px', color: '#fff' }}>{item.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: '#4ade80', fontWeight: '900', fontSize: '14px' }}>£{item.estimated_value}</p>
                    <span style={{ fontSize: '10px', color: '#52525b', fontWeight: 'bold' }}>{item.status || 'COLLECTED'}</span>
                  </div>
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
