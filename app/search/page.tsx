"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  display_url: string | null;
  username: string | null;
  avatar_url: string | null;
  tier: string | null;
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_url, username, avatar_url, tier")
      .or(`display_url.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
      .limit(20);

    if (error) {
      console.error("Search error:", error);
    } else {
      setResults(data || []);
    }
    setLoading(false);
  };

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      searchUsers(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Find Collectors</h1>

        <div className="relative mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full p-5 bg-zinc-900 border border-zinc-700 rounded-3xl text-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        {loading && <p className="text-center text-zinc-400">Searching...</p>}

        {!loading && results.length === 0 && query && (
          <p className="text-center text-zinc-500">No collectors found</p>
        )}

        <div className="space-y-4">
          {results.map((user) => (
            <div
              key={user.id}
              onClick={() => router.push(`/profile/${user.id}`)}
              className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 cursor-pointer transition"
            >
              <div className="w-16 h-16 rounded-[30%] overflow-hidden border-2 border-zinc-700 flex-shrink-0">
                <img
                  src={user.avatar_url || "/default-avatar.png"}
                  alt={user.display_url || ""}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xl truncate">{user.display_url || user.username}</p>
                <p className="text-zinc-400">@{user.username || "collector"}</p>
              </div>

              {user.tier && (
                <div className="text-3xl">🏆</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
