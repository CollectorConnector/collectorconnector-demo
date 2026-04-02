import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: "NO_USERNAME", message: "Username is required" },
        { status: 400 }
      );
    }

    // Automatically convert username → full Instagram URL
    const profileUrl = `https://www.instagram.com/${username.replace("@", "")}/`;

    const res = await fetch("https://emjii5mdpdyh.runs.apify.net", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Actor-Token": process.env.APIFY_ACTOR_TOKEN || ""
      },
      body: JSON.stringify({
        addParentData: false,
        directUrls: [profileUrl],
        resultsLimit: 50,
        resultsType: "posts",
        searchLimit: 1,
        searchType: "hashtag"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "APIFY_REQUEST_FAILED",
          status: res.status,
          message: data?.error || "Apify request failed"
        },
        { status: 500 }
      );
    }

    const result = data?.[0];

    if (!result || !result?.posts) {
      return NextResponse.json(
        { error: "NO_POSTS_FOUND", message: "No posts returned" },
        { status: 404 }
      );
    }

    return NextResponse.json({ posts: result.posts });
  } catch (err) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: String(err) },
      { status: 500 }
    );
  }
}
