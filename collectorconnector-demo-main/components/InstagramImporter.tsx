
'use client';

import { useEffect, useState } from 'react';

type IG = {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  permalink?: string;
};

export default function InstagramImporter({ userId }: { userId: string }) {
  const [media, setMedia] = useState<IG[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  // Try to fetch media on mount to detect if token exists
  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetch('/api/instagram/media');
      if (r.status === 401) {
        setConnected(false);
        setLoading(false);
        return;
      }
      const j = await r.json();
      setMedia(j.media ?? []);
      setConnected(true);
      setLoading(false);
    })();
  }, []);

  async function loadMedia() {
    setLoading(true);
    const r = await fetch('/api/instagram/media');
    const j = await r.json();
    setMedia(j.media ?? []);
    setLoading(false);
  }

  async function importSelected() {
    const items = media
      .filter((m) => selected[m.id])
      .map((m) => ({ id: m.id, media_url: m.media_url, caption: m.caption }));

    if (!items.length) {
      alert('Please select at least one photo to import.');
      return;
    }

    const r = await fetch('/api/instagram/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, items }),
    });

    const j = await r.json();
    if (j.ok) {
      alert(`Imported ${j.imported} photos ✔`);
    } else {
      alert('Import failed');
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      {/* Connect / Status */}
      {connected === false && (
        <a
          href="/api/instagram/login"
          style={{
            display: 'inline-block',
            padding: '10px 14px',
            border: '1px solid #1F2937',
            borderRadius: 8,
            color: '#fff',
            textDecoration: 'none',
            marginRight: 12,
          }}
        >
          Connect Instagram
        </a>
      )}

      <button
        onClick={loadMedia}
        style={{
          padding: '10px 14px',
          border: '1px solid #1F2937',
          borderRadius: 8,
          background: 'transparent',
          color: '#fff',
          fontWeight: 600,
        }}
      >
        {loading ? 'Loading…' : 'Load My IG Photos'}
      </button>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 140px)',
          gap: 12,
          marginTop: 16,
        }}
      >
        {media.map((m) => {
          const url = m.media_type === 'VIDEO' ? m.thumbnail_url || m.media_url : m.media_url;
          const isOn = !!selected[m.id];
          return (
            <div
              key={m.id}
              onClick={() => setSelected((s) => ({ ...s, [m.id]: !isOn }))}
              style={{
                border: isOn ? '2px solid #4ADE80' : '1px solid #1F2937',
                cursor: 'pointer',
                padding: 2,
              }}
              title={m.caption || ''}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
              />
            </div>
          );
        })}
      </div>

      {/* Import button */}
      {media.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={importSelected}
            style={{
              padding: '10px 14px',
              border: '1px solid #1F2937',
              borderRadius: 8,
              background: 'transparent',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            Import Selected Photos
          </button>
        </div>
      )}
    </div>
  );
}

