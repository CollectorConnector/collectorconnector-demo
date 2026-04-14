"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

function List() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("user");
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      supabase
        .from("collections")
        .select(`*, items (image_url)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }) 
        .then(({ data }) => setCollections(data || []));
    }
  }, [userId]);

  return (
    <main style={{ maxWidth: '800px', margin: '100px auto 0', padding: '0 16px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button 
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase' }}>All Collections</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {collections.map((c) => (
          <Link href={`/collections/${c.id}`} key={c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ 
              background: '#111', 
              aspectRatio: '1/1', 
              borderRadius: '24px', 
              border: '1px solid #27272a', 
              position: 'relative', 
              overflow: 'hidden', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {c.items?.[0] ? (
                <img 
                  src={c.items[0].image_url} 
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, #18181b, #27272a)' }} />
              )}
              
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '16px' }}>
                <p style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  {c.title}
                </p>
                <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 'bold' }}>
                    {c.items?.length || 0} ITEMS
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default function CollectionsListPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <Suspense fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', fontWeight: '900' }}>
            LOADING VAULT...
        </div>
      }>
        <List />
      </Suspense>
      <Footer />
    </div>
  );
}
