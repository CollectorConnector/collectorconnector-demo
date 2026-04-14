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
      .limit(10); // Keeping it tight for quality

    if (!error) setResults(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => searchUsers(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      {/* HEADER SPACE */}
      <div className="max-w-xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-sm font-black tracking-[0.2em] text-zinc-500 mb-4 text-center">
          DIRECTORY
        </h1>
        
        {/* THE SEARCH BAR - Now with a glass/glow effect */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000"></div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or @username..."
            className="relative w-full p-5 bg-[#0d0d0d] border border-zinc-800 rounded-2xl text-lg focus:outline-none focus:border-zinc-400 transition-all placeholder:text-zinc-700 font-medium"
          />
          {loading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* RESULTS SECTION */}
      <div className="max-w-xl mx-auto px-6 pb-20">
        {!loading && query && results.length === 0 && (
          <div className="text-center py-20 border border-dashed border-zinc-900 rounded-3xl">
            <p className="text-zinc-600 font-medium">No collectors found in the vault.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="group flex items-center gap-4 p-4 bg-[#0d0d0d] border border-zinc-900 hover:border-zinc-700 rounded-2xl transition-all duration-200 hover:bg-[#111111]"
            >
              {/* AVATAR - Forced consistency */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                  <img
                    src={user.avatar_url || "/icons/tiers/collector.svg"}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                {user.tier === 'founder' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-[#050505] shadow-lg"></div>
                )}
              </div>

              {/* USER INFO */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[16px] text-white truncate tracking-tight">
                    {user.display_url || user.username}
                  </p>
                </div>
                <p className="text-indigo-400/80 text-xs font-black tracking-wider uppercase">
                  @{user.username || "collector"}
                </p>
              </div>

              {/* END ICON */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-7-7 7 7-7 7"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
