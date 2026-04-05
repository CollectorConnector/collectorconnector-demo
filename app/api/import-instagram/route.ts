import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { igHandle, userId } = await req.json();

    if (!igHandle) {
      return NextResponse.json({ error: 'Instagram handle is required' }, { status: 400 });
    }

    // 1. Trigger the Apify Instagram Scraper
    // We use the 'instagram-scrapers/instagram-profile-scrapper' actor
    const apifyResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_API_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "usernames": [igHandle],
        "resultsLimit": 12, // Limit to recent 12 posts to save credits
        "shouldDownloadImages": false,
        "shouldDownloadVideos": false,
      })
    });

    const items = await apifyResponse.json();

    // 2. Format the data for your 'items' table
    // We map Apify's data to your database columns: title, image_url, user_id
    const formattedItems = items.map((post: any) => ({
      user_id: userId,
      title: post.caption?.split('\n')[0].substring(0, 50) || 'Instagram Import',
      description: post.caption || '',
      image_url: post.displayUrl,
      created_at: post.timestamp,
    }));

    return NextResponse.json({ success: true, data: formattedItems });
  } catch (error) {
    console.error('Import Error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Instagram' }, { status: 500 });
  }
}
