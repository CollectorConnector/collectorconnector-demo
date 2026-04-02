import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      posts: [
        {
          id: "demo-1",
          imageUrl: "https://via.placeholder.com/300",
          caption: "Demo post from API route",
        },
      ],
    },
    { status: 200 }
  );
}
