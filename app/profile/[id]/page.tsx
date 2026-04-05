"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";
import Header from "@/components/Header";
import Link from "next/link";

const PRESET_NICHES = ["Sports Cards", "Pokémon", "Comics", "Sneakers", "Watches", "Vinyl Records", "Stamps", "Coins", "Other"];

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
  const [userNiches, setUserNiches] = useState<string[]>([]);

  // UI Modals
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form States
  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState(""); // NEW
  const [newCollName, setNewCollName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [editBio, setEditBio] = useState("");
  const [editName, setEditName] = useState("");

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
        if (prof) {
            setProfile(prof);
            setEditBio(prof.bio || "");
            setEditName(prof.display_url || prof.username || "");
        }

        const { data: items } = await supabase.from("items").select("*").eq("user_id", userId);
        if (items) {
          setItemCount(items.length);
          setVaultValue(items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0));
          const uniqueNiches = Array.from(new Set(items.map(i => i.niche_family).filter(Boolean)));
          setUserNiches(uniqueNiches as string[]);
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
    router.push("/");
  };

  async function handlePostItem() {
    if (!file || !userId || !niche) return;
    setUploading(true);
    try {
      const finalNiche = niche === "Other" ? customNiche : niche;
      const fileName = `${userId}/${Date.now()}.jpg`;
      await supabase.storage.from("item-images").upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
      
      // Included collection_id in the insert
      await supabase.from("items").insert({ 
        user_id: userId, 
        title: itemName || "Untitled", 
        image_url: publicUrl, 
        estimated_value: parseFloat(itemValue) || 0, 
        niche_family: finalNiche, 
        collection_id: selectedCollectionId || null, // WIRED IN
        status: "active" 
      });
      window.location.reload();
    } catch (err) { alert("Post failed"); } finally { setUploading(false); }
  }

  async function handleCreateCollection() {
    if (!newCollName || !userId) return;
    setUploading(true);
    const { error } = await supabase.from("collections").insert({ user_id: userId, title: newCollName });
    if (error) {
        const { error: error2 } = await supabase.from("collections").insert({ user_id: userId, name: newCollName });
        if (error2) alert(error2.message); else window.location.reload();
    } else { window.location.reload(); }
  }

  async function handleUpdateProfile() {
    const { error } = await supabase.from("profiles").update({ bio: editBio, display_url: editName }).eq("id", userId);
    if (error) alert(error.message); else window.location.reload();
  }

  const getBadgeIcon = (): string | undefined => {
    const tier = profile?.membership_tier?.toLowerCase();
    const username = profile?.username?.toLowerCase();
    
    // HARD-WIRED FOUNDERS (RICH & MUM)
    if (username === "stacypearce" || username === "rich" || username === "ceomum") {
      return "/founder.png";
    }

    if (tier === 'diamond') return "/diamond.png";
    if (tier === 'gold') return "/gold.png";
    if (tier === 'silver') return "/silver.png";
    if (tier === 'bronze') return "/bronze.png";
    return undefined;
  };

  const badgeSrc = getBadgeIcon();

  if (loading) return <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>SYNCING VAULT...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'sans-serif' }}>
      <Header />
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* PROFILE CARD */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '24px' }}>
              <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '120px', height: '120px', borderRadius: '20px', objectFit: 'cover', border: '4px solid #18181b' }} alt="Avatar" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>{profile?.display_url || profile?.username}</h1>
              {badgeSrc && <img src={badgeSrc} style={{ width: '32px', height: '32px', objectFit: 'contain' }} alt="Tier Badge" />}
            </div>
            <p style={{ color: '#818cf8', fontSize: '18px', marginBottom: '8px', marginTop: 0 }}>@{profile?.username}</p>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
              {userNiches.map(n => (
                <span key={n} style={{ background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(129, 140, 248, 0.3)' }}>{n} Family</span>
              ))}
            </div>

            <p style={{ color: '#a1a1aa', fontSize: '16px', marginBottom: '24px', maxWidth: '400px' }}>{profile?.bio || "Digital Vault Explorer."}</p>

            {isOwnProfile && (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setShowAddItem(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>+ ITEM</button>
                <button onClick={() => setShowAddCollection(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>+ COLL</button>
                <button onClick={() => setShowEditProfile(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>EDIT</button>
                <button onClick={handleLogout} style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#f87171', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>LOGOUT</button>
              </div>
            )}
        </section>

        {/* STATS */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div><p style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{itemCount}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold', margin: 0 }}>ITEMS</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{collectionCount}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold', margin: 0 }}>COLLS</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: '900', color: '#4ade80', margin: 0 }}>£{vaultValue.toLocaleString()}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold', margin: 0 }}>VALUE</p></div>
          </div>
        </section>

        {/* SQUIRCLE COLLECTIONS LIST */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px', color: '#fff' }}>COLLECTIONS</h2>
            {collections.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {collections.map((c) => (
                    <Link href={`/collections/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                        <div style={{ 
                            background: '#18181b', 
                            aspectRatio: '1/1', 
                            borderRadius: '32px', 
                            border: '1px solid #27272a',
                            overflow: 'hidden',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.2s'
                        }}>
                            <div style={{ textAlign: 'center', padding: '10px' }}>
                                <span style={{ color: '#fff', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{c.title || c.name}</span>
                            </div>
                            <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: '10px', fontSize: '10px', color: '#818cf8', fontWeight: 'bold', border: '1px solid rgba(129, 140, 248, 0.3)' }}>
                                VIEW ↗
                            </div>
                        </div>
                    </Link>
                ))}
                </div>
            ) : (
                <p style={{ color: '#52525b', fontSize: '14px', textAlign: 'center', margin: '20px 0' }}>No collections started yet.</p>
            )}
        </section>

        {/* RECENT DROPS */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>RECENT DROPS</h2>
            <img src="/CC-SML-Logo.png" style={{ width: '18px', height: '18px' }} alt="Logo" />
          </div>
          {recentDrops.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {recentDrops.map((drop) => (
                <div key={drop.id} onClick={() => router.push(`/items/${drop.id}`)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #27272a' }}>
                    <img src={drop.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Drop" />
                </div>
                ))}
            </div>
          ) : (
            <p style={{ color: '#52525b', fontSize: '14px', textAlign: 'center', margin: '20px 0' }}>Vault is currently empty.</p>
          )}
        </section>

        <SuggestedUsers />
      </main>

      {/* MODALS */}
      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px', textAlign: 'center', color: '#fff' }}>NEW ITEM</h2>
            
            <input placeholder="Item Title" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />
            
            {/* COLLECTION SELECTOR */}
            <select 
                value={selectedCollectionId} 
                onChange={e => setSelectedCollectionId(e.target.value)}
                style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px', boxSizing: 'border-box' }}
            >
                <option value="">No Collection (General Vault)</option>
                {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.title || c.name}</option>
                ))}
            </select>

            <select value={niche} onChange={e => setNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px', boxSizing: 'border-box' }}>
              <option value="" disabled>Select Niche Family</option>
              {PRESET_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            
            {niche === "Other" && (
              <input placeholder="What do you collect?" value={customNiche} onChange={e => setCustomNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #818cf8', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />
            )}
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                <input placeholder="Value (£)" type="number" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ flex: 1, background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', boxSizing: 'border-box' }} />
                <a href="https://130point.com/sales/" target="_blank" rel="noopener noreferrer" style={{ background: '#27272a', padding: '10px', borderRadius: '12px', color: '#fff', fontSize: '10px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center' }}>CHECK VALUE ↗</a>
            </div>

            {!preview ? (
              <label style={{ border: '2px dashed #3f3f46', borderRadius: '12px', padding: '30px', display: 'flex', justifyContent: 'center', cursor: 'pointer', color: '#71717a' }}>
                Upload Photo
                <input type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if(f){ setFile(f); setPreview(URL.createObjectURL(f)); }}} />
              </label>
            ) : (
              <img src={preview} style={{ width: '100%', borderRadius: '12px', marginBottom: '15px', maxHeight: '180px', objectFit: 'cover' }} alt="Preview" />
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => { setShowAddItem(false); setPreview(null); }} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={handlePostItem} disabled={uploading || !file || !niche} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px', opacity: (uploading || !file || !niche) ? 0.5 : 1, cursor: 'pointer' }}>
                {uploading ? 'POSTING...' : 'POST ITEM'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTHER MODALS (Add Collection & Edit Profile) STAY THE SAME AS BEFORE */}
      {showAddCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px', textAlign: 'center', color: '#fff' }}>NEW COLLECTION</h2>
            <input placeholder="Collection Name" value={newCollName} onChange={e => setNewCollName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '20px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowAddCollection(false)} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={handleCreateCollection} disabled={uploading} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px', cursor: 'pointer', opacity: uploading ? 0.5 : 1 }}>{uploading ? 'SAVING...' : 'CREATE'}</button>
            </div>
          </div>
        </div>
      )}

      {showEditProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>EDIT PROFILE</h2>
            <input placeholder="Display Name" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />
            <textarea placeholder="Bio" value={editBio} onChange={e => setEditBio(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '20px', boxSizing: 'border-box', minHeight: '100px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowEditProfile(false)} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={handleUpdateProfile} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px', cursor: 'pointer' }}>SAVE</button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
