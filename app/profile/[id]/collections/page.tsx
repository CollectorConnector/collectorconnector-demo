"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionsGrid from "@/components/CollectionsGrid";

export default function UserCollectionsPage() {
  const params = useParams();
  const userId = params?.id as string;
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadCollections();
  }, [userId]);

  async function loadCollections() {
    try {
      setLoading(true);
      // Fetch ONLY from the collections table
      const { data, error } = await supabase
        .from("collections")
        .select(`*, items(*)`)
        .eq("user_id", userId);

      if (error) throw error;
      setCollections(data || []);
    } catch (err) {
      console.error("Grid Load Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ marginTop: '100px', minHeight: '70vh' }}>
        <h1 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '900', textTransform: 'uppercase' }}>
          Vaults
        </h1>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#52525b', marginTop: '40px' }}>LOADING FOLDERS...</div>
        ) : (
          <CollectionsGrid items={collections} />
        )}
      </main>
      <Footer />
    </div>
  );
}
