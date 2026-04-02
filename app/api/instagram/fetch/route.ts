import { NextRequest, NextResponse } from "next/server";
console.log("RapidAPI key loaded:", !!process.env.RAPIDAPI_KEY);

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: "NO_USERNAME_PROVIDED" },
        { status: 400 }
      );
    }

    // WORKING RapidAPI endpoint
    const url = `https://instagram-scraper-api2.p.rapidapi.com/v1.2/posts?username_or_id_or_url=${username}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        "x-rapidapi-host": "instagram-scraper-api2.p.rapidapi.com",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
  { error: "RAPIDAPI_REQUEST_FAILED", status: res.status, message: "RapidAPI request failed" },
  { status: 500 }
);

    }

    const data = await res.json();

    // Validate structure
    if (!data || !data.data || !Array.isArray(data.data.items)) {
      return NextResponse.json(
        { error: "NO_POSTS_FOUND" },
        { status: 404 }
      );
    }

    const posts = data.data.items.map((item: any) => ({
      id: item.id,
      imageUrl: item.image_versions2?.candidates?.[0]?.url || "",
      caption: item.caption?.text || "",
      timestamp: item.taken_at || null,
    }));

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Fetch route failed:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
