
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('ig_access_token')?.value;
  if (!token) {
    return NextResponse.json({ media: [] }, { status: 401 });
  }

  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  const url = `https://graph.instagram.com/me/media?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}`;

  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) {
    return NextResponse.json({ media: [] }, { status: 500 });
  }

  const json = await r.json(); // { data: [...] }
  return NextResponse.json({ media: json.data ?? [] });
}
``
