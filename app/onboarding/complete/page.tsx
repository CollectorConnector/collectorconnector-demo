"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function OnboardingComplete() {
  // Optional: auto‑redirect after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Onboarding Complete
      </h1>

      <p style={{ fontSize: "1.1rem", opacity: 0.8, marginBottom: "2rem" }}>
        Your seller account is now active.  
        You can now list items for sale.
      </p>

      <Link
        href="/"
        style={{
          background: "#ffcc00",
          color: "#000",
          padding: "0.8rem 1.6rem",
          borderRadius: "8px",
          fontWeight: "600",
          textDecoration: "none",
        }}
      >
        Return Home
      </Link>

      <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", opacity: 0.5 }}>
        Redirecting automatically…
      </p>
    </div>
  );
}
