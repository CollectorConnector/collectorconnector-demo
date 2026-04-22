import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const { itemId } = await req.json();

    // Fetch item + seller Stripe account
    const { data: item, error } = await supabase
      .from("items")
      .select("*, profiles(stripe_account_id)")
      .eq("id", itemId)
      .single();

    if (error || !item) {
      return new Response(JSON.stringify({ error: "Item not found" }), { status: 404 });
    }

    const priceInPence = Math.round(item.price * 100);

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: item.title },
            unit_amount: priceInPence,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?item=${itemId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
      payment_intent_data: {
        application_fee_amount: Math.round(priceInPence * 0.08), // ⭐ 8% fee to YOU
        transfer_data: {
          destination: item.profiles.stripe_account_id, // ⭐ payout to seller
        },
      },
      metadata: {
        itemId,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200 });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

