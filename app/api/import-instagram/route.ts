import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Using your existing working client

export async function POST(req: Request) {
  try {
    const { igHandle, userId } = await req.json();

    if (!igHandle || !userId) {
      return NextResponse.json({ error: 'Missing handle or userId' }, { status: 400 });
    }

    // --- 1. YOUR SCRAPER LOGIC GOES HERE ---
    // Assuming you have a function or logic that gets the Instagram posts
    // For now, I'll use a placeholder 'posts' array based on your database screenshots
    const posts = await scrapeInstagram(igHandle); 

    for (const post of posts) {
      const imageUrl = post.display_url;

      try {
        // --- 2. DOWNLOAD THE IMAGE ---
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) continue;
        
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // --- 3. CREATE UNIQUE FILENAME ---
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

        // --- 4. UPLOAD TO 'item-images' BUCKET ---
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        // --- 5. GET THE PERMANENT PUBLIC URL ---
        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);

        // --- 6. SAVE TO 'items' TABLE ---
        const { error: insertError } = await supabase.from('items').insert({
          user_id: userId,
          image_url: publicUrl,
          title: post.caption?.split('\n')[0] || 'Instagram Import',
          status: 'imported'
        });

        if (insertError) console.error('Insert error:', insertError);

      } catch (err) {
        console.error('Error processing post:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Main route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Placeholder for your actual scraping function
async function scrapeInstagram(handle: string) {
    // This is where your actual scraping logic lives
    // Ensure it returns an array of objects with { display_url, caption }
    return []; 
}
