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

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchUsers(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-black mb-2 text-center tracking-tighter">FIND COLLECTORS</h1>
        <p className="text-zinc-500 text-center mb-10 text-sm font-medium">Search the global vault directory</p>

        <div className="relative mb-12">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or @username..."
            className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-lg focus:outline-none focus:border-white/50 transition-all placeholder:text-zinc-600"
          />
          {loading && (
             <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          )}
        </div>

        {!loading && results.length === 0 && query && (
          <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
            <p className="text-zinc-500 font-medium">No collectors found for "{query}"</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {results.map((user) => (
            <div
              key={user.id}
              onClick={() => router.push(`/profile/${user.id}`)}
              className="flex items-center gap-4 bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-500 hover:bg-zinc-900/60 rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98]"
            >
              {/* FIXED SIZE AVATAR */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-700">
                <img
                  src={user.avatar_url || "/icons/tiers/collector.svg"}
                  alt={user.display_url || ""}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* TEXT SECTION */}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg truncate leading-tight">
                    {user.display_url || user.username}
                  </p>
                  {user.tier === 'founder' && (
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-500/20">
                      FOUNDER
                    </span>
                  )}
                </div>
                <p className="text-indigo-400 text-sm font-bold">@{user.username || "collector"}</p>
              </div>

              {/* ACTION ICON */}
              <div className="text-zinc-600 ml-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
