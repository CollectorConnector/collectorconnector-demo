"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function BuyPage() {
  const params = useParams();
  const itemId = params.id;

  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/item/${itemId}`)
      .then(res => res.json())
      .then(data => setItem(data));
  }, [itemId]);

  if (!item) {
    return (
      <div style={{ color: "#fff", padding: "40px" }}>
        Loading item...
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", color: "#fff" }}>
      <h1 style={{ fontSize: "26px", fontWeight: "900", marginBottom: "10px" }}>
        {item.title}
      </h1>

      <p style={{ fontSize: "18px", marginBottom: "20px" }}>
        Price: <strong>£{item.price}</strong>
      </p>

      <button
        onClick={async () => {
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId }),
          });

          const { url } = await res.json();
          window.location.href = url;
        }}
        style={{
          background: "#22c55e",
          color: "#000",
          padding: "14px 22px",
          borderRadius: "12px",
          fontWeight: "900",
          fontSize: "16px",
          cursor: "pointer",
          border: "none",
        }}
      >
        Pay Now
      </button>
    </div>
  );
}

