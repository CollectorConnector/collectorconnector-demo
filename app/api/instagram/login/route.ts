
import { NextResponse } from 'next/server';

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.IG_APP_ID!,             // set in Step 7
    redirect_uri: process.env.IG_REDIRECT_URI!,    // set in Step 7
    scope: 'user_profile,user_media',
    response_type: 'code',
  });

  const url = `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  return NextResponse.redirect(url);
}
