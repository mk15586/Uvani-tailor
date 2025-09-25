import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import nodemailer from 'nodemailer';
import path from 'path';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, userId } = body;
    if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Insert OTP (may be rejected by RLS when using public anon key)
  const { error: insertErr } = await supabase.from('email_otps').insert([{ email, user_id: userId ?? null, otp, expires_at: expiresAt }]);
    if (insertErr) {
      console.warn('insert otp error', insertErr);
      // Do not fail the request if OTP row can't be inserted with anon key — still attempt to send email
    }

    // Setup transporter using provided credentials or environment variables
    const smtpUser = process.env.OTP_SMTP_USER ?? 'uvanitaloring2025@gmail.com';
    const smtpPass = process.env.OTP_SMTP_PASS ?? 'kiok eujd joum lmxo';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Prepare HTML email (industrial, professional)
    const logoPath = path.join(process.cwd(), 'public', 'UVANI logo.png');
    const html = `
      <div style="font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
        <div style="max-width:600px;margin:0 auto;border:1px solid #e6e9ee;padding:24px;border-radius:8px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
            <img src="cid:uvani_logo" alt="Uvani" style="height:48px;object-fit:contain;" />
            <div>
              <h2 style="margin:0;font-size:18px;color:#0f172a;">Uvani Tailor Panel — Email Verification</h2>
              <div style="font-size:13px;color:#6b7280;">OTP verification to complete your account setup</div>
            </div>
          </div>

          <div style="background:#f8fafc;padding:18px;border-radius:6px;margin-bottom:18px;">
            <div style="font-size:14px;color:#374151">Hello,</div>
            <p style="margin:8px 0 0 0;color:#374151;font-size:14px;line-height:1.5">Use the one-time passcode below to verify your email address for Uvani Tailor Panel. This code will expire in 10 minutes.</p>
          </div>

          <div style="text-align:center;margin-bottom:18px;">
            <div style="display:inline-block;padding:12px 18px;border-radius:8px;background:linear-gradient(90deg,#0ea5a4,#0b7285);color:#fff;font-size:22px;font-weight:700;letter-spacing:4px;">${otp}</div>
          </div>

          <div style="font-size:13px;color:#6b7280;line-height:1.4">If you did not request this code, you can safely ignore this email. For support, contact <a href="mailto:support@uvani.com">support@uvani.com</a>.</div>

          <div style="border-top:1px solid #e6e9ee;margin-top:18px;padding-top:12px;font-size:12px;color:#9ca3af;display:flex;justify-content:space-between;align-items:center;">
            <div>Uvani Tailor Panel</div>
            <div>© ${new Date().getFullYear()} Uvani</div>
          </div>
        </div>
      </div>
    `;

    // Send email with embedded logo using cid
    await transporter.sendMail({
      from: `Uvani Tailor <${smtpUser}>`,
      to: email,
      subject: 'Uvani Tailor — Email Verification Code',
      html,
      attachments: [
        {
          filename: 'UVANI logo.png',
          path: logoPath,
          cid: 'uvani_logo',
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'unexpected error' }, { status: 500 });
  }
}
