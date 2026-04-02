import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { collectionId, posts } = await req.json();

    if (!collectionId || !posts || posts.length === 0) {
      return NextResponse.json(
        { error: "Missing collectionId or posts" },
        { status: 400 }
      );
    }

    // Get the logged-in user (required for user_id column)
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Build items to insert
    const itemsToInsert = posts.map((post: any) => ({
      user_id: user.id,
      collection_id: collectionId,
      title: post.caption || "Instagram Post",
      description: post.caption || null,
      image_url: post.imageUrl,   // FIXED: snake_case
      estimated_value: 0,
      image_hash: null,
    }));

    const { error } = await supabase.from("items").insert(itemsToInsert);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to import posts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
