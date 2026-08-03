import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ensureFounderPreordersTable, getPgPool } from '@/app/lib/db';
import { getPayPalAccessToken, getPayPalBaseUrl, paypalFetch } from '@/app/lib/paypal';
import { getSiteOrigin } from '@/app/lib/site-url';

export const runtime = 'nodejs';

type PayPalLink = {
  href: string;
  rel: string;
};

type PayPalOrder = {
  id: string;
  status?: string;
  links?: PayPalLink[];
  message?: string;
  details?: Array<{ issue?: string; description?: string }>;
};

const getFounderAmount = () => {
  const amount = process.env.PAYPAL_FOUNDER_AMOUNT || process.env.FOUNDER_PREORDER_AMOUNT;
  if (amount && Number.parseFloat(amount) > 0) {
    return Number.parseFloat(amount).toFixed(2);
  }

  const cents = Number.parseInt(process.env.STRIPE_FOUNDER_AMOUNT_CENTS || '', 10);
  if (Number.isFinite(cents) && cents > 0) {
    return (cents / 100).toFixed(2);
  }

  throw new Error('PAYPAL_FOUNDER_AMOUNT or FOUNDER_PREORDER_AMOUNT must be configured.');
};

export async function POST(request: NextRequest) {
  const origin = getSiteOrigin(request);
  const currency = (process.env.PAYPAL_FOUNDER_CURRENCY || process.env.FOUNDER_PREORDER_CURRENCY || 'USD').toUpperCase();
  const referenceId = randomUUID();

  let accessToken: string;
  let amount: string;

  try {
    accessToken = await getPayPalAccessToken();
    amount = getFounderAmount();
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'PayPal is not configured.' },
      { status: 503 },
    );
  }

  const response = await paypalFetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': referenceId,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: referenceId,
          description: 'Jamii Aide founding member preorder',
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'Jamii Aide',
            landing_page: 'LOGIN',
            user_action: 'PAY_NOW',
            return_url: `${origin}/api/checkout/paypal/capture`,
            cancel_url: `${origin}/founding-member/cancel`,
          },
        },
      },
    }),
  });

  const order = (await response.json()) as PayPalOrder;
  const approvalUrl = order.links?.find((link) => link.rel === 'payer-action' || link.rel === 'approve')?.href;

  if (!response.ok || !order.id || !approvalUrl) {
    const detail = order.details?.[0]?.description || order.message;
    return NextResponse.json(
      { message: detail || 'Could not create PayPal order.' },
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
          offer_code,
          raw_event
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        ON CONFLICT (checkout_session_id) DO UPDATE
        SET
          payment_provider = EXCLUDED.payment_provider,
          amount_total = EXCLUDED.amount_total,
          currency = EXCLUDED.currency,
          payment_status = EXCLUDED.payment_status,
          status = EXCLUDED.status,
          raw_event = EXCLUDED.raw_event;
      `,
      [
        order.id,
        'paypal',
        Math.round(Number.parseFloat(amount) * 100),
        currency.toLowerCase(),
        'pending',
        order.status || 'created',
        'founding_member',
        JSON.stringify(order),
      ],
    );
  } catch (error) {
    console.error('PayPal founder preorder persistence failed:', error);
  }

  return NextResponse.json({ url: approvalUrl });
}
