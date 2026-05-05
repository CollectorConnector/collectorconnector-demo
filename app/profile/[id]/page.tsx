"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";
import Header from "@/components/Header";
import Link from "next/link";
import ChatDrawer from "@/components/ChatDrawer";
import FollowersListDrawer from "@/components/FollowersListDrawer";

// --- SVG ICONS ---
const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0-.084-.028c.462-.63.862-1.297 1.197-2.002a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.291a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/></svg>
);

const TwitchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0 3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
);

const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V15.5c0 1.93-1.46 3.65-3.39 3.81-2.31.19-4.32-1.47-4.52-3.75-.23-2.36 1.54-4.63 3.91-4.99.34-.05.69-.07 1.02-.06l.01-4.07c-2.09.12-3.97.91-5.48 2.36C8.34 10.4 7.72 12.3 7.72 14.33c0 4.24 3.44 7.67 7.68 7.67 4.25 0 7.67-3.44 7.67-7.67V0h-4.43c-.04.01-.08.01-.12.02H12.525z"/>
  </svg>
);

const FixedEbayLogo = () => (
  <span style={{ 
    fontSize: '22px', 
    fontWeight: '900', 
    letterSpacing: '-1px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }}>
    <span style={{ color: '#E53238' }}>e</span>
    <span style={{ color: '#0064D2' }}>b</span>
    <span style={{ color: '#F5AF02' }}>a</span>
    <span style={{ color: '#86B817' }}>y</span>
  </span>
);

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || "";

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [itemCount, setItemCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [vaultValue, setVaultValue] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const [showSmartDrop, setShowSmartDrop] = useState(false);
  const [showEditCollection, setShowEditCollection] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false); 
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null); 
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [isFollowersListOpen, setIsFollowersListOpen] = useState(false);
  const [followersListMode, setFollowersListMode] = useState<"followers" | "following">("followers");

  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  const [recentDrops, setRecentDrops] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [newCollName, setNewCollName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState(""); 
  const [customNiche, setCustomNiche] = useState("");
  const [availableNiches, setAvailableNiches] = useState(["Cards", "Sneakers", "Watches", "Art", "Coins"]);
  const [collectionsList, setCollectionsList] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  const [editingColl, setEditingColl] = useState<any>(null);
  const [collItems, setCollItems] = useState<any[]>([]); 

  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  
  const [files, setFiles] = useState<File[]>([]);
  const [userRank, setUserRank] = useState<string | null>(null);

  const [selectedAudience, setSelectedAudience] = useState<"everyone" | "private">("everyone");

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const isOwnProfile = currentUserId === userId;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    } catch (err) {
      console.error(err);
      alert("Failed to copy – please try again");
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id || null;
      setCurrentUserId(uid);
      if (uid) {
        loadLikedItems(uid);
      }
    });
    loadGlobalNiches();
  }, [userId]);

  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel("global-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${currentUserId}` },
        () => {
          if (!isChatOpen) {
            setHasNewMessage(true);
            if ("vibrate" in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, isChatOpen]);

  useEffect(() => {
    if (!userId) return;
    loadAllData();
    loadFollowCounts();
    determineRank();
  }, [userId]);

  useEffect(() => {
    if (selectedItemIndex !== null) {
      loadComments(recentDrops[selectedItemIndex].id);
      checkFollowStatusForLightbox();
    }
  }, [selectedItemIndex]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("openChat") === "true") {
      setIsChatOpen(true);
      const newPath = window.location.pathname;
      window.history.replaceState(null, '', newPath);
    }
  }, [userId]);

  useEffect(() => {
    if (userId && currentUserId && userId !== currentUserId) {
      checkFollowStatus();
    }
  }, [userId, currentUserId]);

  async function loadLikedItems(uid: string) {
    const { data } = await supabase
      .from("likes")
      .select("item_id")
      .eq("user_id", uid);
    if (data) {
      setLikedItems(new Set(data.map(l => l.item_id)));
    }
  }

  async function loadComments(itemId: string) {
    const { data } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (
          username,
          display_url,
          avatar_url
        )
      `)
      .eq("item_id", itemId)
      .order("created_at", { ascending: true });
    setComments(data || []);
  }

  async function handleAddComment() {
    if (!newComment.trim() || !currentUserId || selectedItemIndex === null) return;
    setIsSubmittingComment(true);
    const itemId = recentDrops[selectedItemIndex].id;

    const { error } = await supabase.from("comments").insert({
      item_id: itemId,
      user_id: currentUserId,
      content: newComment.trim()
    });

    if (!error) {
      setNewComment("");
      loadComments(itemId);
    }
    setIsSubmittingComment(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function loadGlobalNiches() {
    const { data } = await supabase.from("collections").select("niche");
    if (data) {
      const uniqueNiches = Array.from(new Set(data.map(i => i.niche))).filter(Boolean);
      setAvailableNiches(prev => Array.from(new Set([...prev, ...uniqueNiches as string[]])));
    }
  }

  async function checkFollowStatus() {
    const { data } = await supabase.from("follows").select("*").eq("follower_id", currentUserId).eq("following_id", userId).single();
    setIsFollowing(!!data);
  }

  const [lightboxIsFollowing, setLightboxIsFollowing] = useState(false);
  async function checkFollowStatusForLightbox() {
    if (selectedItemIndex === null || !currentUserId) return;
    const targetId = recentDrops[selectedItemIndex].profiles?.id;
    if (targetId === currentUserId) return;
    const { data } = await supabase.from("follows").select("*").eq("follower_id", currentUserId).eq("following_id", targetId).single();
    setLightboxIsFollowing(!!data);
  }

  async function loadFollowCounts() {
    const { count: followers } = await supabase.from("follows").select("*", { count: 'exact', head: true }).eq("following_id", userId);
    const { count: following } = await supabase.from("follows").select("*", { count: 'exact', head: true }).eq("follower_id", userId);
    setFollowerCount(followers || 0);
    setFollowingCount(following || 0);
  }

  async function toggleFollow() {
    if (!currentUserId) return alert("Please log in to follow collectors!");
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", userId);
      setIsFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: currentUserId, following_id: userId });
      setIsFollowing(true);
    }
    loadFollowCounts();
  }

  async function toggleFollowUser(targetUserId: string) {
    if (!currentUserId) return alert("Please log in to follow collectors!");
    if (lightboxIsFollowing) {
      await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", targetUserId);
      setLightboxIsFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: currentUserId, following_id: targetUserId });
      setLightboxIsFollowing(true);
    }
    if (targetUserId === userId) checkFollowStatus(); 
  }

  async function determineRank() {
    const stacyId = "8b594b57-fc82-477a-a709-45aec99a228f"; 
    if (userId === stacyId) { setUserRank("diamond"); return; }
    
    const foundersIds = [
        "e0759f79-d113-4af6-a575-cee076037092", 
        "bb088a77-ba12-4fe3-a357-03d13dc0d019" 
    ];

    if (foundersIds.includes(userId)) { setUserRank("founder"); return; }

    const { data: allUsers } = await supabase.from("profiles").select("id").order("created_at", { ascending: true });
    if (allUsers) {
      const index = allUsers.findIndex(u => u.id === userId);
      if (index >= 3 && index < 13) setUserRank("gold");
      else if (index >= 13 && index < 23) setUserRank("silver");
      else if (index >= 23 && index < 33) setUserRank("bronze");
      else setUserRank("collector");
    }
  }

  async function loadAllData() {
    try {
      setLoading(true);
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (prof) setProfile(prof);
      
      const { data: localItems } = await supabase
        .from("items")
        .select(`
          id,
          title,
          image_url,
          estimated_value,
          niche_families (
            name
          )
        `)
        .eq("user_id", userId);
      if (localItems) {
        setItemCount(localItems.length);
        setVaultValue(localItems.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0));
      }

      // FIX: Query items specifically for the profile being viewed
      const { data: userDrops, error: dropError } = await supabase
        .from("items")
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            display_url,
            avatar_url
          ),
          niche_families (
            name
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (dropError) {
        console.error(dropError);
      } else if (userDrops) {
        setRecentDrops(userDrops);
      }

      const { data: colls } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
        
      if (colls) { setCollectionCount(colls.length); setCollectionsList(colls); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleUpdateProfile() {
    setUploading(true);
    try {
      const { error } = await supabase.from("profiles").update({ 
        display_url: profile.display_url, 
        bio: profile.bio,
        instagram_url: profile.instagram_url,
        ebay_url: profile.ebay_url,
        facebook_url: profile.facebook_url,
        x_url: profile.x_url,
        whatnot_url: profile.whatnot_url,
        youtube_url: profile.youtube_url,
        tiktok_url: profile.tiktok_url, 
        discord_handle: profile.discord_handle,
        twitch_handle: profile.twitch_handle
      }).eq("id", userId);

      if (error) throw error;
      alert("Profile updated!"); 
      setShowEditProfile(false); 
      loadAllData();
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setUploading(false); 
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${userId}/avatar-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from("item-images").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      if (updateError) throw updateError;
      setProfile({ ...profile, avatar_url: publicUrl });
      alert("Avatar Updated!");
    } catch (err: any) { alert("Upload failed: " + err.message); } finally { setUploading(false); }
  }

  async function handleSmartDrop() {
    if (files.length === 0) return alert("Select at least one image!");
    const finalNiche = selectedNiche === "Other" ? customNiche : selectedNiche;
    setUploading(true);

    try {
      let targetCollectionId = selectedCollectionId;

      if (!targetCollectionId && newCollName.trim()) {
        const { data: newColl, error: collErr } = await supabase
          .from("collections")
          .insert([{ 
            user_id: userId, 
            title: newCollName.trim(), 
            niche: finalNiche || "General" 
          }])
          .select()
          .single();
        
        if (collErr) throw collErr;
        targetCollectionId = newColl.id;
      }

      if (!targetCollectionId) throw new Error("Please select or create a collection.");

      const valuePerItem = (parseFloat(itemValue) / files.length) || 0;
      
      for (const f of files) {
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        await supabase.storage.from("item-images").upload(fileName, f);
        const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
        
        await supabase.from("items").insert({
          user_id: userId,
          title: itemName || "New Drop",
          image_url: publicUrl,
          estimated_value: valuePerItem,
          collection: targetCollectionId,
          status: "active",
          audience: selectedAudience
        });
      }

      alert("Drop Successful!");
      setShowSmartDrop(false);
      setFiles([]);
      setItemName("");
      setItemValue("");
      setNewCollName("");
      setSelectedCollectionId("");
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function toggleLike(itemId: string) {
    if (!currentUserId) return alert("Please log in to like items!");
    
    const isLiked = likedItems.has(itemId);
    const newLiked = new Set(likedItems);
    
    if (isLiked) {
      newLiked.delete(itemId);
      await supabase.from("likes").delete().eq("user_id", currentUserId).eq("item_id", itemId);
    } else {
      newLiked.add(itemId);
      await supabase.from("likes").insert({ user_id: currentUserId, item_id: itemId });
    }
    setLikedItems(newLiked);
  }

  async function deleteItem(id: string) {
    if(!confirm("Delete this photo?")) return;
    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", id)
        .eq("user_id", currentUserId);

      if (error) throw error;
      
      setCollItems(prev => prev.filter(i => i.id !== id));
      setRecentDrops(prev => prev.filter(i => i.id !== id));
      loadAllData();
    } catch (err: any) {
      alert("Error deleting item: " + err.message);
    }
  }

  const renderRankIcon = () => {
    if (!userRank) return null;
    return <img src={`/${userRank}.png`} style={{ width: '30px' }} alt="rank" />;
  };

  const tierIconPath = `/icons/tiers/${(userRank || 'collector').toLowerCase()}.svg`;

  if (loading) return <div className="min-h-screen bg-black" />;

  const hasValidAvatar = profile?.avatar_url && profile.avatar_url.startsWith('http');

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', textAlign: 'center', position: 'relative' }}>
            {isOwnProfile && (
              <button onClick={() => setShowEditProfile(true)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', zIndex: 10 }}>EDIT PROFILE</button>
            )}
            
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px' }}>
              <div 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: '#18181b',
                  borderRadius: '38%', 
                  overflow: 'hidden',
                  border: '4px solid #18181b',
                  cursor: isOwnProfile ? 'pointer' : 'default'
                }}
                onClick={() => isOwnProfile && document.getElementById('avatar-input')?.click()}
              >
                <img 
                  key={profile?.avatar_url || 'no-avatar'}
                  src={hasValidAvatar ? profile.avatar_url : tierIconPath} 
                  crossOrigin="anonymous"
                  onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    if (target.src !== window.location.origin + tierIconPath) {
                      target.src = tierIconPath;
                      target.style.padding = '28px';
                      target.style.objectFit = 'contain';
                    }
                  }}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: hasValidAvatar ? 'cover' : 'contain', 
                    padding: hasValidAvatar ? '0' : '28px'
                  }} 
                />
              </div>
              {isOwnProfile && <input type="file" id="avatar-input" hidden accept="image/*" onChange={handleAvatarUpload} />}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800' }}>{profile?.display_url || profile?.username}</h1>
              {renderRankIcon()}
              {!isOwnProfile && currentUserId && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={toggleFollow} style={{ background: isFollowing ? 'transparent' : '#fff', color: isFollowing ? '#fff' : '#000', border: isFollowing ? '1px solid #27272a' : 'none', padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '900' }}>{isFollowing ? 'FOLLOWING' : 'FOLLOW'}</button>
                  <button onClick={() => { setIsChatOpen(true); setHasNewMessage(false); }} style={{ position: 'relative', background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '900' }}>MESSAGE{hasNewMessage && <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', border: '2px solid #000' }} />}</button>
                </div>
              )}
            </div>
            <p style={{ color: '#818cf8', fontWeight: 'bold' }}>@{profile?.username}</p>
            <p style={{ color: '#a1a1aa', margin: '4px 0 12px' }}>{profile?.bio || "Digital Vault Explorer."}</p>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', margin: '10px 0 20px' }}>
                <div 
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => {
                    if (followerCount > 0) {
                      setFollowersListMode("followers");
                      setIsFollowersListOpen(true);
                    }
                  }}
                >
                  <p style={{ fontSize: '18px', fontWeight: '900' }}>{followerCount}</p>
                  <p style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: 'bold', letterSpacing: '1px' }}>FOLLOWERS</p>
                </div>
                <div 
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => {
                    if (followingCount > 0) {
                      setFollowersListMode("following");
                      setIsFollowersListOpen(true);
                    }
                  }}
                >
                  <p style={{ fontSize: '18px', fontWeight: '900' }}>{followingCount}</p>
                  <p style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: 'bold', letterSpacing: '1px' }}>FOLLOWING</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px', alignItems: 'center', minHeight: '32px' }}>
               {profile?.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" style={{ color: '#E4405F', display: 'flex', alignItems: 'center' }}><InstagramIcon /></a>}
               {profile?.ebay_url && <a href={profile.ebay_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}><FixedEbayLogo /></a>}
               {profile?.tiktok_url && <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', display: 'flex', alignItems: 'center' }}><TikTokIcon /></a>}
               
               {profile?.discord_handle && (
                 <span
                   onClick={() => copyToClipboard(profile.discord_handle, "Discord handle")}
                   style={{ color: '#5865F2', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                   title={`Copy ${profile.discord_handle}`}
                 >
                   <DiscordIcon />
                 </span>
               )}
               
               {profile?.twitch_handle && (
                 <a
                   href={`https://www.twitch.tv/${profile.twitch_handle.replace(/^https?:\/\/(?:www\.)?twitch\.tv\/?/i, '')}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   style={{ color: '#9146FF', display: 'flex', alignItems: 'center' }}
                 >
                   <TwitchIcon />
                 </a>
               )}
            </div>

            {/* FIX: Link to the correct collections route */}
            <Link 
               href={`/profile/${userId}/collections`} 
               style={{ display: 'block', background: '#fff', color: '#000', fontWeight: '900', padding: '16px', borderRadius: '16px', textDecoration: 'none', marginBottom: '20px' }}
            >
                VIEW COLLECTIONS
            </Link>

            {isOwnProfile && (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  onClick={() => { setFiles([]); setShowSmartDrop(true); }} 
                  style={{ width: '100%', background: '#fff', color: '#000', padding: '16px', borderRadius: '16px', fontWeight: '900' }}
                >
                  + SMART DROP
                </button>
              </div>
            )}
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '20px', borderRadius: '20px', textAlign: 'center' }}><p style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 'bold' }}>ITEMS</p><p style={{ fontSize: '20px', fontWeight: '900' }}>{itemCount}</p></div>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '20px', borderRadius: '20px', textAlign: 'center', cursor: isOwnProfile ? 'pointer' : 'default' }} onClick={() => isOwnProfile && setShowEditCollection(true)}><p style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 'bold' }}>COLLECTIONS {isOwnProfile && '⚙️'}</p><p style={{ fontSize: '20px', fontWeight: '900' }}>{collectionCount}</p></div>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '20px', borderRadius: '20px', textAlign: 'center' }}><p style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 'bold' }}>VALUE</p><p style={{ fontSize: '20px', fontWeight: '900', color: '#4ade80' }}>£{vaultValue}</p></div>
        </div>

        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px' }}>RECENT DROPS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {recentDrops.map((drop, index) => {
              const authorId = drop.profiles?.id || drop.user_id;

              return (
                <div 
                  key={drop.id} 
                  onClick={() => setSelectedItemIndex(index)} 
                  style={{ 
                    aspectRatio: '1/1', 
                    background: '#18181b', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    cursor: 'pointer', 
                    position: 'relative' 
                  }}
                >
                  <img src={drop.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
                  <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
                    {authorId ? (
                      <Link 
                        href={`/profile/${authorId}`}
                        onClick={(e) => e.stopPropagation()} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: 'rgba(0,0,0,0.4)', 
                          backdropFilter: 'blur(10px)',
                          width: '32px',
                          height: '32px', 
                          borderRadius: '50%',
                          textDecoration: 'none',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="4"></circle>
                          <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
                        </svg>
                      </Link>
                    ) : null}
                  </div>

                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 10 }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLike(drop.id); }}
                      style={{ 
                        background: 'rgba(0,0,0,0.5)', 
                        border: 'none', 
                        borderRadius: '50%', 
                        width: '30px', 
                        height: '30px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: likedItems.has(drop.id) ? '#fbbf24' : '#fff' 
                      }}
                    >
                      {likedItems.has(drop.id) ? '⭐' : '☆'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {isOwnProfile && <button onClick={handleLogout} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#18181b', border: '1px solid #27272a', color: '#ef4444', fontWeight: '900', cursor: 'pointer', letterSpacing: '1px' }}>LOGOUT</button>}
        
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '900', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1px' }}>Suggested Users</h2>
            <Link href="/suggested" style={{ textDecoration: 'none' }}>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: '900', 
                color: '#818cf8', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                VIEW ALL
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </Link>
          </div>
          <SuggestedUsers />
        </div>
      </main>

      {/* --- LIGHTBOX MODAL --- */}
      {selectedItemIndex !== null && (
        <div 
          onClick={() => setSelectedItemIndex(null)}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.95)', 
            zIndex: 999, 
            display: 'flex', 
            flexDirection: 'column' 
          }}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedItemIndex(null); }} 
            style={{ 
              position: 'absolute', 
              top: '20px', 
              right: '20px', 
              background: 'transparent', 
              border: 'none', 
              color: '#fff', 
              fontSize: '32px', 
              zIndex: 1001,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
             <img 
               src={recentDrops[selectedItemIndex].image_url} 
               style={{ maxHeight: '85vh', maxWidth: '100%', objectFit: 'contain' }} 
               onClick={(e) => e.stopPropagation()} 
             />
             
             {selectedItemIndex > 0 && (
               <button 
                onClick={(e) => { e.stopPropagation(); setSelectedItemIndex(selectedItemIndex - 1); }}
                style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '20px', borderRadius: '50%', fontSize: '24px' }}
               >
                 ←
               </button>
             )}
             
             {selectedItemIndex < recentDrops.length - 1 && (
               <button 
                onClick={(e) => { e.stopPropagation(); setSelectedItemIndex(selectedItemIndex + 1); }}
                style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '20px', borderRadius: '50%', fontSize: '24px' }}
               >
                 →
               </button>
             )}
          </div>

          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: '#09090b', 
              borderTop: '1px solid #27272a', 
              padding: '24px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              maxHeight: '40vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Link href={`/profile/${recentDrops[selectedItemIndex].profiles?.id}`}>
                  <img 
                    src={recentDrops[selectedItemIndex].profiles?.avatar_url || tierIconPath} 
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                </Link>
                <div>
                  <Link href={`/profile/${recentDrops[selectedItemIndex].profiles?.id}`} style={{ textDecoration: 'none' }}>
                    <p style={{ fontWeight: '900', fontSize: '16px', color: '#fff' }}>@{recentDrops[selectedItemIndex].profiles?.username}</p>
                  </Link>
                  <p style={{ color: '#4ade80', fontWeight: 'bold' }}>£{recentDrops[selectedItemIndex].estimated_value}</p>
                </div>
                {recentDrops[selectedItemIndex].profiles?.id !== currentUserId && currentUserId && (
                  <button 
                    onClick={() => toggleFollowUser(recentDrops[selectedItemIndex].profiles?.id)}
                    style={{ marginLeft: '12px', background: lightboxIsFollowing ? 'transparent' : '#fff', color: lightboxIsFollowing ? '#fff' : '#000', border: lightboxIsFollowing ? '1px solid #27272a' : 'none', padding: '6px 14px', borderRadius: '15px', fontSize: '12px', fontWeight: '900' }}
                  >
                    {lightboxIsFollowing ? 'FOLLOWING' : 'FOLLOW'}
                  </button>
                )}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '8px' }}>{recentDrops[selectedItemIndex].title}</h3>
              <p style={{ color: '#a1a1aa' }}>Collection: {recentDrops[selectedItemIndex].niche_families?.name || "General"}</p>

              <div style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '900', marginBottom: '16px', color: '#52525b' }}>COMMENTS ({comments.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {comments.map((c: any) => (
                    <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                      <img src={c.profiles?.avatar_url || tierIconPath} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                      <div>
                        <p style={{ fontSize: '13px' }}>
                          <span style={{ fontWeight: '900', marginRight: '6px' }}>{c.profiles?.username}</span>
                          <span style={{ color: '#a1a1aa' }}>{c.content}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '10px', color: '#fff', fontSize: '14px' }} 
                  />
                  <button 
                    disabled={isSubmittingComment}
                    onClick={handleAddComment}
                    style={{ background: '#fff', color: '#000', border: 'none', padding: '0 20px', borderRadius: '10px', fontWeight: '900', fontSize: '12px' }}
                  >
                    POST
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => toggleLike(recentDrops[selectedItemIndex].id)}
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span style={{ fontSize: '20px' }}>{likedItems.has(recentDrops[selectedItemIndex].id) ? '⭐' : '☆'}</span>
              <span style={{ fontWeight: '900' }}>{likedItems.has(recentDrops[selectedItemIndex].id) ? 'LIKED' : 'LIKE'}</span>
            </button>
          </div>
        </div>
      )}

      {/* --- EDIT PROFILE MODAL --- */}
      {showEditProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Edit Profile</h2>
              <button onClick={() => setShowEditProfile(false)} style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '24px' }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#a1a1aa', marginBottom: '8px' }}>DISPLAY NAME</label>
                <input type="text" value={profile.display_url || ""} onChange={(e) => setProfile({...profile, display_url: e.target.value})} style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '14px', color: '#fff' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#a1a1aa', marginBottom: '8px' }}>BIO</label>
                <textarea value={profile.bio || ""} onChange={(e) => setProfile({...profile, bio: e.target.value})} style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '14px', color: '#fff', minHeight: '100px' }} />
              </div>

              <div style={{ borderTop: '1px solid #27272a', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '900', marginBottom: '16px', color: '#52525b' }}>SOCIAL LINKS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder="Instagram URL" value={profile.instagram_url || ""} onChange={(e) => setProfile({...profile, instagram_url: e.target.value})} style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '12px', color: '#fff' }} />
                  <input type="text" placeholder="eBay Store URL" value={profile.ebay_url || ""} onChange={(e) => setProfile({...profile, ebay_url: e.target.value})} style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '12px', color: '#fff' }} />
                  <input type="text" placeholder="TikTok URL" value={profile.tiktok_url || ""} onChange={(e) => setProfile({...profile, tiktok_url: e.target.value})} style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '12px', color: '#fff' }} />
                  <input type="text" placeholder="Discord Username (e.g. user#1234)" value={profile.discord_handle || ""} onChange={(e) => setProfile({...profile, discord_handle: e.target.value})} style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '12px', color: '#fff' }} />
                  <input type="text" placeholder="Twitch URL" value={profile.twitch_handle || ""} onChange={(e) => setProfile({...profile, twitch_handle: e.target.value})} style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '12px', color: '#fff' }} />
                </div>
              </div>

              <button 
                onClick={handleUpdateProfile} 
                disabled={uploading} 
                style={{ width: '100%', background: '#fff', color: '#000', fontWeight: '900', padding: '16px', borderRadius: '16px', marginTop: '10px' }}
              >
                {uploading ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SMART DROP MODAL --- */}
      {showSmartDrop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900' }}>New Smart Drop</h2>
              <button onClick={() => setShowSmartDrop(false)} style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '24px' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div 
                style={{ 
                  border: '2px dashed #27272a', 
                  borderRadius: '16px', 
                  padding: '40px', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  background: files.length > 0 ? '#18181b' : 'transparent'
                }}
                onClick={() => document.getElementById('drop-files')?.click()}
              >
                <p style={{ fontWeight: 'bold', color: files.length > 0 ? '#4ade80' : '#a1a1aa' }}>
                  {files.length > 0 ? `${files.length} PHOTOS SELECTED` : 'CLICK TO UPLOAD PHOTOS'}
                </p>
                <input 
                  type="file" 
                  id="drop-files" 
                  multiple 
                  hidden 
                  accept="image/*" 
                  onChange={(e) => setFiles(Array.from(e.target.files || []))} 
                />
              </div>

              <input 
                type="text" 
                placeholder="Item Name (e.g. Pikachu Holo)" 
                value={itemName} 
                onChange={(e) => setItemName(e.target.value)} 
                style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '14px', color: '#fff' }} 
              />

              <input 
                type="number" 
                placeholder="Total Estimated Value (£)" 
                value={itemValue} 
                onChange={(e) => setItemValue(e.target.value)} 
                style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '14px', color: '#fff' }} 
              />

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#a1a1aa', marginBottom: '8px' }}>SELECT VAULT</label>
                <select 
                  value={selectedCollectionId} 
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '14px', color: '#fff' }}
                >
                  <option value="">-- Choose Existing Vault --</option>
                  {collectionsList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ height: '1px', background: '#27272a', flex: 1 }} />
                <span style={{ fontSize: '10px', color: '#52525b', fontWeight: 'bold' }}>OR CREATE NEW</span>
                <div style={{ height: '1px', background: '#27272a', flex: 1 }} />
              </div>

              <input 
                type="text" 
                placeholder="New Vault Name" 
                value={newCollName} 
                onChange={(e) => setNewCollName(e.target.value)} 
                style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '14px', color: '#fff' }} 
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <select 
                  value={selectedNiche} 
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '14px', color: '#fff' }}
                >
                  <option value="">Select Niche</option>
                  {availableNiches.map(n => <option key={n} value={n}>{n}</option>)}
                  <option value="Other">Other...</option>
                </select>
                
                {selectedNiche === "Other" && (
                  <input 
                    type="text" 
                    placeholder="Custom Niche" 
                    value={customNiche} 
                    onChange={(e) => setCustomNiche(e.target.value)}
                    style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '14px', color: '#fff' }} 
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={() => setSelectedAudience("everyone")}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid #27272a', background: selectedAudience === "everyone" ? '#fff' : 'transparent', color: selectedAudience === "everyone" ? '#000' : '#fff' }}
                >
                  PUBLIC
                </button>
                <button 
                  onClick={() => setSelectedAudience("private")}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid #27272a', background: selectedAudience === "private" ? '#fff' : 'transparent', color: selectedAudience === "private" ? '#000' : '#fff' }}
                >
                  PRIVATE
                </button>
              </div>

              <button 
                onClick={handleSmartDrop} 
                disabled={uploading} 
                style={{ width: '100%', background: '#fff', color: '#000', fontWeight: '900', padding: '16px', borderRadius: '16px', marginTop: '10px' }}
              >
                {uploading ? 'UPLOADING...' : 'CONFIRM DROP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT COLLECTIONS MODAL --- */}
      {showEditCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Manage Vaults</h2>
              <button onClick={() => setShowEditCollection(false)} style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '24px' }}>✕</button>
            </div>

            {!editingColl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {collectionsList.map(c => (
                  <div 
                    key={c.id} 
                    onClick={async () => {
                      setEditingColl(c);
                      const { data } = await supabase.from("items").select("*").eq("collection", c.id);
                      setCollItems(data || []);
                    }}
                    style={{ background: '#18181b', border: '1px solid #27272a', padding: '20px', borderRadius: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <p style={{ fontWeight: '900' }}>{c.title}</p>
                      <p style={{ fontSize: '12px', color: '#a1a1aa' }}>{c.niche}</p>
                    </div>
                    <span>→</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <button onClick={() => setEditingColl(null)} style={{ color: '#818cf8', fontWeight: 'bold', marginBottom: '20px', background: 'none', border: 'none' }}>← BACK TO VAULTS</button>
                <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '4px' }}>{editingColl.title}</h3>
                <p style={{ color: '#a1a1aa', marginBottom: '24px' }}>Managing items in this collection</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {collItems.map(item => (
                    <div key={item.id} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden' }}>
                      <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        onClick={() => deleteItem(item.id)}
                        style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', fontSize: '12px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {currentUserId && (
        <ChatDrawer 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          currentUserId={currentUserId}
          targetUserId={userId === currentUserId ? null : userId}
        />
      )}

      <FollowersListDrawer
        isOpen={isFollowersListOpen}
        onClose={() => setIsFollowersListOpen(true)}
        userId={userId}
        mode={followersListMode}
      />

      <Footer />
    </div>
  );
}
