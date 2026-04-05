import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { igHandle, userId } = await req.json();

  try {
    // 1. Fetch from Instagram (using your existing scraper logic)
    // For this example, I'm assuming 'posts' is your array of IG data
    const posts = await scrapeInstagram(igHandle); 

    for (const post of posts) {
      const imageUrl = post.display_url;

      // 2. Download the image from Instagram
      const imageRes = await fetch(imageUrl);
      const arrayBuffer = await imageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 3. Create a unique filename
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      // 4. Upload to your 'item-images' bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) continue;

      // 5. Get the permanent Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(fileName);

      // 6. Save to your 'items' table with the NEW URL
      await supabase.from('items').insert({
        user_id: userId,
        image_url: publicUrl,
        title: post.caption?.split('\n')[0] || 'Instagram Import',
        status: 'imported'
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
