"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function useInstagramImport() {
  const [username, setUsername] = useState("");

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

  // Fetch posts from Instagram
  const fetchPosts = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setPosts([]);
    setSelected([]);

    try {
      const res = await fetch("/api/import-instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (data.error) {
        console.error("Instagram error:", data.error);
        setLoading(false);
        return;
      }

      setPosts(data.posts || []);
    } catch (err) {
      console.error("Fetch posts failed:", err);
    }

    setLoading(false);
  };

  // Select / unselect posts
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Import selected posts
  const importSelected = async () => {
    if (selected.length === 0) return;

    setImporting(true);
    setProgress({ current: 0, total: selected.length });

    // Get logged-in user ID
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;

    if (!userId) {
      alert("You must be logged in to import.");
      setImporting(false);
      return;
    }

    const selectedPosts = posts.filter((p) => selected.includes(p.id));

    try {
      const res = await fetch("/api/import-instagram/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts: selectedPosts,
          userId,
        }),
      });

      const data = await res.json();

      let count = 0;
      for (const r of data.results) {
        count++;
        setProgress({ current: count, total: selected.length });
      }
    } catch (err) {
      console.error("Import failed:", err);
    }

    setImporting(false);
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
  };
}
