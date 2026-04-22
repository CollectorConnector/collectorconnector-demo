"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      const { data } = await supabase
        .from("items")
        .select("*")
        .eq("for_sale", true)
        .eq("sold", false); // optional: hide sold items if you track this

      setItems(data || []);
      setLoading(false);
    }

    loadItems();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
        }}
      >
        LOADING MARKETPLACE...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <Header />

      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          paddingTop: "120px",
          paddingBottom: "100px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "900",
            textTransform: "uppercase",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          Marketplace
        </h1>

        {items.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#71717a",
              fontWeight: "bold",
            }}
          >
            No items are currently for sale.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "16px",
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/collections/${item.collection}`)}
                style={{
                  position: "relative",
                  aspectRatio: "1/1",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid #27272a",
                  background: "#09090b",
                  cursor: "pointer",
                }}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* PRICE BADGE */}
                {item.price !== null && item.price !== undefined && (
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "#22c55e",
                      color: "#000",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "800",
                      zIndex: 20,
                    }}
                  >
                    £{item.price}
                  </div>
                )}

                {/* BUY BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/buy/${item.id}`);
                  }}
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    background: "#22c55e",
                    color: "#000",
                    padding: "6px 12px",
                    borderRadius: "12px",
                    fontWeight: "900",
                    fontSize: "12px",
                    zIndex: 30,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  BUY
                </button>

                {/* TITLE BAR */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    width: "100%",
                    background: "rgba(0,0,0,0.6)",
                    padding: "6px",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  {item.title || "Untitled"}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
