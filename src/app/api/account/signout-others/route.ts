import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email || null;
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }
    // TODO: Implement session revocation using service role or auth admin APIs.
    // For now, return success and log the request server-side for admin review.
    console.log('Request to sign out all devices for:', email);
    return NextResponse.json({ message: `Sign out requested for ${email} (placeholder)`, success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
