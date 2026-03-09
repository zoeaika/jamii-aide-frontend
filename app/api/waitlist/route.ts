import { NextRequest, NextResponse } from 'next/server';
import { ensureWaitlistTable, getPgPool } from '@/app/lib/db';

type WaitlistPayload = {
  name?: string;
  email?: string;
  phone?: string;
  acceptsPromotional?: boolean;
  source?: string;
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => /^\+[1-9]\d{7,14}$/.test(phone);

async function forwardToBackend(payload: {
  name: string;
  email: string;
  phone: string;
  acceptsPromotional: boolean;
  source: string;
}) {
  const backendUrl = process.env.WAITLIST_BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { message: 'WAITLIST_BACKEND_API_URL is not configured.' },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.WAITLIST_BACKEND_API_TOKEN
          ? { Authorization: `Bearer ${process.env.WAITLIST_BACKEND_API_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Backend waitlist request failed.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, mode: 'backend_api' });
  } catch (error) {
    console.error('Waitlist backend forward failed:', error);
    return NextResponse.json(
      { message: 'Could not forward waitlist signup.' },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  let payload: WaitlistPayload = {};

  try {
    payload = (await request.json()) as WaitlistPayload;
  } catch {
    return NextResponse.json({ message: 'Invalid JSON payload.' }, { status: 400 });
  }

  const name = payload.name?.trim();
  const email = payload.email?.trim().toLowerCase();
  const phone = payload.phone?.trim();
  const acceptsPromotional = payload.acceptsPromotional === true;
  const source = payload.source?.trim() || 'landing_page';

  if (!name || !email || !phone) {
    return NextResponse.json(
      { message: 'Name, email, and phone are required.' },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: 'Invalid email address.' }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json(
      { message: 'Invalid phone number. Use international format, e.g. +254712345678.' },
      { status: 400 },
    );
  }

  const target = process.env.WAITLIST_TARGET || 'direct_db';
  if (target === 'backend_api') {
    return forwardToBackend({ name, email, phone, acceptsPromotional, source });
  }

  try {
    await ensureWaitlistTable();
    await getPgPool().query(
      `
        INSERT INTO public.waitlist_signups (name, email, phone, accepts_promotional, source)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE
        SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          accepts_promotional = EXCLUDED.accepts_promotional,
          source = EXCLUDED.source;
      `,
      [name, email, phone, acceptsPromotional, source],
    );

    return NextResponse.json({ ok: true, mode: 'direct_db' });
  } catch (error) {
    console.error('Waitlist insert failed:', error);
    return NextResponse.json(
      { message: 'Could not save waitlist signup.' },
      { status: 500 },
    );
  }
}
