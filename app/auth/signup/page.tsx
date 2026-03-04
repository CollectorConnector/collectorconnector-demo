
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase'; // <-- relative import (no alias)

export default function SignUpPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'ok', text: 'Check your email to confirm your account.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/account');
      }
    } catch (err: any) {
      setMessage({ type: 'err', text: err.message || 'Auth failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 420,
        margin: '80px auto',
        padding: 24,
        background: '#111',
        border: '1px solid #1F2937',
        borderRadius: 12,
        color: '#fff',
      }}
    >
      <h1 style={{ margin: 0, marginBottom: 12, fontSize: 22 }}>
        {mode === 'signup' ? 'Create your account' : 'Sign in'}
      </h1>

      {message && (
        <div
          style={{
            background: message.type === 'ok' ? 'rgba(74,222,128,0.15)' : 'rgba(255,0,0,0.2)',
            padding: 10,
            borderRadius: 8,
            marginBottom: 15,
            color: message.type === 'ok' ? '#86efac' : '#ff6b6b',
            border:
              message.type === 'ok'
                ? '1px solid rgba(74,222,128,0.35)'
                : '1px solid rgba(255,0,0,0.35)',
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <label htmlFor="email" style={{ color: '#D1D5DB' }}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ padding: 10, borderRadius: 8, border: '1px solid #1F2937', outline: 'none' }}
            required
          />
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <label htmlFor="password" style={{ color: '#D1D5DB' }}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ padding: 10, borderRadius: 8, border: '1px solid #1F2937', outline: 'none' }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 16px',
            background: '#4ADE80',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
            marginTop: 4,
          }}
        >
          {loading ? 'Please wait…' : (mode === 'signup' ? 'Create account' : 'Sign in')}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
          style={{
            padding: '10px 14px',
            background: 'transparent',
            color: '#4ADE80',
            border: '1px solid #1F2937',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 4,
          }}
        >
          {mode === 'signup' ? 'Have an account? Sign in' : 'New here? Create account'}
        </button>
      </form>
    </div>
  );
}
