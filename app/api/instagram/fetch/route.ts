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

    return NextResponse.json({
      posts: [
        {
          id: "demo-1",
          imageUrl: "https://picsum.photos/300?random=1",
          caption: "Demo post 1",
        },
        {
          id: "demo-2",
          imageUrl: "https://picsum.photos/300?random=2",
          caption: "Demo post 2",
        },
        {
          id: "demo-3",
          imageUrl: "https://picsum.photos/300?random=3",
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
