"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SingleVaultPage() {
  const params = useParams();
  const router = useRouter();
  const idFromUrl = params?.id as string;

  const [items, setItems] = useState<any[]>([]);
  const [vaultName, setVaultName] = useState("COLLECTION");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (idFromUrl) {
      loadVaultData();
    }
  }, [idFromUrl]);

  async function loadVaultData() {
    try {
      setLoading(true);
      
      // 1. Try to find if 'idFromUrl' is a Collection ID
      const { data: vaultData } = await supabase
        .from("collections")
        .select("title, user_id")
        .eq("id", idFromUrl)
        .single();
      
      let itemsData;

      if (vaultData) {
        // It's a collection! Fetch items in this folder
        setVaultName(vaultData.title);
        const { data } = await supabase
          .from("items")
          .select("*")
          .eq("collection", idFromUrl);
        itemsData = data;
      }

      // 2. BACKUP: If no items found or not a collection ID, try fetching by User ID
      if (!itemsData || itemsData.length === 0) {
        const { data } = await supabase
          .from("items")
          .select("*")
          .eq("user_id", idFromUrl);
        itemsData = data;
        if (itemsData && itemsData.length > 0) setVaultName("USER VAULT");
      }

      setItems(itemsData || []);

    } catch (err) {
      console.error("Vault Load Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main style={{ marginTop: '100px', padding: '0 16px', maxWidth: '800px', margin: '100px auto 0', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button 
            onClick={() => router.back()} 
            style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', marginBottom: '20px', cursor: 'pointer' }}
          >
            ← BACK
          </button>
          
          <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {vaultName}
          </h1>
          
          <div style={{ display: 'inline-block', background: 'rgba(129, 140, 248, 0.1)', padding: '6px 16px', borderRadius: '20px', marginTop: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '900', color: '#818cf8' }}>
              {items.length} ITEMS
            </span>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#52525b' }}>LOADING VAULT...</p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #27272a', borderRadius: '20px' }}>
            <p style={{ color: '#3f3f46', fontWeight: '900', textTransform: 'uppercase' }}>No items found in this section</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingBottom: '40px' }}>
            {items.map((item) => (
              <div key={item.id} style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '1/1', background: '#18181b' }}>
                  <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '12px' }}>
                  <p style={{ fontWeight: '900', fontSize: '13px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </p>
                  <p style={{ color: '#4ade80', fontWeight: '900', fontSize: '12px' }}>£{item.estimated_value || 0}</p>
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
