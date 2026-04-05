"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImportInstagramModal from "@/components/ImportInstagramModal";

export default function ItemDetailPage() {
  const { itemId } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItem() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      const { data, error } = await supabase
        .from("items")
        .select("*, profiles(username, avatar_url)")
        .eq("id", itemId)
        .single();

      if (error) {
        console.error(error);
        router.push("/");
      } else {
        setItem(data);
      }
      setLoading(false);
    }
    fetchItem();
  }, [itemId, router]);

  if (loading) return <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>LOADING PIECE...</div>;

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", color: "#fff" }}>
      <Header />

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "120px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
          
          {/* Left: Image */}
          <div style={{ borderRadius: "32px", overflow: "hidden", border: "1px solid #18181b", backgroundColor: "#09090b" }}>
            <img src={item.image_url} alt={item.title} style={{ width: "100%", display: "block" }} />
          </div>

          {/* Right: Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#27272a", overflow: "hidden" }}>
                {item.profiles?.avatar_url && <img src={item.profiles.avatar_url} style={{ width: "100%", height: "100%" }} />}
              </div>
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>{item.profiles?.username}</span>
            </div>

            <h1 style={{ fontSize: "48px", fontWeight: "900", fontStyle: "italic", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "-2px" }}>
              {item.title}
            </h1>
            
            <p style={{ color: "#71717a", fontSize: "18px", lineHeight: "1.6", marginBottom: "40px" }}>
              {item.description || "No description provided for this piece."}
            </p>

            <div style={{ padding: "30px", backgroundColor: "#09090b", borderRadius: "24px", border: "1px solid #18181b" }}>
              <p style={{ margin: 0, color: "#71717a", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase" }}>Estimated Value</p>
              <p style={{ margin: 0, fontSize: "32px", fontWeight: "900" }}>£{item.estimated_value || "???"}</p>
            </div>
            
            <button 
              onClick={() => setIsImportOpen(true)}
              style={{ marginTop: '20px', width: '100%', padding: '15px', borderRadius: '16px', border: '1px solid #27272a', background: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
            >
              IMPORT SIMILAR FROM IG
            </button>
          </div>
        </div>
      </main>

      {/* The Modal Fix */}
      <ImportInstagramModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        userId={userId || ''}
      />

      <Footer />
    </div>
  );
}
