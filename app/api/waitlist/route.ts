import { NextRequest, NextResponse } from 'next/server';
import { ensureWaitlistTable, getPgPool } from '@/app/lib/db';

type WaitlistPayload = {
  name?: string;
  email?: string;
  source?: string;
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

async function forwardToBackend(payload: {
  name: string;
  email: string;
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
  const source = payload.source?.trim() || 'landing_page';

  if (!name || !email) {
    return NextResponse.json(
      { message: 'Name and email are required.' },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: 'Invalid email address.' }, { status: 400 });
  }

  const target = process.env.WAITLIST_TARGET || 'direct_db';
  if (target === 'backend_api') {
    return forwardToBackend({ name, email, source });
  }

  try {
    await ensureWaitlistTable();
    await getPgPool().query(
      `
        INSERT INTO public.waitlist_signups (name, email, source)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) DO NOTHING;
      `,
      [name, email, source],
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
