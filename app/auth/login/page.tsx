"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        // Successful login, redirect to profile
        router.push(`/profile/${data.user.id}`);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* BRANDING HEADER */}
      <header style={{ padding: '20px', borderBottom: '1px solid #18181b', width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'center' }}>
        <img src="/CC-main-logo.png" style={{ height: '50px' }} alt="CollectorConnector Logo" />
      </header>
      
      <main style={{ flex: 1, width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 20px', marginTop: '60px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', textAlign: 'center', marginBottom: '8px' }}>Welcome back</h1>
        <p style={{ color: '#a1a1aa', fontSize: '18px', textAlign: 'center', marginBottom: '48px' }}>Log in to continue your journey</p>
        
        {error && <p style={{ color: '#ef4444', textAlign: 'center', marginBottom: '20px' }}>{error}</p>}

        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', background: '#111', border: '1px solid #18181b', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '16px' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', background: '#111', border: '1px solid #18181b', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '16px' }} />
          
          <button type="submit" disabled={loading} style={{ background: '#fff', color: '#000', fontWeight: '900', padding: '16px', borderRadius: '12px', border: 'none', fontSize: '16px', cursor: 'pointer', marginTop: '20px', opacity: loading ? 0.6 : 1 }}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p style={{ marginTop: '32px', color: '#a1a1aa' }}>
          Don’t have an account? <Link href="/auth/sign-up" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 'bold' }}>Sign up</Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
