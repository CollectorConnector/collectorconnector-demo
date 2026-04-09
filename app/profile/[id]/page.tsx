"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";
import Header from "@/components/Header";
import Link from "next/link";

// --- SVG ICONS (BRAND SPECIFIC) ---
const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const TwitchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44c-.795 0-1.439-.645-1.439-1.44s.644-1.44 1.439-1.44z"/>
  </svg>
);

const WhatnotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L2.4 4.8v14.4L12 24l9.6-4.8V4.8L12 0zm7.2 18L12 21.6 4.8 18V6.6L12 3l7.2 3.6V18z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || "";

  // -- FULL CORE STATE RESTORED --
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const [itemCount, setItemCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [vaultValue, setVaultValue] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [recentDrops, setRecentDrops] = useState<any[]>([]);

  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [showEditCollection, setShowEditCollection] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false); 
  const [selectedItem, setSelectedItem] = useState<any>(null); 
  const [uploading, setUploading] = useState(false);

  // -- FORM DATA STATE --
  const [newCollName, setNewCollName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState(""); 
  const [customNiche, setCustomNiche] = useState("");
  const [availableNiches, setAvailableNiches] = useState(["Cards", "Sneakers", "Watches", "Art", "Coins", "Games", "Comics"]);
  const [collectionsList, setCollectionsList] = useState<any[]>([]);
  const [editingColl, setEditingColl] = useState<any>(null);
  const [collItems, setCollItems] = useState<any[]>([]); 
  const [commentText, setCommentText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<"everyone" | "private">("everyone");

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
    loadGlobalNiches();
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadAllData();
    determineRank();
    if (isOwnProfile) fetchUnreadCount();
  }, [userId, isOwnProfile]);

  useEffect(() => {
    if (userId && currentUserId && userId !== currentUserId) {
      checkFollowStatus();
    }
  }, [userId, currentUserId]);

  // -- DATA LOGIC --
  async function loadGlobalNiches() {
    const { data } = await supabase.from("collections").select("niche");
    if (data) {
      const uniqueNiches = Array.from(new Set(data.map(i => i.niche))).filter(Boolean);
      setAvailableNiches(prev => Array.from(new Set([...prev, ...uniqueNiches])));
    }
  }

  async function fetchUnreadCount() {
    const { count } = await supabase.from("messages").select("*", { count: 'exact', head: true }).eq("receiver_id", userId).eq("read", false);
    setUnreadMessages(count || 0);
  }

  async function determineRank() {
    const stacyId = "8b594b57-fc82-477a-a709-45aec99a228f"; 
    if (userId === stacyId) { setUserRank("diamond"); return; }
    const foundersIds = ["e0759f79-d113-4af6-a575-cee076037092", "bb088a77-ba12-4fe3-a357-03d13dc0019"];
    if (foundersIds.includes(userId)) { setUserRank("founder"); return; }
    const { data: allUsers } = await supabase.from("profiles").select("id").order("created_at", { ascending: true });
    if (allUsers) {
      const index = allUsers.findIndex(u => u.id === userId);
      if (index >= 0 && index < 3) setUserRank("founder");
      else if (index >= 3 && index < 13) setUserRank("gold");
      else if (index >= 13 && index < 23) setUserRank("silver");
      else if (index >= 23 && index < 33) setUserRank("bronze");
    }
  }

  async function loadAllData() {
    try {
      setLoading(true);
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (prof) setProfile(prof);
      
      const { data: localItems } = await supabase.from("items").select("*").eq("user_id", userId);
      if (localItems) {
        setItemCount(localItems.length);
        setVaultValue(localItems.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0));
      }

      // RESTORED RECENT DROPS QUERY
      const { data: globalDrops } = await supabase
        .from("items")
        .select(`*, profiles:user_id (username)`)
        .order("created_at", { ascending: false })
        .limit(24);
      if (globalDrops) setRecentDrops(globalDrops);

      const { data: colls } = await supabase.from("collections").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (colls) { setCollectionCount(colls.length); setCollectionsList(colls); }
    } finally { setLoading(false); }
  }

  async function checkFollowStatus() {
    const { data } = await supabase.from("follows").select("*").eq("follower_id", currentUserId).eq("following_id", userId).single();
    setIsFollowing(!!data);
  }

  async function toggleFollow() {
    if (!currentUserId) return;
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", userId);
      setIsFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: currentUserId, following_id: userId });
      setIsFollowing(true);
    }
  }

  async function handleUpdateProfile() {
    setUploading(true);
    try {
      await supabase.from("profiles").update(profile).eq("id", userId);
      setShowEditProfile(false); 
      loadAllData();
    } finally { setUploading(false); }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${userId}/avatar-${Date.now()}.jpg`;
      await supabase.storage.from("item-images").upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      setProfile({ ...profile, avatar_url: publicUrl });
    } finally { setUploading(false); }
  }

  async function handleCreateCollectionBatch() {
    const finalNiche = selectedNiche === "Other" ? customNiche : selectedNiche;
    if (!finalNiche || !newCollName) return alert("Missing data");
    setUploading(true);
    try {
      const { data: coll } = await supabase.from("collections").insert([{ user_id: userId, title: newCollName, niche: finalNiche }]).select().single();
      if (files.length > 0) {
        for (const f of files) {
          const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          await supabase.storage.from("item-images").upload(fileName, f);
          const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
          await supabase.from("items").insert({ user_id: userId, title: newCollName, image_url: publicUrl, collection: coll.id, status: "active", audience: selectedAudience });
        }
      }
      setShowAddCollection(false); setFiles([]); loadAllData();
    } finally { setUploading(false); }
  }

  async function deleteItem(id: string) {
    if(!confirm("Delete?")) return;
    await supabase.from("items").delete().eq("id", id);
    setCollItems(prev => prev.filter(i => i.id !== id));
    loadAllData();
  }

  const renderRankIcon = () => {
    if (!userRank) return null;
    return <img src={`/${userRank}.png`} style={{ width: '32px', height: '32px' }} alt="rank" />;
  };

  if (loading && !profile) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500">
      <Header />
      <main style={{ marginTop: '100px', paddingBottom: '100px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* --- PROFILE CARD --- */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '28px', padding: '32px', textAlign: 'center', position: 'relative' }}>
            
            {/* FIXED TOP ACTION ROW */}
            {isOwnProfile && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px' }}>
                 <Link href="/messages" style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontSize: '12px', fontWeight: '900', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    INBOX {unreadMessages > 0 && <span style={{ background: '#ef4444', padding: '2px 6px', borderRadius: '6px', fontSize: '10px' }}>{unreadMessages}</span>}
                 </Link>
                 <button onClick={() => setShowEditProfile(true)} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontSize: '12px', fontWeight: '900' }}>EDIT</button>
              </div>
            )}
            
            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 24px' }}>
              <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '100%', height: '100%', borderRadius: '24px', border: '4px solid #18181b', objectFit: 'cover' }} />
              {isOwnProfile && (
                <label style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#fff', color: '#000', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid #09090b' }}>
                  <span style={{ fontSize: '16px' }}>+</span>
                  <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                </label>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px' }}>{profile?.display_url || profile?.username}</h1>
              {renderRankIcon()}
              {!isOwnProfile && currentUserId && (
                <button onClick={toggleFollow} style={{ background: isFollowing ? 'transparent' : '#fff', color: isFollowing ? '#fff' : '#000', border: isFollowing ? '1px solid #27272a' : 'none', padding: '8px 24px', borderRadius: '24px', fontSize: '14px', fontWeight: '900' }}>
                  {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                </button>
              )}
            </div>
            <p style={{ color: '#818cf8', fontWeight: '800', fontSize: '14px' }}>@{profile?.username}</p>
            
            {/* SOCIAL GRID (SIDE BY SIDE 2 IN A ROW) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '500px', margin: '24px auto 0' }}>
                <a href={profile?.ebay_url || "#"} target="_blank" style={{ background: '#18181b', border: '1px solid #27272a', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                   <span style={{fontWeight:'900', fontSize:'18px'}}><span style={{color:'#e53238'}}>e</span><span style={{color:'#0064d2'}}>b</span><span style={{color:'#f5af02'}}>a</span><span style={{color:'#86b817'}}>y</span></span>
                </a>
                <a href={profile?.instagram_url || "#"} target="_blank" style={{ background: '#18181b', border: '1px solid #27272a', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E1306C' }}>
                    <InstagramIcon />
                </a>
                <a href={profile?.facebook_url || "#"} target="_blank" style={{ background: '#18181b', border: '1px solid #27272a', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1877F2' }}>
                    <FacebookIcon />
                </a>
                <a href={profile?.whatnot_url || "#"} target="_blank" style={{ background: '#18181b', border: '1px solid #27272a', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <WhatnotIcon /> <span style={{fontSize:'10px', fontWeight:'900', marginLeft:'5px'}}>WHATNOT</span>
                </a>
                <a href={profile?.youtube_url || "#"} target="_blank" style={{ background: '#18181b', border: '1px solid #27272a', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF0000' }}>
                    <YoutubeIcon />
                </a>
                <a href={profile?.x_url || "#"} target="_blank" style={{ background: '#18181b', border: '1px solid #27272a', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <XIcon />
                </a>
                <a href={profile?.discord_url || "#"} target="_blank" style={{ background: '#18181b', border: '1px solid #27272a', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5865F2' }}>
                    <DiscordIcon />
                </a>
                <a href={profile?.twitch_url || "#"} target="_blank" style={{ background: '#18181b', border: '1px solid #27272a', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9146FF' }}>
                    <TwitchIcon />
                </a>
            </div>

            <p style={{ color: '#a1a1aa', margin: '24px auto', maxWidth: '500px', lineHeight: '1.6' }}>{profile?.bio || "Digital Vault Explorer."}</p>

            <Link href={`/collections?user=${userId}`} style={{ display: 'inline-block', width: '100%', background: '#fff', color: '#000', fontWeight: '900', padding: '18px', borderRadius: '20px', textDecoration: 'none', fontSize: '14px' }}>VIEW COLLECTIONS</Link>

            {isOwnProfile && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                <button onClick={() => setShowAddItem(true)} style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '16px', fontWeight: '800' }}>+ ITEM</button>
                <button onClick={() => setShowAddCollection(true)} style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '16px', fontWeight: '800' }}>+ COLL</button>
              </div>
            )}
        </section>

        {/* --- STATS GRID --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '24px', borderRadius: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900' }}>ITEMS</p>
            <p style={{ fontSize: '24px', fontWeight: '900' }}>{itemCount}</p>
          </div>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '24px', borderRadius: '24px', textAlign: 'center', cursor: 'pointer' }} onClick={() => setShowEditCollection(true)}>
            <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900' }}>COLLS ⚙️</p>
            <p style={{ fontSize: '24px', fontWeight: '900' }}>{collectionCount}</p>
          </div>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '24px', borderRadius: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900' }}>VALUE</p>
            <p style={{ fontSize: '24px', fontWeight: '900', color: '#4ade80' }}>£{vaultValue.toLocaleString()}</p>
          </div>
        </div>

        {/* --- RECENT DROPS GRID --- */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '28px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900' }}>RECENT DROPS</h2>
            <Link href="/discover" style={{ fontSize: '12px', color: '#818cf8', fontWeight: 'bold' }}>SEE ALL</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {recentDrops.map((drop) => (
              <div key={drop.id} onClick={() => setSelectedItem(drop)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '1px solid #27272a' }}>
                <img src={drop.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>
                  @{drop.profiles?.username}
                </div>
              </div>
            ))}
          </div>
        </section>

        {isOwnProfile && (
           <button onClick={() => supabase.auth.signOut().then(() => router.push("/"))} style={{ width: '100%', padding: '20px', borderRadius: '20px', background: '#18181b', border: '1px solid #27272a', color: '#ef4444', fontWeight: '900' }}>LOGOUT SESSION</button>
        )}

        <SuggestedUsers />
      </main>

      {/* --- EDIT MODAL (RE-EXPANDED) --- */}
      {showEditProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '32px', borderRadius: '32px', width: '100%', maxWidth: '420px', border: '1px solid #27272a', maxHeight: '85vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '20px' }}>EDIT PROFILE</h2>
            
            <input value={profile?.display_url || ""} placeholder="Display Name" onChange={e => setProfile({...profile, display_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '10px' }} />
            <input value={profile?.ebay_url || ""} placeholder="eBay URL" onChange={e => setProfile({...profile, ebay_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '10px' }} />
            <input value={profile?.instagram_url || ""} placeholder="Instagram URL" onChange={e => setProfile({...profile, instagram_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '10px' }} />
            <input value={profile?.facebook_url || ""} placeholder="Facebook URL" onChange={e => setProfile({...profile, facebook_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '10px' }} />
            <input value={profile?.whatnot_url || ""} placeholder="Whatnot URL" onChange={e => setProfile({...profile, whatnot_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '10px' }} />
            <input value={profile?.youtube_url || ""} placeholder="Youtube URL" onChange={e => setProfile({...profile, youtube_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '10px' }} />
            <input value={profile?.x_url || ""} placeholder="X (Twitter) URL" onChange={e => setProfile({...profile, x_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '10px' }} />
            <input value={profile?.discord_url || ""} placeholder="Discord URL" onChange={e => setProfile({...profile, discord_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '10px' }} />
            <input value={profile?.twitch_url || ""} placeholder="Twitch URL" onChange={e => setProfile({...profile, twitch_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '10px' }} />
            
            <textarea value={profile?.bio || ""} placeholder="Bio" onChange={e => setProfile({...profile, bio: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', height: '80px', resize: 'none' }} />
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setShowEditProfile(false)} style={{ flex: 1, color: '#71717a' }}>CANCEL</button>
              <button onClick={handleUpdateProfile} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '16px', borderRadius: '16px' }}>SAVE</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ITEM ZOOM --- */}
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.98)', zIndex: 6000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: '30px', right: '30px', fontSize: '40px', color: '#fff' }}>×</button>
          <img src={selectedItem.image_url} style={{ maxWidth: '600px', width: '100%', borderRadius: '24px', objectFit: 'contain' }} />
          <div style={{ background: '#09090b', padding: '28px', borderRadius: '28px', border: '1px solid #27272a', marginTop: '20px', width: '100%', maxWidth: '400px' }}>
             <h3 style={{ fontSize: '22px', fontWeight: '900' }}>{selectedItem.title}</h3>
             <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Message collector..." style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px' }} />
                <button onClick={async () => {
                   await supabase.from("messages").insert({ sender_id: currentUserId, receiver_id: selectedItem.user_id, content: `INQUIRY: ${selectedItem.title}\n\n${commentText}` });
                   setCommentText(""); alert("Sent!");
                }} style={{ background: '#fff', color: '#000', padding: '0 20px', borderRadius: '14px', fontWeight: '900' }}>SEND</button>
             </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
