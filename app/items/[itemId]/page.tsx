"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ItemDetailPage() {
  const params = useParams();
  const itemId = params?.itemId as string; // Unified naming
  const router = useRouter();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      if (!itemId) return;
      const { data, error } = await supabase
        .from("items")
        .select("*, profiles(username, avatar_url)")
        .eq("id", itemId)
        .single();

      if (error || !data) {
        console.error("Item not found:", itemId);
        router.push("/");
      } else {
        setItem(data);
      }
      setLoading(false);
    }
    fetchItem();
  }, [itemId, router]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black">LOADING PIECE...</div>;
  if (!item) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ maxWidth: "800px", margin: "100px auto 0", padding: "0 16px 80px" }}>
        <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '32px', overflow: 'hidden' }}>
          <img src={item.image_url} style={{ width: "100%", aspectRatio: '1/1', objectFit: 'cover' }} />
          <div style={{ padding: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <img src={item.profiles?.avatar_url || "/default-avatar.png"} style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
              <span style={{ fontWeight: "800", color: "#818cf8" }}>@{item.profiles?.username}</span>
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: "900", textTransform: "uppercase" }}>{item.title}</h1>
            <p style={{ color: "#a1a1aa", marginTop: "16px", lineHeight: '1.6' }}>{item.description || "Digital archive entry."}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
