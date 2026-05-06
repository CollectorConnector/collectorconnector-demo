"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function IndividualVaultPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params?.id as string;

  const [items, setItems] = useState<any[]>([]);
  const [vaultTitle, setVaultTitle] = useState("VAULT");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vaultId) loadVaultContent();
  }, [vaultId]);

  async function loadVaultContent() {
    try {
      setLoading(true);
      
      // 1. Get Title
      const { data: vData } = await supabase.from("collections").select("title").eq("id", vaultId).single();
      if (vData) setVaultTitle(vData.title);

      // 2. Get Items strictly tied to this vault UUID
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("collection", vaultId);

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Vault Content Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ marginTop: '100px', padding: '0 16px' }}>
        <button onClick={() => router.back()} style={{ color: '#52525b', fontWeight: 'bold' }}>← BACK</button>
        <h1 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '900', textTransform: 'uppercase' }}>
          {vaultTitle}
        </h1>
        <div className="grid grid-cols-2 gap-4 mt-8">
          {items.map((item) => (
            <div key={item.id} style={{ background: '#18181b', borderRadius: '24px', border: '1px solid #27272a', overflow: 'hidden' }}>
              <img src={item.image_url} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
              <div style={{ padding: '12px' }}>
                <p style={{ fontWeight: '900', fontSize: '13px' }}>{item.title}</p>
                <p style={{ color: '#4ade80', fontWeight: '900' }}>£{item.estimated_value}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
