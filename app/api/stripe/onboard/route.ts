import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe without the explicit apiVersion. 
// The SDK will default to the version it is built for.
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const { accountId } = await req.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "Missing accountId" },
        { status: 400 }
      );
    }

    // Ensure we have the base URL from your .env file
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl) {
      console.error("Configuration Error: NEXT_PUBLIC_APP_URL is not defined in environment variables.");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create the account link with absolute, secure HTTPS URLs
    const link = await stripeClient.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${baseUrl}/onboarding/refresh`,
      return_url: `${baseUrl}/onboarding/complete`,
    });

    return NextResponse.json({ link });
  } catch (err: any) {
    console.error("Stripe Onboarding Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
