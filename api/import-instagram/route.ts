import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import sharp from "sharp"; // Add this import

export async function POST(req: Request) {
  const { posts, userId } = await req.json();

  if (!posts || posts.length === 0) {
    return NextResponse.json({ error: "No posts selected" }, { status: 400 });
  }

  const results = [];

  for (const post of posts) {
    try {
      // Download image
      const imgRes = await fetch(post.imageUrl);
      if (!imgRes.ok) throw new Error("Failed to fetch image");

      const buffer = Buffer.from(await imgRes.arrayBuffer());

      // Resize with Sharp (max 800px width, good quality for items)
      const resizedBuffer = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true }) // Keeps aspect ratio
        .jpeg({ quality: 85 })
        .toBuffer();

      // Upload to Supabase "items" bucket
      const fileName = `${userId}/instagram-${post.id}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("items")
        .upload(fileName, resizedBuffer, {
          contentType: "image/jpeg",
          upsert: true,
          cacheControl: "31536000",
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("items")
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) throw new Error("No public URL");

      // Insert into items table
      const { error: insertError } = await supabase.from("items").insert({
        user_id: userId,
        image_url: urlData.publicUrl,
        caption: post.caption || "",
        source: "instagram",
        name: post.caption ? post.caption.substring(0, 100) : "Instagram Import",
      });

      if (insertError) throw insertError;

      results.push({ id: post.id, status: "success", url: urlData.publicUrl });
    } catch (err: any) {
      console.error(`Failed to import post ${post.id}:`, err);
      results.push({ id: post.id, status: "failed" });
    }
  }

  return NextResponse.json({ results });
}
