import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing userId or email" },
        { status: 400 }
      );
    }

    // 1. Create a Stripe Connect account for this seller
    const account = await stripe.accounts.create({
      type: "express",
      email,
      capabilities: {
        transfers: { requested: true },
      },
    });

    // 2. Create an onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/complete`,
      type: "account_onboarding",
    });

    // 3. Return the onboarding URL to the frontend
    return NextResponse.json({
      url: accountLink.url,
      accountId: account.id,
    });
  } catch (error: any) {
    console.error("Stripe Connect error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
