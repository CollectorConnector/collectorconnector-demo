import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { posts, userId, collectionId } = await req.json();

    if (!posts || posts.length === 0) {
      return NextResponse.json({ error: "NO_POSTS_PROVIDED" }, { status: 400 });
    }

    if (!userId || !collectionId) {
      return NextResponse.json({ error: "MISSING_USER_OR_COLLECTION" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const results = [];

    for (const post of posts) {
      // 1. Download Instagram image
      const imgRes = await fetch(post.imageUrl);
      const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

      // 2. Upload to item-photos bucket
      const filePath = `${userId}/${Date.now()}-${post.id}.jpg`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("item-photos")
        .upload(filePath, imgBuffer, {
          contentType: "image/jpeg",
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-photos/${filePath}`;

      // 3. Create item
      const { data: item, error: itemError } = await supabase
        .from("items")
        .insert({
          user_id: userId,
          title: post.caption?.slice(0, 50) || "Instagram Post",
          description: post.caption || "",
          image_url: publicUrl,
          collection_id: collectionId,
          created_at: new Date(post.timestamp * 1000).toISOString(),
        })
        .select()
        .single();

      if (itemError) {
        console.error("Item creation error:", itemError);
        continue;
      }

      results.push(item);
    }

    // 4. Update collection item_count
    await supabase.rpc("increment_collection_item_count", {
      collection_id_input: collectionId,
      increment_by: results.length,
    });

    return NextResponse.json({
      success: true,
      results,
      redirectTo: `/collections/${collectionId}`,
    });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
