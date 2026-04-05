import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { posts, userId } = await req.json();

    if (!posts || !userId) {
      return NextResponse.json({ error: 'Missing posts or userId' }, { status: 400 });
    }

    const results = [];

    for (const post of posts) {
      try {
        // 1. Download the image from the temporary Instagram URL
        const imageRes = await fetch(post.display_url);
        if (!imageRes.ok) continue;
        
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Create unique filename in your 'item-images' bucket
        const fileName = `${userId}/ig-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

        // 3. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) continue;

        // 4. Get the permanent Public URL from YOUR bucket
        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);

        // 5. Save to the 'items' table
        const { error: insertError } = await supabase.from('items').insert({
          user_id: userId,
          image_url: publicUrl,
          title: post.caption?.split('\n')[0] || 'Instagram Import',
          status: 'imported',
          created_at: new Date().toISOString()
        });

        if (!insertError) results.push(publicUrl);

      } catch (err) {
        console.error('Error processing post:', err);
      }
    }

    return NextResponse.json({ success: true, count: results.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
