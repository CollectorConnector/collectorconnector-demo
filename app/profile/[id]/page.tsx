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
  location?: string | null;
  tier?: string | null;
  items_count?: number | null;
  collections_count?: number | null;
  vault_value?: number | null;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Modals & Edit States
  const [showAddItem, setShowAddItem] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Profile Edit States
  const [editedName, setEditedName] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [saving, setSaving] = useState(false);

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
      setLoading(true);
      const { data: profData } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (profData) {
        setProfile(profData);
        setEditedName(profData.display_url || "");
        setEditedBio(profData.bio || "");
        setEditedLocation(profData.location || "");
      }
      setLoading(false);
    }
    loadData();
  }, [userId]);

  // --- SAVE PROFILE CHANGES ---
  async function saveProfile() {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_url: editedName,
      bio: editedBio,
      location: editedLocation
    }).eq("id", userId);

    if (!error) {
      setProfile(prev => prev ? { ...prev, display_url: editedName, bio: editedBio, location: editedLocation } : null);
      setEditMode(false);
    }
    setSaving(false);
  }

  // --- AVATAR UPLOAD ---
  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${userId}/avatar-${Date.now()}.jpg`;
    await supabase.storage.from("avatars").upload(fileName, file);
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
    setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
    setUploading(false);
  }

  const displayName = profile?.display_url || profile?.username || "Collector";

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center italic font-black">LOADING...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px' }}>
        
        {/* PROFILE HEADER */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '32px', padding: '40px', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 24px' }}>
              <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '100%', height: '100%', borderRadius: '24px', objectFit: 'cover', border: '4px solid #18181b' }} />
              {isOwnProfile && (
                <label style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#fff', color: '#000', padding: '8px', borderRadius: '12px', cursor: 'pointer', fontSize: '10px', fontWeight: '900' }}>
                  EDIT
                  <input type="file" hidden onChange={handleAvatarChange} />
                </label>
              )}
            </div>

            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <input value={editedName} onChange={e => setEditedName(e.target.value)} placeholder="Display Name" style={{ background: '#000', border: '1px solid #27272a', padding: '10px', borderRadius: '8px', color: '#fff', textAlign: 'center' }} />
                <textarea value={editedBio} onChange={e => setEditedBio(e.target.value)} placeholder="Bio" style={{ background: '#000', border: '1px solid #27272a', padding: '10px', borderRadius: '8px', color: '#fff', textAlign: 'center' }} />
                <button onClick={saveProfile} style={{ background: '#4ade80', color: '#000', fontWeight: 'bold', padding: '10px', borderRadius: '8px' }}>{saving ? 'SAVING...' : 'SAVE CHANGES'}</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '42px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-2px' }}>{displayName}</h1>
                  {profile?.tier && (
                    <span style={{ background: '#facc15', color: '#000', fontSize: '10px', fontWeight: 'black', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>{profile.tier}</span>
                  )}
                </div>
                <p style={{ color: '#818cf8', fontSize: '18px', fontWeight: 'bold' }}>@{profile?.username}</p>
                <p style={{ color: '#a1a1aa', fontSize: '16px', margin: '16px 0 32px' }}>{profile?.bio || "No bio set."}</p>
              </>
            )}

            <Link href={`/collections?user=${userId}`} style={{ display: 'block', width: '100%', maxWidth: '320px', backgroundColor: '#fff', color: '#000', fontWeight: '900', padding: '18px 0', borderRadius: '16px', margin: '0 auto 24px', textDecoration: 'none' }}>
              VIEW COLLECTIONS
            </Link>

            {isOwnProfile && (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setShowAddItem(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>+ ADD</button>
                <button onClick={() => setEditMode(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>EDIT PROFILE</button>
                <button onClick={() => setIsImportOpen(true)} style={{ background: '#db2777', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', border: 'none' }}>IMPORT IG</button>
              </div>
            )}
        </section>

        {/* STATS */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '32px', padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div><p style={{ fontSize: '28px', fontWeight: '900' }}>{profile?.items_count ?? 0}</p><p style={{ color: '#52525b', fontSize: '10px', fontWeight: 'bold' }}>ITEMS</p></div>
            <div><p style={{ fontSize: '28px', fontWeight: '900' }}>{profile?.collections_count ?? 0}</p><p style={{ color: '#52525b', fontSize: '10px', fontWeight: 'bold' }}>COLLS</p></div>
            <div><p style={{ fontSize: '28px', fontWeight: '900', color: '#4ade80' }}>£{profile?.vault_value ?? 0}</p><p style={{ color: '#52525b', fontSize: '10px', fontWeight: 'bold' }}>VALUE</p></div>
          </div>
        </section>
      </main>

      <ImportInstagramModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} userId={userId} />

      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#18181b', border: '1px solid #27272a', padding: '32px', borderRadius: '32px', width: '100%', maxWidth: '400px' }}>
             <h2 style={{ textAlign: 'center', fontWeight: '900', marginBottom: '24px', fontStyle: 'italic' }}>ADD NEW PIECE</h2>
             <input placeholder="Name of card..." value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', padding: '12px', borderRadius: '12px', color: '#fff', marginBottom: '16px' }} />
             <input type="file" onChange={e => {
               const f = e.target.files?.[0];
               if(f) { setFile(f); setPreview(URL.createObjectURL(f)); }
             }} style={{ marginBottom: '20px' }} />
             {preview && <img src={preview} style={{ width: '100%', borderRadius: '12px', marginBottom: '20px' }} />}
             <button onClick={() => setShowAddItem(false)} style={{ color: '#71717a', marginRight: '20px' }}>CANCEL</button>
             <button style={{ background: '#fff', color: '#000', padding: '12px 24px', borderRadius: '12px', fontWeight: '900' }}>POST</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
