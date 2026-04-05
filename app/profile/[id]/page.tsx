"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ImportInstagramModal from "@/components/ImportInstagramModal";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";

type Profile = {
  id: string;
  avatar_url?: string | null;
  display_url?: string | null;
  username?: string | null;
  bio?: string | null;
  tier?: string | null;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Live Stats States
  const [itemCount, setItemCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [vaultValue, setVaultValue] = useState(0);

  // Modals & UI States
  const [showAddItem, setShowAddItem] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState(""); // Added value input
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
    
    async function loadProfileAndStats() {
      setLoading(true);
      
      // 1. Fetch Profile Data
      const { data: profData } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (profData) setProfile(profData);

      // 2. Fetch Live Stats
      const [items, colls] = await Promise.all([
        supabase.from("items").select("estimated_value").eq("user_id", userId).eq("status", "active"),
        supabase.from("collections").select("id", { count: 'exact' }).eq("user_id", userId)
      ]);

      // Calculate Item Count and Total Value
      if (items.data) {
        setItemCount(items.data.length);
        const total = items.data.reduce((sum, item) => sum + (Number(item.estimated_value) || 0), 0);
        setVaultValue(total);
      }

      // Calculate Collection Count
      if (colls.count !== null) {
        setCollectionCount(colls.count);
      }

      setLoading(false);
    }

    loadProfileAndStats();
  }, [userId]);

  // --- MANUAL UPLOAD WITH VALUE ---
  async function handleManualUpload() {
    if (!file || !userId) return;
    setUploading(true);
    try {
      const fileName = `${userId}/${Date.now()}.jpg`;
      await supabase.storage.from("item-images").upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);

      const { error } = await supabase.from("items").insert({
        user_id: userId,
        title: itemName || "Untitled",
        image_url: publicUrl,
        estimated_value: parseFloat(itemValue) || 0,
        status: "active"
      });

      if (!error) {
        alert("Success!");
        window.location.reload(); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  const displayName = profile?.display_url || profile?.username || "Collector";

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center italic font-black">SYNCING VAULT...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px' }}>
        
        {/* PROFILE HEADER */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '32px', padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '140px', height: '140px', margin: '0 auto 24px', borderRadius: '24px', overflow: 'hidden', border: '4px solid #18181b' }}>
              <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '42px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-2px' }}>{displayName}</h1>
              {profile?.tier && (
                <span style={{ background: '#facc15', color: '#000', fontSize: '10px', fontWeight: 'black', padding: '2px 8px', borderRadius: '6px' }}>{profile.tier}</span>
              )}
            </div>
            <p style={{ color: '#818cf8', fontSize: '18px', fontWeight: 'bold', marginBottom: '32px' }}>@{profile?.username}</p>

            <Link href={`/collections?user=${userId}`} style={{ display: 'block', width: '100%', maxWidth: '320px', backgroundColor: '#fff', color: '#000', fontWeight: '900', padding: '18px 0', borderRadius: '16px', margin: '0 auto 24px', textDecoration: 'none' }}>
              VIEW COLLECTIONS
            </Link>

            {isOwnProfile && (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setShowAddItem(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>+ ADD</button>
                <button onClick={() => setIsImportOpen(true)} style={{ background: '#db2777', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>IMPORT IG</button>
              </div>
            )}
        </section>

        {/* LIVE STATS SECTION */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '32px', padding: '32px', marginTop: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: '32px', fontWeight: '900' }}>{itemCount}</p>
              <p style={{ color: '#52525b', fontSize: '10px', fontWeight: 'bold' }}>ITEMS</p>
            </div>
            <div>
              <p style={{ fontSize: '32px', fontWeight: '900' }}>{collectionCount}</p>
              <p style={{ color: '#52525b', fontSize: '10px', fontWeight: 'bold' }}>COLLS</p>
            </div>
            <div>
              <p style={{ fontSize: '32px', fontWeight: '900', color: '#4ade80' }}>£{vaultValue.toLocaleString()}</p>
              <p style={{ color: '#52525b', fontSize: '10px', fontWeight: 'bold' }}>VALUE</p>
            </div>
          </div>
        </section>
      </main>

      {/* MODALS */}
      <ImportInstagramModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} userId={userId} />

      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#18181b', padding: '32px', borderRadius: '32px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
             <h2 style={{ textAlign: 'center', fontWeight: '900', marginBottom: '24px', fontStyle: 'italic' }}>ADD NEW PIECE</h2>
             
             <input placeholder="Item Name" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', padding: '12px', borderRadius: '12px', color: '#fff', marginBottom: '12px' }} />
             
             <input placeholder="Value (£)" type="number" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', padding: '12px', borderRadius: '12px', color: '#fff', marginBottom: '16px' }} />

             <input type="file" onChange={e => {
               const f = e.target.files?.[0];
               if(f) { setFile(f); setPreview(URL.createObjectURL(f)); }
             }} style={{ marginBottom: '20px' }} />
             
             <button onClick={handleManualUpload} disabled={uploading} style={{ width: '100%', background: '#fff', color: '#000', padding: '14px', borderRadius: '12px', fontWeight: '900' }}>
               {uploading ? 'POSTING...' : 'POST PIECE'}
             </button>
             <button onClick={() => setShowAddItem(false)} style={{ width: '100%', marginTop: '10px', color: '#71717a' }}>CANCEL</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
