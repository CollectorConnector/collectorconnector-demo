import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY as string
);

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
      type: "express",
      email: email,
      business_profile: {
        name: displayName,
      },
      capabilities: {
        transfers: { requested: true },
      },
      country: "GB"
    });

    return NextResponse.json({ account });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
