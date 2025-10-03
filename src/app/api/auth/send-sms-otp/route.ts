import axios from 'axios';
import { NextResponse } from 'next/server';

const BASE_URL = 'https://api.textbee.dev/api/v1';
const API_KEY = 'c23716be-576b-4b50-bc94-4d282e88dcb2';
const DEVICE_ID = '68df6da1f1ae82d46e74bddc';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// In-memory OTP store (for demo only, use DB in production)
const otpStore: Record<string, { otp: string; expires: number }> = {};

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });

    const otp = generateOtp();
    otpStore[phone] = { otp, expires: Date.now() + 10 * 60 * 1000 };

    // Send OTP via TextBee
    const response = await axios.post(
      `${BASE_URL}/gateway/devices/${DEVICE_ID}/send-sms`,
      {
        recipients: [phone],
        message: `Your profile completion verification OTP is: ${otp}\n\nDo not share this OTP with anyone. If you did not request this, please ignore this message.`
      },
      {
        headers: { 'x-api-key': API_KEY }
      }
    );

    if (response.data && response.data.data && response.data.data.success) {
      return NextResponse.json({ ok: true });
    } else {
      // Log the full response for debugging
      console.error('TextBee API error:', response.data);
      // Return the actual error message if available
      return NextResponse.json({ error: response.data?.data?.message || response.data?.message || 'Failed to send SMS', details: response.data }, { status: 500 });
    }
  } catch (err: any) {
    // Log the error for debugging
    console.error('TextBee API exception:', err?.response?.data || err);
    // Return the actual error message if available
    const message = err?.response?.data?.message || err?.message || 'Failed to send OTP';
    return NextResponse.json({ error: message, details: err?.response?.data }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) return NextResponse.json({ error: 'Missing phone or otp' }, { status: 400 });
    const entry = otpStore[phone];
    if (!entry || entry.otp !== otp) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    if (Date.now() > entry.expires) return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    delete otpStore[phone];
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'OTP verification failed' }, { status: 500 });
  }
}
