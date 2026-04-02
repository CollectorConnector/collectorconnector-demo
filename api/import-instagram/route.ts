import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username } = await req.json();

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  try {
    // Replace with your chosen scraper endpoint
    const SCRAPER_URL = `https://instagram-scraper-api-url.com/user/${username}`;

    const res = await fetch(SCRAPER_URL);
    if (!res.ok) throw new Error("Scraper request failed");

    const json = await res.json();

    // Normalise into the shape your hook expects
    const posts = json.items.slice(0, 12).map((p: any) => ({
      id: p.id,
      imageUrl: p.imageUrl || p.displayUrl || p.thumbnail,
      caption: p.caption || "",
      timestamp: p.timestamp || null,
    }));

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Instagram fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram posts" },
      { status: 500 }
    );
  }
}
