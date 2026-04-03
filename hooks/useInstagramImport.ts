"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function useInstagramImport() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");

  type InstagramPost = {
    id: string;
    imageUrl: string;
    caption: string;
    timestamp?: string | null;
  };

  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Fetch posts using the current working route
  const fetchPosts = async () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    setLoading(true);
    setPosts([]);
    setSelected([]);
    setProgress({ current: 0, total: 0 });

    try {
      const res = await fetch("/api/import-instagram/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to fetch posts. Make sure the profile is public.");
        setLoading(false);
        return;
      }

      // Safe mapping with fallback for imageUrl
      const safePosts: InstagramPost[] = (data.posts || [])
        .filter((p: any) => p && (p.imageUrl || p.displayUrl))
        .map((p: any) => ({
          id: String(p.id || "post-" + Date.now() + Math.random()),
          imageUrl: String(p.imageUrl || p.displayUrl || ""),
          caption: String(p.caption || p.text || "").slice(0, 150),
          timestamp: p.timestamp || null,
        }));

      setPosts(safePosts);

      if (safePosts.length === 0) {
        alert("No posts with images found. The profile may be private or have no recent posts.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to fetch posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Import selected posts
  const importSelected = async () => {
    if (selected.length === 0) {
      alert("Please select at least one post");
      return;
    }

    if (!selectedCollectionId) {
      alert("Please choose a collection first.");
      return;
    }

    setImporting(true);
    setProgress({ current: 0, total: selected.length });

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;

    if (!userId) {
      alert("You must be logged in");
      setImporting(false);
      return;
    }

    const selectedPosts = posts.filter((p) => selected.includes(p.id));

    try {
      const res = await fetch("/api/import-instagram/confirm", {   // your existing confirm endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts: selectedPosts,
          userId,
          collectionId: selectedCollectionId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Import failed");
        setImporting(false);
        return;
      }

      let count = 0;
      for (const r of result.results || []) {
        count++;
        setProgress({ current: count, total: selected.length });
      }

      alert(`Successfully imported ${selected.length} items!`);
      router.push(`/profile/${userId}`);   // or wherever you want to redirect
    } catch (err) {
      console.error("Import failed:", err);
      alert("Import failed. Check console for details.");
    } finally {
      setImporting(false);
    }
  };

  return {
    username,
    setUsername,
    posts,
    selected,
    toggleSelect,
    fetchPosts,
    importSelected,
    loading,
    importing,
    progress,
    selectedCollectionId,
    setSelectedCollectionId,
  };
}
