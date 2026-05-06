"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SingleVaultPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params?.id as string;

  const [items, setItems] = useState<any[]>([]);
  const [vaultName, setVaultName] = useState("COLLECTION");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (collectionId) {
      loadVaultItems();
    }
  }, [collectionId]);

  async function loadVaultItems() {
    try {
      setLoading(true);
      
      // 1. Get the collection name
      const { data: vaultData } = await supabase
        .from("collections")
        .select("title")
        .eq("id", collectionId)
        .single();
      
      if (vaultData) setVaultName(vaultData.title);

      // 2. Get the items in this collection
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("collection", collectionId); // Matches the 'collection' column to this vault's ID

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ marginTop: '100px', padding: '0 16px', maxWidth: '800px', margin: '100px auto 0' }}>
        <button onClick={() => router.back()} style={{ color: '#52525b', fontWeight: 'bold', marginBottom: '20px' }}>
          ← BACK
        </button>
        
        <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', textAlign: 'center' }}>
          {vaultName}
        </h1>

        <div className="grid grid-cols-2 gap-4 mt-8">
          {items.map((item) => (
            <div key={item.id} style={{ background: '#18181b', borderRadius: '24px', overflow: 'hidden', border: '1px solid #27272a' }}>
               <img src={item.image_url} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
               <div style={{ padding: '12px' }}>
                 <p style={{ fontWeight: '900', fontSize: '14px' }}>{item.title}</p>
                 <p style={{ color: '#4ade80', fontWeight: '900' }}>£{item.estimated_value || 0}</p>
               </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
