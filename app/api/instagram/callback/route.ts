
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/?error=missing_code', req.url));
  }

  // Exchange code -> access_token
  const body = new URLSearchParams({
    client_id: process.env.IG_APP_ID!,
    client_secret: process.env.IG_APP_SECRET!,
    grant_type: 'authorization_code',
    redirect_uri: process.env.IG_REDIRECT_URI!,
    code,
  }).toString();

  const r = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!r.ok) {
    return NextResponse.redirect(new URL('/?error=token_exchange_failed', req.url));
  }

  const data = await r.json(); // { access_token, user_id }
  const res = NextResponse.redirect(new URL('/collectors?connected=instagram', req.url));

  // Store short-lived IG token in an HTTP-only cookie (about 1 hour)
  res.cookies.set('ig_access_token', data.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 3600,
    path: '/',
  });

  return res;
}
