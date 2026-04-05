import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { posts, userId } = await req.json(); // We now receive 'posts' directly

    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: 'No posts received' }, { status: 400 });
    }

    for (const post of posts) {
      try {
        const imageRes = await fetch(post.display_url);
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${userId}/ig-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

        // Upload to Supabase
        await supabase.storage.from('item-images').upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

        const { data: { publicUrl } } = supabase.storage.from('item-images').getPublicUrl(fileName);

        // Save to Database
        await supabase.from('items').insert({
          user_id: userId,
          image_url: publicUrl,
          title: post.caption?.split('\n')[0] || 'Instagram Post',
          status: 'imported'
        });
      } catch (e) {
        console.error("Failed to process one post", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
