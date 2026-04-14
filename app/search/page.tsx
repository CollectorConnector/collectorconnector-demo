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
    <div className="min-h-screen bg-black text-white p-6 pt-32">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-2">Search Vault</h1>
          <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full"></div>
        </div>

        <div className="max-w-md mx-auto mb-20">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Username or handle..."
            className="w-full bg-[#0A0A0A] border border-zinc-800 p-4 rounded-2xl text-center focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700 font-bold"
          />
        </div>

        {/* THE GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="group flex flex-col items-center no-underline"
            >
              {/* THE SQUIRCLE IMAGE CONTAINER */}
              <div 
                className="relative aspect-square w-full bg-zinc-900 border border-zinc-800 group-hover:border-zinc-500 transition-all duration-300"
                style={{ 
                  borderRadius: '32%', // The Squircle Sweet Spot
                  padding: '2px', // Gives a tiny bit of breathing room for the border
                }}
              >
                <div 
                  className="w-full h-full overflow-hidden" 
                  style={{ borderRadius: '30.5%' }}
                >
                  <img
                    src={user.avatar_url || "/icons/tiers/collector.svg"}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* OVERLAY BADGE FOR FOUNDER */}
                {user.tier === 'founder' && (
                  <div className="absolute -bottom-2 -right-1 bg-white text-black text-[9px] font-black px-2 py-0.5 rounded-md shadow-xl border border-black uppercase tracking-tighter">
                    Founder
                  </div>
                )}
              </div>

              {/* TEXT INFO */}
              <div className="mt-4 text-center w-full px-1">
                <p className="font-extrabold text-[15px] truncate text-white leading-none mb-1">
                  {user.display_url || user.username}
                </p>
                <p className="text-indigo-400 text-[11px] font-black tracking-widest uppercase opacity-80">
                  @{user.username}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center mt-20">
            <div className="w-8 h-8 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="mt-20 text-center">
             <p className="text-zinc-600 font-bold tracking-widest uppercase text-sm">No Collectors Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
