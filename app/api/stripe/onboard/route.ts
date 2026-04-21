import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY as string
);

export async function POST(req: Request) {
  const { accountId } = await req.json();

  if (!accountId) {
    return NextResponse.json(
      { error: "Missing accountId" },
      { status: 400 }
    );
  }

  try {
    const link = await stripeClient.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/complete`,
    });

    return NextResponse.json({ link });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
