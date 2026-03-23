import { useState } from "react";

export function useInstagramImport() {
  const [username, setUsername] = useState("");
  type InstagramPost = {
  id: string;
  imageUrl: string;
  caption: string;
  timestamp?: string | null;
};

const [posts, setPosts] = useState<InstagramPost[]>([]);

  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const fetchPosts = async () => {
    setLoading(true);
    const res = await fetch("/api/import-instagram", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const importSelected = async () => {
    setImporting(true);
    setProgress({ current: 0, total: selected.length });

    const selectedPosts = posts.filter((p) => selected.includes(p.id));

    const res = await fetch("/api/import-instagram/confirm", {
      method: "POST",
      body: JSON.stringify({
        posts: selectedPosts,
        userId: "CURRENT_USER_ID",
      }),
    });

    const data = await res.json();

    let count = 0;
    for (const r of data.results) {
      count++;
      setProgress({ current: count, total: selected.length });
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

