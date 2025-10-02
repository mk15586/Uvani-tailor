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

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'uvanitaloring2025@gmail.com',
        pass: 'kiok eujd joum lmxo',
      },
    });

    // Enhanced HTML email template
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UVANI Tailoring - Email Verification</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0; 
      padding: 20px 0; 
      line-height: 1.6;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    .header {
      background: linear-gradient(135deg, #4a154b 0%, #6b1f5e 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }
    .logo-container {
      position: relative;
      z-index: 2;
    }
    .logo {
      height: 56px;
      object-fit: contain;
      filter: brightness(1.1);
    }
    .brand-text {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin-top: 12px;
      letter-spacing: 1px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    .content {
      padding: 50px 40px;
      background: #ffffff;
    }
    .welcome-icon {
      text-align: center;
      margin-bottom: 30px;
      position: relative;
      display: inline-block;
      width: 100%;
    }
    .icon-wrapper {
      position: relative;
      display: inline-block;
    }
    .shield-badge {
      position: absolute;
      top: -8px;
      left: -15px;
      width: 50px;
      height: 55px;
      z-index: 10;
    }
    .shield-svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    }
    .logo-circle {
      width: 90px;
      height: 90px;
      background: linear-gradient(135deg, #4a154b, #6b1f5e);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 16px rgba(74, 21, 75, 0.3);
      padding: 18px;
      position: relative;
    }
    .logo-circle img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: brightness(1.2);
    }
    .title {
      font-size: 28px;
      color: #2c3e50;
      text-align: center;
      margin-bottom: 16px;
      font-weight: 700;
    }
    .subtitle {
      text-align: center;
      color: #7f8c8d;
      font-size: 16px;
      margin-bottom: 40px;
    }
    .otp-section {
      background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
      border: 2px dashed #4a154b;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
      position: relative;
    }
    .otp-label {
      font-size: 14px;
      color: #4a154b;
      font-weight: 600;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 800;
      color: #4a154b;
      letter-spacing: 8px;
      margin: 15px 0;
      text-shadow: 0 2px 4px rgba(74, 21, 75, 0.2);
      font-family: 'Courier New', monospace;
    }
    .otp-timer {
      font-size: 14px;
      color: #e74c3c;
      font-weight: 600;
      margin-top: 15px;
    }
    .verify-button {
      display: inline-block;
      background: linear-gradient(135deg, #4a154b 0%, #6b1f5e 100%);
      color: #ffffff !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 30px 0;
      box-shadow: 0 8px 20px rgba(74, 21, 75, 0.3);
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }
    .verify-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(74, 21, 75, 0.4);
    }
    .info-card {
      background: #fff8e1;
      border-left: 4px solid #ffa726;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      box-shadow: 0 2px 8px rgba(255, 167, 38, 0.1);
    }
    .info-icon {
      display: inline-block;
      width: 20px;
      height: 20px;
      background: #ffa726;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
      color: white;
      font-size: 12px;
      margin-right: 10px;
      font-weight: bold;
    }
    .steps-section {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 25px;
      margin: 30px 0;
    }
    .step {
      display: flex;
      align-items: center;
      margin: 15px 0;
      font-size: 15px;
      color: #495057;
    }
    .step-number {
      background: #4a154b;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      margin-right: 15px;
      flex-shrink: 0;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper { margin: 10px; border-radius: 12px; }
      .content { padding: 30px 25px; }
      .header { padding: 30px 25px; }
      .otp-code { font-size: 28px; letter-spacing: 6px; }
      .title { font-size: 24px; }
      .verify-button { padding: 14px 30px; }
      .logo-circle { width: 80px; height: 80px; }
      .shield-badge { width: 45px; height: 50px; top: -5px; left: -12px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <!-- Header -->
    <div class="header">
      <div class="logo-container">
        <img src="https://i.ibb.co/21jdWhH1/UVANI-logo.png" alt="UVANI Tailoring" class="logo" />
        <div class="brand-text">UVANI Tailoring</div>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="welcome-icon">
        <div class="icon-wrapper">
          <div class="shield-badge">
            <svg class="shield-svg" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Outer Shield -->
              <path d="M12 2L3 6V12C3 18.5 7.5 24.5 12 26C16.5 24.5 21 18.5 21 12V6L12 2Z" fill="#7DD3FC" stroke="#7DD3FC" stroke-width="0.5"/>
              <!-- Inner Shield -->
              <path d="M12 4L5 7.5V12C5 17.5 8.5 22.5 12 24C15.5 22.5 19 17.5 19 12V7.5L12 4Z" fill="#4ADE80"/>
              <!-- Checkmark -->
              <path d="M9 13L11 15L15 10" stroke="#2D5F3F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="logo-circle">
            <img src="https://i.ibb.co/21jdWhH1/UVANI-logo.png" alt="UVANI Logo" />
          </div>
        </div>
      </div>
      
      <h1 class="title">Email Verification</h1>
      <p class="subtitle">Complete your account setup with secure verification</p>
      
      <p style="color: #555; font-size: 16px; margin-bottom: 25px;">
        Welcome to <strong>UVANI Tailoring</strong>! To ensure the security of your account and complete your registration, please verify your email address using the verification code below.
      </p>

      <div class="otp-section">
        <div class="otp-label">Your Verification Code</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-timer">⏰ Expires in 10 minutes</div>
      </div>

      <div style="text-align: center;">
        <a href="#" class="verify-button">✓ Verify Email Address</a>
      </div>

      <div class="steps-section">
        <h3 style="color: #2c3e50; margin-bottom: 20px; font-size: 18px;">How to verify:</h3>
        <div class="step">
          <div class="step-number">1</div>
          <span>Copy the 6-digit verification code above</span>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <span>Return to the UVANI app or website</span>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <span>Paste the code in the verification field</span>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <span>Click "Verify" to complete your registration</span>
        </div>
      </div>

      <div class="info-card">
        <span class="info-icon">!</span>
        <strong>Security Notice:</strong> This verification code is confidential and should not be shared with anyone. If you didn't request this verification, please contact our support team immediately at <a href="mailto:support@uvani.com" style="color: #4a154b;">support@uvani.com</a>
      </div>

      <p style="color: #666; font-size: 15px; margin-top: 30px;">
        Thank you for choosing UVANI Tailoring. We're excited to help you discover the perfect tailoring solutions!
      </p>
      
      <p style="color: #666; font-size: 15px; margin-top: 20px;">
        Best regards,<br>
        <strong style="color: #4a154b;">The UVANI Tailoring Team</strong>
      </p>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: 'UVANI Tailoring <uvanitaloring2025@gmail.com>',
      to: email,
      subject: 'UVANI Email Verification Code',
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
