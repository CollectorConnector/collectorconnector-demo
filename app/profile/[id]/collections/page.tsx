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

      const { data, error } = await supabase
        .from("collections")
        .select("*, items(*)")   // ⭐ CRITICAL: load items for cover + count
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (err) {
      console.error("Collections load error:", err);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main style={{ marginTop: "100px", minHeight: "70vh" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: "32px",
            fontWeight: "900",
            textTransform: "uppercase",
          }}
        >
          All Collections
        </h1>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#52525b",
              marginTop: "40px",
            }}
          >
            LOADING COLLECTIONS...
          </div>
        ) : (
          <CollectionsGrid items={collections} />
        )}
      </main>

      <Footer />
    </div>
  );
}
