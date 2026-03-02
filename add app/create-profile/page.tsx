'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [tier, setTier] = useState<'gold'|'platinum'|'silver'|'bronze'|'standard'>('standard');

  function saveLocalProfile() {
    const data = { fullName, username, bio, tier, createdAt: Date.now() };
    try { localStorage.setItem('cc-profile', JSON.stringify(data)); } catch {}
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveLocalProfile();
    router.push('/'); // change to '/demo' if you want to land there
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-xl mx-auto bg-zinc-900/70 rounded-2xl border border-white/10 p-5">
        <h1 className="text-2xl font-semibold">Create your profile</h1>
        <p className="text-white/70 mt-1">This demo saves to your browser only.</p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm text-white/80">Full name</label>
            <input
              className="mt-1 w-full rounded-lg bg-black/40 border border-white/15 p-2 outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Stacy Pearce"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/80">Username</label>
            <input
              className="mt-1 w-full rounded-lg bg-black/40 border border-white/15 p-2 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="stacy"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/80">Bio</label>
            <textarea
              className="mt-1 w-full rounded-lg bg-black/40 border border-white/15 p-2 outline-none"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Collector of ..."
            />
          </div>

          <div>
            <label className="block text-sm text-white/80">Legacy tier</label>
            <select
              className="mt-1 w-full rounded-lg bg-black/40 border border-white/15 p-2 outline-none"
              value={tier}
              onChange={(e) => setTier(e.target.value as any)}
            >
              <option value="gold">Gold (Legacy #1)</option>
              <option value="platinum">Platinum (#2–10)</option>
              <option value="silver">Silver (#11–50)</option>
              <option value="bronze">Bronze (#51–100)</option>
              <option value="standard">Standard (#101+)</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="px-4 py-2 rounded-full border border-white/25 bg-zinc-900 hover:bg-zinc-800">
              Save & Continue
            </button>
            <button type="button" onClick={() => history.back()} className="px-4 py-2 rounded-full border border-white/15 bg-transparent hover:bg-white/5">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
