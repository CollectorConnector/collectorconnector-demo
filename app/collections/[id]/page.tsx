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
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Even if no user is logged in, we want to try loading the collection 
      // if your app allows public viewing. If it's private, keep the user check.
      if (user) {
        setCurrentUserId(user.id);
      }
      if (collectionId) loadCollectionData(user?.id || null);
    };
    init();
  }, [collectionId]);

  async function loadCollectionData(userId: string | null) {
    try {
      setLoading(true);

      // 1. Fetch collection metadata
      // Try ID first, then fallback to title for legacy compatibility
      let { data: coll } = await supabase
        .from("collections")
        .select("*")
        .eq("id", collectionId)
        .single();

      if (!coll) {
        const { data: collByTitle } = await supabase
          .from("collections")
          .select("*")
          .eq("title", decodeURIComponent(collectionId))
          .single(); // Removed strict user_id check here to ensure we find the collection first
        coll = collByTitle;
      }

      if (coll) {
        setCollection(coll);

        // 2. Fetch items matching this collection
        // We look for items matching the UUID (collection_id) OR the legacy title (collection)
        let query = supabase
          .from("items")
          .select("*")
          .or(`collection_id.eq.${coll.id},collection.eq."${coll.title}"`);

        // Only apply user_id filter if we want to restrict viewing to the owner
        if (userId) {
          query = query.eq("user_id", coll.user_id); 
        }

        const { data: itemList, error } = await query;

        if (error) throw error;

        // Deduplicate by ID to prevent UI glitches
        const uniqueItems = itemList 
          ? Array.from(new Map(itemList.map(item => [item.id, item])).values()) 
          : [];
          
        setItems(uniqueItems);
      }

    } catch (err) {
      console.error("Error loading vault:", err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(itemId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!currentUserId) return;
    if (!confirm("Are you sure you want to remove this item?")) return;

    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", currentUserId);

    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      setItems(prev => prev.filter(i => i.id !== itemId));
    }
  }

  if (loading) return (
    <div style={{ background: "#000", color: "#fff", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", letterSpacing: "2px" }}>
      LOADING...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <Header />
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 16px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <button 
            onClick={() => router.back()} 
            style={{ background: "#18181b", color: "#fff", border: "1px solid #27272a", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginBottom: "20px", fontWeight: "bold" }}
          >
            ← BACK
          </button>
          <h1 style={{ fontSize: "32px", fontWeight: "900", textTransform: "uppercase", margin: "10px 0" }}>
            {collection?.title || "Vault"}
          </h1>
          <p style={{ color: "#818cf8", fontWeight: "bold", textTransform: "uppercase", fontSize: "14px" }}>
            {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
          </p>
        </div>

        {items.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "20px" }}>
            {items.map((item) => (
              <div key={item.id} style={{ position: "relative", aspectRatio: "1/1", borderRadius: "16px", overflow: "hidden", border: "1px solid #27272a", background: "#111" }}>
                {currentUserId === collection?.user_id && (
                  <button
                    onClick={(e) => deleteItem(item.id, e)}
                    style={{ position: "absolute", top: "8px", right: "8px", zIndex: 10, background: "rgba(239, 68, 68, 0.9)", color: "#fff", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}
                  >✕</button>
                )}
                <img 
                  src={item.image_url} 
                  alt={item.name || "Collector Item"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#52525b" }}>
            <p>No items found in this collection.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
