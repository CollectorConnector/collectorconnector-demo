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
    if (userId) {
      loadCollections();
    }
  }, [userId]);

  async function loadCollections() {
    try {
      setLoading(true);
      
      // We fetch from 'collections' table, not 'items'
      // We use .select(`*, items(*)`) to get the items inside for the cover images
      const { data, error } = await supabase
        .from("collections")
        .select(`
          *,
          items (*)
        `)
        .eq("user_id", userId);

      if (error) throw error;
      setCollections(data || []);
    } catch (err) {
      console.error("Error loading collections:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main style={{ marginTop: '100px', minHeight: '70vh', paddingBottom: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px' }}>
            Vaults
          </h1>
          <p style={{ color: '#52525b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {collections.length} Folders Found
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#a1a1aa' }}>
            SCANNING VAULTS...
          </div>
        ) : (
          <CollectionsGrid items={collections} />
        )}
      </main>

      <Footer />
    </div>
  );
}
