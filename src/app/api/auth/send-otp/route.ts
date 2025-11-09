import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// In-memory OTP store (for demo only, use DB in production)
const otpStore: Record<string, { otp: string; expires: number }> = {};

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const otp = generateOtp();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };


    // Hardcoded credentials for testing (replace with your actual credentials)
    const smtpUser = 'connectuvani@gmail.com';
    const smtpPass = 'vrda jurq vfqj taba';
    const smtpService = 'gmail';

    const transporter = nodemailer.createTransport({
      service: smtpService,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Compact, modern email design
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background: #ffffff;
      margin: 0; 
      padding: 20px 0;
      line-height: 1.5;
      color: #374151;
      font-size: 14px;
    }
    .email-wrapper {
      max-width: 400px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .header {
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid #f3f4f6;
    }
    .logo {
      height: 32px;
      object-fit: contain;
    }
    .brand {
      color: #111827;
      font-size: 16px;
      font-weight: 600;
      margin-top: 8px;
    }
    .content {
      padding: 24px;
    }
    .title {
      font-size: 18px;
      color: #111827;
      text-align: center;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .description {
      text-align: center;
      color: #6b7280;
      margin-bottom: 20px;
      font-size: 13px;
    }
    .otp-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px;
      text-align: center;
      margin: 20px 0;
    }
    .otp {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      letter-spacing: 3px;
      margin: 8px 0;
      font-family: 'Courier New', monospace;
    }
    .expiry {
      font-size: 12px;
      color: #dc2626;
      font-weight: 500;
    }
    .instruction {
      background: #f0f9ff;
      border-radius: 6px;
      padding: 12px;
      margin: 16px 0;
      font-size: 13px;
    }
    .instruction ol {
      padding-left: 16px;
      margin: 8px 0;
    }
    .instruction li {
      margin-bottom: 4px;
    }
    .security {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 4px;
      padding: 12px;
      margin: 16px 0;
      font-size: 12px;
      color: #7f1d1d;
    }
    .footer {
      text-align: center;
      padding-top: 16px;
      border-top: 1px solid #f3f4f6;
      color: #9ca3af;
      font-size: 12px;
      margin-top: 16px;
    }
    .support {
      color: #374151;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <img src="https://i.ibb.co/21jdWhH1/UVANI-logo.png" alt="UVANI" class="logo" />
      <div class="brand">UVANI Tailoring</div>
    </div>

    <div class="content">
      <h1 class="title">Verify Your Email</h1>
      <p class="description">Enter this code to complete your registration</p>
      
      <div class="otp-box">
        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">VERIFICATION CODE</div>
        <div class="otp">${otp}</div>
        <div class="expiry">⏰ Expires in 10 minutes</div>
      </div>

      <div class="instruction">
        <strong>How to verify:</strong>
        <ol>
          <li>Copy the 6-digit code above</li>
          <li>Return to UVANI app/website</li>
          <li>Paste the code to verify</li>
        </ol>
      </div>

      <div class="security">
        <strong>Security notice:</strong> Do not share this code with anyone. 
        UVANI will never ask for your verification code.
      </div>

      <div class="footer">
        <div>Thank you for choosing UVANI Tailoring</div>
        <div class="support">Need help? Contact support@uvani.com</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: 'UVANI Tailoring <uvanitaloring2025@gmail.com>',
      to: email,
      subject: 'Your UVANI Verification Code',
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Email sending error:', err);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) return NextResponse.json({ error: 'Missing email or otp' }, { status: 400 });
    
    const entry = otpStore[email];
    if (!entry || entry.otp !== otp) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    if (Date.now() > entry.expires) return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    
    delete otpStore[email];
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('OTP verification error:', err);
    return NextResponse.json({ error: 'OTP verification failed' }, { status: 500 });
  }
}