"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function IndividualVaultPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params?.id as string;

  const [items, setItems] = useState<any[]>([]);
  const [vaultTitle, setVaultTitle] = useState("VAULT");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vaultId) loadVaultContent();
  }, [vaultId]);

  async function loadVaultContent() {
    try {
      setLoading(true);

      // 1️⃣ Fetch vault title
      const { data: vData, error: vError } = await supabase
        .from("collections")
        .select("title")
        .eq("id", vaultId)
        .single();

      if (vData?.title) setVaultTitle(vData.title);
      if (vError) console.log("Collection Title Error:", vError.message);

      // 2️⃣ Fetch items using the correct column name
      const { data: itemData, error: itemErr } = await supabase
        .from("items")
        .select("*")
        .eq("collection_id", vaultId);

      if (itemErr) throw itemErr;

      setItems(itemData || []);
    } catch (err) {
      console.error("Vault Content Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main
        style={{
          marginTop: "100px",
          padding: "0 20px",
          maxWidth: "800px",
          margin: "100px auto 0",
          minHeight: "70vh",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "#18181b",
            border: "1px solid #27272a",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "11px",
            fontWeight: "bold",
            marginBottom: "24px",
            cursor: "pointer",
          }}
        >
          ← BACK
        </button>

        <h1
          style={{
            textAlign: "center",
            fontSize: "38px",
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: "-1px",
          }}
        >
          {vaultTitle}
        </h1>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "100px 0",
              color: "#52525b",
            }}
          >
            LOADING VAULT...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "100px 0",
              border: "1px dashed #27272a",
              borderRadius: "24px",
              marginTop: "40px",
            }}
          >
            <p
              style={{
                color: "#52525b",
                fontWeight: "900",
                fontSize: "14px",
                textTransform: "uppercase",
              }}
            >
              No items found in this vault
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginTop: "40px",
              paddingBottom: "60px",
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#09090b",
                  borderRadius: "24px",
                  border: "1px solid #27272a",
                  overflow: "hidden",
                }}
              >
                <div style={{ aspectRatio: "1/1", background: "#18181b" }}>
                  <img
                    src={item.image_url}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div style={{ padding: "16px" }}>
                  <p
                    style={{
                      fontWeight: "900",
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      color: "#4ade80",
                      fontWeight: "900",
                      fontSize: "12px",
                    }}
                  >
                    £{item.estimated_value || 0}
                  </p>
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
