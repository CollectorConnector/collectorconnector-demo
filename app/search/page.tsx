"use client";

import { useState, useEffect } from "react";
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
    <div className="min-h-screen bg-black text-white px-6 pt-32 pb-20">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase italic">
            Search Vault
          </h1>
          <div className="h-1 w-20 bg-indigo-500 mx-auto mt-3 rounded-full" />
        </div>

        {/* SEARCH INPUT */}
        <div className="max-w-md mx-auto mb-16">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search collectors..."
            className="w-full bg-[#0A0A0A] border border-zinc-800 p-4 rounded-2xl 
                       text-center font-bold placeholder:text-zinc-600 
                       focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>

        {/* RESULTS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 
                        gap-x-6 gap-y-12">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="group flex flex-col items-center"
            >
              {/* AVATAR */}
              <div
                className="relative aspect-square w-full bg-zinc-900 border border-zinc-800 
                           group-hover:border-zinc-500 transition-all duration-300"
                style={{ borderRadius: "32%" }}
              >
                <div className="w-full h-full overflow-hidden" style={{ borderRadius: "30.5%" }}>
                  <img
                    src={user.avatar_url || "/icons/tiers/collector.svg"}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 
                               group-hover:scale-110"
                  />
                </div>

                {user.tier === "founder" && (
                  <div className="absolute -bottom-2 -right-1 bg-white text-black 
                                  text-[9px] font-black px-2 py-0.5 rounded-md shadow-xl 
                                  border border-black uppercase tracking-tight">
                    Founder
                  </div>
                )}
              </div>

              {/* TEXT */}
              <div className="mt-4 text-center w-full">
                <p className="font-extrabold text-[15px] truncate leading-none">
                  {user.display_url || user.username}
                </p>
                <p className="text-indigo-400 text-[11px] font-black tracking-widest uppercase mt-1">
                  @{user.username}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center mt-20">
            <div className="w-8 h-8 border-4 border-zinc-800 border-t-indigo-500 
                            rounded-full animate-spin" />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && query && results.length === 0 && (
          <div className="mt-20 text-center">
            <p className="text-zinc-600 font-bold tracking-widest uppercase text-sm">
              No Collectors Found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
