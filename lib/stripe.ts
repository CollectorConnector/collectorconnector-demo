import Stripe from "stripe";

export const stripeClient = new Stripe({
  apiKey: process.env.STRIPE_SECRET_KEY as string,
});
