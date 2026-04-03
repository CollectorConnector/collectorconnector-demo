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

    const url = "https://instagram120.p.rapidapi.com/api/instagram/posts";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        "x-rapidapi-host": "instagram120.p.rapidapi.com",
      },
      body: JSON.stringify({
        username,
        maxId: "",
      }),
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!data || !data.data) {
      return NextResponse.json(
        { posts: [], error: "No posts found" },
        { status: 404 }
      );
    }

    const posts = data.data.map((item: any) => ({
      id: item.id,
      imageUrl: item.image_versions2?.candidates?.[0]?.url || item.thumbnail_url,
      caption: item.caption?.text || "",
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
