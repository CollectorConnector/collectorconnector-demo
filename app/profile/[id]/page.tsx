"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  tier: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  ebay: string | null;
  whatnot: string | null;
  discord: string | null;
  website: string | null;
};

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (!data) {
        // no profile for this id → you could redirect or show 404
        setLoading(false);
        return;
      }

      setProfile(data as Profile);
      setLoading(false);
    }

    loadProfile();
  }, [id]);

  const tierIconMap: Record<string, string> = {
    diamond: "/diamond.png",
    founder: "/founder.png",
    gold: "/gold.png",
    silver: "/silver.png",
    bronze: "/bronze.png",
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "inherit",
        }}
      >
        <p>Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "inherit",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ marginBottom: 12 }}>Profile not found.</p>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: "1px solid #333",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Go home
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile.display_name || profile.username || "Collector";
  const username = profile.username ? `@${profile.username}` : "";
  const bio = profile.bio || "Collector on CollectorConnector";
  const location = profile.location || "";
  const tierKey = (profile.tier || "").toLowerCase();
  const tierIcon = tierIconMap[tierKey];

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
      {/* HEADER: AVATAR + NAME + BADGE */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName}
              width={72}
              height={72}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
            {displayName}
          </h1>

          {tierIcon && (
            <img
              src={tierIcon}
              alt={`${profile.tier} badge`}
              style={{ height: 26, width: 26, objectFit: "contain" }}
            />
          )}
        </div>

        {username && (
          <p style={{ color: "#A1A1A1", marginTop: 4, fontSize: 14 }}>
            {username}
          </p>
        )}

        {bio && (
          <p style={{ color: "#A1A1A1", marginTop: 6 }}>{bio}</p>
        )}

        {location && (
          <p style={{ color: "#A1A1A1", marginTop: 4 }}>{location}</p>
        )}
      </div>

      {/* STATS – still static for now, can be wired to items/collections later */}
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

      {/* COLLECTIONS – still static labels for now */}
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

      {/* ACTIVITY – still using your static images for now */}
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

      {/* POST – static for now */}
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
