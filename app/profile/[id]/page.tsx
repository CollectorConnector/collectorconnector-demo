The breakthrough script 

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
  items_count?: number | null;
  collections_count?: number | null;
  followers_count?: number | null;
  following_count?: number | null;
  vault_value?: number | null;
  likes_count?: number | null;
};

type RecentDrop = {
  id: string;
  name: string;
  image_url: string | null;
  created_at: string;
  profiles: { username: string | null } | null;
};

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  
  const userId = useMemo(() => {
    const id = params?.id;
    return Array.isArray(id) ? id[0] : id || "";
  }, [params?.id]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editedDisplayUrl, setEditedDisplayUrl] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

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
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error || !data) {
          setError("Profile not found");
          return;
        }

        setProfile(data as Profile);
        setEditedDisplayUrl(data.display_url || "");
        setEditedBio(data.bio || "");
        setEditedLocation(data.location || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  useEffect(() => {
    async function loadRecentDrops() {
      const { data } = await supabase
        .from("items")
        .select(`id, name, image_url, created_at, profiles!user_id_fkey (username)`)
        .order("created_at", { ascending: false })
        .limit(6);
      setRecentDrops((data as unknown as RecentDrop[]) || []);
    }
    loadRecentDrops();
  }, []);

  useEffect(() => {
    if (!currentUserId || !userId || isOwnProfile) return;
    async function checkFollow() {
      const { data } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUserId)
        .eq("following_id", userId)
        .maybeSingle();
      setIsFollowing(!!data);
    }
    checkFollow();
  }, [currentUserId, userId, isOwnProfile]);

  async function saveProfileChanges() {
    if (!isOwnProfile) return;
    setSaving(true);
    try {
      const updates = {
        display_url: editedDisplayUrl.trim() || null,
        bio: editedBio.trim() || null,
        location: editedLocation.trim() || null,
      };
      const { error } = await supabase.from("profiles").update(updates).eq("id", currentUserId);
      if (error) throw error;
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      setEditMode(false);
    } catch (err) {
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !isOwnProfile) return;
    setUploading(true);
    try {
      const timestamp = Date.now();
      const ext = selectedFile.name.split(".").pop() || "jpg";
      const filePath = `${currentUserId}/avatar-${timestamp}.${ext}`;
      await supabase.storage.from("avatars").upload(filePath, selectedFile, { upsert: true });
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", currentUserId);
      setProfile((prev) => prev ? { ...prev, avatar_url: urlData.publicUrl } : null);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function toggleFollow() {
    if (!currentUserId || isOwnProfile || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", userId);
        setIsFollowing(false);
      } else {
        await supabase.from("follows").insert({ follower_id: currentUserId, following_id: userId });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  }

  const displayName = useMemo(() => profile?.display_url || profile?.username || "Collector", [profile]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  if (error || !profile) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{error || "Not Found"}</div>;

  return (
    <div className="min-h-screen bg-black text-white" style={{ background: '#000', color: '#fff' }}>
      <Header />
      
      {/* The screenshot shows a total lack of styling. 
        Adding a massive top margin and center alignment via inline styles 
        to bypass any CSS loading issues.
      */}
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
        <section style={{ 
          background: '#09090b', 
          border: '1px solid #27272a', 
          borderRadius: '24px', 
          padding: '32px', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
            
            {/* Avatar */}
            <div style={{ marginBottom: '24px' }}>
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt="Avatar"
                style={{
                  width: '128px',
                  height: '128px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '4px solid #18181b'
                }}
              />
              {isOwnProfile && (
                <label style={{ display: 'block', fontSize: '12px', marginTop: '8px', color: '#6366f1', cursor: 'pointer' }}>
                  Edit Photo
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>

            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '4px' }}>{displayName}</h1>
            {profile.username && <p style={{ color: '#818cf8', fontSize: '20px', marginBottom: '16px' }}>@{profile.username}</p>}
            <p style={{ color: '#a1a1aa', fontSize: '18px', marginBottom: '32px', maxWidth: '400px' }}>{profile.bio || "No bio yet."}</p>

            {/* THE VIEW COLLECTIONS BUTTON - Hard-coded visibility */}
            <Link 
              href={`/collections?user=${userId}`} 
              style={{
                display: 'block',
                width: '100%',
                maxWidth: '320px',
                backgroundColor: '#ffffff',
                color: '#000000',
                fontWeight: '900',
                padding: '18px 0',
                borderRadius: '16px',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: '18px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                marginBottom: '24px'
              }}
            >
              VIEW COLLECTIONS
            </Link>

            {/* TOOLBAR */}
            {isOwnProfile && !editMode && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => setShowAddItem(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px' }}>+ ITEM</button>
                <button onClick={() => setEditMode(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px' }}>EDIT</button>
                <button onClick={() => setIsImportOpen(true)} style={{ background: '#db2777', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', border: 'none' }}>IMPORT IG</button>
              </div>
            )}
        </section>

        {/* STATS SECTION */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div><p style={{ fontSize: '24px', fontWeight: '900' }}>{profile.items_count ?? 0}</p><p style={{ color: '#52525b', fontSize: '12px', fontWeight: 'bold' }}>ITEMS</p></div>
            <div><p style={{ fontSize: '24px', fontWeight: '900' }}>{profile.collections_count ?? 0}</p><p style={{ color: '#52525b', fontSize: '12px', fontWeight: 'bold' }}>COLLS</p></div>
            <div><p style={{ fontSize: '24px', fontWeight: '900' }}>£{profile.vault_value ?? 0}</p><p style={{ color: '#52525b', fontSize: '12px', fontWeight: 'bold' }}>VAULT</p></div>
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

        {isOwnProfile && (
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/auth/login"); }} style={{ marginTop: '20px', color: '#52525b', background: 'none', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            LOGOUT ACCOUNT
          </button>
        )}
      </main>

      {isImportOpen && <ImportInstagramModal onClose={() => setIsImportOpen(false)} />}
      
      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#18181b', padding: '32px', borderRadius: '32px', width: '100%', maxWidth: '360px' }}>
            <h2 style={{ textAlign: 'center', fontWeight: '900', marginBottom: '24px' }}>NEW ITEM</h2>
            {!preview ? (
              <label style={{ border: '2px dashed #3f3f46', borderRadius: '16px', padding: '40px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                <span style={{ color: '#71717a', fontSize: '14px' }}>Tap to Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if(f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            ) : (
              <img src={preview} style={{ width: '100%', borderRadius: '16px', marginBottom: '16px' }} />
            )}
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button onClick={() => { setShowAddItem(false); setPreview(null); }} style={{ flex: 1, color: '#a1a1aa', background: 'none', border: 'none', fontWeight: 'bold' }}>CANCEL</button>
              <button disabled={!file} style={{ flex: 1, background: '#fff', color: '#000', borderRadius: '12px', padding: '12px', fontWeight: '900' }}>POST</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
