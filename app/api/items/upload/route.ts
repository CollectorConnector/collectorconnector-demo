// app/api/items/upload/route.ts
// Temporary placeholder - direct upload is now handled in the profile page

export async function POST() {
  return new Response(
    JSON.stringify({ message: "Upload route disabled - using direct Supabase upload instead" }),
    { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}
