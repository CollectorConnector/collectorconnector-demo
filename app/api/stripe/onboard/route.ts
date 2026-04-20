import { NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe";

export async function POST(req: Request) {
  const { accountId } = await req.json();

  if (!accountId) {
    return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
  }

  try {
    const link = await stripeClient.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["recipient"],
          refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/refresh`,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/complete?accountId=${accountId}`,
        },
      },
    });

    return NextResponse.json({ url: link.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
