"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import SuggestedUsers from "@/components/SuggestedUsers";
import Header from "@/components/Header";
import Link from "next/link";

const PRESET_NICHES = [
  "Sports Cards", "Pokémon", "Comics", "Sneakers", 
  "Watches", "Vinyl Records", "Stamps", "Coins", "Other"
];

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
  const [recentDrops, setRecentDrops] = useState<any[]>([]);

  // UI States
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form States
  const [itemName, setItemName] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    async function loadData() {
      try {
        setLoading(true);
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();
        if (prof) setProfile(prof);

        const { data: items } = await supabase.from("items").select("estimated_value").eq("user_id", userId);
        if (items) {
          setItemCount(items.length);
          setVaultValue(items.reduce((sum, i) => sum + (Number(i.estimated_value) || 0), 0));
        }

        const { count } = await supabase.from("collections").select("*", { count: 'exact', head: true }).eq("user_id", userId);
        setCollectionCount(count || 0);

        const { data: drops } = await supabase.from("items").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(6);
        setRecentDrops(drops || []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  async function handlePostItem() {
    if (!file || !userId || !niche) return;
    setUploading(true);
    try {
      const finalNiche = niche === "Other" ? customNiche : niche;
      const fileName = `${userId}/${Date.now()}.jpg`;
      await supabase.storage.from("item-images").upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);
      
      await supabase.from("items").insert({
        user_id: userId,
        title: itemName || "Untitled",
        image_url: publicUrl,
        estimated_value: parseFloat(itemValue) || 0,
        niche_family: finalNiche,
        status: "active"
      });
      window.location.reload();
    } catch (err) {
      alert("Post failed");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black">SYNCING VAULT...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="mt-24 pb-20 max-w-3xl mx-auto px-4 flex flex-col gap-6">
        
        {/* Profile Info */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-[24px] p-8 text-center flex flex-col items-center">
          <img src={profile?.avatar_url || "/default-avatar.png"} className="w-28 h-28 rounded-2xl object-cover border-4 border-zinc-900 mb-6" />
          <div className="flex items-center gap-3 justify-center mb-2">
            <h1 className="text-3xl font-extrabold">{profile?.display_url || profile?.username}</h1>
            <img src="/diamond.png" className="w-10 h-10 object-contain" alt="Diamond" />
          </div>
          <p className="text-indigo-400 text-lg mb-4">@{profile?.username}</p>
          <p className="text-zinc-400 mb-6 max-w-sm">{profile?.bio || "Digital Vault Explorer."}</p>
          <Link href={`/collections?user=${userId}`} className="w-full max-w-xs bg-white text-black font-black py-4 rounded-2xl text-center no-underline mb-6">VIEW COLLECTIONS</Link>
          {isOwnProfile && (
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowAddItem(true)} className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl font-bold text-sm">+ ITEM</button>
              <button onClick={() => setShowAddCollection(true)} className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl font-bold text-sm">+ COLL</button>
              <button className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl font-bold text-sm">EDIT</button>
            </div>
          )}
        </section>

        {/* Stats */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-[24px] p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-black">{itemCount}</p><p className="text-zinc-600 text-[10px] font-bold">ITEMS</p></div>
            <div><p className="text-2xl font-black">{collectionCount}</p><p className="text-zinc-600 text-[10px] font-bold">COLLS</p></div>
            <div><p className="text-2xl font-black text-green-400">£{vaultValue.toLocaleString()}</p><p className="text-zinc-600 text-[10px] font-bold">VALUE</p></div>
          </div>
        </section>

        {/* Recent Drops */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-[24px] p-6">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-lg font-black">RECENT DROPS</h2>
            <img src="/CC-SML-Logo.png" className="w-5 h-5" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {recentDrops.map((drop) => (
              <div key={drop.id} onClick={() => router.push(`/items/${drop.id}`)} className="aspect-square bg-zinc-900 rounded-xl overflow-hidden cursor-pointer">
                <img src={drop.image_url} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>
        <SuggestedUsers />
      </main>

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[2000] p-5">
          <div className="bg-zinc-900 p-8 rounded-[24px] w-full max-w-sm border border-zinc-800">
            <h2 className="font-black text-center mb-5">NEW ITEM</h2>
            <input placeholder="Item Title" value={itemName} onChange={e => setItemName(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-xl mb-3 text-white" />
            <select value={niche} onChange={e => setNiche(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-xl mb-3 text-white appearance-none">
              <option value="" disabled>Select Niche Family</option>
              {PRESET_NICHES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {niche === "Other" && <input placeholder="What do you collect?" value={customNiche} onChange={e => setCustomNiche(e.target.value)} className="w-full bg-black border border-indigo-500 p-3 rounded-xl mb-3 text-white" />}
            <div className="flex gap-2 mb-4">
              <input placeholder="Value (£)" type="number" value={itemValue} onChange={e => setItemValue(e.target.value)} className="flex-1 bg-black border border-zinc-800 p-3 rounded-xl text-white" />
              <a href="https://130point.com/sales/" target="_blank" className="bg-zinc-800 p-3 rounded-xl text-[10px] font-bold text-center leading-tight">CHECK<br/>VALUE ↗</a>
            </div>
            {!preview ? (
              <label className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex justify-center cursor-pointer text-zinc-500">Upload Photo<input type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f){ setFile(f); setPreview(URL.createObjectURL(f)); }}} /></label>
            ) : (
              <img src={preview} className="w-full rounded-xl mb-4 max-h-40 object-cover" />
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddItem(false)} className="flex-1 font-bold text-zinc-500">CANCEL</button>
              <button onClick={handlePostItem} disabled={uploading || !file || !niche} className="flex-2 bg-white text-black font-black py-3 px-6 rounded-xl disabled:opacity-50">{uploading ? 'POSTING...' : 'POST ITEM'}</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
