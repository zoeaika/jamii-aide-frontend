import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ensureFounderPreordersTable, getPgPool } from '@/app/lib/db';

export const runtime = 'nodejs';

type StripeWebhookEvent = {
  id: string;
  type: string;
  data: {
    object: Record<string, any>;
  };
};

const parseStripeSignature = (header: string) => {
  return header.split(',').reduce(
    (acc, part) => {
      const [key, value] = part.split('=');
      if (key === 't' && value) {
        acc.timestamp = value;
      }
      if (key === 'v1' && value) {
        acc.signatures.push(value);
      }
      return acc;
    },
    { timestamp: '', signatures: [] as string[] },
  );
};

const verifyStripeSignature = (payload: string, signatureHeader: string, secret: string) => {
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  return signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature, 'hex');
    return (
      signatureBuffer.length === expectedBuffer.length &&
      timingSafeEqual(signatureBuffer, expectedBuffer)
    );
  });
};

const handleCheckoutSessionCompleted = async (
  session: Record<string, any>,
  event: StripeWebhookEvent,
) => {
  if (session?.metadata?.offer_code !== 'founding_member') {
    return;
  }

  await ensureFounderPreordersTable();
  await getPgPool().query(
    `
      INSERT INTO public.founder_preorders (
        checkout_session_id,
        payment_provider,
        payment_intent_id,
        customer_id,
        customer_email,
        customer_name,
        amount_total,
        currency,
        payment_status,
        status,
        offer_code,
        paid_at,
        raw_event
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12::jsonb)
      ON CONFLICT (checkout_session_id) DO UPDATE
      SET
        payment_provider = EXCLUDED.payment_provider,
        payment_intent_id = EXCLUDED.payment_intent_id,
        customer_id = EXCLUDED.customer_id,
        customer_email = EXCLUDED.customer_email,
        customer_name = EXCLUDED.customer_name,
        amount_total = EXCLUDED.amount_total,
        currency = EXCLUDED.currency,
        payment_status = EXCLUDED.payment_status,
        status = EXCLUDED.status,
        paid_at = COALESCE(public.founder_preorders.paid_at, NOW()),
        raw_event = EXCLUDED.raw_event;
    `,
    [
      session.id,
      'stripe',
      session.payment_intent || null,
      session.customer || null,
      session.customer_details?.email || session.customer_email || null,
      session.customer_details?.name || null,
      session.amount_total ?? null,
      session.currency ?? null,
      session.payment_status || 'paid',
      session.status || 'complete',
      'founding_member',
      JSON.stringify(event),
    ],
  );
};

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { message: 'STRIPE_WEBHOOK_SECRET is not configured.' },
      { status: 503 },
    );
  }

  const payload = await request.text();
  const signatureHeader = request.headers.get('stripe-signature');

  if (!signatureHeader || !verifyStripeSignature(payload, signatureHeader, webhookSecret)) {
    return NextResponse.json({ message: 'Invalid Stripe signature.' }, { status: 400 });
  }

  let event: StripeWebhookEvent;
  try {
    event = JSON.parse(payload) as StripeWebhookEvent;
  } catch {
    return NextResponse.json({ message: 'Invalid Stripe webhook payload.' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutSessionCompleted(event.data.object, event);
    }
  } catch (error) {
    console.error('Stripe webhook handling failed:', error);
    return NextResponse.json({ message: 'Webhook handling failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
