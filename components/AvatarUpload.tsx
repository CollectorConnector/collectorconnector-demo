'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AvatarUploadProps {
  userId: string;
  currentUrl?: string;
  onSaved?: (url: string) => void;
  editable?: boolean;          // ← add this
}

export default function AvatarUpload({
  userId,
  currentUrl,
  onSaved,
  editable = false,            // default = false → safe when prop is missing
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentUrl);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editable) return;     // ← prevent upload if not editable

    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from('item-photos')
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage.from('item-photos').getPublicUrl(path);
      const publicUrl = data.publicUrl;

      setPreview(publicUrl);
      onSaved?.(publicUrl);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Avatar"
          className="w-[120px] h-[120px] rounded-full object-cover border border-gray-700"
        />
      ) : (
        <div
          className="w-[120px] h-[120px] rounded-full bg-gray-900 border border-gray-700"
        />
      )}

      {editable && (
        <label
          className={`cursor-pointer text-sm font-semibold ${
            uploading ? 'text-gray-500' : 'text-blue-400 hover:text-blue-300'
          }`}
        >
          {uploading ? 'Uploading…' : 'Change avatar'}
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      )}
    </div>
  );
}
