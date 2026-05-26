import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ensureFounderPreordersTable, getPgPool } from '@/app/lib/db';

export const runtime = 'nodejs';

type StripeCheckoutSession = {
  id: string;
  url?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  payment_status?: string | null;
  status?: string | null;
};

const STRIPE_CHECKOUT_SESSIONS_URL = 'https://api.stripe.com/v1/checkout/sessions';

const appendLineItem = (params: URLSearchParams) => {
  const priceId = process.env.STRIPE_FOUNDER_PRICE_ID;
  const amount = Number.parseInt(process.env.STRIPE_FOUNDER_AMOUNT_CENTS || '', 10);
  const currency = (process.env.STRIPE_FOUNDER_CURRENCY || 'usd').toLowerCase();
  const productName = process.env.STRIPE_FOUNDER_PRODUCT_NAME || 'Jamii Aide Founding Member Preorder';

  if (priceId) {
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('STRIPE_FOUNDER_PRICE_ID or STRIPE_FOUNDER_AMOUNT_CENTS must be configured.');
  }

  params.append('line_items[0][price_data][currency]', currency);
  params.append('line_items[0][price_data][product_data][name]', productName);
  params.append(
    'line_items[0][price_data][product_data][description]',
    'Founding member access before public launch.',
  );
  params.append('line_items[0][price_data][unit_amount]', String(amount));
  params.append('line_items[0][quantity]', '1');
};

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { message: 'STRIPE_SECRET_KEY is not configured.' },
      { status: 503 },
    );
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const clientReferenceId = randomUUID();
  const params = new URLSearchParams();

  params.append('mode', 'payment');
  params.append('client_reference_id', clientReferenceId);
  params.append('customer_creation', 'always');
  params.append('billing_address_collection', 'auto');
  params.append('success_url', `${origin}/founding-member/success?session_id={CHECKOUT_SESSION_ID}`);
  params.append('cancel_url', `${origin}/founding-member/cancel`);
  params.append('metadata[offer_code]', 'founding_member');
  params.append('metadata[client_reference_id]', clientReferenceId);
  params.append('payment_intent_data[metadata][offer_code]', 'founding_member');
  params.append('payment_intent_data[metadata][client_reference_id]', clientReferenceId);
  params.append('allow_promotion_codes', 'true');

  try {
    appendLineItem(params);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Founder price is not configured.' },
      { status: 503 },
    );
  }

  const response = await fetch(STRIPE_CHECKOUT_SESSIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
    cache: 'no-store',
  });

  const session = (await response.json()) as StripeCheckoutSession & {
    error?: { message?: string };
  };

  if (!response.ok || !session.url) {
    return NextResponse.json(
      { message: session.error?.message || 'Could not create Stripe Checkout session.' },
      { status: response.status || 502 },
    );
  }

  try {
    await ensureFounderPreordersTable();
    await getPgPool().query(
      `
        INSERT INTO public.founder_preorders (
          checkout_session_id,
          payment_provider,
          amount_total,
          currency,
          payment_status,
          status,
          offer_code
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (checkout_session_id) DO UPDATE
        SET
          payment_provider = EXCLUDED.payment_provider,
          amount_total = EXCLUDED.amount_total,
          currency = EXCLUDED.currency,
          payment_status = EXCLUDED.payment_status,
          status = EXCLUDED.status;
      `,
      [
        session.id,
        'stripe',
        session.amount_total ?? null,
        session.currency ?? null,
        session.payment_status ?? 'pending',
        session.status ?? 'created',
        'founding_member',
      ],
    );
  } catch (error) {
    console.error('Founder preorder session persistence failed:', error);
  }

  return NextResponse.json({ url: session.url });
}
