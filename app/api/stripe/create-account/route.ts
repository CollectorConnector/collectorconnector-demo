import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY as string,
  {
    apiVersion: "2024-06-20",
  }
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
    const account = await stripeClient.v2.core.accounts.create({
      display_name: displayName,
      contact_email: email,
      identity: { country: "gb" },
      dashboard: "express",
      defaults: {
        responsibilities: {
          fees_collector: "application",
          losses_collector: "application",
        },
      },
      configuration: {
        recipient: {
          capabilities: {
            stripe_balance: {
              stripe_transfers: { requested: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ account });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
