import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username } = await req.json();

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  try {
    const taskId = process.env.APIFY_INSTAGRAM_TASK_ID!;
    const token = process.env.APIFY_API_TOKEN!;

    const scraperRes = await fetch(
      `https://api.apify.com/v2/actor-tasks/${taskId}/run-sync-get-dataset-items?token=${token}`,
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
