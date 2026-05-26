import { NextRequest, NextResponse } from 'next/server';
import { ensureFounderPreordersTable, getPgPool } from '@/app/lib/db';

export const runtime = 'nodejs';

type PesapalTokenResponse = {
  token?: string;
  error?: { message?: string };
  message?: string;
};

const getPesapalBaseUrl = () =>
  process.env.PESAPAL_ENV === 'live'
    ? 'https://pay.pesapal.com/v3/api'
    : 'https://cybqa.pesapal.com/pesapalv3/api';

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

const handlePesapalNotification = async (request: NextRequest) => {
  const orderTrackingId =
    request.nextUrl.searchParams.get('OrderTrackingId') ||
    request.nextUrl.searchParams.get('orderTrackingId') ||
    request.nextUrl.searchParams.get('order_tracking_id');
  const merchantReference =
    request.nextUrl.searchParams.get('OrderMerchantReference') ||
    request.nextUrl.searchParams.get('orderMerchantReference') ||
    request.nextUrl.searchParams.get('merchant_reference');

  if (!orderTrackingId) {
    return NextResponse.json({ message: 'Missing Pesapal order tracking ID.' }, { status: 400 });
  }

  const token = await getAccessToken();
  const statusResponse = await fetch(
    `${getPesapalBaseUrl()}/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    },
  );

  const statusPayload = (await statusResponse.json()) as Record<string, any>;
  if (!statusResponse.ok) {
    console.error('Pesapal status lookup failed:', statusPayload);
    return NextResponse.json({ message: 'Could not verify Pesapal payment.' }, { status: 502 });
  }

  const paymentStatusDescription = String(statusPayload.payment_status_description || '').toLowerCase();
  const paymentStatus =
    paymentStatusDescription === 'completed'
      ? 'paid'
      : paymentStatusDescription || String(statusPayload.status || 'pending').toLowerCase();

  await ensureFounderPreordersTable();
  await getPgPool().query(
    `
      INSERT INTO public.founder_preorders (
        checkout_session_id,
        payment_provider,
        payment_intent_id,
        amount_total,
        currency,
        payment_status,
        status,
        offer_code,
        paid_at,
        raw_event
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CASE WHEN $6 = 'paid' THEN NOW() ELSE NULL END, $9::jsonb)
      ON CONFLICT (checkout_session_id) DO UPDATE
      SET
        payment_provider = EXCLUDED.payment_provider,
        payment_intent_id = EXCLUDED.payment_intent_id,
        amount_total = COALESCE(EXCLUDED.amount_total, public.founder_preorders.amount_total),
        currency = COALESCE(EXCLUDED.currency, public.founder_preorders.currency),
        payment_status = EXCLUDED.payment_status,
        status = EXCLUDED.status,
        paid_at = CASE
          WHEN EXCLUDED.payment_status = 'paid' THEN COALESCE(public.founder_preorders.paid_at, NOW())
          ELSE public.founder_preorders.paid_at
        END,
        raw_event = EXCLUDED.raw_event;
    `,
    [
      orderTrackingId,
      'pesapal',
      statusPayload.confirmation_code || merchantReference || null,
      statusPayload.amount ? Math.round(Number.parseFloat(statusPayload.amount) * 100) : null,
      statusPayload.currency ? String(statusPayload.currency).toLowerCase() : null,
      paymentStatus,
      statusPayload.payment_status_description || statusPayload.status || 'pending',
      'founding_member',
      JSON.stringify({ ...statusPayload, merchant_reference: merchantReference }),
    ],
  );

  return NextResponse.json({ orderNotificationType: 'IPNCHANGE', orderTrackingId, orderMerchantReference: merchantReference, status: 200 });
};

export async function GET(request: NextRequest) {
  try {
    return await handlePesapalNotification(request);
  } catch (error) {
    console.error('Pesapal IPN handling failed:', error);
    return NextResponse.json({ message: 'Pesapal IPN handling failed.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handlePesapalNotification(request);
  } catch (error) {
    console.error('Pesapal IPN handling failed:', error);
    return NextResponse.json({ message: 'Pesapal IPN handling failed.' }, { status: 500 });
  }
}
