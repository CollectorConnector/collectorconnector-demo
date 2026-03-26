import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username } = await req.json();

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  try {
    // TODO: Replace with your real Apify task ID and API token
    const scraperRes = await fetch(
      `https://api.apify.com/v2/actor-tasks/YOUR_TASK_ID/run-sync-get-dataset-items?token=YOUR_TOKEN`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directUrls: [`https://www.instagram.com/${username}/`],
          resultsLimit: 12,
        }),
      }
    );

    if (!scraperRes.ok) throw new Error("Apify request failed");

    const posts = await scraperRes.json();

    const formatted = posts.map((p: any) => ({
      id: p.id || Date.now().toString(),
      imageUrl: p.displayUrl || p.imageUrl,
      caption: p.caption || p.text || "",
    }));

    return NextResponse.json({ posts: formatted });
  } catch (error: any) {
    console.error("Instagram fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch from Instagram" }, { status: 500 });
  }
}
