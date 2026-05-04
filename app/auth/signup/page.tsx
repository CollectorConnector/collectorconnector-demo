"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          // Redirect them to the profile creation page after they verify
          emailRedirectTo: `${window.location.origin}/create-profile`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        alert("Verification email sent! Check your inbox.");
        router.push("/auth/login");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <header style={{ padding: '30px 20px', width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'center' }}>
        <img src="/CC-main-logo.png" style={{ height: '60px' }} alt="CollectorConnector Logo" />
      </header>
      
      <main style={{ flex: 1, width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', textAlign: 'center', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '-1px' }}>Create your account</h1>
        <p style={{ color: '#a1a1aa', fontSize: '16px', textAlign: 'center', marginBottom: '40px', fontWeight: 'bold' }}>Start your CollectorConnector journey</p>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', width: '100%', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '11px', fontWeight: '900', color: '#71717a', marginLeft: '4px' }}>USERNAME</label>
          <input type="text" placeholder="stacypearce123" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', background: '#111', border: '1px solid #27272a', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }} />
          
          <label style={{ fontSize: '11px', fontWeight: '900', color: '#71717a', marginLeft: '4px', marginTop: '8px' }}>EMAIL ADDRESS</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', background: '#111', border: '1px solid #27272a', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }} />
          
          <label style={{ fontSize: '11px', fontWeight: '900', color: '#71717a', marginLeft: '4px', marginTop: '8px' }}>PASSWORD</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', background: '#111', border: '1px solid #27272a', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }} />
          
          <button type="submit" disabled={loading} style={{ background: '#fff', color: '#000', fontWeight: '900', padding: '18px', borderRadius: '12px', border: 'none', fontSize: '16px', cursor: 'pointer', marginTop: '24px', textTransform: 'uppercase', letterSpacing: '1px', opacity: loading ? 0.6 : 1 }}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p style={{ marginTop: '32px', color: '#a1a1aa', fontSize: '14px' }}>
          Already have an account? <Link href="/auth/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 'bold' }}>Log in</Link>
        </p>
      </main>

      <div style={{ width: '100%', marginTop: '60px' }}>
        <Footer />
      </div>
    </div>
  );
}
