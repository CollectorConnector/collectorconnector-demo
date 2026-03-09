"use client";

import Image from "next/image";

export default function ProfilePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "24px 20px",
        fontFamily: "inherit",
      }}
    >
      {/* HEADER: NAME + BADGE */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
            Stacy Pearce
          </h1>

          <img
            src="/gold.png"
            alt="Gold Badge"
            style={{ height: 26, width: 26, objectFit: "contain" }}
          />
        </div>

        <p style={{ color: "#A1A1A1", marginTop: 6 }}>
          Collector of watches, Pokémon cards, coins & pub history
        </p>

        <p style={{ color: "#A1A1A1", marginTop: 4 }}>Swindon, UK</p>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          background: "#111",
          padding: "16px 20px",
          borderRadius: 12,
          marginBottom: 32,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>2.1k</p>
          <p style={{ color: "#A1A1A1", fontSize: 13 }}>Items</p>
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>4</p>
          <p style={{ color: "#A1A1A1", fontSize: 13 }}>Categories</p>
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>90.8</p>
          <p style={{ color: "#A1A1A1", fontSize: 13 }}>Rarity</p>
        </div>
      </div>

      {/* COLLECTIONS */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        Collections
      </h2>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 32,
        }}
      >
        {["Cards", "Watches", "Coins", "Memorabilia"].map((c) => (
          <div
            key={c}
            style={{
              padding: "10px 16px",
              background: "#111",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {c}
          </div>
        ))}
      </div>

      {/* ACTIVITY */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        Activity
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ position: "relative" }}>
          <img
            src="/charizard.png"
            alt="Featured Card"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 10,
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              background: "#fff",
              color: "#000",
              padding: "2px 6px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Featured
          </div>
        </div>

        <img
          src="/watch.png"
          alt="Watch"
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 10,
            objectFit: "cover",
          }}
        />

        <img
          src="/coin.png"
          alt="Coin"
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 10,
            objectFit: "cover",
          }}
        />
      </div>

      {/* POST */}
      <div style={{ marginBottom: 80 }}>
        <p style={{ color: "#A1A1A1", fontSize: 13, marginBottom: 6 }}>
          2 hours ago
        </p>

        <p style={{ fontSize: 15 }}>
          Just added this one to the collection. What do you think
        </p>
      </div>
    </div>
  );
}
