'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// ← Add / change to this (explicit interface is clearer)
interface AvatarUploadProps {
  userId: string;
  currentUrl?: string | null;       // match your usage (avatar_url can be null)
  onSaved?: (url: string) => void;
  editable?: boolean;               // ← added
}

export default function AvatarUpload({
  userId,
  currentUrl,
  onSaved,
  editable = false,                   // ← safe default
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentUrl);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editable) return;            // ← important: block upload when not allowed

    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('item-photos')
        .getPublicUrl(path);

      const publicUrl = data.publicUrl;

      setPreview(publicUrl);
      onSaved?.(publicUrl);

      // Bonus: persist to profile (strongly recommended)
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {preview ? (
        <img
          src={preview}
          alt="Avatar"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-700 shadow-md"
        />
      ) : (
        <div className="w-32 h-32 rounded-full bg-gray-800 border-2 border-gray-700" />
      )}

      {editable && (
        <label className={`
          mt-2 px-4 py-2 text-sm font-medium rounded-md
          ${uploading 
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 cursor-pointer transition'}
        `}>
          {uploading ? 'Uploading...' : 'Change avatar'}
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
