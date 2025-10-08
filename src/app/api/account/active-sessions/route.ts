import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder: in a real implementation, query session store / supabase to count active sessions for the user
  return NextResponse.json({ count: 0 });
}
