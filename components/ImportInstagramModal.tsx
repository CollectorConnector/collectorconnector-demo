"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface InstagramPost {
  id: string;
  imageUrl: string;
  caption?: string;
}

interface Collection {
  id: string;
  title: string;
}

export default function InstagramImportModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [loading, setLoading] = useState(false);

  // Load user collections
  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setCollections((data as Collection[]) || []);
  }

  // ⭐ RESTORED: OLD WORKING FETCH ROUTE
  async function fetchPosts() {
    if (!username.trim()) {
      alert("Enter a username first");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/import-instagram/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }

  function togglePost(id: string) {
    setSelectedPosts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  // ⭐ RESTORED: OLD WORKING IMPORT ROUTE
  async function handleImport() {
    if (selectedPosts.length === 0) {
      alert("Select at least one post");
      return;
    }

    let collectionIdToUse = selectedCollection;

    // Create new collection if needed
    if (selectedCollection === "new") {
      if (!newCollectionName.trim()) {
        alert("Enter a name for the new collection");
        return;
      }

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      const { data: newCol, error } = await supabase
        .from("collections")
        .insert({
          title: newCollectionName,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        alert("Failed to create collection");
        return;
      }

      collectionIdToUse = newCol.id;
    }

    const res = await fetch("/api/import-instagram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collectionId: collectionIdToUse,
        posts: posts.filter((p) => selectedPosts.includes(p.id)),
      }),
    });

    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      alert("Import failed");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6">
      <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-lg border border-zinc-700">
        <h2 className="text-2xl font-bold mb-4">Import from Instagram</h2>

        <input
          type="text"
          placeholder="Instagram username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 mb-4"
        />

        <button
          onClick={fetchPosts}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl mb-4"
        >
          {loading ? "Fetching..." : "Fetch Posts"}
        </button>

        {posts.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => togglePost(post.id)}
                className={`border rounded-xl overflow-hidden cursor-pointer ${
                  selectedPosts.includes(post.id)
                    ? "border-blue-500"
                    : "border-zinc-700"
                }`}
              >
                <img src={post.imageUrl} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 mb-3"
            >
              <option value="">Select a collection</option>

              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}

              <option value="new">+ Create New Collection</option>
            </select>

            {selectedCollection === "new" && (
              <input
                type="text"
                placeholder="New collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 mb-4"
              />
            )}
          </>
        )}

        {posts.length > 0 && (
          <button
            onClick={handleImport}
            className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl mb-4"
          >
            Import Selected Posts
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
