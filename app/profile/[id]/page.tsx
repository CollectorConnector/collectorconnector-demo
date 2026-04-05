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

// ... (Types remain the same)

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // App State
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);
  
  // Edit/Upload States
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // Unified loading state for uploads
  const [editedDisplayUrl, setEditedDisplayUrl] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [editedTier, setEditedTier] = useState("");
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // 1. Get current user session
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  const isOwnProfile = currentUserId === userId;

  // 2. Load profile data
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
        
        // Populate edit fields
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
  }, [userId]); // Removed isOwnProfile from deps to prevent unnecessary re-runs

  // 3. Load recent drops
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

  // 4. Follow check
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

  // --- ACTIONS ---

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
      alert("Avatar update failed");
    } finally {
      setUploading(false);
    }
  }

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
      
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      setEditMode(false);
      alert("Profile saved!");
    } catch (err) {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  // --- HELPERS ---
  const displayName = useMemo(() => profile?.display_url || profile?.username || "Collector", [profile]);

  const getTierIcon = (tier?: string | null) => {
    if (!tier) return null;
    const lower = tier.toLowerCase();
    const tiers = ['bronze', 'silver', 'gold', 'diamond', 'founder'];
    const matched = tiers.find(t => lower.includes(t));
    return matched ? `/${matched}.png` : null;
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  if (error || !profile) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="h-14" />

      <main className="pt-8 pb-20 space-y-10 max-w-[720px] mx-auto px-4">
        <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 shadow-lg text-center">
          <div className="flex flex-col items-center w-full">
            
            {/* Avatar Section */}
            <div className="mb-6 relative group">
              <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt="Avatar"
                className={`w-28 h-28 object-cover rounded-xl border-2 border-white shadow-md ${uploading ? 'opacity-50' : ''}`}
              />
              {isOwnProfile && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition cursor-pointer rounded-xl">
                  <span className="text-xs font-bold">Change</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Editable Fields */}
            {editMode ? (
              <div className="w-full max-w-md space-y-3">
                <input
                  type="text"
                  placeholder="Display Name"
                  value={editedDisplayUrl}
                  onChange={(e) => setEditedDisplayUrl(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-4 py-2 w-full text-center"
                />
                <textarea
                  placeholder="Bio"
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-4 py-2 w-full h-24 resize-none"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={saveProfileChanges} 
                    disabled={saving}
                    className="flex-1 bg-indigo-600 py-2 rounded-lg font-bold"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setEditMode(false)} className="flex-1 bg-zinc-800 py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-1">{displayName}</h1>
                {profile.username && <p className="text-indigo-400 text-xl mb-4">@{profile.username}</p>}
                <p className="text-gray-300 text-lg mb-4 max-w-lg leading-relaxed">
                  {profile.bio || "This collector hasn’t written a bio yet."}
                </p>
              </>
            )}

            <Link href="/collections" className="block w-full max-w-md mx-auto bg-white text-black font-semibold py-4 rounded-2xl mt-6 border border-zinc-700 transition">
              View Collections
            </Link>

            {/* Action Buttons */}
            {isOwnProfile && !editMode && (
              <div className="mt-10 flex flex-wrap gap-3 justify-center">
                <button onClick={() => setShowAddItem(true)} className="border border-zinc-600 hover:bg-zinc-800 px-6 py-3 rounded-xl text-sm font-medium transition">+ Add Item</button>
                <button onClick={() => setEditMode(true)} className="border border-zinc-600 hover:bg-zinc-800 px-6 py-3 rounded-xl text-sm font-medium transition">Edit Profile</button>
                <button onClick={() => setIsImportOpen(true)} className="bg-pink-600 hover:bg-pink-500 px-6 py-3 rounded-xl text-white font-medium transition">Import Instagram</button>
              </div>
            )}

            {!isOwnProfile && currentUserId && (
              <button onClick={toggleFollow} disabled={followLoading} className="mt-8 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-lg font-medium transition disabled:opacity-50">
                {followLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </section>

        <SuggestedUsers />
        
        {/* Stats and Grid remain largely the same... */}
      </main>

      {/* Logout & Modals... */}
    </div>
  );
}
