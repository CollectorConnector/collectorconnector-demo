
// Ensure this runs on Node (Buffer available)
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Server-side Supabase client (service role key — DO NOT expose to client)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const igToken = cookies().get('ig_access_token')?.value;
  if (!igToken) return NextResponse.json({ ok: false, error: 'NO_IG' }, { status: 401 });

  const { userId, items } = await req.json() as {
    userId: string;
    items: { id: string; media_url: string; caption?: string }[];
  };

  if (!userId || !items?.length) {
    return NextResponse.json({ ok: false, error: 'BAD_REQ' }, { status: 400 });
  }

  const results: string[] = [];

  for (const it of items) {
    // Download image bytes from Instagram
    const fileRes = await fetch(it.media_url);
    if (!fileRes.ok) continue;
    const arrayBuf = await fileRes.arrayBuffer();
    const bytes = Buffer.from(arrayBuf);

    // Simplify to jpg; Instagram serves jpeg for images
    const filename = `${userId}/ig-${it.id}-${Date.now()}.jpg`;

    const { error } = await supabaseAdmin
      .storage
      .from('item-photos')                 // using your public bucket
      .upload(filename, bytes, { contentType: 'image/jpeg', upsert: true });

    if (!error) {
      const { data } = supabaseAdmin.storage.from('item-photos').getPublicUrl(filename);
      const publicUrl = data.publicUrl;
      results.push(publicUrl);

      await supabaseAdmin.from('user_media').insert({
        user_id: userId,
        source: 'instagram',
        url: publicUrl,
        caption: it.caption ?? null,
      });
    }
  }

  return NextResponse.json({ ok: true, imported: results.length, urls: results });
}
