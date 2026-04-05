import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 1. Define what an Instagram post looks like for TypeScript
interface InstagramPost {
  display_url: string;
  caption?: string;
}

export async function POST(req: Request) {
  try {
    const { igHandle, userId } = await req.json();

    if (!igHandle || !userId) {
      return NextResponse.json({ error: 'Missing handle or userId' }, { status: 400 });
    }

    // 2. Tell TypeScript 'posts' is an array of InstagramPost
    const posts: InstagramPost[] = await scrapeInstagram(igHandle); 

    for (const post of posts) {
      // TypeScript now knows 'display_url' exists!
      const imageUrl = post.display_url;

      try {
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) continue;
        
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) continue;

        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);

        await supabase.from('items').insert({
          user_id: userId,
          image_url: publicUrl,
          title: post.caption?.split('\n')[0] || 'Instagram Import',
          status: 'imported'
        });

      } catch (err) {
        console.error('Error processing post:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. Update the placeholder to return the correct type
async function scrapeInstagram(handle: string): Promise<InstagramPost[]> {
    // This needs to return your actual scraped data
    // For now, it returns an empty array that matches the type
    return []; 
}
