"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ImportInstagramModal from "@/components/ImportInstagramModal";
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
  cover_url?: string;
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

  // UI STATES
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // INPUTS
  const [newCollName, setNewCollName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState(""); 
  const [customNiche, setCustomNiche] = useState("");
  const [itemName, setItemName] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    async function loadAllData() {
      try {
        setLoading(true);
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (prof) setProfile(prof);
        
        const { data: items } = await supabase.from("items").select("id").eq("user_id", userId);
        if (items) setItemCount(items.length);

        const { data: colls } = await supabase.from("collections").select(`*, items (image_url)`).eq("user_id", userId);
        setCollections(colls || []);

        const { data: drops } = await supabase.from("items").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(6);
        setRecentDrops(drops || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    loadAllData();
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  async function handleCreateCollection() {
    if (!newCollName || !userId) return;
    setUploading(true);
    const finalNiche = selectedNiche === "Other" ? customNiche : selectedNiche;
    try {
      const { data: newColl } = await supabase.from("collections").insert({
        user_id: userId,
        title: newCollName,
        niche: finalNiche
      }).select().single();

      if (files.length > 0) {
        for (const file of files) {
          const fileName = `${userId}/${Date.now()}.jpg`;
          await supabase.storage.from("item-images").upload(fileName, file);
          const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
          await supabase.from("items").insert({
            user_id: userId,
            title: itemName || "Untitled",
            image_url: publicUrl,
            collection_id: newColl.id,
            status: "active"
          });
        }
      }
      window.location.reload();
    } catch (err) { alert("Error"); } finally { setUploading(false); }
  }

  // BUG FIX 1: DIAMOND BADGE LOGIC (Strict String Return)
  const getBadgeSrc = (): string | null => {
    const user = profile?.username?.toLowerCase();
    const tier = profile?.membership_tier?.toLowerCase();
    if (["stacypearce", "rich", "ceomum"].includes(user || "")) return "/founder.png";
    if (tier === "diamond") return "/diamond.png";
    return null;
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black">SYNCING VAULT...</div>;

  const badge = getBadgeSrc();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* HEADER */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '120px', height: '120px', borderRadius: '20px', objectFit: 'cover', border: '4px solid #18181b', marginBottom: '24px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800' }}>{profile?.display_url || profile?.username}</h1>
              {/* FIX: Using a constant to avoid TS null errors */}
              {badge && <img src={badge} style={{ width: '38px' }} alt="Tier" />}
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

        {/* BUG FIX 2: COLLECTION SQUIRCLES (Fixed 32px Radius) */}
        <section>
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px' }}>COLLECTIONS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {collections.map((c) => (
                    <Link href={`/collections/${c.id}`} key={c.id}>
                        <div style={{ background: '#18181b', aspectRatio: '1/1', borderRadius: '32px', border: '1px solid #27272a', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {c.items?.[0] && <img src={c.items[0].image_url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />}
                            <span style={{ position: 'relative', fontWeight: '900', textTransform: 'uppercase', textAlign: 'center', padding: '0 10px' }}>{c.title}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

        {/* BUG FIX 3: RECENT DROPS LOGOUT FIX (Correct routing to [itemId]) */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px' }}>RECENT DROPS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {recentDrops.map((drop) => (
              <div 
                key={drop.id} 
                onClick={() => router.push(`/items/${drop.id}`)} 
                style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #27272a' }}
              >
                <img src={drop.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </section>

        {/* ROADMAP SECTION (COMING SOON) */}
        <section style={{ background: 'linear-gradient(180deg, #09090b 0%, #000 100%)', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', marginTop: '20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '900', color: '#818cf8', letterSpacing: '2px', marginBottom: '20px' }}>COMING SOON</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'left' }}>
            {["Valuation Checker", "ISO: Wanted Board", "Whale Launchpad", "Niche Meccas", "Messenger", "Verified Market"].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3f3f46' }}></div>
                <p style={{ color: '#a1a1aa', fontSize: '12px', fontWeight: 'bold' }}>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <SuggestedUsers />
      </main>

      {/* MODALS */}
      {showAddCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px' }}>NEW VAULT</h2>
            <input placeholder="Title" value={newCollName} onChange={e => setNewCollName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '20px' }} />
            <button onClick={handleCreateCollection} disabled={uploading} style={{ width: '100%', background: '#fff', color: '#000', fontWeight: '900', padding: '14px', borderRadius: '12px' }}>CREATE</button>
            <button onClick={() => setShowAddCollection(false)} style={{ width: '100%', background: 'none', color: '#52525b', marginTop: '10px' }}>CANCEL</button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
