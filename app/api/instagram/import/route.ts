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

    // Insert each post as an item
    const itemsToInsert = posts.map((post: any) => ({
      collection_id: collectionId,
      title: post.caption || "Instagram Post",
      imageUrl: post.imageUrl, // camelCase for Instagram imports
    }));

    const { error } = await supabase.from("items").insert(itemsToInsert);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to import posts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
