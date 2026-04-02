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

    // ⭐ TEMPORARY MOCK DATA — ALWAYS RETURNS POSTS
    // This guarantees your modal works while you build the real Instagram API later.
    return NextResponse.json({
      posts: [
        {
          id: "demo-1",
          imageUrl: "https://via.placeholder.com/300?text=Post+1",
          caption: "Demo post 1",
        },
        {
          id: "demo-2",
          imageUrl: "https://via.placeholder.com/300?text=Post+2",
          caption: "Demo post 2",
        },
        {
          id: "demo-3",
          imageUrl: "https://via.placeholder.com/300?text=Post+3",
          caption: "Demo post 3",
        },
      ],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { posts: [], error: "Server error" },
      { status: 500 }
    );
  }
}
