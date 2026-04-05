import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { igHandle, userId } = await req.json();
    
    // Clean up handle (remove @ and spaces)
    const cleanHandle = igHandle.trim().replace('@', '');
    
    console.log(`🚀 Starting import for: ${cleanHandle} (User: ${userId})`);

    if (!process.env.APIFY_API_TOKEN) {
      console.error("❌ Missing APIFY_API_TOKEN in environment variables");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 1. Trigger the Apify Instagram Scraper
    // Using run-sync-get-dataset-items for an immediate response
    const apifyResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_API_TOKEN}`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "usernames": [cleanHandle],
          "resultsLimit": 12, // Grabbing latest 12 posts
          "shouldDownloadImages": false,
          "shouldDownloadVideos": false,
        })
      }
    );

    if (!apifyResponse.ok) {
      const errorData = await apifyResponse.text();
      console.error("❌ Apify API Error:", errorData);
      return NextResponse.json({ error: 'Instagram scraper failed to respond' }, { status: 502 });
    }

    const items = await apifyResponse.json();

    if (!items || items.length === 0) {
      console.log("⚠️ No items found for this handle.");
      return NextResponse.json({ error: 'No public posts found. Is the account private?' }, { status: 404 });
    }

    // 2. Format data for your Supabase 'items' table
    const formattedItems = items.map((post: any) => {
      // Robust Date Parsing
      // Some scrapers return unix timestamps, some ISO strings. We handle both.
      let finalDate;
      try {
        if (post.timestamp) {
          const parsedDate = new Date(post.timestamp);
          finalDate = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
        } else {
          finalDate = new Date().toISOString();
        }
      } catch (e) {
        finalDate = new Date().toISOString();
      }

      return {
        user_id: userId,
        title: post.caption ? post.caption.split('\n')[0].substring(0, 60) : 'Instagram Post',
        description: post.caption || '',
        image_url: post.displayUrl || post.url, // Fallback to url if displayUrl is missing
        created_at: finalDate,
      };
    });

    console.log(`✅ Successfully prepared ${formattedItems.length} items for Supabase.`);

    return NextResponse.json({ 
      success: true, 
      data: formattedItems 
    });

  } catch (error: any) {
    console.error('❌ Server Crash during import:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
