// app/api/import-instagram/fetch/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== "string" || username.trim() === "") {
      return NextResponse.json({ error: "Valid Instagram username is required" }, { status: 400 });
    }

    const APIFY_TOKEN = process.env.APIFY_TOKEN;
    if (!APIFY_TOKEN) {
      return NextResponse.json({ error: "Apify token not configured in .env.local" }, { status: 500 });
    }

    const cleanUsername = username.trim().replace("@", "");

    const response = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directUrls: [`https://www.instagram.com/${cleanUsername}/`],
          resultsLimit: 24,           // Start with 24 for speed
          resultsType: "posts",
          onlyPosts: true,
          scrapeComments: false,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Apify error:", errorText);
      return NextResponse.json({ 
        error: "Failed to fetch Instagram data. Profile may be private or temporarily unavailable." 
      }, { status: 500 });
    }

    const rawPosts = await response.json();

    const formattedPosts = rawPosts
      .filter((p: any) => p.displayUrl || p.imageUrl)
      .map((p: any) => ({
        id: p.id || `post-${Date.now()}`,
        imageUrl: p.displayUrl || p.imageUrl || p.thumbnailUrl,
        caption: p.caption || p.text || "",
        timestamp: p.timestamp || null,
        likes: p.likesCount || 0,
      }));

    return NextResponse.json({ 
      success: true, 
      posts: formattedPosts,
      count: formattedPosts.length 
    });

  } catch (error: any) {
    console.error("Instagram fetch error:", error);
    return NextResponse.json({ 
      error: error.message || "Something went wrong while fetching posts" 
    }, { status: 500 });
  }
}
