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
      if (user) {
        setCurrentUserId(user.id);
      }
      if (collectionId) loadCollectionData();
    };
    init();
  }, [collectionId]);

  async function loadCollectionData() {
    try {
      setLoading(true);

      // 1. Fetch collection metadata
      // We check by ID or by Title (decoded) to find the collection object
      let { data: coll } = await supabase
        .from("collections")
        .select("*")
        .or(`id.eq.${collectionId},title.eq.${decodeURIComponent(collectionId)}`)
        .maybeSingle();

      if (!coll) {
        console.error("Collection not found");
        setLoading(false);
        return;
      }

      setCollection(coll);

      // 2. Fetch items 
      // We specifically look for items where collection_id matches the UUID 
      // OR the string column 'collection' matches the title exactly.
      const { data: itemList, error } = await supabase
        .from("items")
        .select("*")
        .or(`collection_id.eq.${coll.id},collection.eq."${coll.title}"`);

      if (error) throw error;

      // Deduplicate by ID to prevent UI glitches
      const uniqueItems = itemList ? Array.from(new Map(itemList.map(item => [item.id, item])).values()) : [];
      setItems(uniqueItems);

    } catch (err) {
      console.error("Error loading vault:", err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(itemId: string, e: React.MouseEvent) {
    e.stopPropagation();
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

  if (loading) return <div style={{ background: "#000", color: "#fff", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>LOADING...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <Header />
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 16px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <button onClick={() => router.back()} style={{ background: "#18181b", color: "#fff", border: "1px solid #27272a", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginBottom: "20px" }}>← BACK</button>
          <h1 style={{ fontSize: "32px", fontWeight: "900", textTransform: "uppercase" }}>{collection?.title || "Vault"}</h1>
          <p style={{ color: "#818cf8", fontWeight: "bold" }}>{items.length} ITEMS</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "16px" }}>
          {items.map((item) => (
            <div key={item.id} style={{ position: "relative", aspectRatio: "1/1", borderRadius: "20%", overflow: "hidden", border: "1px solid #27272a" }}>
              {/* Only show delete if user is logged in and matches collection owner */}
              {currentUserId === collection?.user_id && (
                <button
                  onClick={(e) => deleteItem(item.id, e)}
                  style={{ position: "absolute", top: "5px", right: "5px", zIndex: 10, background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontWeight: "bold" }}
                >✕</button>
              )}
              <img src={item.image_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
