import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username } = await req.json();

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  // Call Apify Instagram Scraper
  const scraperRes = await fetch("https://api.apify.com/v2/actor-tasks/YOUR_TASK_ID/run-sync-get-dataset-items?token=YOUR_TOKEN");

  const posts = await scraperRes.json();

  // Map to only what we need
  const formatted = posts.map((p: any) => ({
    id: p.id,
    imageUrl: p.displayUrl,
    caption: p.caption || "",
    timestamp: p.timestamp || null,
  }));

  return NextResponse.json({ posts: formatted });
}
