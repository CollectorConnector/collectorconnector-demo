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

// --- RAW SVG ICONS (No NPM needed) ---
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
);

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
      .limit(16);

    if (!error) setResults(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => searchUsers(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <p className="text-[10px] font-black tracking-[0.4em] text-zinc-600 uppercase mb-4">
            Network Directory
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            FIND COLLECTORS
          </h1>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-20 max-w-xl mx-auto">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or @username..."
            className="w-full bg-[#0d0d0d] border border-zinc-800 pl-14 p-5 rounded-2xl text-lg focus:outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-800 font-medium"
          />
          {loading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* RESULTS GRID - Enforced uniformity */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="group relative flex flex-col bg-[#0d0d0d] border border-zinc-900 rounded-3xl p-3 md:p-4 transition-all duration-300 hover:border-zinc-500 hover:bg-[#111111]"
            >
              {/* IMAGE CONTAINER - This fixes the "different sizes" issue */}
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-4">
                <img
                  src={user.avatar_url || "/icons/tiers/collector.svg"}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* USER DETAILS */}
              <div className="px-1 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[15px] truncate text-white tracking-tight">
                    {user.display_url || user.username}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-indigo-400 text-[11px] font-black tracking-wider uppercase">
                    @{user.username}
                  </p>
                  {user.tier === 'founder' && (
                    <span className="bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                      FOUNDER
                    </span>
                  )}
                </div>
              </div>

              {/* FLOATING ACTION ARROW */}
              <div className="absolute top-6 right-6 p-2 bg-black/80 rounded-full border border-zinc-800 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <ArrowIcon />
              </div>
            </Link>
          ))}
        </div>

        {/* EMPTY STATE */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-24 opacity-30">
            <p className="text-xs font-black tracking-[0.5em] uppercase">No Collectors Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
