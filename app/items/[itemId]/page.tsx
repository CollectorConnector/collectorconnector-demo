"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImportInstagramModal from "@/components/ImportInstagramModal";

export default function ItemDetailPage() {
  const params = useParams();
  const itemId = params?.itemId; // Use optional chaining for safety
  const router = useRouter();
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItem() {
      if (!itemId) return;

      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      const { data, error } = await supabase
        .from("items")
        .select("*, profiles(username, avatar_url)")
        .eq("id", itemId)
        .single();

      if (error || !data) {
        console.error(error);
        router.push("/");
      } else {
        setItem(data);
      }
      setLoading(false);
    }
    fetchItem();
  }, [itemId, router]);

  if (loading) return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900' }}>
      RETRIEVING FROM VAULT...
    </div>
  );

  if (!item) return null;

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", color: "#fff" }}>
      <Header />

      {/* Spacing Fix: marginTop '100px' and maxWidth '800px' to match Profile */}
      <main style={{ maxWidth: "800px", margin: "100px auto 0", padding: "0 16px 80px" }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Main Card Container */}
          <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '32px', overflow: 'hidden' }}>
            
            {/* Image Section */}
            <div style={{ aspectRatio: '1/1', width: '100%', backgroundColor: '#000' }}>
              <img 
                src={item.image_url} 
                alt={item.title} 
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
              />
            </div>

            {/* Info Section */}
            <div style={{ padding: "32px" }}>
              
              {/* Profile Bar */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <img 
                  src={item.profiles?.avatar_url || "/default-avatar.png"} 
                  style={{ width: "32px", height: "32px", borderRadius: "10px", objectFit: "cover" }} 
                />
                <span style={{ fontWeight: "800", fontSize: "14px", color: "#818cf8" }}>@{item.profiles?.username}</span>
              </div>

              {/* Title - Clean and Bold */}
              <h1 style={{ fontSize: "32px", fontWeight: "900", textTransform: "uppercase", marginBottom: "16px", letterSpacing: "-1px" }}>
                {item.title || "UNTITLED PIECE"}
              </h1>
              
              {/* Description */}
              <p style={{ color: "#a1a1aa", fontSize: "16px", lineHeight: "1.6", marginBottom: "32px" }}>
                {item.description || "No archive notes provided for this piece."}
              </p>

              {/* Action Button: Replaced the Value box with the Import button */}
              <button 
                onClick={() => setIsImportOpen(true)}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  borderRadius: '16px', 
                  background: '#fff', 
                  color: '#000', 
                  fontWeight: '900', 
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                IMPORT SIMILAR PIECE
              </button>
            </div>
          </div>
        </div>
      </main>

      <ImportInstagramModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        userId={userId || ''}
      />

      <Footer />
    </div>
  );
}
