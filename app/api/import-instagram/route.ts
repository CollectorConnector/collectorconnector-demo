import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { igHandle, userId } = await req.json();
    console.log(`Starting import for: ${igHandle} for user: ${userId}`);

    if (!process.env.APIFY_API_TOKEN) {
      console.error("Missing APIFY_API_TOKEN");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 1. Run Apify Scraper
    const apifyResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "usernames": [igHandle.replace('@', '')], // Remove @ if user included it
        "resultsLimit": 10,
      })
    });

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error("Apify API Error:", errorText);
      return NextResponse.json({ error: 'Failed to scrape Instagram' }, { status: 502 });
    }

    const items = await apifyResponse.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No public posts found for this handle' }, { status: 404 });
    }

    // 2. Format specifically for YOUR Supabase 'items' table columns
    const formattedItems = items.map((post: any) => ({
      user_id: userId,
      title: post.caption ? post.caption.split('\n')[0].substring(0, 60) : 'Instagram Post',
      description: post.caption || '',
      image_url: post.displayUrl,
      created_at: new Date(post.timestamp).toISOString(),
    }));

    return NextResponse.json({ success: true, data: formattedItems });
  } catch (error: any) {
    console.error('Full Import Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
