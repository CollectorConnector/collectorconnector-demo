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
  const [rememberMe, setRememberMe] = useState(true); // Default to checked
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
        // If they want to be remembered, we let Supabase handle the persistence
        // (Supabase does this via cookies/localStorage by default)
        router.push(`/profile/${data.user.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* LOGO AREA */}
      <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '20px' }}>
        <Link href="/">
          <img 
            src="/CC-main-logo.png" 
            alt="CollectorConnector Logo" 
            style={{ height: '60px', cursor: 'pointer' }} 
          />
        </Link>
      </div>

      <main style={{ flex: 1, width: '100%', maxWidth: '380px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', textAlign: 'center', marginBottom: '8px' }}>Welcome back</h1>
        <p style={{ color: '#a1a1aa', fontSize: '16px', textAlign: 'center', marginBottom: '40px' }}>Log in to access your vault</p>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', background: '#111', border: '1px solid #27272a', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '16px', boxSizing: 'border-box' }} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', background: '#111', border: '1px solid #27272a', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '16px', boxSizing: 'border-box' }} 
          />

          {/* REMEMBER ME CHECKBOX */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => setRememberMe(!rememberMe)}>
            <div style={{ 
                width: '18px', 
                height: '18px', 
                border: '1px solid #27272a', 
                borderRadius: '4px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: rememberMe ? '#fff' : 'transparent' 
            }}>
                {rememberMe && <span style={{ color: '#000', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
            </div>
            <span style={{ fontSize: '14px', color: '#a1a1aa' }}>Remember me</span>
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{ background: '#fff', color: '#000', fontWeight: '900', padding: '16px', borderRadius: '12px', border: 'none', fontSize: '16px', cursor: 'pointer', marginTop: '4px', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "LOGGING IN..." : "LOG IN"}
          </button>
        </form>

        <p style={{ marginTop: '32px', color: '#a1a1aa', textAlign: 'center', fontSize: '14px' }}>
          Don’t have an account? <Link href="/auth/sign-up" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 'bold' }}>Sign up</Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
