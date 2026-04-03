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

    const url = `https://instagram-scraper.p.rapidapi.com/user/${username}/posts`;

    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!, // safer
        "x-rapidapi-host": "instagram-scraper.p.rapidapi.com",
      },
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!data || !data.items) {
      return NextResponse.json(
        { posts: [], error: "No posts found" },
        { status: 404 }
      );
    }

    const posts = data.items.map((item: any) => ({
      id: item.id,
      imageUrl: item.media_url || item.display_url || item.thumbnail_src,
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
