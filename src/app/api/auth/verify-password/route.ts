import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });

    const { data, error } = await supabase.from('tailors').select('password').eq('email', email).maybeSingle();
    if (error) return NextResponse.json({ error: error.message || 'DB error' }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'No account found' }, { status: 404 });

    const stored = data.password;
    if (String(stored).trim() !== String(password).trim()) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
}
