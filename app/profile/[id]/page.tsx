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
  cover_url?: string | null;
  items?: { image_url: string }[]; // We fetch this for the cover fallback
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const [vaultValue, setVaultValue] = useState(0);
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
  const [itemValue, setItemValue] = useState("");
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
        // 1. Profile
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (prof) setProfile(prof);

        // 2. Stats
        const { data: items } = await supabase.from("items").select("estimated_value").eq("user_id", userId);
        if (items) {
          setItemCount(items.length);
          setVaultValue(items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0));
        }

        // 3. Collections + Sub-fetch items for the cover fallback
        const { data: colls } = await supabase.from("collections")
          .select(`*, items(image_url)`)
          .eq("user_id", userId);
        setCollections(colls || []);

        // 4. Recent Drops
        const { data: drops } = await supabase.from("items")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(6);
        setRecentDrops(drops || []);

      } catch (err) { 
        console.error("Vault Error:", err); 
      } finally { 
        setLoading(false); 
      }
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
      const { data: newColl, error: collError } = await supabase.from("collections").insert({
        user_id: userId,
        title: newCollName,
        niche: finalNiche
      }).select().single();

      if (collError) throw collError;

      if (files.length > 0) {
        for (const file of files) {
          const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          await supabase.storage.from("item-images").upload(fileName, file);
          const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
          
          await supabase.from("items").insert({
            user_id: userId,
            title: itemName || "Untitled",
            image_url: publicUrl,
            estimated_value: parseFloat(itemValue) || 0,
            collection_id: newColl.id,
            status: "active"
          });
        }
      }
      window.location.reload();
    } catch (err) { alert("Launch failed"); } finally { setUploading(false); }
  }

  const getBadge = () => {
    const user = profile?.username?.toLowerCase();
    if (["stacypearce", "rich", "ceomum"].includes(user || "")) return "/founder.png";
    if (profile?.membership_tier?.toLowerCase() === "diamond") return "/diamond.png";
    return null;
  };

  if (loading) return <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>RESTORING VAULT...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* FULL PROFILE HEADER */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '32px', padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '120px', height: '120px', borderRadius: '24px', objectFit: 'cover', border: '4px solid #18181b', marginBottom: '20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>{profile?.display_url || profile?.username}</h1>
              {getBadge() && <img src={getBadge()!} style={{ width: '32px', height: '32px' }} />}
            </div>
            <p style={{ color: '#818cf8', fontWeight: 'bold', margin: '0 0 16px 0' }}>@{profile?.username}</p>
            <p style={{ color: '#a1a1aa', maxWidth: '450px', lineHeight: '1.5', marginBottom: '24px' }}>{profile?.bio || "Digital Vault Explorer."}</p>
            
            {isOwnProfile && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowAddItem(true)} style={{ background: '#fff', color: '#000', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', fontSize: '13px' }}>+ ITEM</button>
                <button onClick={() => setShowAddCollection(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', fontSize: '13px' }}>+ COLL</button>
                <button onClick={handleLogout} style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#f87171', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', fontSize: '13px' }}>LOGOUT</button>
              </div>
            )}
        </section>

        {/* STATS */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div><p style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{itemCount}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>ITEMS</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{collections.length}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>COLLS</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: '900', color: '#4ade80', margin: 0 }}>£{vaultValue.toLocaleString()}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>VALUE</p></div>
          </div>
        </section>

        {/* COLLECTIONS GRID (The Visual Fix) */}
        <section>
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px' }}>COLLECTIONS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {collections.map((c) => {
                    // Logic: Use cover_url OR the first item's image as background
                    const displayImg = c.cover_url || c.items?.[0]?.image_url;
                    
                    return (
                        <Link href={`/collections/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                            <div style={{ background: '#18181b', aspectRatio: '1/1', borderRadius: '32px', border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                {displayImg && (
                                  <img src={displayImg} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} alt="" />
                                )}
                                <span style={{ position: 'relative', zIndex: 2, fontWeight: '900', fontSize: '16px', textTransform: 'uppercase', color: '#fff', textAlign: 'center', padding: '0 10px', textShadow: '0 2px 10px rgba(0,0,0,1)' }}>{c.title}</span>
                                <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.8)', padding: '6px 12px', borderRadius: '10px', fontSize: '10px', color: '#fff', fontWeight: '900', border: '1px solid #27272a', zIndex: 2 }}>VIEW ↗</div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>

        {/* RECENT DROPS */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px' }}>RECENT DROPS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {recentDrops.map((drop) => (
                <div key={drop.id} onClick={() => router.push(`/items/${drop.id}`)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #27272a' }}>
                  <img src={drop.image_url || "/default-item.png"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </div>
            ))}
          </div>
        </section>

        <SuggestedUsers />
      </main>

      {/* MODAL: ADD COLLECTION + NICHE FIX */}
      {showAddCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', textAlign: 'center', marginBottom: '20px' }}>CREATE VAULT</h2>
            <input placeholder="Vault Title" value={newCollName} onChange={e => setNewCollName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '12px', boxSizing: 'border-box' }} />
            <select value={selectedNiche} onChange={(e) => setSelectedNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
              <option value="">Category</option>
              <option value="Pokemon">Pokemon</option>
              <option value="Basketball">Basketball</option>
              <option value="Other">Other...</option>
            </select>
            {selectedNiche === "Other" && (
              <input placeholder="Specify Niche" value={customNiche} onChange={e => setCustomNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #818cf8', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px', boxSizing: 'border-box' }} />
            )}
            <hr style={{ border: '0', borderTop: '1px solid #27272a', margin: '20px 0' }} />
            <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} style={{ fontSize: '12px', color: '#a1a1aa' }} />
            {files.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <input placeholder="Items Title" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px', marginBottom: '8px', boxSizing: 'border-box' }} />
                <input placeholder="Value per item (£)" type="number" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px', boxSizing: 'border-box' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowAddCollection(false)} style={{ flex: 1, background: 'none', color: '#52525b', border: 'none', fontWeight: '900' }}>CANCEL</button>
              <button onClick={handleCreateCollection} disabled={uploading} style={{ flex: 2, background: '#fff', color: '#000', borderRadius: '12px', fontWeight: '900', padding: '12px' }}>{uploading ? 'LAUNCHING...' : 'CREATE'}</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
