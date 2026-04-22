import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const PRICES = {
  bronze: "price_1TOjY6AcUN8e3s6cwArJilaR",
  silver: "price_1TOjWfAcUN8e3s6crElb2AtF",
  gold: "price_1TOjUxAcUN8e3s6cOHSP4HTV",
} as const;

export async function POST(req: NextRequest) {
  try {
    const { tier } = await req.json(); // "bronze" | "silver" | "gold"
    const priceId = PRICES[tier as keyof typeof PRICES];

    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
