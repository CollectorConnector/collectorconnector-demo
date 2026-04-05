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

// --- Types ---
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
};

type RecentDrop = {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // LIVE STATS
  const [itemCount, setItemCount] = useState(0);
  const [vaultValue, setVaultValue] = useState(0);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);

  // UI STATES
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // INPUTS
  const [newCollName, setNewCollName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState(""); // NEW FIX 1
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
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (prof) setProfile(prof);

        const { data: items } = await supabase.from("items").select("estimated_value").eq("user_id", userId);
        if (items) {
          setItemCount(items.length);
          setVaultValue(items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0));
        }

        // NEW FIX 2: Get more fields for the squircle images
        const { data: colls } = await supabase.from("collections").select("*").eq("user_id", userId);
        setCollections(colls || []);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  async function handlePostItem() {
    if (!files.length || !userId) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        await supabase.storage.from("item-images").upload(fileName, file);
        const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
        
        await supabase.from("items").insert({
          user_id: userId,
          title: itemName || "Untitled",
          image_url: publicUrl,
          estimated_value: parseFloat(itemValue) || 0,
          collection_id: selectedCollectionId || null,
          status: "active"
        });
      }
      window.location.reload();
    } catch (err) {
      alert("Post failed");
    } finally {
      setUploading(false);
    }
  }

  // UPDATED: Create Collection + Optional Batch Upload
  async function handleCreateCollection() {
    if (!newCollName || !userId) return;
    setUploading(true);
    try {
      const { data: newColl, error: collError } = await supabase.from("collections").insert({
        user_id: userId,
        title: newCollName,
        niche: selectedNiche
      }).select().single();

      if (collError) throw collError;

      // Batch drop items immediately if files selected
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
    } catch (err) {
      alert("Failed to create collection");
    } finally {
      setUploading(false);
    }
  }

  const getBadge = () => {
    const user = profile?.username?.toLowerCase();
    if (user === "stacypearce" || user === "rich" || user === "ceomum") return "/founder.png";
    if (profile?.membership_tier?.toLowerCase() === "diamond") return "/diamond.png";
    return null;
  };

  const displayName = profile?.display_url || profile?.username || "Collector";

  if (loading) return <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>SYNCING VAULT...</div>;

  return (
    <div className="min-h-screen bg-black text-white" style={{ background: '#000' }}>
      <Header />
      
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* PROFILE HEADER */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '24px' }}>
              <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '120px', height: '120px', borderRadius: '20px', objectFit: 'cover', border: '4px solid #18181b' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>{displayName}</h1>
              {getBadge() && <img src={getBadge() || ""} style={{ width: '38px', height: '38px', objectFit: 'contain' }} alt="Badge" />}
            </div>
            
            <p style={{ color: '#818cf8', fontSize: '18px', marginBottom: '16px' }}>@{profile?.username}</p>
            <p style={{ color: '#a1a1aa', fontSize: '16px', marginBottom: '24px', maxWidth: '400px' }}>{profile?.bio || "Digital Vault Explorer."}</p>

            <Link href={`/collections?user=${userId}`} style={{ display: 'block', width: '100%', maxWidth: '320px', backgroundColor: '#ffffff', color: '#000000', fontWeight: '900', padding: '16px 0', borderRadius: '16px', textAlign: 'center', textDecoration: 'none', fontSize: '16px', marginBottom: '20px' }}>
              VIEW COLLECTIONS
            </Link>

            {isOwnProfile && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setShowAddItem(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>+ ITEM</button>
                <button onClick={() => setShowAddCollection(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>+ ADD COLLECTION</button>
                <button onClick={handleLogout} style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#f87171', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>LOGOUT</button>
              </div>
            )}
        </section>

        {/* LIVE STATS */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div><p style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{itemCount}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>ITEMS</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>{collections.length}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>COLLS</p></div>
            <div><p style={{ fontSize: '22px', fontWeight: '900', color: '#4ade80', margin: 0 }}>£{vaultValue.toLocaleString()}</p><p style={{ color: '#52525b', fontSize: '11px', fontWeight: 'bold' }}>VALUE</p></div>
          </div>
        </section>

        {/* COLLECTIONS GRID (NEW FIX 3: Images in Squircles) */}
        <section style={{ background: '#000', padding: '10px 0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '16px' }}>COLLECTIONS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {collections.map((c) => (
                    <Link href={`/collections/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                        <div style={{ background: '#18181b', aspectRatio: '1/1', borderRadius: '32px', border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                            {c.cover_url && <img src={c.cover_url} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />}
                            <span style={{ position: 'relative', zIndex: 2, fontWeight: '900', fontSize: '16px', textTransform: 'uppercase', color: '#fff', textAlign: 'center', padding: '0 10px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{c.title}</span>
                            <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '10px', fontSize: '10px', color: '#fff', fontWeight: '900', border: '1px solid #27272a', zIndex: 2 }}>VIEW ↗</div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

        {/* RECENT DROPS GRID */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px' }}>RECENT DROPS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {recentDrops.length > 0 ? (
              recentDrops.map((drop) => (
                <div key={drop.id} onClick={() => router.push(`/items/${drop.id}`)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #27272a' }}>
                  <img src={drop.image_url || "/default-item.png"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                </div>
              ))
            ) : (
              <p style={{ gridColumn: 'span 3', textAlign: 'center', color: '#52525b', padding: '20px' }}>Vault is empty.</p>
            )}
          </div>
        </section>

        <SuggestedUsers />
      </main>

      {/* MODALS: ADD COLLECTION WITH SUPER-FLOW */}
      {showAddCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>NEW COLLECTION</h2>
            
            <select value={selectedNiche} onChange={(e) => setSelectedNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px' }}>
              <option value="">Select Niche</option>
              <option value="Pokemon">Pokemon</option>
              <option value="Basketball">Basketball</option>
              <option value="Football">Football</option>
              <option value="Coins">Coins</option>
              <option value="Comics">Comics</option>
              <option value="Watches">Watches</option>
              <option value="Other">Other</option>
            </select>

            <input placeholder="Collection Title" value={newCollName} onChange={e => setNewCollName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '20px' }} />
            
            <p style={{ fontSize: '12px', color: '#52525b', fontWeight: 'bold', marginBottom: '10px' }}>BATCH DROP (MAX 20)</p>
            <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} style={{ color: '#71717a', fontSize: '12px', marginBottom: '10px' }} />
            
            {files.length > 0 && (
              <>
                <input placeholder="Item Names" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '12px', marginBottom: '5px' }} />
                <input placeholder="Value per item (£)" type="number" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '12px', marginBottom: '15px' }} />
              </>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button onClick={() => { setShowAddCollection(false); setFiles([]); }} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={handleCreateCollection} disabled={uploading} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px', cursor: 'pointer', opacity: uploading ? 0.5 : 1 }}>
                {uploading ? 'LAUNCHING...' : 'CREATE VAULT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>VAULT DROP</h2>
            
            <select value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px' }}>
              <option value="">No Collection</option>
              {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>

            <input placeholder="Item Title" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px' }} />
            <input placeholder="Value (£)" type="number" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '15px' }} />
            
            <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} style={{ color: '#71717a', marginBottom: '20px', fontSize: '14px' }} />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowAddItem(false); setFiles([]); }} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>CANCEL</button>
              <button onClick={handlePostItem} disabled={uploading || files.length === 0} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px', opacity: uploading ? 0.5 : 1, cursor: 'pointer' }}>
                {uploading ? 'DROPPING...' : `VAULT ${files.length} ITEMS`}
              </button>
            </div>
          </div>
        </div>
      )}

      {isImportOpen && <ImportInstagramModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} userId={userId} />}
      <Footer />
    </div>
  );
}
