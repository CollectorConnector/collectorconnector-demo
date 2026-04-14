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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0-.084-.028c.462-.63.862-1.297 1.197-2.002a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.291a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/></svg>
);

const TwitchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0 3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
);

const FixedEbayLogo = () => (
  <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-1px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
    <span style={{ color: '#E53238' }}>e</span><span style={{ color: '#0064D2' }}>b</span><span style={{ color: '#F5AF02' }}>a</span><span style={{ color: '#86B817' }}>y</span>
  </span>
);

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || "";

  // --- STATE CORE ---
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // --- STATS ---
  const [itemCount, setItemCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [vaultValue, setVaultValue] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // --- INTERACTION ---
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [showSmartDrop, setShowSmartDrop] = useState(false);
  const [showEditCollection, setShowEditCollection] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false); 
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null); 
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  // --- CONTENT ---
  const [recentDrops, setRecentDrops] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newCollName, setNewCollName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState(""); 
  const [customNiche, setCustomNiche] = useState("");
  const [availableNiches, setAvailableNiches] = useState([
    "Cards", "Sneakers", "Watches", "Art", "Coins", "Games", "Comics", 
    "Lego", "Vinyl", "Handbags", "Antiques", "Models", "Other"
  ]);
  const [collectionsList, setCollectionsList] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  // --- EDITING LOGIC ---
  const [editingColl, setEditingColl] = useState<any>(null);
  const [collItems, setCollItems] = useState<any[]>([]); 
  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [userRank, setUserRank] = useState<string | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<"everyone" | "private">("everyone");

  const isOwnProfile = currentUserId === userId;

  // --- INITIALIZATION ---
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
    loadGlobalNiches();
  }, []);

  // --- REALTIME CHAT NOTIFICATIONS ---
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
            if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, isChatOpen]);

  // --- DATA LOADING TRIGGER ---
  useEffect(() => {
    if (!userId) return;
    loadAllData();
    loadFollowCounts();
    determineRank();
  }, [userId]);

  // --- DEEP LINK CHAT ---
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("openChat") === "true") {
      setIsChatOpen(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [userId]);

  // --- FOLLOW SYNC ---
  useEffect(() => {
    if (userId && currentUserId && userId !== currentUserId) checkFollowStatus();
  }, [userId, currentUserId]);

  // --- FUNCTIONS ---
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
    try {
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", userId);
        setIsFollowing(false);
      } else {
        await supabase.from("follows").insert({ follower_id: currentUserId, following_id: userId });
        setIsFollowing(true);
      }
      loadFollowCounts();
    } catch (e) { console.error(e); }
  }

  async function determineRank() {
    const stacyId = "8b594b57-fc82-477a-a709-45aec99a228f"; 
    if (userId === stacyId) { setUserRank("diamond"); return; }
    
    const foundersIds = ["e0759f79-d113-4af6-a575-cee076037092", "bb088a77-ba12-4fe3-a357-03d13dc0d019"];
    if (foundersIds.includes(userId)) { setUserRank("founder"); return; }

    const { data: allUsers } = await supabase.from("profiles").select("id").order("created_at", { ascending: true });
    if (allUsers) {
      const index = allUsers.findIndex(u => u.id === userId);
      if (index >= 0 && index < 3) setUserRank("founder");
      else if (index >= 3 && index < 13) setUserRank("gold");
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
      
      const { data: localItems } = await supabase.from("items").select("*").eq("user_id", userId);
      if (localItems) {
        setItemCount(localItems.length);
        setVaultValue(localItems.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0));
      }

      const { data: globalDrops, error: dropError } = await supabase
        .from("items")
        .select(`
          *,
          profiles:user_id (id, username, display_url)
        `)
        .order("created_at", { ascending: false })
        .limit(24);
      
      if (!dropError && globalDrops) setRecentDrops(globalDrops);

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
        discord_handle: profile.discord_handle,
        twitch_handle: profile.twitch_handle,
        tiktok_url: profile.tiktok_url
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
      await supabase.storage.from("item-images").upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
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
          .insert([{ user_id: userId, title: newCollName.trim(), niche: finalNiche || "General" }])
          .select().single();
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
    } catch (err: any) { alert(err.message); } finally { setUploading(false); }
  }

  async function deleteItem(id: string) {
    if(!confirm("Delete this photo?")) return;
    try {
      await supabase.from("items").delete().eq("id", id);
      setCollItems(prev => prev.filter(i => i.id !== id));
      setRecentDrops(prev => prev.filter(i => i.id !== id));
      loadAllData();
    } catch (err: any) { alert("Error deleting: " + err.message); }
  }

  const toggleStar = (itemId: string) => {
    const newLikes = new Set(likedItems);
    newLikes.has(itemId) ? newLikes.delete(itemId) : newLikes.add(itemId);
    setLikedItems(newLikes);
  };

  const tierIconPath = `/icons/tiers/${(userRank || 'collector').toLowerCase()}.svg`;
  const hasValidAvatar = profile?.avatar_url && profile.avatar_url.startsWith('http');

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      
      <main style={{ marginTop: '100px', paddingBottom: '100px', maxWidth: '800px', margin: '100px auto 0', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* --- PROFILE HEADER CARD --- */}
        <section style={{ 
          background: 'linear-gradient(180deg, #09090b 0%, #000 100%)', 
          border: '1px solid #27272a', 
          borderRadius: '28px', 
          padding: '40px 20px', 
          textAlign: 'center', 
          position: 'relative',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
            {isOwnProfile && (
              <button onClick={() => setShowEditProfile(true)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', border: '1px solid #27272a', color: '#fff', padding: '10px 18px', borderRadius: '14px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', transition: '0.2s' }}>EDIT PROFILE</button>
            )}
            
            <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 28px' }}>
              <div style={{ 
                width: '100%', 
                height: '100%', 
                backgroundColor: '#18181b', 
                borderRadius: '40%', 
                overflow: 'hidden', 
                border: '4px solid #18181b', 
                cursor: isOwnProfile ? 'pointer' : 'default',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
              }} onClick={() => isOwnProfile && document.getElementById('avatar-input')?.click()}>
                <img 
                  src={hasValidAvatar ? profile.avatar_url : tierIconPath} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: hasValidAvatar ? 'cover' : 'contain', 
                    padding: hasValidAvatar ? '0' : '32px',
                    transition: '0.3s'
                  }} 
                />
              </div>
              {isOwnProfile && <input type="file" id="avatar-input" hidden accept="image/*" onChange={handleAvatarUpload} />}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-0.5px' }}>{profile?.display_url || profile?.username}</h1>
              {userRank && <img src={`/${userRank}.png`} style={{ width: '34px', height: '34px', objectFit: 'contain' }} />}
              
              {!isOwnProfile && currentUserId && (
                <div style={{ display: 'flex', gap: '12px', marginLeft: '8px' }}>
                  <button onClick={toggleFollow} style={{ background: isFollowing ? 'transparent' : '#fff', color: isFollowing ? '#fff' : '#000', border: '1.5px solid #fff', padding: '10px 24px', borderRadius: '24px', fontWeight: '900', fontSize: '14px' }}>{isFollowing ? 'FOLLOWING' : 'FOLLOW'}</button>
                  <button onClick={() => { setIsChatOpen(true); setHasNewMessage(false); }} style={{ position: 'relative', background: 'transparent', border: '1.5px solid #27272a', color: '#fff', padding: '10px 24px', borderRadius: '24px', fontWeight: '900', fontSize: '14px' }}>
                    MESSAGE
                    {hasNewMessage && <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', background: '#ef4444', borderRadius: '50%', border: '2px solid #000' }} />}
                  </button>
                </div>
              )}
            </div>

            <p style={{ color: '#818cf8', fontWeight: '700', fontSize: '16px', margin: '4px 0 12px' }}>@{profile?.username}</p>
            <p style={{ color: '#a1a1aa', maxWidth: '500px', margin: '0 auto 20px', lineHeight: '1.5', fontSize: '15px' }}>{profile?.bio || "Digital Vault Explorer."}</p>

            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', margin: '24px 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '22px', fontWeight: '900' }}>{followerCount}</p>
                  <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', letterSpacing: '1px' }}>FOLLOWERS</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '22px', fontWeight: '900' }}>{followingCount}</p>
                  <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', letterSpacing: '1px' }}>FOLLOWING</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '32px', alignItems: 'center' }}>
               {profile?.instagram_url && <a href={profile.instagram_url} target="_blank" style={{ opacity: 0.8, transition: '0.2s' }}><InstagramIcon /></a>}
               {profile?.ebay_url && <a href={profile.ebay_url} target="_blank" style={{ opacity: 0.8, transition: '0.2s' }}><FixedEbayLogo /></a>}
               {profile?.discord_handle && <span style={{ color: '#5865F2', opacity: 0.8 }}><DiscordIcon /></span>}
               {profile?.twitch_handle && <span style={{ color: '#9146FF', opacity: 0.8 }}><TwitchIcon /></span>}
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
              <Link href={`/collections?user=${userId}`} style={{ flex: 1, background: '#fff', color: '#000', fontWeight: '900', padding: '18px', borderRadius: '18px', textDecoration: 'none', textAlign: 'center', fontSize: '15px' }}>VIEW COLLECTIONS</Link>
              {isOwnProfile && (
                <button onClick={() => { setFiles([]); setShowSmartDrop(true); }} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #27272a', padding: '18px', borderRadius: '18px', fontWeight: '900', fontSize: '15px' }}>+ SMART DROP</button>
              )}
            </div>
        </section>

        {/* --- QUICK STATS GRID --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '24px', borderRadius: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', letterSpacing: '1px', marginBottom: '8px' }}>TOTAL ITEMS</p>
            <p style={{ fontSize: '24px', fontWeight: '900' }}>{itemCount}</p>
          </div>
          <div 
            onClick={() => isOwnProfile && setShowEditCollection(true)} 
            style={{ background: '#09090b', border: '1px solid #27272a', padding: '24px', borderRadius: '24px', textAlign: 'center', cursor: isOwnProfile ? 'pointer' : 'default', transition: '0.2s' }}
          >
            <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', letterSpacing: '1px', marginBottom: '8px' }}>COLLECTIONS {isOwnProfile && '⚙️'}</p>
            <p style={{ fontSize: '24px', fontWeight: '900' }}>{collectionCount}</p>
          </div>
          <div style={{ background: '#09090b', border: '1px solid #27272a', padding: '24px', borderRadius: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', letterSpacing: '1px', marginBottom: '8px' }}>EST. VALUE</p>
            <p style={{ fontSize: '24px', fontWeight: '900', color: '#4ade80' }}>£{vaultValue.toLocaleString()}</p>
          </div>
        </div>

        {/* --- GLOBAL FEED SECTION --- */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '28px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>GLOBAL RECENT DROPS</h2>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
            {recentDrops.map((drop, index) => (
              <div 
                key={drop.id} 
                onClick={() => setSelectedItemIndex(index)} 
                style={{ 
                  aspectRatio: '1/1', 
                  background: '#18181b', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  cursor: 'pointer', 
                  position: 'relative',
                  border: '1px solid transparent',
                  transition: '0.2s'
                }}
              >
                <img src={drop.image_url} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {drop.profiles?.username && (
                  <Link 
                    href={`/profile/${drop.profiles.id}`} 
                    onClick={e => e.stopPropagation()} 
                    style={{ 
                      position: 'absolute', 
                      top: '8px', 
                      left: '8px', 
                      background: 'rgba(0,0,0,0.7)', 
                      backdropFilter: 'blur(4px)',
                      padding: '4px 8px', 
                      borderRadius: '8px', 
                      fontSize: '10px', 
                      fontWeight: '800',
                      color: '#fff', 
                      textDecoration: 'none',
                      zIndex: 5
                    }}
                  >
                    @{drop.profiles.username}
                  </Link>
                )}
                {likedItems.has(drop.id) && (
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>⭐️</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --- SUGGESTED SECTION --- */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '900', color: '#52525b', letterSpacing: '1px', textTransform: 'uppercase' }}>Discover Collectors</h2>
            <Link href="/suggested" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: '900' }}>VIEW ALL</span>
            </Link>
          </div>
          <SuggestedUsers />
        </div>

        {isOwnProfile && (
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', 
              padding: '20px', 
              borderRadius: '20px', 
              background: '#09090b', 
              border: '1px solid #27272a', 
              color: '#ef4444', 
              fontWeight: '900',
              fontSize: '14px',
              letterSpacing: '1px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            LOGOUT ACCOUNT
          </button>
        )}
      </main>

      {/* --- MODALS (SMART DROP, EDITING, LIGHTBOX) --- */}
      
      {/* 1. LIGHTBOX MODAL */}
      {selectedItemIndex !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.98)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={() => setSelectedItemIndex(null)} style={{ position: 'absolute', top: '40px', right: '40px', background: 'none', border: 'none', color: '#fff', fontSize: '32px', cursor: 'pointer' }}>✕</button>
            
            <button 
              onClick={() => setSelectedItemIndex(p => p! > 0 ? p! - 1 : recentDrops.length - 1)} 
              style={{ position: 'absolute', left: '30px', background: 'rgba(255,255,255,0.05)', border: 'none', width: '60px', height: '60px', borderRadius: '50%', color: '#fff', fontSize: '28px' }}
            >‹</button>
            
            <div style={{ width: '90%', maxWidth: '550px', textAlign: 'center' }}>
                <img 
                  src={recentDrops[selectedItemIndex].image_url} 
                  style={{ width: '100%', borderRadius: '32px', border: '1px solid #27272a', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }} 
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 10px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '20px', fontWeight: '900', marginBottom: '4px' }}>{recentDrops[selectedItemIndex].title || "Untitled Drop"}</p>
                        <Link href={`/profile/${recentDrops[selectedItemIndex].profiles?.id}`} style={{ color: '#818cf8', fontSize: '15px', fontWeight: '700', textDecoration: 'none' }}>
                          @{recentDrops[selectedItemIndex].profiles?.username}
                        </Link>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                          onClick={() => toggleStar(recentDrops[selectedItemIndex].id)} 
                          style={{ background: '#18181b', border: '1px solid #27272a', padding: '12px 20px', borderRadius: '16px', color: '#fff', fontSize: '20px' }}
                        >
                          {likedItems.has(recentDrops[selectedItemIndex].id) ? '⭐️' : '☆'}
                        </button>
                    </div>
                </div>
                <div style={{ background: '#09090b', borderRadius: '20px', padding: '16px', border: '1px solid #27272a' }}>
                    <input placeholder="Add a comment..." style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '15px' }} />
                </div>
            </div>

            <button 
              onClick={() => setSelectedItemIndex(p => p! < recentDrops.length - 1 ? p! + 1 : 0)} 
              style={{ position: 'absolute', right: '30px', background: 'rgba(255,255,255,0.05)', border: 'none', width: '60px', height: '60px', borderRadius: '50%', color: '#fff', fontSize: '28px' }}
            >›</button>
        </div>
      )}

      {/* 2. EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '500px', border: '1px solid #27272a', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '32px', textAlign: 'center' }}>EDIT PROFILE</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', marginBottom: '8px' }}>DISPLAY NAME</p>
              <input value={profile?.display_url || ""} onChange={e => setProfile({...profile, display_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', marginBottom: '8px' }}>BIO</p>
              <textarea value={profile?.bio || ""} onChange={e => setProfile({...profile, bio: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '14px', borderRadius: '14px', height: '100px', resize: 'none' }} />
            </div>

            <p style={{ fontSize: '11px', color: '#71717a', fontWeight: '900', marginBottom: '16px', textAlign: 'center', borderTop: '1px solid #27272a', paddingTop: '20px' }}>SOCIAL LINKS</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                <input placeholder="Instagram URL" value={profile?.instagram_url || ""} onChange={e => setProfile({...profile, instagram_url: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', padding: '12px', color: '#fff', borderRadius: '12px', fontSize: '13px' }} />
                <input placeholder="eBay Store URL" value={profile?.ebay_url || ""} onChange={e => setProfile({...profile, ebay_url: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', padding: '12px', color: '#fff', borderRadius: '12px', fontSize: '13px' }} />
                <input placeholder="X (Twitter) URL" value={profile?.x_url || ""} onChange={e => setProfile({...profile, x_url: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', padding: '12px', color: '#fff', borderRadius: '12px', fontSize: '13px' }} />
                <input placeholder="YouTube URL" value={profile?.youtube_url || ""} onChange={e => setProfile({...profile, youtube_url: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', padding: '12px', color: '#fff', borderRadius: '12px', fontSize: '13px' }} />
                <input placeholder="TikTok URL" value={profile?.tiktok_url || ""} onChange={e => setProfile({...profile, tiktok_url: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', padding: '12px', color: '#fff', borderRadius: '12px', fontSize: '13px' }} />
                <input placeholder="Discord ID" value={profile?.discord_handle || ""} onChange={e => setProfile({...profile, discord_handle: e.target.value})} style={{ background: '#000', border: '1px solid #27272a', padding: '12px', color: '#fff', borderRadius: '12px', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowEditProfile(false)} style={{ flex: 1, color: '#71717a', fontWeight: '800', fontSize: '14px' }}>CANCEL</button>
              <button onClick={handleUpdateProfile} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '16px', borderRadius: '16px' }}>{uploading ? 'SAVING...' : 'SAVE CHANGES'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SMART DROP MODAL */}
      {showSmartDrop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '36px', borderRadius: '32px', width: '100%', maxWidth: '460px', border: '1px solid #27272a', position: 'relative' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', textAlign: 'center' }}>NEW SMART DROP</h2>
            
            <label style={{ 
              display: 'block', 
              background: '#09090b', 
              textAlign: 'center', 
              padding: '40px 20px', 
              borderRadius: '20px', 
              cursor: 'pointer', 
              border: '2px dashed #27272a', 
              marginBottom: '20px',
              transition: '0.2s'
            }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📸</span>
              <span style={{ fontWeight: '800', fontSize: '14px' }}>{files.length > 0 ? `${files.length} Photos Ready` : "Upload Item Photos"}</span>
              <input type="file" multiple accept="image/*" hidden onChange={e => setFiles(Array.from(e.target.files || []))} />
            </label>

            <input placeholder="Drop Title (e.g. 1st Edition Charizard)" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', background: '#000', color: '#fff', padding: '14px', borderRadius: '14px', border: '1px solid #27272a', marginBottom: '14px' }} />
            <input type="number" placeholder="Estimated Total Value (£)" value={itemValue} onChange={e => setItemValue(e.target.value)} style={{ width: '100%', background: '#000', color: '#fff', padding: '14px', borderRadius: '14px', border: '1px solid #27272a', marginBottom: '14px' }} />
            
            <select value={selectedCollectionId} onChange={e => setSelectedCollectionId(e.target.value)} style={{ width: '100%', background: '#000', color: '#fff', padding: '14px', borderRadius: '14px', border: '1px solid #27272a', marginBottom: '14px', fontSize: '14px' }}>
              <option value="">Select Existing Collection...</option>
              {collectionsList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>

            {!selectedCollectionId && (
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
                <p style={{ fontSize: '10px', color: '#71717a', fontWeight: '900', marginBottom: '10px' }}>OR CREATE NEW</p>
                <input placeholder="New Collection Name" value={newCollName} onChange={e => setNewCollName(e.target.value)} style={{ width: '100%', background: '#000', color: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #27272a', marginBottom: '10px' }} />
                <select value={selectedNiche} onChange={e => setSelectedNiche(e.target.value)} style={{ width: '100%', background: '#000', color: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #27272a' }}>
                  <option value="">Select Niche...</option>
                  {availableNiches.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowSmartDrop(false)} style={{ flex: 1, color: '#71717a', fontWeight: '800' }}>CANCEL</button>
              <button onClick={handleSmartDrop} disabled={uploading} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '16px', borderRadius: '16px' }}>{uploading ? 'PROCESSING...' : 'CONFIRM DROP'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MANAGE COLLECTIONS MODAL */}
      {showEditCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '36px', borderRadius: '32px', width: '100%', maxWidth: '520px', border: '1px solid #27272a', maxHeight: '85vh', overflowY: 'auto' }}>
             <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '24px' }}>MANAGE COLLECTIONS</h2>
             {collectionsList.map(c => (
               <div key={c.id} style={{ background: '#09090b', padding: '20px', borderRadius: '20px', marginBottom: '16px', border: '1px solid #27272a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: '900', fontSize: '16px', display: 'block' }}>{c.title}</span>
                      <span style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', fontWeight: '800' }}>{c.niche}</span>
                    </div>
                    <button onClick={async () => {
                      const { data } = await supabase.from("items").select("*").eq("collection", c.id).order('created_at', {ascending: false});
                      setEditingColl(c); setCollItems(data || []);
                    }} style={{ color: '#818cf8', fontSize: '13px', fontWeight: '800', background: 'rgba(129, 140, 248, 0.1)', padding: '8px 16px', borderRadius: '10px' }}>EDIT ITEMS</button>
                  </div>
                  
                  {editingColl?.id === c.id && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #27272a', paddingTop: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        {collItems.map(item => (
                          <div key={item.id} style={{ position: 'relative', aspectRatio: '1/1' }}>
                            <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                            <button onClick={() => deleteItem(item.id)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: '2px solid #18181b', borderRadius: '50%', width: '22px', height: '22px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
               </div>
             ))}
             <button onClick={() => setShowEditCollection(false)} style={{ width: '100%', marginTop: '20px', padding: '16px', color: '#71717a', fontWeight: '800' }}>DONE & CLOSE</button>
          </div>
        </div>
      )}

      {/* --- EXTERNAL COMPONENTS --- */}
      <ChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        receiverId={userId} 
        receiverName={profile?.display_url || profile?.username || "Collector"} 
      />
      <Footer />
    </div>
  );
}
