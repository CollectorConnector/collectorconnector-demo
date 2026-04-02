import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username } = await req.json();

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  try {
    const url = `https://instagram-scraper-2022.p.rapidapi.com/ig/user_info?user=${username}`;

    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        "x-rapidapi-host": "instagram-scraper-2022.p.rapidapi.com",
      },
    });

    if (!res.ok) throw new Error("Scraper request failed");

    const json = await res.json();

    // Extract posts (limit to 12 for your UI)
    const posts = (json?.data?.user?.edge_owner_to_timeline_media?.edges || [])
      .slice(0, 12)
      .map((edge: any) => {
        const node = edge.node;
        return {
          id: node.id,
          imageUrl: node.display_url,
          caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || "",
          timestamp: node.taken_at_timestamp || null,
        };
      });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Instagram fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram posts" },
      { status: 500 }
    );
  }
}
