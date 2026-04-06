"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";
import Header from "@/components/Header";
import Link from "next/link";

type Profile = {
  id: string;
  avatar_url?: string | null;
  display_url?: string | null;
  username?: string | null;
  bio?: string | null;
  membership_tier?: string | null; 
};

type Collection = {
  id: string;
  title: string;
  niche?: string;
  items?: { image_url: string }[];
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentDrops, setRecentDrops] = useState<any[]>([]);

  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [newCollName, setNewCollName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState(""); 
  const [customNiche, setCustomNiche] = useState("");
  const [itemName, setItemName] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    async function loadData() {
      try {
        setLoading(true);
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (prof) setProfile(prof);
        
        const { data: items } = await supabase.from("items").select("id").eq("user_id", userId);
        if (items) setItemCount(items?.length || 0);

        const { data: colls } = await supabase.from("collections").select(`*, items (image_url)`).eq("user_id", userId);
        setCollections(colls || []);

        const { data: drops } = await supabase.from("items").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(6);
        setRecentDrops(drops || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    loadData();
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const getBadgeSrc = (): string | null => {
    const user = (profile?.username || "").toLowerCase();
    const tier = (profile?.membership_tier || "").toLowerCase();
    
    // 1. Founders List
    if (["stacypearce", "rich", "ceomum"].includes(user)) return "/founder.png";
    // 2. Your 1/1 Diamond Tier
    if (tier === "diamond") return "/diamond.png";
    
    return null;
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black">SYNCING VAULT...</div>;

  const badge = getBadgeSrc();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* PROFILE HEADER */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '120px', height: '120px', borderRadius: '20px', objectFit: 'cover', border: '4px solid #18181b', marginBottom: '24px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800' }}>{profile?.display_url || profile?.username}</h1>
              {badge && <img src={badge} style={{ width: '38px' }} alt="Tier Badge" />}
            </div>
            <p style={{ color: '#818cf8', fontSize: '18px', marginBottom: '24px' }}>@{profile?.username}</p>
            {isOwnProfile && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowAddItem(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>+ ITEM</button>
                <button onClick={() => setShowAddCollection(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>+ COLLECTION</button>
                <button onClick={handleLogout} style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#f87171', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>LOGOUT</button>
              </div>
            )}
        </section>

        {/* STATS */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
            <div><p style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{itemCount}</p><p style={{ color: '#52525b', fontSize: '11px' }}>ITEMS</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{collections.length}</p><p style={{ color: '#52525b', fontSize: '11px' }}>COLLS</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: '900', color: '#818cf8', margin: 0 }}>↗</p><p style={{ color: '#52525b', fontSize: '11px' }}>VIEW ALL</p></div>
          </div>
        </section>

        {/* COLLECTIONS (SQUIRCLES) */}
        <section>
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px' }}>COLLECTIONS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {collections.map((c) => (
                    <Link href={`/collections/${c.id}`} key={c.id}>
                        <div style={{ background: '#18181b', aspectRatio: '1/1', borderRadius: '32px', border: '1px solid #27272a', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {c.items?.[0] && <img src={c.items[0].image_url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />}
                            <span style={{ position: 'relative', fontWeight: '900', textTransform: 'uppercase' }}>{c.title}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

        {/* RECENT DROPS (LOGOUT BUG FIXED) */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px' }}>RECENT DROPS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {recentDrops.map((drop) => (
              <div key={drop.id} onClick={() => router.push(`/items/${drop.id}`)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #27272a' }}>
                <img src={drop.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </section>

        <SuggestedUsers />
      </main>
      <Footer />
    </div>
  );
}
