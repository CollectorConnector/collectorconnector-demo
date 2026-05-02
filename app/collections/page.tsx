"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

function List() {
  const router = useRouter();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    supabase
      .from("collections")
      .select(`
        id,
        title,
        name,
        created_at,
        items (
          id,
          image_url,
          for_sale,
          status,
          audience,
          collection_id
        )
      `)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching collections:", error);
          setCollections([]);
          setLoading(false);
          return;
        }

        // Only show collections that actually have items
        const cleaned = (data || []).filter(
          (col) => col.items && col.items.length > 0
        );

        setCollections(cleaned);
        setLoading(false);
      });
  }, []);

  if (!loading && collections.length === 0) {
    return (
      <div style={{ textAlign: "center", paddingTop: "100px" }}>
        <p style={{ color: "#52525b", fontWeight: "900" }}>
          NO COLLECTIONS FOUND
        </p>
        <button
          onClick={() => router.back()}
          style={{
            color: "#818cf8",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          GO BACK
        </button>
      </div>
    );
  }

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "100px auto 0",
        padding: "0 16px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <h1
          style={{
            fontSize: "32px",
            fontWeight: "900",
            textTransform: "uppercase",
          }}
        >
          All Collections
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        {collections.map((c) => {
          const hasItemsForSale = c.items?.some((i: any) => i.for_sale);
          const itemCount = c.items?.length || 0;
          const previewImage = c.items?.[0]?.image_url;

          return (
            <Link
              href={`/collections/${c.id}`}
              key={c.id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  background: "#111",
                  aspectRatio: "1/1",
                  borderRadius: "24px",
                  border: "1px solid #27272a",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={c.title}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: 0.5,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(45deg, #18181b, #27272a)",
                    }}
                  />
                )}

                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    textAlign: "center",
                    padding: "16px",
                  }}
                >
                  <p
                    style={{
                      fontWeight: "900",
                      textTransform: "uppercase",
                      fontSize: "14px",
                      letterSpacing: "1px",
                      textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                    }}
                  >
                    {c.title}
                  </p>

                  <span
                    style={{
                      fontSize: "10px",
                      color: "#818cf8",
                      fontWeight: "bold",
                      display: "block",
                    }}
                  >
                    {itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"}
                  </span>

                  {hasItemsForSale && (
                    <div
                      style={{
                        marginTop: "8px",
                        background: "#22c55e",
                        color: "#000",
                        fontSize: "9px",
                        fontWeight: "900",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        display: "inline-block",
                      }}
                    >
                      FOR SALE
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

export default function CollectionsListPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <Suspense
        fallback={
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#000",
              color: "#fff",
              fontWeight: "900",
            }}
          >
            LOADING VAULT...
          </div>
        }
      >
        <List />
      </Suspense>
      <Footer />
    </div>
  );
}
