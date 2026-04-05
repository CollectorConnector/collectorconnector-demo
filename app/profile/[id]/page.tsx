"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";
import Header from "@/components/Header";
import Link from "next/link";

const PRESET_NICHES = ["Sports Cards", "Pokémon", "Comics", "Sneakers", "Watches", "Vinyl Records", "Vinyls", "Coins", "Other"];

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || "";

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [vaultValue, setVaultValue] = useState(0);
  const [recentDrops, setRecentDrops] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // UI Modals
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  
  // Form States
  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [niche, setNiche] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [newCollName, setNewCollName] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    async function loadData() {
      try {
        setLoading(true);
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();
        setProfile(prof);

        const { data: items } = await supabase.from("items").select("*").eq("user_id", userId);
        if (items) {
          setItemCount(items.length);
          setVaultValue(items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0));
        }

        const { data: colls, count } = await supabase.from("collections").select("*", { count: 'exact' }).eq("user_id", userId);
        setCollectionCount(count || 0);
        setCollections(colls || []);

        const { data: drops } = await supabase.from("items").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(6);
        setRecentDrops(drops || []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  async function handlePostItem() {
    if (!files.length || !niche) return alert("Select photos and a niche!");
    setUploading(true);
    try {
      for (const file of files) {
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        await supabase.storage.from("item-images").upload(fileName, file);
        const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
        
        await supabase.from("items").insert({ 
          user_id: userId, 
          title: itemName || "Vault Item", 
          image_url: publicUrl, 
          estimated_value: parseFloat(itemValue) || 0, 
          niche_family: niche, 
          collection_id: selectedCollectionId || null
        });
      }
      window.location.reload();
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateCollection() {
    if (!newCollName) return;
    setUploading(true);
    const { error } = await supabase.from("collections").insert({ user_id: userId, title: newCollName });
    if (error) alert(error.message); else window.location.reload();
  }

  const getBadge = () => {
    const user = profile?.username?.toLowerCase();
    if (user === "stacypearce" || user === "rich" || user === "ceomum") return "/founder.png";
    if (profile?.membership_tier?.toLowerCase() === "diamond") return "/diamond.png";
    return null;
  };

  if (loading) return <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>SYNCING VAULT...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'sans-serif' }}>
      <Header />
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* PROFILE CARD */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '120px', height: '120px', borderRadius: '20px', objectFit: 'cover', border: '4px solid #18181b', marginBottom: '24px' }} alt="Avatar" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>{profile?.display_url || profile?.username}</h1>
              {getBadge() && <img src={getBadge() || undefined} style={{ width: '32px', height: '32px' }} alt="Badge" />}
            </div>
            <p style={{ color: '#818cf8', fontSize: '18px', margin: '8px 0' }}>@{profile?.username}</p>
            <p style={{ color: '#a1a1aa', fontSize: '16px', marginBottom: '24px' }}>{profile?.bio || "Digital Vault Explorer."}</p>
            {isOwnProfile && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={() => setShowAddItem(true)} style={{ background: '#fff', color: '#000', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', border: 'none', cursor: 'pointer' }}>+ ITEM</button>
                <button onClick={() => setShowAddCollection(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>+ COLL</button>
                <button onClick={handleLogout} style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#f87171', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>LOGOUT</button>
              </div>
            )}
        </section>

        {/* STATS */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
            <div><p style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{itemCount}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>ITEMS</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{collectionCount}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>COLLS</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: '900', color: '#4ade80', margin: 0 }}>£{vaultValue.toLocaleString()}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>VALUE</p></div>
        </section>

        {/* COLLECTIONS (SQUIRCLES) */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px' }}>COLLECTIONS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {collections.map((c) => (
                    <Link href={`/collections/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                        <div style={{ background: '#18181b', aspectRatio: '1/1', borderRadius: '32px', border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <span style={{ fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', color: '#fff' }}>{c.title}</span>
                            <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', color: '#818cf8', fontWeight: 'bold' }}>VIEW ↗</div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

        {/* RECENT DROPS */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px' }}>RECENT DROPS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {recentDrops.map((drop) => (
                    <div key={drop.id} onClick={() => router.push(`/items/${drop.id}`)} style={{ aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', border: '1px solid #27272a', cursor: 'pointer' }}>
                        <img src={drop.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Drop" />
                    </div>
                ))}
            </div>
        </section>
        
        <SuggestedUsers />
      </main>

      {/* MODALS (ADD ITEM / ADD COLL) */}
      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '450px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>VAULT DROP</h2>
            <input placeholder="Item Title" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />
            <select value={selectedCollectionId} onChange={e => setSelectedCollectionId(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px', boxSizing: 'border-box' }}>
                <option value="">No Collection</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <select value={niche} onChange={e => setNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px', boxSizing: 'border-box' }}>
              <option value="" disabled>Select Niche</option>
              {PRESET_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <input placeholder="Estimated Value (£)" type="number" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '15px', boxSizing: 'border-box' }} />
            <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files || []))} style={{ color: '#71717a', marginBottom: '20px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowAddItem(false)} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={handlePostItem} disabled={uploading} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px', cursor: 'pointer' }}>{uploading ? 'DROPPING...' : 'VAULT ITEMS'}</button>
            </div>
          </div>
        </div>
      )}

      {showAddCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>NEW COLLECTION</h2>
            <input placeholder="Collection Title" value={newCollName} onChange={e => setNewCollName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '20px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowAddCollection(false)} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={handleCreateCollection} disabled={uploading} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px', cursor: 'pointer' }}>CREATE</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
