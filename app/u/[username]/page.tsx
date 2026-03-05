
// app/u/[username]/page.tsx

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;

  // FETCH PROFILE
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url")
    .eq("username", username)
    .maybeSingle();

  if (profileErr) console.error("Profile fetch error:", profileErr);

  if (!profile) {
    return (
      <div style={{ background: "black", color: "white", padding: 40 }}>
        <h1 style={{ color: "#4ADE80" }}>Profile not found</h1>
        <p>No user found for @{username}</p>
        <Link href="/" style={{ color: "#4ADE80" }}>Go Home</Link>
      </div>
    );
  }

  // FETCH COLLECTIONS
  const { data: collections, error: collErr } = await supabase
    .from("collections")
    .select("id, title, niche, cover_url, item_count, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (collErr) console.error("Collections fetch error:", collErr);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          height: 64,
          borderBottom: "1px solid #1f1f1f",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/CC-SML-Logo.png"
              alt="CC Logo"
              width={42}
              height={42}
              style={{ borderRadius: 8 }}
            />
            <span style={{ fontWeight: 800 }}>CollectorConnector</span>
          </Link>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          <Link href="/upload" style={{ color: "#4ADE80", fontWeight: 600 }}>
            Upload
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <header
        style={{
          padding: "32px 16px",
          borderBottom: "1px solid #1f1f1f",
          background:
            "radial-gradient(1200px 480px at 10% -10%, rgba(74,222,128,0.10), rgba(0,0,0,0))",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "100px 1fr",
            gap: 16,
          }}
        >
          {/* AVATAR */}
          <div
            style={{
              width: 100,
              height: 100,
              overflow: "hidden",
              borderRadius: 16,
              border: "1px solid #262626",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url || "/default-avatar.png"}
              alt={profile.display_name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* PROFILE INFO */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
              {profile.display_name || profile.username}
            </h1>
            <div style={{ color: "#9CA3AF" }}>@{profile.username}</div>
            {profile.bio && (
              <p style={{ maxWidth: 740, color: "#E5E7EB" }}>{profile.bio}</p>
            )}
          </div>
        </div>
      </header>

      {/* COLLECTIONS */}
      <main style={{ padding: "24px 16px", flex: 1 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          {/* SECTION TITLE */}
          <h2
            style={{
              margin: "8px 0 16px",
              fontSize: 18,
              fontWeight: 800,
              color: "#E5E7EB",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: "#4ADE80",
                borderRadius: "50%",
                boxShadow: "0 0 10px #4ADE80",
              }}
            />
            Collections
          </h2>

          {/* EMPTY STATE */}
          {!collections || collections.length === 0 ? (
            <div
              style={{
                border: "1px dashed #1f1f1f",
                color: "#9CA3AF",
                padding: 20,
                borderRadius: 12,
              }}
            >
              No collections yet.
            </div>
          ) : (
            /* GRID */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              {collections.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/u/${profile.username}/collection/${c.id}`}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid #1f1f1f",
                    borderRadius: 14,
                    overflow: "hidden",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))",
                  }}
                >
                  <div style={{ position: "relative", height: 160 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.cover_url}
                      alt={c.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                    {/* GRADIENT OVERLAY */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)",
                      }}
                    />

                    {/* TEXT */}
                    <div
                      style={{
                        position: "absolute",
                        left: 12,
                        bottom: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>{c.title}</div>
                      <div style={{ fontSize: 13, color: "#9CA3AF" }}>
                        {c.item_count ?? 0} items
                        {c.niche ? ` · ${c.niche}` : ""}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          padding: "18px 16px",
          borderTop: "1px solid #1f1f1f",
          color: "#9CA3AF",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/CC-SML-Logo.png"
            alt="CC Logo"
            width={32}
            height={32}
            style={{ opacity: 0.75 }}
          />
          <span style={{ fontSize: 13 }}>
            © {new Date().getFullYear()} CollectorConnector
          </span>

          <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            <Link href="/terms" style={{ color: "#9CA3AF" }}>
              Terms
            </Link>
            <Link href="/privacy" style={{ color: "#9CA3AF" }}>
              Privacy
            </Link>
            <Link href="/cookies" style={{ color: "#9CA3AF" }}>
              Cookies
            </Link>
            <Link href="/guidelines" style={{ color: "#9CA3AF" }}>
              Guidelines
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
