"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";
import Header from "@/components/Header";
import Link from "next/link";

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

  // SOCIAL STATE
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  // MODAL STATES
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [showEditCollection, setShowEditCollection] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false); 
  const [selectedItem, setSelectedItem] = useState<any>(null); 
  
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
  const [commentText, setCommentText] = useState("");
  
  const [files, setFiles] = useState<File[]>([]);
  const [userRank, setUserRank] = useState<string | null>(null);

  // Search & Audience Logic
  const [selectedAudience, setSelectedAudience] = useState<"everyone" | "private">("everyone");
  const [searchQuery, setSearchQuery] = useState("");

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
    loadGlobalNiches();
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadAllData();
    determineRank();
  }, [userId]);

  useEffect(() => {
    if (userId && currentUserId && userId !== currentUserId) {
      checkFollowStatus();
    }
  }, [userId, currentUserId]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function loadGlobalNiches() {
    const { data } = await supabase.from("collections").select("niche");
    if (data) {
      const uniqueNiches = Array.from(new Set(data.map(i => i.niche))).filter(Boolean);
      setAvailableNiches(prev => Array.from(new Set([...prev, ...uniqueNiches])));
    }
  }

  async function checkFollowStatus() {
    const { data } = await supabase.from("follows").select("*").eq("follower_id", currentUserId).eq("following_id", userId).single();
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
    if (!currentUserId) return alert("Log in to like items!");
    setLikedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  async function determineRank() {
    const stacyId = "8b594b57-fc82-477a-a709-45aec99a228f"; 
    if (userId === stacyId) { setUserRank("diamond"); return; }
    const foundersIds = ["e0759f79-d113-4af6-a575-cee076037092", "bb088a77-ba12-4fe3-a357-03d13dc0019"];
    if (foundersIds.includes(userId)) { setUserRank("founder"); return; }
    const { data: allUsers } = await supabase.from("profiles").select("id").order("created_at", { ascending: true });
    if (allUsers) {
      const index = allUsers.findIndex(u => u.id === userId);
      if (index >= 3 && index < 13) setUserRank("gold");
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
        .select(`*, profiles:user_id (username), collections:collection (niche)`)
        .or('audience.eq.everyone,audience.is.null')
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (globalDrops) setRecentDrops(globalDrops);

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
            ebay_url: profile.ebay_url,
            instagram_url: profile.instagram_url,
            discord_url: profile.discord_url,
            whatnot_url: profile.whatnot_url,
            facebook_url: profile.facebook_url,
            tiktok_url: profile.tiktok_url,
            youtube_url: profile.youtube_url,
            twitter_url: profile.twitter_url
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
    } catch (err: any) { alert(err.message); } finally { setUploading(false); }
  }

  async function handleCreateCollectionBatch() {
    const finalNiche = selectedNiche === "Other" ? customNiche : selectedNiche;
    if (!finalNiche) return alert("Please specify a niche!");
    setUploading(true);
    try {
      const { data: coll, error: collErr } = await supabase.from("collections").insert([{ user_id: userId, title: newCollName.trim(), niche: finalNiche.trim() }]).select().single();
      if (collErr) throw collErr;

      if (files.length > 0) {
        const valuePerItem = (parseFloat(itemValue) / files.length) || 0;
        for (const f of files) {
          const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          await supabase.storage.from("item-images").upload(fileName, f);
          const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
          await supabase.from("items").insert({
            user_id: userId, title: itemName || newCollName, image_url: publicUrl,
            estimated_value: valuePerItem, collection: coll.id, status: "active",
            audience: selectedAudience
          });
        }
      }
      loadGlobalNiches(); 
      setShowAddCollection(false);
      setFiles([]);
      setNewCollName("");
      setSelectedNiche("");
      setCustomNiche("");
      setSelectedAudience("everyone");
      loadAllData();
    } catch (err: any) { alert(err.message); } finally { setUploading(false); }
  }

  async function handleBatchUploadItems() {
    if (!selectedCollectionId) return alert("Select a collection!");
    if (files.length === 0) return alert("Select at least one image!");
    setUploading(true);
    try {
      const valuePerItem = (parseFloat(itemValue) / files.length) || 0;
      for (const f of files) {
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        await supabase.storage.from("item-images").upload(fileName, f);
        const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
        await supabase.from("items").insert({
          user_id: userId, title: itemName || "New Item", image_url: publicUrl,
          estimated_value: valuePerItem, collection: selectedCollectionId, status: "active",
          audience: selectedAudience
        });
      }
      alert("Drop Successful!");
      setShowAddItem(false);
      setFiles([]);
      setSelectedAudience("everyone");
      loadAllData();
    } catch (err) { alert("Upload failed."); } finally { setUploading(false); }
  }

  async function deleteItem(id: string) {
    if(!confirm("Delete this photo?")) return;
    await supabase.from("items").delete().eq("id", id);
    setCollItems(prev => prev.filter(i => i.id !== id));
    loadAllData();
  }

  const renderRankIcon = () => {
    if (!userRank) return null;
    return <img src={`/${userRank}.png`} style={{ width: '30px' }} alt="rank" />;
  };

  const isCollectionValid = newCollName.trim() !== "" && (selectedNiche !== "" && (selectedNiche !== "Other" || customNiche.trim() !== ""));

  const filteredDrops = recentDrops.filter(drop => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return drop.title?.toLowerCase().includes(q) || drop.collections?.niche?.toLowerCase().includes(q) || drop.profiles?.username?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* PROFILE HEADER */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', textAlign: 'center', position: 'relative' }}>
            {isOwnProfile && (
              <button onClick={() => setShowEditProfile(true)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', zIndex: 10 }}>EDIT PROFILE</button>
            )}
            
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px' }}>
              <img src={profile?.avatar_url || "/default-avatar.png"} style={{ width: '100%', height: '100%', borderRadius: '20px', border: '4px solid #18181b', objectFit: 'cover', cursor: isOwnProfile ? 'pointer' : 'default' }} onClick={() => isOwnProfile && document.getElementById('avatar-input')?.click()} />
              {isOwnProfile && <input type="file" id="avatar-input" hidden accept="image/*" onChange={handleAvatarUpload} />}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800' }}>{profile?.display_url || profile?.username}</h1>
              {renderRankIcon()}
              {!isOwnProfile && currentUserId && (
                <button onClick={toggleFollow} style={{ background: isFollowing ? 'transparent' : '#fff', color: isFollowing ? '#fff' : '#000', border: isFollowing ? '1px solid #27272a' : 'none', padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '900' }}>
                  {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                </button>
              )}
            </div>
            <p style={{ color: '#818cf8', fontWeight: 'bold' }}>@{profile?.username}</p>

            {/* COMMAND CENTRE SOCIAL LINKS */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', margin: '16px 0', alignItems: 'center', flexWrap: 'wrap' }}>
                {profile?.ebay_url && (
                  <a href={profile.ebay_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontWeight: '900', fontSize: '18px', display: 'flex' }}>
                    <span style={{ color: '#e53238' }}>e</span><span style={{ color: '#0064d2' }}>b</span><span style={{ color: '#f5af02' }}>a</span><span style={{ color: '#86b817' }}>y</span>
                  </a>
                )}
                {profile?.whatnot_url && (
                  <a href={profile.whatnot_url} target="_blank" style={{ textDecoration: 'none', background: '#fffa00', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '900' }}>WHATNOT</a>
                )}
                {profile?.instagram_url && (
                  <a href={profile.instagram_url} target="_blank">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E4405F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                )}
                {profile?.tiktok_url && (
                  <a href={profile.tiktok_url} target="_blank">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.28-2.26.74-4.63 2.58-5.91 1.64-1.15 3.7-1.49 5.66-1.02v4.08c-.77-.23-1.61-.21-2.34.14-.57.26-1.05.74-1.32 1.31-.43.91-.25 2.05.42 2.8.61.73 1.58 1.05 2.51.92.8-.08 1.53-.55 1.95-1.24.23-.39.34-.84.33-1.29.02-4.14.01-8.28.02-12.43z"/></svg>
                  </a>
                )}
                {profile?.facebook_url && (
                  <a href={profile.facebook_url} target="_blank">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {profile?.discord_url && (
                  <a href={profile.discord_url} target="_blank">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 11.721 11.721 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/></svg>
                  </a>
                )}
                {profile?.youtube_url && (
                  <a href={profile.youtube_url} target="_blank">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
            </div>

            <p style={{ color: '#a1a1aa', margin: '0 0 24px' }}>{profile?.bio || "Digital Vault Explorer."}</p>
            <Link href={`/collections?user=${userId}`} style={{ display: 'block', background: '#fff', color: '#000', fontWeight: '900', padding: '16px', borderRadius: '16px', textDecoration: 'none', marginBottom: '20px' }}>VIEW COLLECTIONS</Link>

            {isOwnProfile && (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => { setFiles([]); setShowAddItem(true); }} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>+ ITEM</button>
                <button onClick={() => { setFiles([]); setShowAddCollection(true); }} style={{ background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' }}>+ COLLECTION</button>
              </div>
            )}
        </section>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 'bold' }}>ITEMS</p>
            <p style={{ fontSize: '20px', fontWeight: '900' }}>{itemCount}</p>
          </div>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '20px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer' }} onClick={() => setShowEditCollection(true)}>
            <p style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 'bold' }}>COLLECTIONS ⚙️</p>
            <p style={{ fontSize: '20px', fontWeight: '900' }}>{collectionCount}</p>
          </div>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 'bold' }}>VALUE</p>
            <p style={{ fontSize: '20px', fontWeight: '900', color: '#4ade80' }}>£{vaultValue}</p>
          </div>
        </div>

        {/* RECENT DROPS GRID */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '900' }}>GLOBAL RECENT DROPS</h2>
            <input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: '#000', border: '1px solid #27272a', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', width: '150px', color: '#fff' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {filteredDrops.map((drop) => (
              <div key={drop.id} onClick={() => setSelectedItem(drop)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                <img src={drop.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '5px', left: '5px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>@{drop.profiles?.username}</div>
              </div>
            ))}
          </div>
        </section>

        {isOwnProfile && <button onClick={handleLogout} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#18181b', border: '1px solid #27272a', color: '#ef4444', fontWeight: '900' }}>LOGOUT</button>}
        <SuggestedUsers />
      </main>

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px' }}>EDIT COMMAND CENTRE</h2>
            
            <p style={{ fontSize: '10px', color: '#818cf8', fontWeight: 'bold' }}>GENERAL</p>
            <input placeholder="Display Name" value={profile?.display_url || ""} onChange={e => setProfile({...profile, display_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px', marginBottom: '8px' }} />
            <textarea placeholder="Bio" value={profile?.bio || ""} onChange={e => setProfile({...profile, bio: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px', height: '60px', resize: 'none', marginBottom: '15px' }} />
            
            <p style={{ fontSize: '10px', color: '#818cf8', fontWeight: 'bold', marginBottom: '8px' }}>LINKS</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input placeholder="eBay" value={profile?.ebay_url || ""} onChange={e => setProfile({...profile, ebay_url: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px', fontSize: '12px' }} />
                <input placeholder="Whatnot" value={profile?.whatnot_url || ""} onChange={e => setProfile({...profile, whatnot_url: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px', fontSize: '12px' }} />
                <input placeholder="Instagram" value={profile?.instagram_url || ""} onChange={e => setProfile({...profile, instagram_url: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px', fontSize: '12px' }} />
                <input placeholder="TikTok" value={profile?.tiktok_url || ""} onChange={e => setProfile({...profile, tiktok_url: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px', fontSize: '12px' }} />
                <input placeholder="Facebook" value={profile?.facebook_url || ""} onChange={e => setProfile({...profile, facebook_url: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px', fontSize: '12px' }} />
                <input placeholder="Discord" value={profile?.discord_url || ""} onChange={e => setProfile({...profile, discord_url: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px', fontSize: '12px' }} />
                <input placeholder="YouTube" value={profile?.youtube_url || ""} onChange={e => setProfile({...profile, youtube_url: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px', fontSize: '12px' }} />
                <input placeholder="Twitter/X" value={profile?.twitter_url || ""} onChange={e => setProfile({...profile, twitter_url: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px', fontSize: '12px' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowEditProfile(false)} style={{ flex: 1, color: '#a1a1aa' }}>CANCEL</button>
              <button onClick={handleUpdateProfile} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>{uploading ? 'SAVING...' : 'SAVE'}</button>
            </div>
          </div>
        </div>
      )}

      {/* OTHER MODALS */}
      {showEditCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '500px', border: '1px solid #27272a', maxHeight: '80vh', overflowY: 'auto' }}>
             <h2 style={{ fontWeight: '900', marginBottom: '20px' }}>MANAGE COLLECTIONS</h2>
             {collectionsList.map(c => (
               <div key={c.id} style={{ background: '#000', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #27272a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold' }}>{c.title} ({c.niche})</span>
                    <button onClick={async () => {
                      const { data } = await supabase.from("items").select("*").eq("collection", c.id);
                      setEditingColl(c); setCollItems(data || []);
                    }} style={{ color: '#818cf8', fontSize: '12px' }}>VIEW ITEMS</button>
                  </div>
                  {editingColl?.id === c.id && (
                    <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {collItems.map(item => (
                        <div key={item.id} style={{ position: 'relative' }}>
                          <img src={item.image_url} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px' }} />
                          <button onClick={() => deleteItem(item.id)} style={{ position: 'absolute', top: -5, right: -5, background: 'red', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
             ))}
             <button onClick={() => setShowEditCollection(false)} style={{ width: '100%', marginTop: '20px', color: '#a1a1aa' }}>CLOSE</button>
          </div>
        </div>
      )}

      {showAddCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>NEW COLLECTION</h2>
            <input placeholder="Name" value={newCollName} onChange={e => setNewCollName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '12px' }} />
            <select value={selectedNiche} onChange={e => setSelectedNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '12px' }}>
              <option value="">Select Niche...</option>
              {availableNiches.map(n => <option key={n} value={n}>{n}</option>)}
              <option value="Other">Other...</option>
            </select>
            {selectedNiche === "Other" && (
              <input placeholder="Specify Niche" value={customNiche} onChange={e => setCustomNiche(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#818cf8', padding: '14px', borderRadius: '12px', marginBottom: '12px', fontWeight: 'bold' }} />
            )}
            <hr style={{ border: 'none', borderTop: '1px solid #27272a', margin: '20px 0' }} />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button onClick={() => setSelectedAudience('everyone')} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', border: '1px solid #27272a', background: selectedAudience === 'everyone' ? '#fff' : '#000', color: selectedAudience === 'everyone' ? '#000' : '#fff' }}>EVERYONE</button>
                <button onClick={() => setSelectedAudience('private')} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', border: '1px solid #27272a', background: selectedAudience === 'private' ? '#fff' : '#000', color: selectedAudience === 'private' ? '#000' : '#fff' }}>PRIVATE</button>
            </div>
            <label style={{ display: 'block', background: '#27272a', color: '#fff', textAlign: 'center', padding: '20px', borderRadius: '12px', cursor: 'pointer', border: '2px dashed #3f3f46' }}>📸<br/>{files.length > 0 ? `${files.length} Photos` : "ADD PHOTOS"}<input type="file" multiple accept="image/*" hidden onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 20))} /></label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowAddCollection(false)} style={{ flex: 1, color: '#a1a1aa' }}>CANCEL</button>
              <button onClick={handleCreateCollectionBatch} disabled={!isCollectionValid || uploading} style={{ flex: 2, background: isCollectionValid ? '#fff' : '#27272a', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>CREATE</button>
            </div>
          </div>
        </div>
      )}

      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px' }}>BATCH DROP</h2>
            <select value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
              <option value="">Select Collection</option>
              {collectionsList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input placeholder="Batch Title" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }} />
            <input type="number" placeholder="Value (£)" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }} />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button onClick={() => setSelectedAudience('everyone')} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', border: '1px solid #27272a', background: selectedAudience === 'everyone' ? '#fff' : '#000', color: selectedAudience === 'everyone' ? '#000' : '#fff' }}>EVERYONE</button>
                <button onClick={() => setSelectedAudience('private')} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', border: '1px solid #27272a', background: selectedAudience === 'private' ? '#fff' : '#000', color: selectedAudience === 'private' ? '#000' : '#fff' }}>PRIVATE</button>
            </div>
            <label style={{ display: 'block', background: '#27272a', color: '#fff', textAlign: 'center', padding: '30px', borderRadius: '12px', cursor: 'pointer', border: '2px dashed #3f3f46', marginBottom: '10px' }}>📸<br/>{files.length > 0 ? `${files.length} Photos` : "ADD PHOTOS"}<input type="file" multiple accept="image/*" hidden onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 20))} /></label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => setShowAddItem(false)} style={{ flex: 1, color: '#a1a1aa' }}>CANCEL</button>
              <button onClick={handleBatchUploadItems} disabled={uploading || !selectedCollectionId || files.length === 0} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>DROP BATCH</button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 4000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '30px', color: '#fff' }}>×</button>
          <img src={selectedItem.image_url} style={{ maxWidth: '90%', maxHeight: '60%', borderRadius: '12px', marginBottom: '20px' }} />
          <div style={{ width: '100%', maxWidth: '400px', background: '#18181b', borderRadius: '20px', padding: '20px', border: '1px solid #27272a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>{selectedItem.title}</span>
              <button onClick={() => toggleLike(selectedItem.id)} style={{ fontSize: '24px', background: 'none', border: 'none' }}>{likedItems.has(selectedItem.id) ? '⭐' : '☆'}</button>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Comment..." style={{ flex: 1, background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px' }} />
              <button onClick={() => { alert("Commented!"); setCommentText(""); }} style={{ background: '#fff', color: '#000', padding: '0 15px', borderRadius: '10px', fontWeight: 'bold' }}>SEND</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
