import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // 1. Create Stripe Express account
    const account = await stripeClient.accounts.create({
      type: "express",
    });

    // 2. Save Stripe account ID into the REAL user table (profiles)
    await supabase
      .from("profiles")
      .update({ stripe_account_id: account.id })
      .eq("id", userId);

    // 3. Return the account ID
    return NextResponse.json({ accountId: account.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
