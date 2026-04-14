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
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '120px 24px 80px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase', fontStyle: 'italic', margin: 0 }}>
            SEARCH VAULT
          </h1>
          <div style={{ height: '3px', width: '40px', backgroundColor: '#6366f1', margin: '12px auto', borderRadius: '10px' }} />
        </div>

        {/* SEARCH INPUT */}
        <div style={{ maxWidth: '400px', margin: '0 auto 80px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search collectors..."
            style={{
              width: '100%',
              backgroundColor: '#0a0a0a',
              border: '1px solid #27272a',
              padding: '16px',
              borderRadius: '16px',
              textAlign: 'center',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              outline: 'none'
            }}
          />
        </div>

        {/* THE GRID - Forced Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
          gap: '32px' 
        }}>
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block', textAlign: 'center' }}
            >
              {/* THE SQUIRCLE IMAGE */}
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                aspectRatio: '1/1', 
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                overflow: 'hidden',
                /* THE SQUIRCLE GEOMETRY */
                borderRadius: '38%', 
                transition: 'all 0.3s ease'
              }}>
                <img
                  src={user.avatar_url || "/icons/tiers/collector.svg"}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {user.tier === "founder" && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '8px', 
                    right: '8px', 
                    backgroundColor: '#fff', 
                    color: '#000', 
                    fontSize: '9px', 
                    fontWeight: '900', 
                    padding: '3px 8px', 
                    borderRadius: '6px',
                    textTransform: 'uppercase'
                  }}>
                    Founder
                  </div>
                )}
              </div>

              {/* INFO */}
              <div style={{ marginTop: '16px' }}>
                <p style={{ margin: 0, fontWeight: '800', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.display_url || user.username}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  @{user.username}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', marginTop: '40px', color: '#52525b' }}>Searching...</div>
        )}

        {!loading && query && results.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '80px', color: '#52525b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>
            No Results
          </div>
        )}
      </div>
    </div>
  );
}
