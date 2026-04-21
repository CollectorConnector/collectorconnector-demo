import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.alpha", // Ensure this matches your installed version
});

export async function POST(req: Request) {
  try {
    const { accountId } = await req.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "Missing accountId" },
        { status: 400 }
      );
    }

    // Verify that the environment variable exists
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl || !baseUrl.startsWith("https://")) {
      console.error("Invalid or missing NEXT_PUBLIC_APP_URL:", baseUrl);
      return NextResponse.json(
        { error: "Invalid configuration: NEXT_PUBLIC_APP_URL must be an HTTPS URL" },
        { status: 500 }
      );
    }

    // Create the account link
    const link = await stripeClient.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      // Using the correct environment variable and ensuring full absolute URLs
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
