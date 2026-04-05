import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 1. Define the structure for TypeScript
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

    // 2. Fetch the posts from Instagram
    const posts: InstagramPost[] = await scrapeInstagram(igHandle); 

    if (posts.length === 0) {
      return NextResponse.json({ success: false, message: 'No posts found or access denied by Instagram' });
    }

    const results = [];

    for (const post of posts) {
      try {
        // --- STEP 3: DOWNLOAD THE IMAGE ---
        const imageRes = await fetch(post.display_url);
        if (!imageRes.ok) continue;
        
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // --- STEP 4: CREATE UNIQUE FILENAME ---
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileName = `${userId}/ig-${timestamp}-${randomString}.jpg`;

        // --- STEP 5: UPLOAD TO SUPABASE BUCKET ---
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          console.error('Storage Upload Error:', uploadError);
          continue;
        }

        // --- STEP 6: GET PERMANENT PUBLIC URL ---
        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);

        // --- STEP 7: INSERT INTO ITEMS TABLE ---
        const { error: insertError } = await supabase.from('items').insert({
          user_id: userId,
          image_url: publicUrl,
          title: post.caption?.split('\n')[0] || 'Instagram Import',
          status: 'imported',
          created_at: new Date().toISOString()
        });

        if (!insertError) {
          results.push(publicUrl);
        }

      } catch (err) {
        console.error('Error processing individual post:', err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: results.length,
      message: `Successfully imported ${results.length} items.` 
    });

  } catch (error: any) {
    console.error('Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 8. THE SCRAPER ENGINE
async function scrapeInstagram(handle: string): Promise<InstagramPost[]> {
  try {
    // Attempting to use the public JSON endpoint
    const url = `https://www.instagram.com/${handle}/?__a=1&__d=dis`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      next: { revalidate: 0 } // Don't cache the result
    });

    if (!response.ok) {
      console.log(`Instagram responded with status: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const media = data.graphql?.user?.edge_owner_to_timeline_media?.edges || [];

    return media.map((item: any) => ({
      display_url: item.node.display_url,
      caption: item.node.edge_media_to_caption?.edges[0]?.node?.text || 'Instagram Post'
    }));

  } catch (error) {
    console.error("Scraping Logic Error:", error);
    return [];
  }
}
