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
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Header />
      
      {/* 1. Fix: We use pt-24 (96px) to ensure we are well below the 56px header. 
          2. Fix: Added flex-col to keep the vertical flow predictable.
      */}
      <main className="pt-24 pb-20 flex flex-col items-center px-4 max-w-[800px] mx-auto relative z-10">
        
        {/* PROFILE CARD */}
        <section className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center text-center">
            
            {/* Avatar */}
            <div className="mb-6 relative group">
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt="Avatar"
                className={`w-32 h-32 object-cover rounded-2xl border-4 border-zinc-900 shadow-xl ${uploading ? 'opacity-50' : ''}`}
              />
              {isOwnProfile && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition cursor-pointer rounded-2xl">
                  <span className="text-sm font-bold text-white">Edit</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Display Info */}
            {editMode ? (
              <div className="w-full max-w-sm space-y-4">
                <input
                  type="text"
                  value={editedDisplayUrl}
                  onChange={(e) => setEditedDisplayUrl(e.target.value)}
                  placeholder="Display Name"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-center"
                />
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  placeholder="Bio"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 h-24 resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={saveProfileChanges} disabled={saving} className="flex-1 bg-white text-black py-3 rounded-xl font-bold">
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditMode(false)} className="flex-1 bg-zinc-800 py-3 rounded-xl">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <h1 className="text-4xl font-extrabold mb-2">{displayName}</h1>
                {profile.username && <p className="text-indigo-400 text-xl font-medium mb-4">@{profile.username}</p>}
                <p className="text-zinc-400 text-lg mb-8 max-w-md leading-relaxed">{profile.bio || "No bio yet."}</p>
                
                {/* THE VITAL LINK: Forced to full width of container for visibility */}
                <Link 
                  href={`/collections?user=${userId}`} 
                  className="w-full max-w-sm bg-white text-black font-black py-5 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-center text-xl uppercase tracking-tight"
                >
                  View Collections
                </Link>
              </div>
            )}

            {/* Own Profile Toolbar */}
            {isOwnProfile && !editMode && (
              <div className="mt-10 flex flex-wrap gap-3 justify-center">
                <button onClick={() => setShowAddItem(true)} className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 transition">+ ADD ITEM</button>
                <button onClick={() => setEditMode(true)} className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 transition">EDIT PROFILE</button>
                <button onClick={() => setIsImportOpen(true)} className="bg-pink-600 px-6 py-3 rounded-xl text-sm font-bold hover:bg-pink-500 transition">IMPORT IG</button>
              </div>
            )}

            {/* Follow Button */}
            {!isOwnProfile && currentUserId && (
              <button onClick={toggleFollow} disabled={followLoading} className="mt-8 w-full max-w-sm py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-lg transition">
                {isFollowing ? "UNFOLLOW" : "FOLLOW"}
              </button>
            )}
        </section>

        <SuggestedUsers />

        {/* STATS */}
        <section className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="flex flex-col">
                <span className="text-3xl font-black">{profile.items_count ?? 0}</span>
                <span className="text-zinc-500 text-xs font-bold uppercase mt-1">Items</span>
            </div>
            <div className="flex flex-col border-x border-zinc-800">
                <span className="text-3xl font-black">{profile.collections_count ?? 0}</span>
                <span className="text-zinc-500 text-xs font-bold uppercase mt-1">Colls</span>
            </div>
            <div className="flex flex-col">
                <span className="text-3xl font-black">£{profile.vault_value ?? 0}</span>
                <span className="text-zinc-500 text-xs font-bold uppercase mt-1">Vault</span>
            </div>
          </div>
        </section>

        {/* FEED */}
        <section className="w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tight">Recent Drops</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recentDrops.map((drop) => (
              <div key={drop.id} onClick={() => router.push(`/items/${drop.id}`)} className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 cursor-pointer border border-zinc-800 hover:border-zinc-500 transition">
                <img src={drop.image_url || "/default-item.png"} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        </section>

        {/* Log Out */}
        {isOwnProfile && (
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/auth/login"); }} className="mt-4 text-zinc-600 font-bold hover:text-red-500 transition uppercase text-xs tracking-widest">
            Logout Account
          </button>
        )}
      </main>

      {/* Modals */}
      {isImportOpen && <ImportInstagramModal onClose={() => setIsImportOpen(false)} />}
      
      {showAddItem && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[999] p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[40px] w-full max-w-sm shadow-2xl">
            <h2 className="text-2xl font-black mb-6 text-center">NEW ITEM</h2>
            {!preview ? (
              <label className="border-4 border-dashed border-zinc-800 rounded-3xl p-12 flex flex-col items-center cursor-pointer hover:border-indigo-500 transition">
                <span className="text-zinc-500 font-bold uppercase text-xs">Tap to Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if(f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            ) : (
              <img src={preview} className="rounded-2xl max-h-56 w-full object-cover mb-4 shadow-lg" />
            )}
            <div className="flex gap-4 mt-8">
              <button onClick={() => { setShowAddItem(false); setPreview(null); }} className="flex-1 py-4 font-bold text-zinc-500">CANCEL</button>
              <button disabled={!file} className="flex-1 bg-white text-black font-black py-4 rounded-2xl disabled:opacity-30 uppercase">POST</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
