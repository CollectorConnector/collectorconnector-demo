import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "NO_USERNAME_PROVIDED" }, { status: 400 });
    }

    // Correct RapidAPI endpoint
    const url = `https://instagram-scraper-2022.p.rapidapi.com/ig/user_info/?user=${username}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        "x-rapidapi-host": "instagram-scraper-2022.p.rapidapi.com",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "RAPIDAPI_REQUEST_FAILED", status: res.status },
        { status: 500 }
      );
    }

    const data = await res.json();

    // Validate structure
    if (!data || !data.edge_owner_to_timeline_media) {
      return NextResponse.json({ error: "NO_POSTS_FOUND" }, { status: 404 });
    }

    const edges = data.edge_owner_to_timeline_media.edges;

    // Transform into the shape your hook expects
    const posts = edges.map((edge: any) => ({
      id: edge.node.id,
      imageUrl: edge.node.display_url,
      caption: edge.node.edge_media_to_caption.edges?.[0]?.node?.text || "",
      timestamp: edge.node.taken_at_timestamp,
    }));

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Fetch route failed:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
