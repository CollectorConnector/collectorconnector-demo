"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";
import Header from "@/components/Header";
import Link from "next/link";
import ChatDrawer from "@/components/ChatDrawer";

// --- SVG ICONS ---
const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.862-1.297 1.197-2.002a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.291a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/></svg>
);

const TwitchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0 3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
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

  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [showEditCollection, setShowEditCollection] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false); 
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null); 
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
    loadGlobalNiches();
  }, []);

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

      const { data: globalDrops, error: dropError } = await supabase
        .from("items")
        .select(`*, profiles:user_id (username)`)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (dropError) {
        const { data: fallback } = await supabase.from("items").select("*").limit(20).order("created_at", { ascending: false });
        if (fallback) setRecentDrops(fallback);
      } else if (globalDrops) {
        setRecentDrops(globalDrops);
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
            discord_handle: profile.discord_handle,
            twitch_handle: profile.twitch_handle,
            instagram_url: profile.instagram_url,
            ebay_url: profile.ebay_url,
            facebook_url: profile.facebook_url,
            x_url: profile.x_url,
            whatnot_url: profile.whatnot_url,
            youtube_url: profile.youtube_url
        }).eq("id", userId);
        if (error) throw error;
        alert("Profile updated!"); 
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
      const { error: uploadError } = await supabase.storage.from("item-images").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      if (updateError) throw updateError;
      setProfile({ ...profile, avatar_url: publicUrl });
      alert("Avatar Updated!");
    } catch (err: any) { alert("Upload failed: " + err.message); } finally { setUploading(false); }
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

  const tierIconPath = `/icons/tiers/${(userRank || 'collector').toLowerCase()}.svg`;

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main style={{ marginTop: '100px', paddingBottom: '80px', maxWidth: '800px', margin: '100px auto 0', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* PROFILE CARD */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '32px', textAlign: 'center', position: 'relative' }}>
            {isOwnProfile && (
              <button onClick={() => setShowEditProfile(true)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#18181b', border: '1px solid #27272a', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', zIndex: 10 }}>EDIT PROFILE</button>
            )}
            
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px' }}>
              <img 
                src={profile?.avatar_url || tierIconPath} 
                onError={(e) => { 
                  const target = e.target as HTMLImageElement;
                  if (target.src !== window.location.origin + tierIconPath) {
                    target.src = tierIconPath;
                  }
                }}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: '20px', 
                  border: '4px solid #18181b', 
                  objectFit: 'cover', 
                  cursor: isOwnProfile ? 'pointer' : 'default',
                  background: '#18181b',
                  padding: profile?.avatar_url ? '0' : '22px'
                }} 
                onClick={() => isOwnProfile && document.getElementById('avatar-input')?.click()} 
              />
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
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '18px', fontWeight: '900' }}>{followerCount}</p>
                  <p style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: 'bold', letterSpacing: '1px' }}>FOLLOWERS</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '18px', fontWeight: '900' }}>{followingCount}</p>
                  <p style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: 'bold', letterSpacing: '1px' }}>FOLLOWING</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px', alignItems: 'center', minHeight: '32px' }}>
               {profile?.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" style={{ color: '#E4405F', display: 'flex', alignItems: 'center' }}><InstagramIcon /></a>}
               {profile?.ebay_url && <a href={profile.ebay_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}><FixedEbayLogo /></a>}
               {profile?.discord_handle && <span style={{ color: '#5865F2' }}><DiscordIcon /></span>}
               {profile?.twitch_handle && <span style={{ color: '#9146FF' }}><TwitchIcon /></span>}
            </div>

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
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '20px', borderRadius: '20px', textAlign: 'center' }}><p style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 'bold' }}>ITEMS</p><p style={{ fontSize: '20px', fontWeight: '900' }}>{itemCount}</p></div>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '20px', borderRadius: '20px', textAlign: 'center', cursor: isOwnProfile ? 'pointer' : 'default' }} onClick={() => isOwnProfile && setShowEditCollection(true)}><p style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 'bold' }}>COLLECTIONS {isOwnProfile && '⚙️'}</p><p style={{ fontSize: '20px', fontWeight: '900' }}>{collectionCount}</p></div>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '20px', borderRadius: '20px', textAlign: 'center' }}><p style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 'bold' }}>VALUE</p><p style={{ fontSize: '20px', fontWeight: '900', color: '#4ade80' }}>£{vaultValue}</p></div>
        </div>

        {/* RECENT DROPS GRID */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px' }}>GLOBAL RECENT DROPS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {recentDrops.map((drop, index) => (
              <div key={drop.id} onClick={() => setSelectedItemIndex(index)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                <img src={drop.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '5px', left: '5px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>@{drop.profiles?.username}</div>
                {likedItems.has(drop.id) && <div style={{ position: 'absolute', bottom: '5px', right: '5px', fontSize: '14px' }}>⭐</div>}
              </div>
            ))}
          </div>
        </section>

        {isOwnProfile && <button onClick={handleLogout} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#18181b', border: '1px solid #27272a', color: '#ef4444', fontWeight: '900', cursor: 'pointer', letterSpacing: '1px' }}>LOGOUT</button>}
        
        {/* FIX: SUGGESTED USERS CAROUSEL SECTION - Removed manual header and Link */}
        <div style={{ marginTop: '12px' }}>
          <SuggestedUsers />
        </div>
      </main>

      {/* PHOTO PREVIEW LIGHTBOX */}
      {selectedItemIndex !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={() => setSelectedItemIndex(null)} style={{ position: 'absolute', top: '40px', right: '30px', background: 'none', border: 'none', color: '#fff', fontSize: '30px', cursor: 'pointer' }}>✕</button>
            <button onClick={() => setSelectedItemIndex((prev) => (prev! > 0 ? prev! - 1 : recentDrops.length - 1))} style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', fontSize: '24px' }}>‹</button>
            <div style={{ maxWidth: '90%', maxHeight: '80%', textAlign: 'center' }}>
                <img src={recentDrops[selectedItemIndex].image_url} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '12px', border: '1px solid #27272a' }} />
                <p style={{ marginTop: '20px', fontSize: '20px', fontWeight: '900' }}>{recentDrops[selectedItemIndex].title}</p>
                <p style={{ color: '#818cf8', fontWeight: 'bold' }}>@{recentDrops[selectedItemIndex].profiles?.username}</p>
            </div>
            <button onClick={() => setSelectedItemIndex((prev) => (prev! < recentDrops.length - 1 ? prev! + 1 : 0))} style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', fontSize: '24px' }}>›</button>
        </div>
      )}

      {/* ALL MODALS (RE-ADDED) */}
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
            <p style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' }}>AUDIENCE</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button onClick={() => setSelectedAudience('everyone')} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', border: '1px solid #27272a', background: selectedAudience === 'everyone' ? '#fff' : '#000', color: selectedAudience === 'everyone' ? '#000' : '#fff' }}>EVERYONE</button>
                <button onClick={() => setSelectedAudience('private')} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', border: '1px solid #27272a', background: selectedAudience === 'private' ? '#fff' : '#000', color: selectedAudience === 'private' ? '#000' : '#fff' }}>PRIVATE</button>
            </div>
            <p style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '10px', fontWeight: 'bold' }}>OPTIONAL: START WITH PHOTOS</p>
            <input type="number" placeholder="Estimated Total Value (£)" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }} />
            <label style={{ display: 'block', background: '#27272a', color: '#fff', textAlign: 'center', padding: '20px', borderRadius: '12px', cursor: 'pointer', border: '2px dashed #3f3f46' }}>
               <span style={{ fontSize: '20px' }}>📸</span><br/>{files.length > 0 ? `${files.length} Photos Selected` : "TAP TO ADD PHOTOS (UP TO 20)"}
               <input type="file" multiple accept="image/*" hidden onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 20))} />
            </label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => { setShowAddCollection(false); setFiles([]); }} style={{ flex: 1, color: '#a1a1aa' }}>CANCEL</button>
              <button onClick={handleCreateCollectionBatch} disabled={!isCollectionValid || uploading} style={{ flex: 2, background: isCollectionValid ? '#fff' : '#27272a', color: isCollectionValid ? '#000' : '#555', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>{uploading ? 'DROPPING...' : 'CREATE'}</button>
            </div>
          </div>
        </div>
      )}

      {showEditProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px' }}>EDIT PROFILE</h2>
            <p style={{ fontSize: '11px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>DISPLAY NAME</p>
            <input value={profile?.display_url || ""} onChange={e => setProfile({...profile, display_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '16px' }} />
            <p style={{ fontSize: '11px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>BIO</p>
            <textarea value={profile?.bio || ""} onChange={e => setProfile({...profile, bio: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', height: '80px', resize: 'none', marginBottom: '16px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
               <div><p style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>INSTAGRAM URL</p><input placeholder="https://..." value={profile?.instagram_url || ""} onChange={e => setProfile({...profile, instagram_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px' }} /></div>
               <div><p style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>EBAY URL</p><input placeholder="https://..." value={profile?.ebay_url || ""} onChange={e => setProfile({...profile, ebay_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowEditProfile(false)} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold' }}>CANCEL</button>
              <button onClick={handleUpdateProfile} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>{uploading ? 'SAVING...' : 'SAVE CHANGES'}</button>
            </div>
          </div>
        </div>
      )}

      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px' }}>BATCH DROP</h2>
            <select value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
              <option value="">Select Target Collection</option>
              {collectionsList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input placeholder="Batch Title" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }} />
            <input type="number" placeholder="Total Estimated Value (£)" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px' }} />
            <p style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' }}>AUDIENCE</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button onClick={() => setSelectedAudience('everyone')} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', border: '1px solid #27272a', background: selectedAudience === 'everyone' ? '#fff' : '#000', color: selectedAudience === 'everyone' ? '#000' : '#fff' }}>EVERYONE</button>
                <button onClick={() => setSelectedAudience('private')} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '11px', fontWeight: '900', border: '1px solid #27272a', background: selectedAudience === 'private' ? '#fff' : '#000', color: selectedAudience === 'private' ? '#000' : '#fff' }}>PRIVATE</button>
            </div>
            <label style={{ display: 'block', background: '#27272a', color: '#fff', textAlign: 'center', padding: '30px', borderRadius: '12px', cursor: 'pointer', border: '2px dashed #3f3f46', marginBottom: '10px' }}>
               <span style={{ fontSize: '24px' }}>📸</span><br/>{files.length > 0 ? `${files.length} Photos Ready` : "TAP TO ADD PHOTOS (UP TO 20)"}
               <input type="file" multiple accept="image/*" hidden onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 20))} />
            </label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => setShowAddItem(false)} style={{ flex: 1, color: '#a1a1aa' }}>CANCEL</button>
              <button onClick={handleBatchUploadItems} disabled={uploading || !selectedCollectionId || files.length === 0} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>{uploading ? 'DROPPING...' : 'DROP BATCH'}</button>
            </div>
          </div>
        </div>
      )}

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

      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} receiverId={userId} receiverName={profile?.display_url || profile?.username || "Collector"} />
      <Footer />
    </div>
  );
}
