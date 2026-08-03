import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ensureFounderPreordersTable, getPgPool } from '@/app/lib/db';

export const runtime = 'nodejs';

type PesapalTokenResponse = {
  token?: string;
  error?: { message?: string };
  message?: string;
};

type PesapalOrderResponse = {
  order_tracking_id?: string;
  merchant_reference?: string;
  redirect_url?: string;
  error?: { message?: string };
  message?: string;
};

const getPesapalBaseUrl = () =>
  process.env.PESAPAL_ENV === 'live'
    ? 'https://pay.pesapal.com/v3/api'
    : 'https://cybqa.pesapal.com/pesapalv3/api';

const getFounderAmount = () => {
  const amount = process.env.PESAPAL_FOUNDER_AMOUNT || process.env.FOUNDER_PREORDER_AMOUNT;
  if (amount && Number.parseFloat(amount) > 0) {
    return Number.parseFloat(amount);
  }

  const cents = Number.parseInt(process.env.STRIPE_FOUNDER_AMOUNT_CENTS || '', 10);
  if (Number.isFinite(cents) && cents > 0) {
    return cents / 100;
  }

  throw new Error('PESAPAL_FOUNDER_AMOUNT or FOUNDER_PREORDER_AMOUNT must be configured.');
};

const getAccessToken = async () => {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET must be configured.');
  }

  const response = await fetch(`${getPesapalBaseUrl()}/Auth/RequestToken`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
    cache: 'no-store',
  });

  const payload = (await response.json()) as PesapalTokenResponse;
  if (!response.ok || !payload.token) {
    throw new Error(payload.error?.message || payload.message || 'Could not authenticate with Pesapal.');
  }

  return payload.token;
};

export async function POST(request: NextRequest) {
  const notificationId = process.env.PESAPAL_IPN_ID;
  if (!notificationId) {
    return NextResponse.json(
      { message: 'PESAPAL_IPN_ID is not configured.' },
      { status: 503 },
    );
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const merchantReference = `JA-${randomUUID()}`;
  const currency = (process.env.PESAPAL_FOUNDER_CURRENCY || process.env.FOUNDER_PREORDER_CURRENCY || 'KES').toUpperCase();
  const defaultEmail = process.env.PESAPAL_DEFAULT_EMAIL || 'Saidika@jamiiaide.com';
  const defaultPhone = process.env.PESAPAL_DEFAULT_PHONE || '';

  let token: string;
  let amount: number;

  try {
    token = await getAccessToken();
    amount = getFounderAmount();
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Pesapal is not configured.' },
      { status: 503 },
    );
  }

  const response = await fetch(`${getPesapalBaseUrl()}/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: merchantReference,
      currency,
      amount,
      description: 'Jamii Aide founding member preorder',
      callback_url: `${origin}/founding-member/success?provider=pesapal`,
      notification_id: notificationId,
      billing_address: {
        email_address: defaultEmail,
        phone_number: defaultPhone,
        first_name: 'Jamii',
        last_name: 'Aide',
      },
    }),
    cache: 'no-store',
  });

  const order = (await response.json()) as PesapalOrderResponse;
  if (!response.ok || !order.redirect_url || !order.order_tracking_id) {
    return NextResponse.json(
      { message: order.error?.message || order.message || 'Could not create Pesapal order.' },
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
        order.order_tracking_id,
        'pesapal',
        Math.round(amount * 100),
        currency.toLowerCase(),
        'pending',
        'created',
        'founding_member',
        JSON.stringify({ ...order, merchant_reference: merchantReference }),
      ],
    );
  } catch (error) {
    console.error('Pesapal founder preorder persistence failed:', error);
  }

  return NextResponse.json({ url: order.redirect_url });
}
