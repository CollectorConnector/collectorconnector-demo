"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";
import Header from "@/components/Header";
import Link from "next/link";

const PRESET_NICHES = ["Sports Cards", "Pokémon", "Comics", "Sneakers", "Watches", "Vinyls", "Coins", "Other"];

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || "";

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const [vaultValue, setVaultValue] = useState(0);
  const [recentDrops, setRecentDrops] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  
  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [niche, setNiche] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [newCollName, setNewCollName] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    async function loadData() {
      setLoading(true);
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();
      setProfile(prof);

      const { data: items } = await supabase.from("items").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (items) {
        setRecentDrops(items.slice(0, 6));
        setItemCount(items.length);
        setVaultValue(items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0));
      }

      const { data: colls } = await supabase.from("collections").select("*").eq("user_id", userId);
      setCollections(colls || []);
      setLoading(false);
    }
    loadData();
  }, [userId]);

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
      alert("UPLOAD ERROR: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateCollection() {
    if (!newCollName) return;
    setUploading(true);
    const { error } = await supabase.from("collections").insert({ user_id: userId, title: newCollName });
    if (error) alert("COLL ERROR: " + error.message);
    else window.location.reload();
  }

  const getBadge = () => {
    const user = profile?.username?.toLowerCase();
    if (user === "stacypearce" || user === "rich" || user === "ceomum") return "/founder.png";
    if (profile?.membership_tier?.toLowerCase() === "diamond") return "/diamond.png";
    return null;
  };

  if (loading) return <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>SYNCING...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'sans-serif' }}>
      <Header />
      <main style={{ maxWidth: '800px', margin: '100px auto', padding: '0 16px' }}>
        
        <div style={{ background: '#09090b', borderRadius: '24px', padding: '30px', border: '1px solid #27272a', textAlign: 'center' }}>
          <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '100px', height: '100px', borderRadius: '20px', marginBottom: '15px', objectFit: 'cover' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0 }}>{profile?.display_url || profile?.username}</h1>
            {getBadge() && <img src={getBadge() ?? undefined} style={{ width: '24px', height: '24px' }} alt="Tier Badge" />}
          </div>
          <p style={{ color: '#818cf8' }}>@{profile?.username}</p>
          
          {currentUserId === userId && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
              <button onClick={() => setShowAddItem(true)} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>+ ITEM</button>
              <button onClick={() => setShowAddCollection(true)} style={{ background: '#18181b', color: '#fff', border: '1px solid #27272a', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>+ COLL</button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '20px 0', textAlign: 'center' }}>
          <div style={{ background: '#09090b', padding: '15px', borderRadius: '15px', border: '1px solid #27272a' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{itemCount}</div>
            <div style={{ fontSize: '10px', color: '#52525b' }}>ITEMS</div>
          </div>
          <div style={{ background: '#09090b', padding: '15px', borderRadius: '15px', border: '1px solid #27272a' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{collections.length}</div>
            <div style={{ fontSize: '10px', color: '#52525b' }}>COLLS</div>
          </div>
          <div style={{ background: '#09090b', padding: '15px', borderRadius: '15px', border: '1px solid #27272a' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ade80' }}>£{vaultValue.toLocaleString()}</div>
            <div style={{ fontSize: '10px', color: '#52525b' }}>VALUE</div>
          </div>
        </div>

        <h3 style={{ marginBottom: '15px', fontWeight: '900' }}>COLLECTIONS</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '30px' }}>
          {collections.map(c => (
            <Link href={`/collections/${c.id}`} key={c.id} style={{ textDecoration: 'none', color: '#fff' }}>
              <div style={{ background: '#18181b', aspectRatio: '1/1', borderRadius: '32px', border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '14px' }}>{c.title}</span>
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '10px', color: '#818cf8', fontWeight: 'bold' }}>VIEW ↗</div>
              </div>
            </Link>
          ))}
        </div>

        <h3 style={{ marginBottom: '15px', fontWeight: '900' }}>RECENT DROPS</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {recentDrops.map(d => (
            <div key={d.id} onClick={() => router.push(`/items/${d.id}`)} style={{ aspectRatio: '1/1', cursor: 'pointer' }}>
               <img src={d.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', border: '1px solid #27272a' }} />
            </div>
          ))}
        </div>

      </main>

      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>VAULT DROP</h2>
            <input placeholder="Batch Title" onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #27272a', padding: '12px', borderRadius: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />
            <select onChange={e => setSelectedCollectionId(e.target.value)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #27272a', padding: '12px', borderRadius: '12px', marginBottom: '10px', boxSizing: 'border-box' }}>
              <option value="">No Collection</option>
              {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <select onChange={e => setNiche(e.target.value)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #27272a', padding: '12px', borderRadius: '12px', marginBottom: '10px', boxSizing: 'border-box' }}>
              <option value="">Select Niche</option>
              {PRESET_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <input placeholder="Value (£)" onChange={e => setItemValue(e.target.value)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #27272a', padding: '12px', borderRadius: '12px', marginBottom: '15px', boxSizing: 'border-box' }} />
            <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files || []))} style={{ marginBottom: '20px', color: '#71717a' }} />
            <button onClick={handlePostItem} disabled={uploading} style={{ width: '100%', padding: '14px', background: '#fff', color: '#000', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>
              {uploading ? "DROPPING..." : "VAULT IT"}
            </button>
            <button onClick={() => setShowAddItem(false)} style={{ width: '100%', marginTop: '10px', background: 'none', color: '#52525b', border: 'none', cursor: 'pointer' }}>CANCEL</button>
          </div>
        </div>
      )}

      {showAddCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '350px', border: '1px solid #27272a' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>NEW COLLECTION</h2>
            <input placeholder="Title" onChange={e => setNewCollName(e.target.value)} style={{ width: '100%', background: '#000', color: '#fff', border: '1px solid #27272a', padding: '12px', borderRadius: '12px', marginBottom: '20px', boxSizing: 'border-box' }} />
            <button onClick={handleCreateCollection} disabled={uploading} style={{ width: '100%', padding: '14px', background: '#fff', color: '#000', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>CREATE</button>
            <button onClick={() => setShowAddCollection(false)} style={{ width: '100%', marginTop: '10px', background: 'none', color: '#52525b', border: 'none', cursor: 'pointer' }}>CANCEL</button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
