"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CollectionVaultPage() {
  const params = useParams();
  const router = useRouter();
  
  // Ensure we are grabbing the 'id' from the dynamic route [id]
  const targetUserId = params?.id as string;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (targetUserId) {
      loadVaultData();
    }
  }, [targetUserId]);

  async function loadVaultData() {
    try {
      setLoading(true);
      
      // We query items WHERE user_id matches the ID from the URL
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setItems(data);
        const total = data.reduce((sum, item) => sum + (Number(item.estimated_value) || 0), 0);
        setTotalValue(total);
      }
    } catch (err) {
      console.error("Error loading vault:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main style={{ marginTop: '100px', padding: '0 16px', maxWidth: '800px', margin: '100px auto 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <button 
            onClick={() => router.back()} 
            style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px', cursor: 'pointer' }}
          >
            ← BACK
          </button>
          
          <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Collection Vault
          </h1>
          
          <div style={{ display: 'inline-block', background: 'rgba(129, 140, 248, 0.1)', padding: '6px 16px', borderRadius: '20px', marginTop: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '900', color: '#818cf8' }}>
              {items.length} ITEMS — £{totalValue}
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#a1a1aa', marginTop: '40px' }}>Loading Vault...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: '#3f3f46', fontWeight: '900', fontSize: '18px', textTransform: 'uppercase' }}>
              This vault is currently empty
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {items.map((item) => (
              <div key={item.id} style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '1/1', background: '#18181b' }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontWeight: '900', fontSize: '14px', marginBottom: '4px' }}>{item.title}</h3>
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
