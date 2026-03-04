
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AvatarUpload({
  userId,
  currentUrl,
  onSaved,
}: {
  userId: string;
  currentUrl?: string;
  onSaved?: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentUrl);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from('item-photos')
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from('item-photos')
        .getPublicUrl(path);

      setPreview(data.publicUrl);
      onSaved?.(data.publicUrl);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Avatar"
          style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: '#222',
            border: '1px solid #1F2937',
          }}
        />
      )}

      <br />

      <label style={{ cursor: 'pointer', fontWeight: 600 }}>
        {uploading ? 'Uploading…' : 'Upload Photo'}
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}
