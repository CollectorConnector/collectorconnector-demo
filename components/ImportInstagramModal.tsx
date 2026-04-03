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

  // Collections for the user to choose from
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");

  // Load user's collections when modal opens
  useEffect(() => {
    const loadCollections = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("collections")
        .select("id, title")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setCollections(data);
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

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch posts");
      }

      if (data.posts && data.posts.length > 0) {
        setPosts(data.posts);
      } else {
        setError("No posts found. Make sure the profile is public.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
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
      alert("Please select a collection to import into");
      return;
    }

    setImporting(true);

    try {
      const selectedPosts = posts.filter((p) => selected.includes(p.id));

      for (const post of selectedPosts) {
        const imgRes = await fetch(post.imageUrl);
        const buffer = Buffer.from(await imgRes.arrayBuffer());

        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const filePath = `items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("items")
          .upload(filePath, buffer, { contentType: "image/jpeg", upsert: true });

        if (uploadError) continue;

        const { data: urlData } = supabase.storage.from("items").getPublicUrl(filePath);

        await supabase.from("items").insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          image_url: urlData.publicUrl,
          name: post.caption?.slice(0, 100) || "Instagram Import",
          caption: post.caption || "",
          collection_id: selectedCollectionId,
          source: "instagram",
        });
      }

      alert(`Successfully imported ${selected.length} items!`);
      onClose();
    } catch (err) {
      alert("Some items failed to import. Check console.");
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-700">
          <h2 className="text-2xl font-bold">Import from Instagram</h2>
          <p className="text-zinc-400 text-sm mt-1">Enter a public Instagram username</p>
        </div>

        <div className="p-6 flex-1 overflow-auto">
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
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium disabled:opacity-50 transition"
            >
              {loading ? "Fetching..." : "Fetch"}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

          {posts.length > 0 && (
            <>
              <div className="flex justify-between items-center mt-6 mb-3">
                <p className="text-zinc-400 text-sm">{posts.length} posts found</p>
                <button
                  onClick={toggleSelectAll}
                  className="text-indigo-400 text-sm hover:underline"
                >
                  {selected.length === posts.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 max-h-96 overflow-auto">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => toggleSelect(post.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition ${
                      selected.includes(post.id) ? "border-indigo-500" : "border-transparent"
                    }`}
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                    {selected.includes(post.id) && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                        <div className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">✓</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Collection Picker */}
              <div className="mt-6">
                <label className="block text-sm text-zinc-400 mb-2">Import into Collection</label>
                <select
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">Select a collection...</option>
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
            className="flex-1 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={importSelected}
            disabled={selected.length === 0 || importing || !selectedCollectionId}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium disabled:opacity-50 transition"
          >
            {importing ? `Importing ${selected.length}...` : `Import ${selected.length} Items`}
          </button>
        </div>
      </div>
    </div>
  );
}
