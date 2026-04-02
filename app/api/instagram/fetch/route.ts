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

    const res = await fetch("https://emjii5mdpdyh.runs.apify.net", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Actor-Token": "VJCIl3lGPLZoRGxML"
      },
      body: JSON.stringify({
        usernames: [username],
        resultsLimit: 50
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

    // The actor returns an array of profiles
    const profile = data?.[0];

    if (!profile || !profile.posts) {
      return NextResponse.json(
        { error: "NO_POSTS_FOUND", message: "No posts returned" },
        { status: 404 }
      );
    }

    return NextResponse.json({ posts: profile.posts });
  } catch (err) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: String(err) },
      { status: 500 }
    );
  }
}
