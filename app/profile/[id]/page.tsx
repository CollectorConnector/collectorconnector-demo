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

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || "";

  // -- CORE STATE --
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // -- STATS --
  const [itemCount, setItemCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [vaultValue, setVaultValue] = useState(0);

  // -- INTERACTION STATE --
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [recentDrops, setRecentDrops] = useState<any[]>([]);

  // -- UI/MODAL STATE --
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [showEditCollection, setShowEditCollection] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false); 
  const [selectedItem, setSelectedItem] = useState<any>(null); 
  const [uploading, setUploading] = useState(false);

  // -- FORM DATA --
  const [newCollName, setNewCollName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState(""); 
  const [customNiche, setCustomNiche] = useState("");
  const [availableNiches, setAvailableNiches] = useState(["Cards", "Sneakers", "Watches", "Art", "Coins", "Games", "Comics"]);
  const [collectionsList, setCollectionsList] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [editingColl, setEditingColl] = useState<any>(null);
  const [collItems, setCollItems] = useState<any[]>([]); 
  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [commentText, setCommentText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<"everyone" | "private">("everyone");

  const isOwnProfile = currentUserId === userId;

  // -- INITIALIZATION --
  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    initAuth();
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

  // -- DATA FETCHING LOGIC --
  async function loadGlobalNiches() {
    const { data } = await supabase.from("collections").select("niche");
    if (data) {
      const uniqueNiches = Array.from(new Set(data.map(i => i.niche))).filter(Boolean);
      setAvailableNiches(prev => Array.from(new Set([...prev, ...uniqueNiches])));
    }
  }

  async function fetchUnreadCount() {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: 'exact', head: true })
      .eq("receiver_id", userId)
      .eq("read", false);
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

      const { data: globalDrops } = await supabase
        .from("items")
        .select(`*, profiles:user_id (username)`)
        .order("created_at", { ascending: false })
        .limit(24);
      if (globalDrops) setRecentDrops(globalDrops);

      const { data: colls } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (colls) { 
        setCollectionCount(colls.length); 
        setCollectionsList(colls); 
      }
    } catch (err) { console.error("Load fail", err); } finally { setLoading(false); }
  }

  // -- INTERACTION LOGIC --
  async function checkFollowStatus() {
    const { data } = await supabase.from("follows")
      .select("*")
      .eq("follower_id", currentUserId)
      .eq("following_id", userId)
      .single();
    setIsFollowing(!!data);
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
  }

  async function toggleLike(itemId: string) {
    if (!currentUserId) return;
    setLikedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  // -- UPLOAD & EDIT LOGIC --
  async function handleUpdateProfile() {
    setUploading(true);
    try {
      const { error } = await supabase.from("profiles").update({ 
          display_url: profile.display_url, 
          bio: profile.bio,
          discord_url: profile.discord_url,
          twitch_url: profile.twitch_url,
          ebay_url: profile.ebay_url,
          instagram_url: profile.instagram_url
      }).eq("id", userId);
      if (error) throw error;
      setShowEditProfile(false); 
      loadAllData();
    } catch (err: any) { alert(err.message); } finally { setUploading(false); }
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
    } catch (err: any) { console.error(err); } finally { setUploading(false); }
  }

  async function handleCreateCollectionBatch() {
    const finalNiche = selectedNiche === "Other" ? customNiche : selectedNiche;
    if (!finalNiche || !newCollName) return alert("Name and Niche required!");
    setUploading(true);
    try {
      const { data: coll, error: collErr } = await supabase.from("collections")
        .insert([{ user_id: userId, title: newCollName.trim(), niche: finalNiche.trim() }])
        .select().single();
      if (collErr) throw collErr;

      if (files.length > 0) {
        const valuePerItem = (parseFloat(itemValue) / files.length) || 0;
        for (const f of files) {
          const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          await supabase.storage.from("item-images").upload(fileName, f);
          const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
          await supabase.from("items").insert({
            user_id: userId, title: itemName || newCollName, image_url: publicUrl,
            estimated_value: valuePerItem, collection: coll.id, status: "active", audience: selectedAudience 
          });
        }
      }
      setShowAddCollection(false);
      setFiles([]);
      loadAllData();
    } catch (err: any) { alert(err.message); } finally { setUploading(false); }
  }

  async function deleteItem(id: string) {
    if(!confirm("Are you sure?")) return;
    await supabase.from("items").delete().eq("id", id);
    setCollItems(prev => prev.filter(i => i.id !== id));
    loadAllData();
  }

  // -- RENDER HELPERS --
  const renderRankIcon = () => {
    if (!userRank) return null;
    return <img src={`/${userRank}.png`} style={{ width: '32px', height: '32px' }} alt="Rank" />;
  };

  if (loading && !profile) return <div className="min-h-screen bg-black flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500">
      <Header />
      
      <main style={{ marginTop: '100px', paddingBottom: '100px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* --- PROFILE CARD --- */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '28px', padding: '40px 32px', textAlign: 'center', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            
            {isOwnProfile && (
              <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '10px' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px' }}>{profile?.display_url || profile?.username}</h1>
              {renderRankIcon()}
              {!isOwnProfile && currentUserId && (
                <button onClick={toggleFollow} style={{ background: isFollowing ? 'transparent' : '#fff', color: isFollowing ? '#fff' : '#000', border: isFollowing ? '1px solid #27272a' : 'none', padding: '8px 24px', borderRadius: '24px', fontSize: '14px', fontWeight: '900', transition: '0.2s' }}>
                  {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                </button>
              )}
            </div>
            
            <p style={{ color: '#818cf8', fontWeight: '800', fontSize: '14px', marginTop: '4px' }}>@{profile?.username}</p>
            
            {/* SOCIAL LINKS - RESTORED COLORS */}
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '20px', alignItems: 'center' }}>
                {profile?.ebay_url && (
                    <a href={profile.ebay_url} target="_blank" style={{ textDecoration: 'none', fontWeight: '900', fontSize: '22px', fontFamily: 'Arial, sans-serif' }}>
                       <span style={{ color: '#e53238' }}>e</span><span style={{ color: '#0064d2' }}>b</span><span style={{ color: '#f5af02' }}>a</span><span style={{ color: '#86b817' }}>y</span>
                    </a>
                )}
                {profile?.instagram_url && (
                    <a href={profile.instagram_url} target="_blank" style={{ color: '#E1306C', transition: '0.2s' }} className="hover:scale-110"><InstagramIcon /></a>
                )}
                {profile?.discord_url && <a href={profile.discord_url} target="_blank" style={{ color: '#5865F2' }}><DiscordIcon /></a>}
                {profile?.twitch_url && <a href={profile.twitch_url} target="_blank" style={{ color: '#9146FF' }}><TwitchIcon /></a>}
            </div>

            <p style={{ color: '#a1a1aa', margin: '24px auto', maxWidth: '500px', lineHeight: '1.6' }}>{profile?.bio || "Digital Vault Explorer."}</p>

            <Link href={`/collections?user=${userId}`} style={{ display: 'inline-block', width: '100%', maxWidth: '300px', background: '#fff', color: '#000', fontWeight: '900', padding: '18px', borderRadius: '20px', textDecoration: 'none', fontSize: '14px', letterSpacing: '1px' }}>VIEW COLLECTIONS</Link>

            {isOwnProfile && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                <button onClick={() => setShowAddItem(true)} style={{ flex: 1, maxWidth: '140px', background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '16px', fontWeight: '800', fontSize: '13px' }}>+ ITEM</button>
                <button onClick={() => setShowAddCollection(true)} style={{ flex: 1, maxWidth: '140px', background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '16px', fontWeight: '800', fontSize: '13px' }}>+ COLL</button>
              </div>
            )}
        </section>

        {/* --- STATS GRID --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '24px', borderRadius: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', letterSpacing: '1px' }}>ITEMS</p>
            <p style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>{itemCount}</p>
          </div>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '24px', borderRadius: '24px', textAlign: 'center', cursor: 'pointer' }} onClick={() => setShowEditCollection(true)}>
            <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', letterSpacing: '1px' }}>COLLS ⚙️</p>
            <p style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>{collectionCount}</p>
          </div>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '24px', borderRadius: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', letterSpacing: '1px' }}>VALUE</p>
            <p style={{ fontSize: '24px', fontWeight: '900', marginTop: '4px', color: '#4ade80' }}>£{vaultValue.toLocaleString()}</p>
          </div>
        </div>

        {/* --- GLOBAL RECENT DROPS --- */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '28px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900' }}>RECENT DROPS</h2>
            <Link href="/discover" style={{ fontSize: '12px', color: '#818cf8', fontWeight: 'bold' }}>SEE ALL</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {recentDrops.map((drop) => (
              <div key={drop.id} onClick={() => setSelectedItem(drop)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '1px solid #27272a' }}>
                <img src={drop.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={drop.title} />
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>
                  @{drop.profiles?.username}
                </div>
              </div>
            ))}
          </div>
        </section>

        {isOwnProfile && (
           <button onClick={handleLogout} style={{ width: '100%', padding: '20px', borderRadius: '20px', background: '#18181b', border: '1px solid #27272a', color: '#ef4444', fontWeight: '900', fontSize: '14px' }}>LOGOUT SESSION</button>
        )}

        <SuggestedUsers />
      </main>

      {/* --- MODAL: EDIT PROFILE (BRANDED LINKS) --- */}
      {showEditProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}>
          <div style={{ background: '#18181b', padding: '32px', borderRadius: '32px', width: '100%', maxWidth: '420px', border: '1px solid #27272a', maxHeight: '85vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px' }}>PROFILE SETTINGS</h2>
            
            <label style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', marginBottom: '8px', display: 'block' }}>DISPLAY NAME</label>
            <input value={profile?.display_url || ""} onChange={e => setProfile({...profile, display_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '20px' }} />
            
            <label style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', marginBottom: '8px', display: 'block' }}>EBAY URL</label>
            <input value={profile?.ebay_url || ""} placeholder="https://ebay.com/usr/..." onChange={e => setProfile({...profile, ebay_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '20px' }} />

            <label style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', marginBottom: '8px', display: 'block' }}>INSTAGRAM URL</label>
            <input value={profile?.instagram_url || ""} placeholder="https://instagram.com/..." onChange={e => setProfile({...profile, instagram_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '20px' }} />

            <label style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', marginBottom: '8px', display: 'block' }}>DISCORD</label>
            <input value={profile?.discord_url || ""} placeholder="Invite Link" onChange={e => setProfile({...profile, discord_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '20px' }} />

            <label style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', marginBottom: '8px', display: 'block' }}>BIO</label>
            <textarea value={profile?.bio || ""} onChange={e => setProfile({...profile, bio: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', height: '100px', resize: 'none' }} />
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowEditProfile(false)} style={{ flex: 1, color: '#71717a', fontWeight: '800' }}>CANCEL</button>
              <button onClick={handleUpdateProfile} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '16px', borderRadius: '16px' }}>{uploading ? 'SAVING...' : 'SAVE CHANGES'}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ZOOM + DIRECT MESSAGING --- */}
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.98)', zIndex: 6000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: '30px', right: '30px', fontSize: '40px', color: '#fff' }}>×</button>
          
          <div style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <img src={selectedItem.image_url} style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,1)', maxHeight: '60vh', objectFit: 'contain' }} />
            
            <div style={{ background: '#09090b', padding: '28px', borderRadius: '28px', border: '1px solid #27272a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ fontSize: '22px', fontWeight: '900' }}>{selectedItem.title}</h3>
                    <p style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '18px', marginTop: '4px' }}>£{selectedItem.estimated_value}</p>
                </div>
                <button onClick={() => toggleLike(selectedItem.id)} style={{ fontSize: '28px' }}>
                  {likedItems.has(selectedItem.id) ? '⭐' : '☆'}
                </button>
              </div>

              {/* MESSAGE BAR */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <input 
                    value={commentText} 
                    onChange={e => setCommentText(e.target.value)} 
                    placeholder={`Inquire about this to @${selectedItem.profiles?.username}...`} 
                    style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '16px', borderRadius: '16px', fontSize: '14px' }} 
                />
                <button 
                  onClick={async () => {
                    if (!commentText.trim()) return;
                    const { error } = await supabase.from("messages").insert({ 
                      sender_id: currentUserId, 
                      receiver_id: selectedItem.user_id, 
                      content: `ITEM INQUIRY: ${selectedItem.title}\n\n${commentText}` 
                    });
                    if(!error) { alert("Inquiry Sent!"); setCommentText(""); }
                  }} 
                  style={{ background: '#fff', color: '#000', padding: '0 24px', borderRadius: '16px', fontWeight: '900' }}
                >
                    SEND
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: NEW COLLECTION --- */}
      {showAddCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '32px', borderRadius: '32px', width: '100%', maxWidth: '420px', border: '1px solid #27272a' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px' }}>NEW COLLECTION</h2>
            
            <input placeholder="Collection Title" value={newCollName} onChange={e => setNewCollName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '16px' }} />
            
            <select value={selectedNiche} onChange={e => setSelectedNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
              <option value="">Select Category...</option>
              {availableNiches.map(n => <option key={n} value={n}>{n}</option>)}
              <option value="Other">Other...</option>
            </select>
            
            {selectedNiche === "Other" && (
                <input placeholder="Specify Category" value={customNiche} onChange={e => setCustomNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#818cf8', padding: '16px', borderRadius: '16px', marginBottom: '16px' }} />
            )}

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button onClick={() => setSelectedAudience('everyone')} style={{ flex: 1, padding: '14px', borderRadius: '14px', fontSize: '11px', fontWeight: '900', border: '1px solid #27272a', background: selectedAudience === 'everyone' ? '#fff' : '#000', color: selectedAudience === 'everyone' ? '#000' : '#fff' }}>EVERYONE</button>
                <button onClick={() => setSelectedAudience('private')} style={{ flex: 1, padding: '14px', borderRadius: '14px', fontSize: '11px', fontWeight: '900', border: '1px solid #27272a', background: selectedAudience === 'private' ? '#fff' : '#000', color: selectedAudience === 'private' ? '#000' : '#fff' }}>PRIVATE</button>
            </div>

            <label style={{ display: 'block', background: '#000', color: '#a1a1aa', textAlign: 'center', padding: '30px', borderRadius: '16px', cursor: 'pointer', border: '2px dashed #27272a' }}>
               {files.length > 0 ? `✅ ${files.length} PHOTOS READY` : "📸 DROP PHOTOS HERE"}
               <input type="file" multiple accept="image/*" hidden onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 50))} />
            </label>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowAddCollection(false)} style={{ flex: 1, color: '#71717a' }}>CANCEL</button>
              <button onClick={handleCreateCollectionBatch} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '16px', borderRadius: '16px' }}>CREATE & DROP</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: MANAGE COLLECTIONS (EDITING ITEMS) --- */}
      {showEditCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '32px', borderRadius: '32px', width: '100%', maxWidth: '500px', border: '1px solid #27272a', maxHeight: '80vh', overflowY: 'auto' }}>
             <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px' }}>YOUR COLLECTIONS</h2>
             {collectionsList.map(c => (
               <div key={c.id} style={{ background: '#09090b', padding: '20px', borderRadius: '20px', marginBottom: '12px', border: '1px solid #27272a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontWeight: '900', display: 'block' }}>{c.title}</span>
                        <span style={{ fontSize: '10px', color: '#71717a' }}>{c.niche.toUpperCase()}</span>
                    </div>
                    <button onClick={async () => {
                      const { data } = await supabase.from("items").select("*").eq("collection", c.id);
                      setEditingColl(c); 
                      setCollItems(data || []);
                    }} style={{ background: '#18181b', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>MANAGE</button>
                  </div>
                  
                  {editingColl?.id === c.id && (
                    <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', borderTop: '1px solid #27272a', paddingTop: '16px' }}>
                      {collItems.map(item => (
                        <div key={item.id} style={{ position: 'relative' }}>
                          <img src={item.image_url} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px' }} />
                          <button onClick={() => deleteItem(item.id)} style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
             ))}
             <button onClick={() => setShowEditCollection(false)} style={{ width: '100%', marginTop: '20px', color: '#71717a', fontWeight: 'bold' }}>CLOSE SETTINGS</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
