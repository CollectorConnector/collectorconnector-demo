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

      // 1️⃣ Fetch collections for this user
      const { data: collData, error: collErr } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (collErr) throw collErr;

      if (!collData || collData.length === 0) {
        setCollections([]);
        return;
      }

      const collectionIds = collData.map((c) => c.id);

      // 2️⃣ Fetch items belonging to these collections
      const { data: itemData, error: itemErr } = await supabase
        .from("items")
        .select("*")
        .in("collection_id", collectionIds);

      if (itemErr) throw itemErr;

      // 3️⃣ Attach items to their collections
      const merged = collData.map((c) => ({
        ...c,
        items: itemData.filter((i) => String(i.collection_id) === String(c.id)),
      }));

      setCollections(merged);
    } catch (err) {
      console.error("Grid Load Error:", err);
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
          Vaults
        </h1>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#52525b",
              marginTop: "40px",
            }}
          >
            LOADING FOLDERS...
          </div>
        ) : (
          <CollectionsGrid items={collections} />
        )}
      </main>
      <Footer />
    </div>
  );
}
