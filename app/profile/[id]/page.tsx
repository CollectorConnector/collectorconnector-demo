"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";
import Header from "@/components/Header";
import Link from "next/link";

// Popular categories to keep data clean, but flexible enough for the obscure stuff!
const PRESET_NICHES = [
  "Sports Cards", 
  "Pokémon", 
  "Comics", 
  "Sneakers", 
  "Watches", 
  "Vinyl Records", 
  "Stamps", 
  "Coins", 
  "Other"
];

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

  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [recentDrops, setRecentDrops] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // NEW ITEM STATES
  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

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

        const { data: items } = await supabase.from("items").select("estimated_value").eq("user_id", userId);
        if (items) {
          setItemCount(items.length);
          setVaultValue(items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0));
        }

        const { count } = await supabase.from("collections").select("*", { count: 'exact', head: true }).eq("user_id", userId);
        setCollectionCount(count || 0);

        const { data: drops } = await supabase.from("items").select("id, title, image_url, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(6);
        setRecentDrops(drops || []);

      } catch (err) {
        console.error("Sync Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, [userId]);

  async function handlePostItem() {
    if (!file || !userId || !niche) return;
    setUploading(true);
    try {
      const finalNiche = niche === "Other" ? customNiche : niche;
      const fileName = `${userId}/${Date.now()}.jpg`;
      
      await supabase.storage.from("item-images").upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
      
      await supabase.from("items").insert({
        user_id: userId,
        title: itemName || "Untitled",
        image_url: publicUrl,
        estimated_value: parseFloat(itemValue) || 0,
        niche_family: finalNiche, // This links them to their "Family"
        status: "active"
      });
      window.location.reload();
    } catch (err) {
      alert("Post failed");
    } finally {
      setUploading(false);
    }
  }

  const displayName = profile?.display_url || profile?.username || "Collector";

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black">SYNCING VAULT...</div>;

  return (
    <div className="min-h-screen bg-black text-white" style={{ background: '#000' }}>
      <Header />
      
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* PROFILE HEADER */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '24px' }}>
              <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '120px', height: '120px', borderRadius: '20px', objectFit: 'cover', border: '4px solid #18181b' }} alt="Avatar" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800' }}>{displayName}</h1>
              <img src="/diamond.png" style={{ width: '38px', height: '38px', objectFit: 'contain' }} alt="Diamond Tier" />
            </div>
            
            <p style={{ color: '#818cf8', fontSize: '18px', marginBottom: '16px' }}>@{profile?.username}</p>
            <p style={{ color: '#a1a1aa', fontSize: '16px', marginBottom: '24px', maxWidth: '400px' }}>{profile?.bio || "Digital Vault Explorer."}</p>

            <Link href={`/collections?user=${userId}`} style={{ display: 'block', width: '100%', maxWidth: '320px', backgroundColor: '#ffffff', color: '#000000', fontWeight: '900', padding: '16px 0', borderRadius: '16px', textAlign: 'center', textDecoration: 'none', fontSize: '16px', marginBottom: '20px' }}>
              VIEW COLLECTIONS
            </Link>

            {isOwnProfile && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setShowAddItem(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px' }}>+ ITEM</button>
                <button onClick={() => setShowAddCollection(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px' }}>+ COLL</button>
                <button style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px' }}>EDIT</button>
              </div>
            )}
        </section>

        {/* LIVE STATS */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div><p style={{ fontSize: '22px', fontWeight: '900' }}>{itemCount}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>ITEMS</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: '900' }}>{collectionCount}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>COLLS</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: '900', color: '#4ade80' }}>£{vaultValue.toLocaleString()}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>VALUE</p></div>
          </div>
        </section>

        {/* RECENT DROPS GRID */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '900' }}>RECENT DROPS</h2>
            <img src="/CC-SML-Logo.png" style={{ width: '18px', height: '18px' }} alt="CC Logo" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {recentDrops.map((drop: any) => (
              <div key={drop.id} onClick={() => router.push(`/items/${drop.id}`)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}>
                <img src={drop.image_url || "/default-item.png"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              </div>
            ))}
          </div>
        </section>

        <SuggestedUsers />
      </main>

      {/* NEW ITEM MODAL WITH NICHE DROPDOWN */}
      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>NEW ITEM</h2>
            
            <input placeholder="Item Title" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px' }} />
            
            {/* NICHE SELECT */}
            <select 
              value={niche} 
              onChange={(e) => setNiche(e.target.value)}
              style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px', appearance: 'none' }}
            >
              <option value="" disabled>Select Niche Family</option>
              {PRESET_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            {/* CUSTOM NICHE INPUT */}
            {niche === "Other" && (
              <input 
                placeholder="What do you collect?" 
                value={customNiche} 
                onChange={e => setCustomNiche(e.target.value)} 
                style={{ width: '100%', background: '#000', border: '1px solid #818cf8', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px' }} 
              />
            )}

            {/* VALUE & CHECKER */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                <input placeholder="Value (£)" type="number" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ flex: 1, background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px' }} />
                <a href={`https://130point.com/sales/`} target="_blank" style={{ background: '#27272a', padding: '12px', borderRadius: '12px', color: '#fff', fontSize: '10px', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                    CHECK<br/>VALUE ↗
                </a>
            </div>

            {!preview ? (
              <label style={{ border: '2px dashed #3f3f46', borderRadius: '12px', padding: '30px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                <span style={{ color: '#71717a' }}>Upload Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if(f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            ) : (
              <div style={{ position: 'relative' }}>
                <img src={preview} style={{ width: '100%', borderRadius: '12px', marginBottom: '15px', maxHeight: '180px', objectFit: 'cover' }} alt="Preview" />
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => { setShowAddItem(false); setPreview(null); setNiche(""); }} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold', background: 'none', border: 'none' }}>CANCEL</button>
              <button onClick={handlePostItem} disabled={uploading || !file || !niche} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px', opacity: (uploading || !file || !niche) ? 0.5 : 1 }}>
                {uploading ? 'POSTING...' : 'POST ITEM'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
