"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
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
  location?: string | null;
  bio?: string | null;
  tier?: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // LIVE STATS - Defaulted to 0
  const [itemCount, setItemCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [vaultValue, setVaultValue] = useState(0);

  // UI STATES
  const [showAddItem, setShowAddItem] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // EDIT PROFILE INPUTS
  const [editedDisplayUrl, setEditedDisplayUrl] = useState("");
  const [editedBio, setEditedBio] = useState("");

  // ADD ITEM INPUTS
  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
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
        
        // 1. Fetch Profile
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (prof) {
          setProfile(prof);
          setEditedDisplayUrl(prof.display_url || "");
          setEditedBio(prof.bio || "");
        }

        // 2. Fetch Live Stats (Items & Value)
        const { data: items } = await supabase
          .from("items")
          .select("estimated_value")
          .eq("user_id", userId)
          .eq("status", "active");

        if (items) {
          setItemCount(items.length);
          const total = items.reduce((sum, item) => sum + (Number(item.estimated_value) || 0), 0);
          setVaultValue(total);
        }

        // 3. Fetch Live Stats (Collections)
        const { count } = await supabase
          .from("collections")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", userId);
        
        setCollectionCount(count || 0);

        // 4. Fetch Recent Drops for the grid
        const { data: drops } = await supabase
          .from("items")
          .select("id, title, image_url, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(6);
        
        setRecentDrops((drops as any) || []);

      } catch (err) {
        console.error(err);
        setError("Failed to sync vault data");
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, [userId]);

  // HANDLE POSTING NEW ITEM
  async function handlePostItem() {
    if (!file || !userId) return;
    setUploading(true);
    try {
      const fileName = `${userId}/${Date.now()}.jpg`;
      const { error: storageError } = await supabase.storage.from("item-images").upload(fileName, file);
      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("items").insert({
        user_id: userId,
        title: itemName || "Untitled Piece",
        image_url: publicUrl,
        estimated_value: parseFloat(itemValue) || 0,
        status: "active"
      });

      if (dbError) throw dbError;

      // Success - Refresh to update live stats
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function saveProfileChanges() {
    setSaving(true);
    const updates = { display_url: editedDisplayUrl, bio: editedBio };
    const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      setEditMode(false);
    }
    setSaving(false);
  }

  const displayName = profile?.display_url || profile?.username || "Collector";

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center italic font-black">SYNCING VAULT...</div>;

  return (
    <div className="min-h-screen bg-black text-white" style={{ background: '#000', color: '#fff' }}>
      <Header />
      
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* PROFILE HEADER SECTION */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '24px' }}>
              <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '128px', height: '128px', borderRadius: '16px', objectFit: 'cover', border: '4px solid #18181b' }} />
            </div>

            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '320px' }}>
                <input value={editedDisplayUrl} onChange={e => setEditedDisplayUrl(e.target.value)} placeholder="Display Name" style={{ background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px' }} />
                <textarea value={editedBio} onChange={e => setEditedBio(e.target.value)} placeholder="Bio" style={{ background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', minHeight: '80px' }} />
                <button onClick={saveProfileChanges} style={{ background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>{saving ? 'SAVING...' : 'SAVE CHANGES'}</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <h1 style={{ fontSize: '36px', fontWeight: '800' }}>{displayName}</h1>
                  {profile?.tier && <span style={{ background: '#facc15', color: '#000', fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>{profile.tier}</span>}
                </div>
                <p style={{ color: '#818cf8', fontSize: '20px', marginBottom: '16px' }}>@{profile?.username}</p>
                <p style={{ color: '#a1a1aa', fontSize: '18px', marginBottom: '32px', maxWidth: '400px' }}>{profile?.bio || "No bio yet."}</p>
              </>
            )}

            <Link href={`/collections?user=${userId}`} style={{ display: 'block', width: '100%', maxWidth: '320px', backgroundColor: '#ffffff', color: '#000000', fontWeight: '900', padding: '18px 0', borderRadius: '16px', textAlign: 'center', textDecoration: 'none', fontSize: '18px', marginBottom: '24px' }}>
              VIEW COLLECTIONS
            </Link>

            {isOwnProfile && !editMode && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => setShowAddItem(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>+ ITEM</button>
                <button onClick={() => setEditMode(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>EDIT</button>
                <button onClick={() => setIsImportOpen(true)} style={{ background: '#db2777', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', border: 'none' }}>IMPORT IG</button>
              </div>
            )}
        </section>

        {/* STATS SECTION - NOW LIVE */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div><p style={{ fontSize: '24px', fontWeight: '900' }}>{itemCount}</p><p style={{ color: '#52525b', fontSize: '12px', fontWeight: 'bold' }}>ITEMS</p></div>
            <div><p style={{ fontSize: '24px', fontWeight: '900' }}>{collectionCount}</p><p style={{ color: '#52525b', fontSize: '12px', fontWeight: 'bold' }}>COLLS</p></div>
            <div><p style={{ fontSize: '24px', fontWeight: '900', color: '#4ade80' }}>£{vaultValue.toLocaleString()}</p><p style={{ color: '#52525b', fontSize: '12px', fontWeight: 'bold' }}>VALUE</p></div>
          </div>
        </section>

        <SuggestedUsers />

        {/* FEED SECTION */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '24px' }}>RECENT DROPS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {recentDrops.map((drop) => (
              <div key={drop.id} onClick={() => router.push(`/items/${drop.id}`)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}>
                <img src={drop.image_url || "/default-item.png"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* MODALS */}
      {isImportOpen && (
        <ImportInstagramModal 
          isOpen={isImportOpen} 
          onClose={() => setIsImportOpen(false)} 
          userId={userId} 
        />
      )}
      
      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#18181b', padding: '32px', borderRadius: '32px', width: '100%', maxWidth: '360px', border: '1px solid #27272a' }}>
            <h2 style={{ textAlign: 'center', fontWeight: '900', marginBottom: '20px' }}>NEW ITEM</h2>
            
            <input placeholder="Item Name (e.g. Stephen Curry PSA 9)" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '10px' }} />
            <input placeholder="Value (£)" type="number" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '20px' }} />
            
            {!preview ? (
              <label style={{ border: '2px dashed #3f3f46', borderRadius: '16px', padding: '40px', display: 'flex', justifyContent: 'center', cursor: 'pointer', textAlign: 'center' }}>
                <span style={{ color: '#71717a', fontSize: '14px' }}>Tap to Upload Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if(f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            ) : (
              <div style={{ position: 'relative' }}>
                <img src={preview} style={{ width: '100%', borderRadius: '16px', marginBottom: '16px' }} />
                <button onClick={() => setPreview(null)} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '30px', height: '30px' }}>×</button>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button onClick={() => { setShowAddItem(false); setPreview(null); }} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold', background: 'none', border: 'none' }}>CANCEL</button>
              <button 
                onClick={handlePostItem} 
                disabled={uploading || !file} 
                style={{ flex: 1, background: '#fff', color: '#000', borderRadius: '12px', padding: '12px', fontWeight: '900', opacity: (uploading || !file) ? 0.5 : 1 }}
              >
                {uploading ? 'POSTING...' : 'POST'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
