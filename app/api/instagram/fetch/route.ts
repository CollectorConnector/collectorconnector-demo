import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

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
        resultsLimit: 200,
        resultsType: "posts",
        searchLimit: 1,
        searchType: "hashtag"
      })
    });

    // Read raw text instead of JSON
    const raw = await res.text();

    return NextResponse.json({
      status: res.status,
      raw
    });
  } catch (err) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: String(err) },
      { status: 500 }
    );
  }
}
