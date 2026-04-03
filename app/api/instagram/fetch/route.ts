import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "NO_USERNAME" }, { status: 400 });
    }

    // ⭐ OLD SIMPLE SCRAPER (PUBLIC INSTAGRAM)
    const url = `https://www.instagram.com/${username}/?__a=1&__d=dis`;
    const igRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!igRes.ok) {
      return NextResponse.json(
        { error: "FAILED_TO_FETCH_PROFILE" },
        { status: 500 }
      );
    }

    const json = await igRes.json();

    // ⭐ Extract posts from Instagram’s public JSON
    const edges =
      json?.graphql?.user?.edge_owner_to_timeline_media?.edges || [];

    const posts = edges.map((edge: any) => ({
      id: edge.node.id,
      imageUrl: edge.node.display_url,
      caption: edge.node.edge_media_to_caption?.edges?.[0]?.node?.text || "",
    }));

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("FETCH ERROR:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
