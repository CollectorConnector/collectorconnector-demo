import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { igHandle, userId } = await req.json();
    
    // Clean up handle
    const cleanHandle = igHandle.trim().replace('@', '');
    
    console.log(`🚀 Starting import for: ${cleanHandle} (User: ${userId})`);

    if (!process.env.APIFY_API_TOKEN) {
      console.error("❌ Missing APIFY_API_TOKEN");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 1. Trigger the Apify Instagram Scraper
    const apifyResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_API_TOKEN}`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "usernames": [cleanHandle],
          "resultsLimit": 20, // Increased to 20 so you have more to sort!
          "shouldDownloadImages": false,
          "shouldDownloadVideos": false,
        })
      }
    );

    if (!apifyResponse.ok) {
      const errorData = await apifyResponse.text();
      console.error("❌ Apify API Error:", errorData);
      return NextResponse.json({ error: 'Instagram scraper failed' }, { status: 502 });
    }

    const items = await apifyResponse.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No public posts found.' }, { status: 404 });
    }

    // 2. Format data for your Supabase 'items' table
    const formattedItems = items.map((post: any) => {
      // Robust Date Handling
      let finalDate = new Date().toISOString();
      try {
        if (post.timestamp) {
          const parsedDate = new Date(post.timestamp);
          if (!isNaN(parsedDate.getTime())) finalDate = parsedDate.toISOString();
        }
      } catch (e) {}

      return {
        user_id: userId,
        title: post.caption ? post.caption.split('\n')[0].substring(0, 60) : 'Instagram Post',
        description: post.caption || '',
        image_url: post.displayUrl || post.url,
        created_at: finalDate,
        // --- NEW SORTING LOGIC ---
        status: 'imported',     // This keeps them in the "Inbox"
        collection_id: null     // They start with no collection assigned
      };
    });

    console.log(`✅ Prepared ${formattedItems.length} items for the Curator Inbox.`);

    return NextResponse.json({ 
      success: true, 
      data: formattedItems 
    });

  } catch (error: any) {
    console.error('❌ Server Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
