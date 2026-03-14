'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AvatarUploadProps {
  userId: string;
  currentUrl?: string | null;
  editable?: boolean;
  onSaved?: (url: string) => void;
}

export default function AvatarUpload({
  userId,
  currentUrl,
  editable = false,
  onSaved,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentUrl ?? undefined);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editable) return;

    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('item-photos') // ← change to 'avatars' if you create a dedicated bucket
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('item-photos')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      if (!publicUrl) throw new Error('No public URL returned');

      // Update local preview
      setPreview(publicUrl);

      // Optional: notify parent (if you want to do something extra)
      onSaved?.(publicUrl);

      // IMPORTANT: Save URL to profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update profile avatar_url:', updateError);
        // You might want to show a toast/notification here in production
      }
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      alert(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  }

  const defaultAvatar = (
    <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-500 text-xl">
      No photo
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview / Placeholder */}
      {preview ? (
        <img
          src={preview}
          alt="Profile avatar"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-600 shadow-md"
          onError={(e) => {
            e.currentTarget.src = '/default-avatar.png'; // fallback if image fails
            e.currentTarget.onerror = null;
          }}
        />
      ) : (
        defaultAvatar
      )}

      {/* Upload controls – only shown when editable */}
      {editable && (
        <div className="flex flex-col items-center gap-2">
          <label
            htmlFor="avatar-upload"
            className={`
              px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition
              ${
                uploading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 border border-blue-500/30'
              }
            `}
          >
            {uploading ? 'Uploading...' : 'Change avatar'}
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <p className="text-xs text-gray-500">
            JPG, PNG or GIF • Max 5MB
          </p>
        </div>
      )}
    </div>
  );
}
