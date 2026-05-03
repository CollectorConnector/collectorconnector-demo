"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CollectionDetails() {
  const params = useParams();
  const collectionId = params?.id as string;
  const router = useRouter();

  const [collection, setCollection] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id || null;
      setCurrentUserId(userId);
      if (collectionId && userId) {
        loadCollectionData(userId);
      }
    };
    getUser();
  }, [collectionId]);

  async function loadCollectionData(userId: string) {
    try {
      setLoading(true);

      // 1. Fetch collection metadata
      const { data: coll } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (coll) setCollection(coll);

      // 2. Build strict filters
      // We only want items that belong to THIS user AND match this collection
      const orFilters = [
        `collection_id.eq.${collectionId}`,
      ];

      if (coll?.title) {
        orFilters.push(`collection.eq.${coll.title}`);
      }

      // 3. Fetch items - Adding the .eq("user_id", userId) is critical
      // to prevent "Duplicate" images from other users appearing
      const { data: itemList, error } = await supabase
        .from("items")
        .select("*")
        .or(orFilters.join(","))
        .eq("user_id", userId); // Strict ownership check

      if (error) throw error;

      // Filter out any potential accidental duplicates by ID in the state
      const uniqueItems = itemList ? Array.from(new Map(itemList.map(item => [item.id, item])).values()) : [];
      setItems(uniqueItems);

    } catch (err) {
      console.error("Error loading collection vault:", err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(itemId: string, e: React.MouseEvent) {
    e.stopPropagation();
    
    // Safety check: ensure we have a user
    if (!currentUserId) return;

    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", currentUserId); // Safety: only delete if it's yours

    if (error) {
      alert("Error deleting item: " + error.message);
      return;
    }

    setItems(prev => prev.filter(i => i.id !== itemId));
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", letterSpacing: "2px" }}>
        LOADING VAULT...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "inherit" }}>
      <Header />

      <main style={{ maxWidth: "800px", margin: "0 auto", paddingTop: "110px", paddingLeft: "16px", paddingRight: "16px", paddingBottom: "100px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <button 
            onClick={() => router.back()} 
            style={{ color: "#71717a", fontSize: "11px", fontWeight: "900", marginBottom: "16px", border: "1px solid #27272a", background: "#09090b", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", textTransform: "uppercase" }}
          >
            ← Back
          </button>

          <h1 style={{ fontSize: "28px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "-1px", marginBottom: "8px" }}>
            {collection?.title || "Collection Vault"}
          </h1>

          <div style={{ display: "inline-block", background: "#18181b", padding: "6px 16px", borderRadius: "20px", border: "1px solid #27272a" }}>
            <p style={{ color: "#818cf8", fontWeight: "900", fontSize: "12px", letterSpacing: "1px", margin: 0 }}>
              {items.length} ITEMS — £{items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0)}
            </p>
          </div>
        </div>

        {items.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "14px" }}>
            {items.map((item) => (
              <div 
                key={item.id}
                style={{ aspectRatio: "1/1", position: "relative", overflow: "hidden", borderRadius: "24%", border: "1px solid #27272a", background: "#09090b" }}
              >
                <button
                  onClick={(e) => deleteItem(item.id, e)}
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    zIndex: 20,
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "22px",
                    height: "22px",
                    fontSize: "12px",
                    fontWeight: "900",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ×
                </button>

                <img 
                  src={item.image_url} 
                  alt={item.title || "Collection Item"} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#3f3f46", fontWeight: "bold" }}>
            THIS VAULT IS CURRENTLY EMPTY
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
