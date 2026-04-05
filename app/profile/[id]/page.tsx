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
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  // Core Data State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // UI & Modals State
  const [showAddItem, setShowAddItem] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);
  
  // Edit & Upload States
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editedDisplayUrl, setEditedDisplayUrl] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [editedTier, setEditedTier] = useState("");
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Social State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Determine if viewing own profile
  const isOwnProfile = currentUserId === userId;

  // 1. Get current user session on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // 2. Load target profile data
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
        
        // Pre-fill edit fields
        setEditedDisplayUrl(data.display_url || "");
        setEditedBio(data.bio || "");
        setEditedLocation(data.location || "");
        setEditedTier(data.tier || "");
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  // 3. Load community feed
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

  // 4. Check follow status
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

  // --- Profile Actions ---

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
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", currentUserId);

      if (updateError) throw updateError;
      
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      setEditMode(false);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
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

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

      await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", currentUserId);

      setProfile((prev) => prev ? { ...prev, avatar_url: urlData.publicUrl } : null);
      alert("Avatar updated!");
    } catch (err) {
      console.error(err);
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

  // --- Helpers ---
  const displayName = useMemo(() => profile?.display_url || profile?.username || "Collector", [profile]);

  const getTierIcon = (tier?: string | null) => {
    if (!tier) return null;
    const lower = tier.toLowerCase();
    if (lower.includes("bronze")) return "/bronze.png";
    if (lower.includes("silver")) return "/silver.png";
    if (lower.includes("gold")) return "/gold.png";
    if (lower.includes("diamond")) return "/diamond.png";
    if (lower.includes("founder")) return "/founder.png";
    return null;
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  if (error || !profile) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{error || "Not Found"}</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="h-14" />

      <main className="pt-8 pb-20 space-y-10 max-w-[720px] mx-auto px-4">
        
        {/* Profile Header */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg text-center overflow-visible">
          <div className="flex flex-col items-center w-full">
            
            {/* Avatar */}
            <div className="mb-6 relative group">
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt="Avatar"
                className={`w-28 h-28 object-cover rounded-xl border-2 border-white shadow-md ${uploading ? 'opacity-50' : ''}`}
              />
              {isOwnProfile && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition cursor-pointer rounded-xl">
                  <span className="text-xs font-bold">Edit</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Editable Content vs View Content */}
            {editMode ? (
              <div className="w-full max-w-lg space-y-4">
                <input
                  type="text"
                  value={editedDisplayUrl}
                  onChange={(e) => setEditedDisplayUrl(e.target.value)}
                  placeholder="Display Name"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-center text-xl"
                />
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  placeholder="Bio"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 h-24 resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={saveProfileChanges} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold transition">
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditMode(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl transition">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-1">{displayName}</h1>
                {profile.username && <p className="text-indigo-400 text-xl mb-4">@{profile.username}</p>}
                <p className="text-gray-300 text-lg mb-4 max-w-lg leading-relaxed">
                  {profile.bio || "No bio set."}
                </p>
                {profile.location && <p className="text-gray-400 text-lg mb-4">{profile.location}</p>}
              </>
            )}

            <Link href="/collections" className="block w-full max-w-md mx-auto text-center bg-white text-black font-semibold py-4 rounded-2xl mt-6 border border-zinc-700 active:opacity-80 transition text-lg">
              View Collections
            </Link>

            {/* Profile Actions */}
            {isOwnProfile && !editMode && (
              <div className="mt-10 flex flex-wrap gap-3 justify-center">
                <button onClick={() => setShowAddItem(true)} className="border border-zinc-600 hover:bg-zinc-800 px-6 py-3 rounded-xl text-sm font-medium transition">+ Item</button>
                <button onClick={() => setEditMode(true)} className="border border-zinc-600 hover:bg-zinc-800 px-6 py-3 rounded-xl text-sm font-medium transition">Edit Profile</button>
                <button onClick={() => setIsImportOpen(true)} className="bg-pink-600 hover:bg-pink-500 px-6 py-3 rounded-xl text-white font-medium transition">Instagram Import</button>
              </div>
            )}

            {!isOwnProfile && currentUserId && (
              <button onClick={toggleFollow} disabled={followLoading} className="mt-8 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-lg font-medium transition">
                {followLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </section>

        <SuggestedUsers />

        {/* Stats Section */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 text-center">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            <div><p className="text-3xl font-bold">{profile.items_count ?? 0}</p><p className="text-gray-500 text-sm mt-1">Items</p></div>
            <div><p className="text-3xl font-bold">{profile.collections_count ?? 0}</p><p className="text-gray-500 text-sm mt-1">Collections</p></div>
            <div onClick={() => router.push("/followers")} className="cursor-pointer group">
              <p className="text-3xl font-bold group-hover:text-indigo-400">{profile.followers_count ?? 0}</p>
              <p className="text-gray-500 text-sm mt-1">Followers</p>
            </div>
            <div onClick={() => router.push("/following")} className="cursor-pointer group">
              <p className="text-3xl font-bold group-hover:text-indigo-400">{profile.following_count ?? 0}</p>
              <p className="text-gray-500 text-sm mt-1">Following</p>
            </div>
            <div><p className="text-3xl font-bold">£{profile.vault_value ?? 0}</p><p className="text-gray-500 text-sm mt-1">Vault</p></div>
            <div><p className="text-3xl font-bold">{profile.likes_count ?? 0}</p><p className="text-gray-500 text-sm mt-1">Likes</p></div>
          </div>
        </section>

        {/* Community Feed */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10">
          <h2 className="text-2xl font-bold mb-8 text-center">Live Community Drops</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {recentDrops.map((drop) => (
              <div key={drop.id} onClick={() => router.push(`/items/${drop.id}`)} className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition cursor-pointer">
                <img src={drop.image_url || "/default-item.png"} alt={drop.name} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-4 flex flex-col justify-end">
                  <p className="text-white text-xs font-bold">@{drop.profiles?.username}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Auth Actions */}
        {isOwnProfile && (
          <div className="flex flex-col gap-4">
             <button onClick={async () => { await supabase.auth.signOut(); router.push("/auth/login"); }} className="w-full py-4 bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white rounded-xl font-bold transition">
              Log Out
            </button>
          </div>
        )}

      </main>

      {/* Modals */}
      <ImportInstagramModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      
      {/* Footer is usually at the bottom of the page container */}
      <Footer />
    </div>
  );
}
