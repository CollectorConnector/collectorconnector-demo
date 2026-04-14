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

// --- SVG ICONS ---
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
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
      .limit(20);

    if (!error) setResults(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => searchUsers(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter mb-2">SEARCH</h1>
          <p className="text-zinc-500 text-sm font-bold tracking-widest uppercase">Global Collector Directory</p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-16">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find by name or @handle..."
            className="w-full bg-[#0d0d0d] border border-zinc-800/50 pl-14 p-5 rounded-2xl text-lg focus:outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-800 font-medium"
          />
          {loading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* RESULTS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="group flex flex-col items-center text-center transition-transform duration-200 hover:-translate-y-1"
            >
              {/* THE SQUIRCLE AVATAR */}
              <div 
                className="aspect-square w-full overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-300 group-hover:border-zinc-400 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                style={{ 
                  borderRadius: '35%', // This creates the squircle shape
                  maskImage: 'paint(squircle)', // Optional: for true mathematical squircles if supported
                }}
              >
                <img
                  src={user.avatar_url || "/icons/tiers/collector.svg"}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* USER DETAILS */}
              <div className="mt-4 w-full px-2">
                <p className="font-bold text-[15px] truncate text-white tracking-tight leading-none mb-1">
                  {user.display_url || user.username}
                </p>
                <p className="text-indigo-400 text-[10px] font-black tracking-tighter uppercase opacity-80">
                  @{user.username}
                </p>
                
                {user.tier === 'founder' && (
                  <div className="mt-2 inline-block bg-white text-black text-[8px] font-black px-1.5 py-0.5 rounded-sm">
                    FOUNDER
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* EMPTY STATE */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-20 border border-dashed border-zinc-900 rounded-[35%] max-w-sm mx-auto">
            <p className="text-xs font-black tracking-widest uppercase text-zinc-700">No matches found</p>
          </div>
        )}
      </div>
    </div>
  );
}
