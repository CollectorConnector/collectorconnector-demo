import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const {
      amount,
      sellerStripeAccountId,
      listingId,
      buyerId,
      sellerId,
    } = await req.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      application_fee_amount: Math.round(amount * 0.08),
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: {
        listingId,
        buyerId,
        sellerId,
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment Intent Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
