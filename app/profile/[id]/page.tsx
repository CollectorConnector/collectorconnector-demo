"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ImportInstagramModal from "@/components/ImportInstagramModal";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";

// --- Types ---
type Profile = {
  id: string;
  avatar_url?: string | null;
  display_url?: string | null;
  username?: string | null;
  bio?: string | null;
  items_count?: number | null;
  collections_count?: number | null;
  vault_value?: number | null;
};

type RecentDrop = {
  id: string;
  name: string;
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
  const [showAddItem, setShowAddItem] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);
  
  // Upload States
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [uploading, setUploading] = useState(false);

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
        // 1. Load Profile
        const { data: profData } = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (profData) setProfile(profData as Profile);

        // 2. Load Recent Items for this user
        const { data: itemData } = await supabase
          .from("items")
          .select(`id, title, image_url, created_at`)
          .eq("user_id", userId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(6);
        
        setRecentDrops((itemData as any) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  // --- MANUAL UPLOAD LOGIC ---
  async function handleManualUpload() {
    if (!file || !userId) return;
    setUploading(true);
    try {
      const fileName = `${userId}/manual-${Date.now()}.jpg`;
      const { error: storageError } = await supabase.storage.from("item-images").upload(fileName, file);
      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("items").insert({
        user_id: userId,
        title: itemName || "Untitled Piece",
        image_url: publicUrl,
        status: "active"
      });

      if (dbError) throw dbError;

      alert("Piece added to vault!");
      setShowAddItem(false);
      setPreview(null);
      setFile(null);
      window.location.reload(); // Refresh to show new card
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  const displayName = useMemo(() => profile?.display_url || profile?.username || "Collector", [profile]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center italic font-black">LOADING VAULT...</div>;

  return (
    <div className="min-h-screen bg-black text-white" style={{ background: '#000', color: '#fff' }}>
      <Header />
      
      <main style={{ 
        marginTop: '100px', 
        paddingBottom: '80px', 
        maxWidth: '800px', 
        marginRight: 'auto', 
        marginLeft: 'auto', 
        paddingLeft: '16px', 
        paddingRight: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* PROFILE HEADER SECTION */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '32px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <img src={profile?.avatar_url || "/default-avatar.png"} alt="Avatar" style={{ width: '140px', height: '140px', borderRadius: '24px', objectFit: 'cover', border: '4px solid #18181b' }} />
            </div>

            <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '4px', fontStyle: 'italic', letterSpacing: '-2px' }}>{displayName}</h1>
            {profile?.username && <p style={{ color: '#818cf8', fontSize: '20px', marginBottom: '16px', fontWeight: 'bold' }}>@{profile.username}</p>}
            <p style={{ color: '#a1a1aa', fontSize: '18px', marginBottom: '32px', maxWidth: '450px', lineHeight: '1.5' }}>{profile?.bio || "Collector. Curator. Connector."}</p>

            <Link href={`/collections?user=${userId}`} style={{ display: 'block', width: '100%', maxWidth: '320px', backgroundColor: '#ffffff', color: '#000000', fontWeight: '900', padding: '20px 0', borderRadius: '20px', textAlign: 'center', textDecoration: 'none', fontSize: '18px', marginBottom: '24px' }}>
              VIEW COLLECTIONS
            </Link>

            {isOwnProfile && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => setShowAddItem(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '12px 24px', borderRadius: '14px', fontWeight: 'bold' }}>+ ADD PIECE</button>
                <button onClick={() => setIsImportOpen(true)} style={{ background: '#db2777', color: '#fff', padding: '12px 24px', borderRadius: '14px', fontWeight: 'bold', border: 'none' }}>IMPORT IG</button>
              </div>
            )}
        </section>

        {/* STATS SECTION */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '32px', padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div><p style={{ fontSize: '28px', fontWeight: '900' }}>{profile?.items_count ?? 0}</p><p style={{ color: '#52525b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>ITEMS</p></div>
            <div><p style={{ fontSize: '28px', fontWeight: '900' }}>{profile?.collections_count ?? 0}</p><p style={{ color: '#52525b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>COLLS</p></div>
            <div><p style={{ fontSize: '28px', fontWeight: '900', color: '#4ade80' }}>£{profile?.vault_value ?? 0}</p><p style={{ color: '#52525b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>VALUE</p></div>
          </div>
        </section>

        {/* FEED SECTION */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '32px', padding: '32px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '900', marginBottom: '24px', color: '#71717a', letterSpacing: '2px' }}>RECENT DROPS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {recentDrops.length > 0 ? recentDrops.map((drop) => (
              <div key={drop.id} onClick={() => router.push(`/items/${drop.id}`)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #27272a' }}>
                <img src={drop.image_url || "/default-item.png"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              </div>
            )) : <p style={{ color: '#52525b', fontStyle: 'italic' }}>No items added yet.</p>}
          </div>
        </section>

        {isOwnProfile && (
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/auth/login"); }} style={{ marginTop: '20px', color: '#3f3f46', background: 'none', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            LOGOUT ACCOUNT
          </button>
        )}
      </main>

      {/* MODALS */}
      <ImportInstagramModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} userId={userId} />
      
      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#18181b', padding: '32px', borderRadius: '32px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ textAlign: 'center', fontWeight: '900', marginBottom: '24px', fontSize: '24px', fontStyle: 'italic' }}>NEW ITEM</h2>
            
            <input 
              type="text" 
              placeholder="Card Name..." 
              value={itemName} 
              onChange={(e) => setItemName(e.target.value)} 
              style={{ width: '100%', background: '#09090b', border: '1px solid #27272a', padding: '14px', borderRadius: '12px', color: '#fff', marginBottom: '16px' }}
            />

            {!preview ? (
              <label style={{ border: '2px dashed #3f3f46', borderRadius: '20px', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ color: '#71717a', fontSize: '14px', fontWeight: 'bold' }}>TAP TO UPLOAD PHOTO</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if(f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            ) : (
              <img src={preview} style={{ width: '100%', borderRadius: '20px', marginBottom: '16px', border: '1px solid #27272a' }} />
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button onClick={() => { setShowAddItem(false); setPreview(null); }} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold', background: 'none', border: 'none' }}>CANCEL</button>
              <button 
                onClick={handleManualUpload} 
                disabled={!file || uploading} 
                style={{ flex: 2, background: '#fff', color: '#000', borderRadius: '16px', padding: '14px', fontWeight: '900' }}
              >
                {uploading ? 'POSTING...' : 'POST PIECE'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
