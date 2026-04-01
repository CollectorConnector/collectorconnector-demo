// app/api/ebay/list-item/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Mock eBay listing:", body);

  // Later: call real eBay APIs here
  return NextResponse.json({
    success: true,
    listingUrl: "https://www.ebay.com/itm/mock-listing-id",
  });
}
