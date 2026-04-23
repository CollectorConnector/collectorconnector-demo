import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// Map your plan names to Stripe Price IDs
const PRICE_IDS: Record<string, string | undefined> = {
  bronze: process.env.STRIPE_BRONZE_PRICE_ID,
  silver: process.env.STRIPE_SILVER_PRICE_ID,
  gold: process.env.STRIPE_GOLD_PRICE_ID,
};

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const plan = searchParams.get("plan");

    if (!plan || !PRICE_IDS[plan]) {
      return NextResponse.json(
        { error: "Invalid or missing plan" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe upgrade error:", error);
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 }
    );
  }
}
