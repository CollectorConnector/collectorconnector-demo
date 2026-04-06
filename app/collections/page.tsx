"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

function List() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("user");
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      supabase.from("collections").select(`*, items (image_url)`).eq("user_id", userId)
        .then(({ data }) => setCollections(data || []));
    }
  }, [userId]);

  return (
    <main style={{ maxWidth: '800px', margin: '100px auto 0', padding: '0 16px 80px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '32px' }}>ALL COLLECTIONS</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {collections.map((c) => (
          <Link href={`/collections/${c.id}`} key={c.id}>
            <div style={{ background: '#18181b', aspectRatio: '1/1', borderRadius: '32px', border: '1px solid #27272a', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {c.items?.[0] && <img src={c.items[0].image_url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />}
              <p style={{ position: 'relative', fontWeight: '900', textTransform: 'uppercase' }}>{c.title}</p>
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
      <Suspense fallback={<div className="p-20 text-center">LOADING...</div>}>
        <List />
      </Suspense>
      <Footer />
    </div>
  );
}
