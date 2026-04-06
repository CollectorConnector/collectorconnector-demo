"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

// This is the actual logic
function CollectionsListContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("user");
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollections() {
      if (!userId) return;
      const { data } = await supabase
        .from("collections")
        .select(`*, items (image_url)`)
        .eq("user_id", userId);
      setCollections(data || []);
      setLoading(false);
    }
    loadCollections();
  }, [userId]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black">LOADING VAULTS...</div>;

  return (
    <main style={{ maxWidth: '800px', margin: '100px auto 0', padding: '0 16px 80px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '32px', fontStyle: 'italic' }}>ALL COLLECTIONS</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {collections.map((c) => (
          <Link href={`/collections/${c.id}`} key={c.id}>
            <div style={{ 
              background: '#18181b', 
              aspectRatio: '1/1', 
              borderRadius: '32px', // THE SQUIRCLE
              border: '1px solid #27272a', 
              position: 'relative', 
              overflow: 'hidden', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {c.items?.[0] && (
                <img 
                  src={c.items[0].image_url} 
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} 
                />
              )}
              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <p style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '18px', margin: 0 }}>{c.title}</p>
                <p style={{ fontSize: '10px', color: '#71717a', fontWeight: 'bold', marginTop: '4px' }}>{c.items?.length || 0} ITEMS</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

// This is the wrapper that stops Vercel from crashing
export default function CollectionsListPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white font-black">INITIALIZING...</div>}>
        <CollectionsListContent />
      </Suspense>
      <Footer />
    </div>
  );
}
