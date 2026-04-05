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
  const [editedTier, setEditedTier] = useState("");
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
        setEditedTier(data.tier || "");
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
        tier: editedTier || null,
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
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500">
      <Header />
      
      {/* Increased margin to force content below the 56px fixed header */}
      <main className="mt-20 pb-20 space-y-10 max-w-[720px] mx-auto px-4 relative z-10">
        
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-xl text-center">
          <div className="flex flex-col items-center">
            
            <div className="mb-6 relative group">
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt="Avatar"
                className={`w-28 h-28 object-cover rounded-2xl border-2 border-zinc-800 shadow-md ${uploading ? 'opacity-50' : ''}`}
              />
              {isOwnProfile && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition cursor-pointer rounded-2xl">
                  <span className="text-xs font-bold text-white">Change</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>

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
                    {saving ? "..." : "Save"}
                  </button>
                  <button onClick={() => setEditMode(false)} className="flex-1 bg-zinc-800 py-3 rounded-xl">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-1">{displayName}</h1>
                {profile.username && <p className="text-indigo-400 text-lg mb-4">@{profile.username}</p>}
                <p className="text-zinc-400 text-base mb-6 max-w-md">{profile.bio || "No bio yet."}</p>
              </>
            )}

            {/* THE COLLECTIONS LINK */}
            <Link 
              href={`/collections?user=${userId}`} 
              className="w-full max-w-sm bg-white text-black font-bold py-4 rounded-2xl mt-4 hover:bg-zinc-200 transition text-center"
            >
              View Collections
            </Link>

            {isOwnProfile && !editMode && (
              <div className="mt-8 flex flex-wrap gap-2 justify-center">
                <button onClick={() => setShowAddItem(true)} className="bg-zinc-900 border border-zinc-800 px-5 py-2 rounded-lg text-sm hover:bg-zinc-800">+ Item</button>
                <button onClick={() => setEditMode(true)} className="bg-zinc-900 border border-zinc-800 px-5 py-2 rounded-lg text-sm hover:bg-zinc-800">Edit Profile</button>
                <button onClick={() => setIsImportOpen(true)} className="bg-pink-600/10 text-pink-500 border border-pink-500/20 px-5 py-2 rounded-lg text-sm hover:bg-pink-600 hover:text-white transition">Import Instagram</button>
              </div>
            )}

            {!isOwnProfile && currentUserId && (
              <button onClick={toggleFollow} disabled={followLoading} className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition">
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </section>

        <SuggestedUsers />

        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold">{profile.items_count ?? 0}</p><p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Items</p></div>
            <div><p className="text-2xl font-bold">{profile.collections_count ?? 0}</p><p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Colls</p></div>
            <div><p className="text-2xl font-bold">£{profile.vault_value ?? 0}</p><p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Vault</p></div>
          </div>
        </section>

        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Recent Drops</h2>
          <div className="grid grid-cols-3 gap-4">
            {recentDrops.map((drop) => (
              <div key={drop.id} onClick={() => router.push(`/items/${drop.id}`)} className="aspect-square rounded-lg overflow-hidden bg-zinc-900 cursor-pointer border border-zinc-800">
                <img src={drop.image_url || "/default-item.png"} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        </section>

        {isOwnProfile && (
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/auth/login"); }} className="w-full py-4 text-zinc-500 text-sm hover:text-red-500 transition">
            Log Out
          </button>
        )}
      </main>

      {isImportOpen && <ImportInstagramModal onClose={() => setIsImportOpen(false)} />}
      
      {showAddItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Add Item</h2>
            {!preview ? (
              <label className="border-2 border-dashed border-zinc-800 rounded-2xl p-10 flex flex-col items-center cursor-pointer hover:border-indigo-500 transition">
                <span className="text-zinc-500">Upload Item Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if(f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                }} />
              </label>
            ) : (
              <img src={preview} className="rounded-xl max-h-48 w-full object-cover mb-4" />
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddItem(false); setPreview(null); }} className="flex-1 py-3 text-zinc-400">Cancel</button>
              <button disabled={!file} className="flex-1 bg-white text-black font-bold py-3 rounded-xl disabled:opacity-50">Post</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
