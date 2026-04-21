import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeClient = new Stripe({
  apiKey: process.env.STRIPE_SECRET_KEY as string,
});

export async function POST(req: Request) {
  const { displayName, email } = await req.json();

  if (!displayName || !email) {
    return NextResponse.json(
      { error: "Missing displayName or email" },
      { status: 400 }
    );
  }

  try {
    const account = await stripeClient.accounts.create({
      display_name: displayName,
      email: email,
      country: "GB",
      type: "express",
      capabilities: {
        transfers: { requested: true },
      },
    });

    return NextResponse.json({ account });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
