"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ImportInstagramModalProps {
  onClose: () => void;
}

export default function ImportInstagramModal({ onClose }: ImportInstagramModalProps) {
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");

  // Load user's collections
  useEffect(() => {
    const loadCollections = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("collections")
        .select("id, title")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setCollections(data);
    };

    loadCollections();
  }, []);

  const fetchPosts = async () => {
    if (!username.trim()) {
      setError("Please enter an Instagram username");
      return;
    }

    setLoading(true);
    setError(null);
    setPosts([]);
    setSelected([]);

    try {
      const res = await fetch("/api/import-instagram/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch posts");

      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (postId: string) => {
    setSelected((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === posts.length) {
      setSelected([]);
    } else {
      setSelected(posts.map((p) => p.id));
    }
  };

  const importSelected = async () => {
    if (selected.length === 0) {
      alert("Please select at least one post");
      return;
    }
    if (!selectedCollectionId) {
      alert("Please select a collection");
      return;
    }

    setImporting(true);

    try {
      const selectedPosts = posts.filter((p) => selected.includes(p.id));

      for (const post of selectedPosts) {
        const imgRes = await fetch(post.imageUrl);
        const buffer = Buffer.from(await imgRes.arrayBuffer());

        const fileName = `ig-${Date.now()}.jpg`;
        const filePath = `items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("items")
          .upload(filePath, buffer, { contentType: "image/jpeg", upsert: true });

        if (uploadError) continue;

        const { data: urlData } = supabase.storage.from("items").getPublicUrl(filePath);

        await supabase.from("items").insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          image_url: urlData.publicUrl,
          name: post.caption?.slice(0, 80) || "Instagram Import",
          caption: post.caption || "",
          collection_id: selectedCollectionId,
          source: "instagram",
        });
      }

      alert(`Imported ${selected.length} items successfully!`);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Some items failed to import");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-700">
          <h2 className="text-2xl font-bold">Import from Instagram</h2>
          <p className="text-zinc-400 text-sm mt-1">Public profile only</p>
        </div>

        <div className="p-6 flex-1 overflow-auto space-y-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. nike or breaking_cajun"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={fetchPosts}
              disabled={loading || !username.trim()}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium disabled:opacity-50 transition"
            >
              {loading ? "Fetching..." : "Fetch"}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {posts.length > 0 && (
            <>
              <div className="flex justify-between items-center">
                <p className="text-zinc-400">{posts.length} posts found</p>
                <button onClick={toggleSelectAll} className="text-indigo-400 hover:underline text-sm">
                  {selected.length === posts.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 max-h-80 overflow-auto">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => toggleSelect(post.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition ${
                      selected.includes(post.id) ? "border-indigo-500" : "border-transparent"
                    }`}
                  >
                    <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                    {selected.includes(post.id) && (
                      <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                        <div className="bg-white text-black w-7 h-7 rounded-full flex items-center justify-center text-lg">✓</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Import into Collection</label>
                <select
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">Choose collection...</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-zinc-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={importSelected}
            disabled={selected.length === 0 || importing || !selectedCollectionId}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium disabled:opacity-50"
          >
            {importing ? `Importing ${selected.length}...` : `Import ${selected.length} Items`}
          </button>
        </div>
      </div>
    </div>
  );
}
