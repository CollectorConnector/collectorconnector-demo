import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    // Get logged-in user
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user's stored Instagram access token
    const { data: tokenRow, error: tokenError } = await supabase
      .from("instagram_tokens")
      .select("access_token")
      .eq("user_id", user.id)
      .single();

    if (tokenError || !tokenRow?.access_token) {
      return NextResponse.json(
        { error: "No Instagram token found" },
        { status: 401 }
      );
    }

    const accessToken = tokenRow.access_token;

    // Fetch media from Instagram Graph API
    const igRes = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,caption,permalink&access_token=${accessToken}`
    );

    if (!igRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Instagram media" },
        { status: 500 }
      );
    }

    const json = await igRes.json();

    return NextResponse.json({
      media: json.data || [],
    });
  } catch (err) {
    console.error("INSTAGRAM FETCH ERROR:", err);
    return NextResponse.json(
      { error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
