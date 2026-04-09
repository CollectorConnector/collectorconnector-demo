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
const WhatnotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L2.4 4.8v14.4L12 24l9.6-4.8V4.8L12 0zm7.2 18L12 21.6 4.8 18V6.6L12 3l7.2 3.6V18z"/></svg>
);
const YoutubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);

// --- UPDATED OFFICIAL EBAY LOGO ---
const FixedEbayLogo = () => (
  <svg width="45" height="18" viewBox="0 0 45 18" xmlns="http://www.w3.org/2000/svg">
    <path fill="#E53238" d="M5.6 15.6c-.6 0-1.1-.1-1.6-.4-.5-.3-.9-.6-1.1-1.1h-.1v1.3H0V2.7h2.7v4.6h.1c.3-.5.7-.9 1.1-1.2.5-.3 1-.4 1.6-.4 1 0 1.8.4 2.4 1.1s.9 1.8.9 3c0 1.3-.3 2.3-.9 3-.6.9-1.5 1.2-2.3 1.2zm-.7-2.3c.4 0 .8-.1 1-.4.3-.3.4-.8.4-1.5 0-.7-.1-1.2-.4-1.5-.3-.3-.6-.4-1-.4s-.8.1-1 .4c-.3.3-.4.8-.4 1.5s.1 1.2.4 1.5c.3.3.7.4 1 .4z"/>
    <path fill="#0064D2" d="M16.6 15.6c-.9 0-1.6-.3-2.2-.9s-.9-1.5-.9-2.7h5.9c0-.2 0-.4 0-.6 0-1.2-.3-2.2-.9-2.9-.6-.7-1.4-1.1-2.4-1.1-1 0-1.8.4-2.4 1.2s-.9 1.8-.9 3.1c0 1.3.3 2.3.9 3 .6.8 1.4 1.2 2.5 1.2.8 0 1.5-.2 2.1-.5.6-.3 1-.8 1.2-1.3l-2.2-1c-.1.4-.4.8-.7 1-.4.3-.7.5-1 .5zm-.6-5.8c.4 0 .7.1.9.4.2.3.3.7.4 1.3h-3.1c.1-.6.2-1 .4-1.3.2-.3.6-.4 1-.4z"/>
    <path fill="#F5AF02" d="M28.4 15.6c-.6 0-1.1-.1-1.6-.4-.5-.3-.9-.6-1.1-1.1h-.1v1.3h-2.7V2.7h2.7v4.6h.1c.3-.5.7-.9 1.1-1.2.5-.3 1-.4 1.6-.4 1 0 1.8.4 2.4 1.1s.9 1.8.9 3c0 1.3-.3 2.3-.9 3-.6.9-1.5 1.2-2.3 1.2zm-.7-2.3c.4 0 .8-.1 1-.4.3-.3.4-.8.4-1.5 0-.7-.1-1.2-.4-1.5-.3-.3-.6-.4-1-.4s-.8.1-1 .4c-.3.3-.4.8-.4 1.5s.1 1.2.4 1.5c.3.3.7.4 1 .4z"/>
    <path fill="#86B817" d="M40.2 15.4h-2.8l-.5-1.5h-.1c-.4.6-.8 1.1-1.3 1.3-.5.3-1.1.4-1.7.4-1 0-1.8-.3-2.3-.9-.5-.6-.8-1.4-.8-2.5 0-1.1.3-1.9.9-2.5.6-.6 1.4-1 2.5-1 .7 0 1.2.1 1.7.3l.1-.8c0-.4-.1-.7-.3-.8-.2-.2-.5-.3-1-.3s-.8.1-1.1.4c-.3.2-.5.5-.7.9l-2.2-1c.4-.7.9-1.2 1.6-1.5.7-.3 1.5-.5 2.5-.5 1.4 0 2.4.3 3 .9.6.6.9 1.5.9 2.7v5.1c0 .6 0 1 .1 1.3h.1zm-3.3-3.1v-.6c-.3-.2-.6-.3-1-.3-.4 0-.7.1-.9.4-.2.3-.3.6-.3 1.1s.1.8.3 1.1c.2.3.5.4.9.4.3 0 .6-.1.8-.3.2-.2.3-.5.3-1l-.1.2z"/>
  </svg>
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

  // SOCIAL STATE
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  // MODAL STATES
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [showEditCollection, setShowEditCollection] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false); 
  const [selectedItem, setSelectedItem] = useState<any>(null); 
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Notification State
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
  const [commentText, setCommentText] = useState("");
  
  const [files, setFiles] = useState<File[]>([]);
  const [userRank, setUserRank] = useState<string | null>(null);

  // Audience State
  const [selectedAudience, setSelectedAudience] = useState<"everyone" | "private">("everyone");

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
    loadGlobalNiches();
  }, []);

  // GLOBAL NOTIFICATION LISTENER
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("global-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${currentUserId}` },
        (payload) => {
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
    determineRank();
  }, [userId]);

  // TRIGGER CHAT FROM INBOX
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

      const { data: globalDrops, error: dropError } = await supabase
        .from("items")
        .select(`
          *,
          profiles:user_id (
            username
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (dropError) {
        console.error("Drop Error:", dropError);
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
    } catch (err: any) { 
        alert("Upload failed: " + err.message); 
    } finally { 
        setUploading(false); 
    }
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
              <img 
                src={profile?.avatar_url || "/default-avatar.png"} 
                style={{ width: '100%', height: '100%', borderRadius: '20px', border: '4px solid #18181b', objectFit: 'cover', cursor: isOwnProfile ? 'pointer' : 'default' }} 
                onClick={() => isOwnProfile && document.getElementById('avatar-input')?.click()} 
              />
              {isOwnProfile && (
                <input 
                    type="file" 
                    id="avatar-input" 
                    hidden 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800' }}>{profile?.display_url || profile?.username}</h1>
              {renderRankIcon()}
              {!isOwnProfile && currentUserId && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={toggleFollow} style={{ background: isFollowing ? 'transparent' : '#fff', color: isFollowing ? '#fff' : '#000', border: isFollowing ? '1px solid #27272a' : 'none', padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '900' }}>
                    {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                  </button>
                  <button 
                    onClick={() => { setIsChatOpen(true); setHasNewMessage(false); }} 
                    style={{ position: 'relative', background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '8px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '900' }}
                  >
                    MESSAGE
                    {hasNewMessage && (
                        <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', border: '2px solid #000' }} />
                    )}
                  </button>
                </div>
              )}
            </div>
            <p style={{ color: '#818cf8', fontWeight: 'bold' }}>@{profile?.username}</p>
            <p style={{ color: '#a1a1aa', margin: '4px 0 12px' }}>{profile?.bio || "Digital Vault Explorer."}</p>

            {/* SOCIAL LINKS GRID */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px', alignItems: 'center', minHeight: '32px' }}>
               {profile?.instagram_url && (
                <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" style={{ color: '#E4405F', display: 'flex', alignItems: 'center' }}>
                  <InstagramIcon />
                </a>
               )}
               
               {profile?.ebay_url && (
                <a href={profile.ebay_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '4px 10px', borderRadius: '8px' }}>
                  <FixedEbayLogo />
                </a>
               )}
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

        {/* GLOBAL RECENT DROPS */}
        <section style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '24px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px' }}>GLOBAL RECENT DROPS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {recentDrops.map((drop) => (
              <div key={drop.id} onClick={() => setSelectedItem(drop)} style={{ aspectRatio: '1/1', background: '#18181b', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                <img src={drop.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '5px', left: '5px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                  @{drop.profiles?.username}
                </div>
                {likedItems.has(drop.id) && <div style={{ position: 'absolute', bottom: '5px', right: '5px', fontSize: '14px' }}>⭐</div>}
              </div>
            ))}
          </div>
        </section>

        {isOwnProfile && (
           <button 
             onClick={handleLogout} 
             style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#18181b', border: '1px solid #27272a', color: '#ef4444', fontWeight: '900', cursor: 'pointer', letterSpacing: '1px' }}
           >
             LOGOUT
           </button>
        )}

        <SuggestedUsers />
      </main>

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', border: '1px solid #27272a', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px' }}>EDIT PROFILE</h2>
            
            <p style={{ fontSize: '11px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>DISPLAY NAME</p>
            <input value={profile?.display_url || ""} onChange={e => setProfile({...profile, display_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '16px' }} />
            
            <p style={{ fontSize: '11px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>BIO</p>
            <textarea value={profile?.bio || ""} onChange={e => setProfile({...profile, bio: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', height: '80px', resize: 'none', marginBottom: '16px' }} />

            {/* URL GRID SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
               <div>
                  <p style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>INSTAGRAM URL</p>
                  <input placeholder="https://..." value={profile?.instagram_url || ""} onChange={e => setProfile({...profile, instagram_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px' }} />
               </div>
               <div>
                  <p style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>EBAY URL</p>
                  <input placeholder="https://..." value={profile?.ebay_url || ""} onChange={e => setProfile({...profile, ebay_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px' }} />
               </div>
               <div>
                  <p style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>FACEBOOK URL</p>
                  <input placeholder="https://..." value={profile?.facebook_url || ""} onChange={e => setProfile({...profile, facebook_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px' }} />
               </div>
               <div>
                  <p style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>X / TWITTER URL</p>
                  <input placeholder="https://..." value={profile?.x_url || ""} onChange={e => setProfile({...profile, x_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px' }} />
               </div>
               <div>
                  <p style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>WHATNOT URL</p>
                  <input placeholder="https://..." value={profile?.whatnot_url || ""} onChange={e => setProfile({...profile, whatnot_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px' }} />
               </div>
               <div>
                  <p style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>TWITCH CHANNEL</p>
                  <input placeholder="Channel Name" value={profile?.twitch_handle || ""} onChange={e => setProfile({...profile, twitch_handle: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '10px', borderRadius: '10px' }} />
               </div>
            </div>

            <p style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>DISCORD (USERNAME#0000)</p>
            <input value={profile?.discord_handle || ""} onChange={e => setProfile({...profile, discord_handle: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '16px' }} />

            {/* YOUTUBE AT BOTTOM NEXT TO DISCORD */}
            <p style={{ fontSize: '10px', color: '#a1a1aa', marginBottom: '4px', fontWeight: 'bold' }}>YOUTUBE URL</p>
            <input placeholder="https://..." value={profile?.youtube_url || ""} onChange={e => setProfile({...profile, youtube_url: e.target.value})} style={{ width: '100%', background: '#000', border: '1px solid #27272a', color: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '16px' }} />

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowEditProfile(false)} style={{ flex: 1, color: '#a1a1aa', fontWeight: 'bold' }}>CANCEL</button>
              <button onClick={handleUpdateProfile} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>{uploading ? 'SAVING...' : 'SAVE CHANGES'}</button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH DROP MODAL */}
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
               <span style={{ fontSize: '24px' }}>📸</span><br/>
               {files.length > 0 ? `${files.length} Photos Ready` : "TAP TO ADD PHOTOS (UP TO 20)"}
               <input type="file" multiple accept="image/*" hidden onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 20))} />
            </label>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => setShowAddItem(false)} style={{ flex: 1, color: '#a1a1aa' }}>CANCEL</button>
              <button onClick={handleBatchUploadItems} disabled={uploading || !selectedCollectionId || files.length === 0} style={{ flex: 2, background: '#fff', color: '#000', fontWeight: '900', padding: '12px', borderRadius: '12px' }}>{uploading ? 'DROPPING...' : 'DROP BATCH'}</button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT DRAWER RENDER */}
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
