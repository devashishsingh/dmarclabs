import { NextRequest, NextResponse } from 'next/server';

const VALID_SUBJECTS = new Set(['bug', 'feature', 'access', 'privacy', 'general', 'other']);

function sanitize(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim().slice(0, 2000);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json({ error: 'VALIDATION', message: 'name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'VALIDATION', message: 'valid email is required' }, { status: 400 });
    }
    if (!subject || !VALID_SUBJECTS.has(subject)) {
      return NextResponse.json({ error: 'VALIDATION', message: 'invalid subject' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json({ error: 'VALIDATION', message: 'message must be at least 3 characters' }, { status: 400 });
    }

    const safeName = sanitize(name);
    const safeMessage = sanitize(message);

    console.log(`[contact] subject=${subject} hasEmail=true ts=${new Date().toISOString()} name="${safeName}" msg_len=${safeMessage.length}`);

    // TODO: send via Resend when RESEND_API_KEY is available
    // const { Resend } = await import('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ ... });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
