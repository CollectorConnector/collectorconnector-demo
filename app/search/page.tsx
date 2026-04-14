"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowRight, Search, Loader2 } from "lucide-react";

type Profile = {
  id: string;
  display_url: string | null;
  username: string | null;
  avatar_url: string | null;
  tier: string | null;
};

// --- SLEEK COLLECTOR CARD COMPONENT ---
const CollectorCard = ({ user }: { user: Profile }) => (
  <Link
    href={`/profile/${user.id}`}
    className="group relative flex flex-col overflow-hidden bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 transition-all duration-300 hover:border-neutral-500 hover:bg-neutral-900/70 hover:-translate-y-1 active:scale-[0.98]"
  >
    {/* Standardized Avatar - ENFORCES SQUARE ASPECT */}
    <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700 mb-4 flex-shrink-0">
      <img
        src={user.avatar_url || "/default-avatar.png"} // Update with your actual placeholder
        alt={user.display_url || user.username || "Collector"}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    </div>

    {/* User Metadata */}
    <div className="flex-1 min-w-0 mb-3">
      <div className="flex items-center gap-2 mb-1">
        <p className="font-extrabold text-[15px] truncate tracking-tight text-white leading-tight">
          {user.display_url || user.username || "Collector"}
        </p>
        {user.tier === "founder" && (
          <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
            FOUNDER
          </span>
        )}
      </div>
      <p className="text-neutral-500 text-xs font-bold">@{user.username || "collector"}</p>
    </div>

    {/* Subtle Action Icon */}
    <div className="absolute top-4 right-4 bg-black/60 p-2 rounded-full border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <ArrowRight className="w-4 h-4 text-neutral-400" strokeWidth={3} />
    </div>
  </Link>
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
      .limit(16); // Increased limit for grid display

    if (!error) setResults(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => searchUsers(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        
        {/* TOP SECTION */}
        <div className="text-center mb-16">
          <h1 className="text-xs font-black tracking-[0.3em] text-neutral-600 uppercase mb-3">
            DIRECTORY
          </h1>
          <h2 className="text-4xl font-extrabold tracking-tighter text-white">Find Collectors</h2>
        </div>

        {/* MODERN SEARCH BAR */}
        <div className="relative mb-16 max-w-xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Username or display name..."
            className="w-full bg-neutral-900 border border-neutral-800 pl-14 p-5 rounded-2xl text-lg focus:outline-none focus:border-indigo-500/70 transition-all placeholder:text-neutral-700"
          />
          {loading && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>
          )}
        </div>

        {/* MODERN GRID LAYOUT */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((user) => (
            <CollectorCard key={user.id} user={user} />
          ))}
        </div>

        {/* CLEAN EMPTY STATE */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-24 bg-neutral-900/20 rounded-3xl border-2 border-dashed border-neutral-800">
            <Search className="w-12 h-12 text-neutral-700 mx-auto mb-6" strokeWidth={1}/>
            <p className="text-sm tracking-widest uppercase text-neutral-600 font-bold">No Results Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
