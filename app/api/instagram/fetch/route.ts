import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { posts: [], error: "Missing username" },
        { status: 400 }
      );
    }

    // Build the Apify URL using your token stored in Vercel
    const url = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync?token=${process.env.APIFY_TOKEN}`;

    // Apify expects a POST body with directUrls
    const body = {
      directUrls: [`https://www.instagram.com/${username}/`],
      resultsType: "posts",
      resultsLimit: 50,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Apify returns results inside data.items or data.data
    const items = data?.data?.items || data?.items || [];

    const posts = items.map((item: any) => ({
      id: item.id,
      imageUrl:
        item.displayUrl ||
        item.display_url ||
        item.thumbnail_url ||
        item.thumbnailUrl,
      caption: item.caption || "",
    }));

    return NextResponse.json({ posts });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { posts: [], error: "Server error" },
      { status: 500 }
    );
  }
}
