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
      .limit(20);

    if (!error) setResults(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => searchUsers(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="min-h-screen bg-black text-white p-4 pt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* COMPACT SEARCH HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Search Vault</h1>
        </div>

        {/* SEARCH BAR */}
        <div className="max-w-md mx-auto mb-16">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search collectors..."
            className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-center focus:outline-none focus:border-white/20 transition-all"
          />
        </div>

        {/* THE GRID - This replaces the vertical list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="group flex flex-col items-center no-underline"
            >
              {/* THE SQUIRCLE IMAGE CONTAINER */}
              <div 
                className="relative aspect-square w-full overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-zinc-500 transition-all"
                style={{ 
                  borderRadius: '35%', // Enforces the squircle shape
                }}
              >
                <img
                  src={user.avatar_url || "/icons/tiers/collector.svg"}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* INFO SECTION */}
              <div className="mt-3 text-center w-full px-1">
                <p className="font-bold text-[14px] truncate text-white leading-tight mb-0.5">
                  {user.display_url || user.username}
                </p>
                <p className="text-indigo-400 text-[10px] font-black tracking-widest uppercase opacity-70">
                  @{user.username}
                </p>
                
                {user.tier === 'founder' && (
                  <div className="mt-2 inline-block bg-white text-black text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">
                    Founder
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center mt-10">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <p className="text-center text-zinc-600 text-sm mt-20">NO COLLECTORS MATCHING "{query.toUpperCase()}"</p>
        )}
      </div>
    </div>
  );
}
