"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";
import Header from "@/components/Header";
import Link from "next/link";

// --- SVG ICONS ---
const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
);
const TwitchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
);
const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44c-.795 0-1.439-.645-1.439-1.44s.644-1.44 1.439-1.44z"/></svg>
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

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = params?.id || "";

  // -- CORE PROFILE STATE --
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<string | null>(null);
  
  // -- TABS & DATA ARRAYS --
  const [activeTab, setActiveTab] = useState("items");
  const [items, setItems] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [recentDrops, setRecentDrops] = useState<any[]>([]);
  
  // -- STATS --
  const [stats, setStats] = useState({
    items: 0,
    colls: 0,
    value: 0,
    followers: 0,
    following: 0
  });

  // -- UI STATE --
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
      if (data.user?.id) checkFollowingStatus(data.user.id);
    });
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadProfileData();
      loadItemsAndCollections();
      loadGlobalDrops();
      determineRank();
    }
  }, [userId]);

  // --- LOGIC: FETCHING ---
  async function loadProfileData() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (data) setProfile(data);
      
      // Load follow counts
      const { count: followers } = await supabase.from("follows").select("*", { count: 'exact', head: true }).eq("following_id", userId);
      const { count: following } = await supabase.from("follows").select("*", { count: 'exact', head: true }).eq("follower_id", userId);
      setStats(prev => ({ ...prev, followers: followers || 0, following: following || 0 }));
    } finally { setLoading(false); }
  }

  async function loadItemsAndCollections() {
    const { data: itemData } = await supabase.from("items").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    const { data: collData } = await supabase.from("collections").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    
    if (itemData) {
      setItems(itemData);
      const totalVal = itemData.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0);
      setStats(prev => ({ ...prev, items: itemData.length, value: totalVal }));
    }
    if (collData) {
      setCollections(collData);
      setStats(prev => ({ ...prev, colls: collData.length }));
    }
  }

  async function loadGlobalDrops() {
    const { data } = await supabase.from("items").select(`*, profiles:user_id (username)`).order("created_at", { ascending: false }).limit(24);
    if (data) setRecentDrops(data);
  }

  // --- LOGIC: ACTIONS ---
  async function checkFollowingStatus(me: string) {
    const { data } = await supabase.from("follows").select("*").eq("follower_id", me).eq("following_id", userId).single();
    setIsFollowing(!!data);
  }

  async function toggleFollow() {
    if (!currentUserId) return router.push("/login");
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", userId);
    } else {
      await supabase.from("follows").insert({ follower_id: currentUserId, following_id: userId });
    }
    setIsFollowing(!isFollowing);
    loadProfileData();
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err) { console.error(err); } finally { setUploading(false); }
  }

  async function handleUpdateProfile() {
    setUploading(true);
    const { error } = await supabase.from("profiles").update({
      display_url: profile.display_url,
      bio: profile.bio,
      ebay_url: profile.ebay_url,
      instagram_url: profile.instagram_url,
      facebook_url: profile.facebook_url,
      whatnot_url: profile.whatnot_url,
      youtube_url: profile.youtube_url,
      x_url: profile.x_url,
      discord_url: profile.discord_url,
      twitch_url: profile.twitch_url
    }).eq("id", userId);
    setUploading(false);
    if (!error) setShowEditProfile(false);
  }

  async function determineRank() {
    const stacyId = "8b594b57-fc82-477a-a709-45aec99a228f"; 
    if (userId === stacyId) setUserRank("diamond");
  }

  if (loading && !profile) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <Header />
      
      <main className="max-w-[640px] mx-auto px-4 pt-[110px] pb-32">
        
        {/* PROFILE CARD */}
        <section className="bg-[#09090b] border border-[#27272a] rounded-[40px] p-8 text-center relative shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4 text-left">
              <div>
                <div className="text-xl font-black">{stats.followers}</div>
                <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Followers</div>
              </div>
              <div>
                <div className="text-xl font-black">{stats.following}</div>
                <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Following</div>
              </div>
            </div>
            {isOwnProfile ? (
              <button onClick={() => setShowEditProfile(true)} className="bg-[#18181b] border border-[#27272a] px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest text-zinc-400 uppercase">Settings</button>
            ) : (
              <button onClick={toggleFollow} className={`px-6 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all ${isFollowing ? 'bg-[#18181b] text-zinc-400 border border-[#27272a]' : 'bg-white text-black'}`}>
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div className="relative w-[130px] h-[130px] mx-auto mb-6 group">
            <img src={profile?.avatar_url || "/default-avatar.png"} className="w-full h-full rounded-[38px] object-cover border-4 border-[#18181b] shadow-2xl" />
            {isOwnProfile && (
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5l-8 8M9 4l1 1-1-1zm1 0l3 3-3-3z"/></svg>
              </button>
            )}
            <input type="file" ref={fileInputRef} hidden onChange={handleAvatarUpload} accept="image/*" />
          </div>

          <h1 className="text-3xl font-black tracking-tighter mb-1">
            {profile?.display_url || profile?.username}
            {userRank === 'diamond' && <span className="ml-2">💎</span>}
          </h1>
          <p className="text-indigo-400 font-bold text-sm mb-6">@{profile?.username}</p>

          {/* SOCIALS ROW - Conditional */}
          <div className="flex flex-wrap items-center justify-center gap-5 mb-8">
            {profile?.ebay_url && <a href={profile.ebay_url} target="_blank" className="font-black text-lg hover:scale-110 transition-transform"><span className="text-[#e53238]">e</span><span className="text-[#0064d2]">b</span><span className="text-[#f5af02]">a</span><span className="text-[#86b817]">y</span></a>}
            {profile?.instagram_url && <a href={profile.instagram_url} target="_blank" className="text-[#E1306C] hover:scale-110 transition-transform"><InstagramIcon /></a>}
            {profile?.facebook_url && <a href={profile.facebook_url} target="_blank" className="text-[#1877F2] hover:scale-110 transition-transform"><FacebookIcon /></a>}
            {profile?.whatnot_url && <a href={profile.whatnot_url} target="_blank" className="text-white hover:opacity-70 transition-opacity"><WhatnotIcon /></a>}
            {profile?.youtube_url && <a href={profile.youtube_url} target="_blank" className="text-[#FF0000] hover:scale-110 transition-transform"><YoutubeIcon /></a>}
            {profile?.x_url && <a href={profile.x_url} target="_blank" className="text-white hover:scale-110 transition-transform"><XIcon /></a>}
            {profile?.discord_url && <a href={profile.discord_url} target="_blank" className="text-[#5865F2] hover:scale-110 transition-transform"><DiscordIcon /></a>}
            {profile?.twitch_url && <a href={profile.twitch_url} target="_blank" className="text-[#9146FF] hover:scale-110 transition-transform"><TwitchIcon /></a>}
          </div>

          <p className="text-zinc-400 text-[15px] font-medium italic mb-8 max-w-[420px] mx-auto leading-relaxed">{profile?.bio}</p>
        </section>

        {/* STATS STRIP */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-[#09090b] border border-[#27272a] p-5 rounded-[28px] text-center">
            <div className="text-[10px] text-zinc-500 font-black tracking-widest uppercase mb-1">Items</div>
            <div className="text-2xl font-black">{stats.items}</div>
          </div>
          <div className="bg-[#09090b] border border-[#27272a] p-5 rounded-[28px] text-center">
            <div className="text-[10px] text-zinc-500 font-black tracking-widest uppercase mb-1">Colls</div>
            <div className="text-2xl font-black">{stats.colls}</div>
          </div>
          <div className="bg-[#09090b] border border-[#27272a] p-5 rounded-[28px] text-center">
            <div className="text-[10px] text-zinc-500 font-black tracking-widest uppercase mb-1">Value</div>
            <div className="text-2xl font-black text-emerald-400">£{stats.value.toLocaleString()}</div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-2 mt-8 mb-6 p-1 bg-[#09090b] border border-[#27272a] rounded-2xl">
          {["items", "collections", "drops", "about"].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === tab ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <div className="min-h-[400px]">
          {activeTab === 'items' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map(item => (
                <Link key={item.id} href={`/item/${item.id}`} className="aspect-square bg-[#09090b] border border-[#27272a] rounded-3xl overflow-hidden group">
                  <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </Link>
              ))}
              {items.length === 0 && <div className="col-span-full py-20 text-center text-zinc-600 font-bold italic">No items yet.</div>}
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="space-y-4">
              {collections.map(coll => (
                <Link key={coll.id} href={`/collections/${coll.id}`} className="block bg-[#09090b] border border-[#27272a] p-6 rounded-[32px] hover:border-zinc-500 transition-all">
                  <h3 className="font-black text-xl mb-1">{coll.name}</h3>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{coll.item_count || 0} ITEMS</p>
                </Link>
              ))}
              {collections.length === 0 && <div className="py-20 text-center text-zinc-600 font-bold italic">No collections yet.</div>}
            </div>
          )}

          {activeTab === 'drops' && (
            <div className="grid grid-cols-3 gap-3">
              {recentDrops.map(drop => (
                <Link key={drop.id} href={`/item/${drop.id}`} className="relative aspect-square bg-[#09090b] border border-[#27272a] rounded-2xl overflow-hidden group">
                  <img src={drop.image_url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <span className="text-[8px] font-black text-white truncate text-center">@{drop.profiles?.username}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-[#09090b] border border-[#27272a] p-8 rounded-[40px]">
               <h4 className="text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-4">Bio</h4>
               <p className="text-zinc-300 leading-relaxed font-medium mb-8">{profile?.bio || "User hasn't provided a bio."}</p>
               <h4 className="text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-4">Member Since</h4>
               <p className="text-white font-black">{new Date(profile?.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        <SuggestedUsers />
      </main>

      {/* EDIT MODAL */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/95 z-[1000] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#09090b] border border-[#27272a] p-8 rounded-[40px] w-full max-w-[480px] max-h-[85vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-black tracking-tight mb-8">EDIT PROFILE</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase block mb-2">Display Name</label>
                <input value={profile.display_url || ""} onChange={e => setProfile({...profile, display_url: e.target.value})} className="w-full bg-black border border-[#27272a] rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "eBay", key: "ebay_url" }, { label: "Insta", key: "instagram_url" },
                  { label: "FB", key: "facebook_url" }, { label: "Whatnot", key: "whatnot_url" },
                  { label: "YT", key: "youtube_url" }, { label: "X", key: "x_url" },
                  { label: "Discord", key: "discord_url" }, { label: "Twitch", key: "twitch_url" }
                ].map(s => (
                  <div key={s.key}>
                    <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1">{s.label}</label>
                    <input value={profile[s.key] || ""} onChange={e => setProfile({...profile, [s.key]: e.target.value})} className="w-full bg-black border border-[#27272a] rounded-xl p-3 text-xs" />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase block mb-2">Bio</label>
                <textarea value={profile.bio || ""} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-black border border-[#27272a] rounded-2xl p-4 text-sm min-h-[100px]" />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowEditProfile(false)} className="flex-1 font-black text-xs text-zinc-500 uppercase tracking-widest">Cancel</button>
                <button onClick={handleUpdateProfile} disabled={uploading} className="flex-[2] bg-white text-black font-black py-4 rounded-2xl uppercase text-xs tracking-widest shadow-xl">
                  {uploading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
