import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, reason } = await req.json();
    if (!email || !reason) return NextResponse.json({ error: 'Missing email or reason' }, { status: 400 });

    const adminEmail = process.env.UVANI_ADMIN_EMAIL || 'uvanitaloring2025@gmail.com';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'uvanitaloring2025@gmail.com',
        pass: process.env.EMAIL_PASS || '',
      },
    });

    const html = `<p>Account deletion request received:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Reason:</strong> ${reason}</li>
        <li><strong>Time:</strong> ${new Date().toISOString()}</li>
      </ul>
    `;

    await transporter.sendMail({
      from: `UVANI App <${process.env.EMAIL_USER || 'uvanitaloring2025@gmail.com'}>`,
      to: adminEmail,
      subject: `Account Deletion Request - ${email}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('request-deletion error', err);
    return NextResponse.json({ error: 'Failed to request deletion' }, { status: 500 });
  }
}
