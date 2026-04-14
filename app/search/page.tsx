"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

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
      .limit(12);

    if (!error) setResults(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => searchUsers(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/10">
      <div className="max-w-2xl mx-auto px-6 pt-32">
        
        {/* TOP SECTION */}
        <div className="text-center mb-12">
          <h1 className="text-xs font-black tracking-[0.3em] text-zinc-600 uppercase mb-3">
            Global Search
          </h1>
          <h2 className="text-3xl font-bold tracking-tighter">Locate Collectors</h2>
        </div>

        {/* THE SEARCH INPUT */}
        <div className="relative mb-16">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-2xl opacity-20 group-focus-within:opacity-100 transition duration-500"></div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Username or display name..."
            className="relative w-full bg-[#0A0A0A] border border-zinc-800/50 p-5 rounded-2xl text-lg focus:outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-800"
          />
          {loading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
               <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* RESULTS GRID - 2 Columns makes it look much more 'Pro' than a long list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="group relative flex items-center gap-4 p-4 bg-[#0A0A0A] border border-zinc-900 rounded-2xl transition-all duration-300 hover:border-zinc-700 hover:bg-[#111111]"
            >
              {/* AVATAR BOX */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                  <img
                    src={user.avatar_url || "/icons/tiers/collector.svg"}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* USER TEXT */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[15px] truncate tracking-tight text-zinc-100">
                    {user.display_url || user.username}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-zinc-500 text-xs font-medium">@{user.username}</p>
                  {user.tier === 'founder' && (
                    <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                      FOUNDER
                    </span>
                  )}
                </div>
              </div>

              {/* ACTION */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-7-7 7 7-7 7"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* EMPTY STATE */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <p className="text-sm tracking-widest uppercase">No Results Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
