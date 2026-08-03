import { NextRequest, NextResponse } from 'next/server';
import { ensureFounderPreordersTable, getPgPool } from '@/app/lib/db';

export const runtime = 'nodejs';

type MpesaTokenResponse = {
  access_token?: string;
  errorMessage?: string;
};

type MpesaStkResponse = {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
  errorMessage?: string;
};

const getMpesaBaseUrl = () =>
  process.env.MPESA_ENV === 'live'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

const normalizeMpesaPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');

  if (/^0(?:7|1)\d{8}$/.test(digits)) {
    return `254${digits.slice(1)}`;
  }

  if (/^(?:7|1)\d{8}$/.test(digits)) {
    return `254${digits}`;
  }

  if (/^254(?:7|1)\d{8}$/.test(digits)) {
    return digits;
  }

  return '';
};

const getFounderAmount = () => {
  const amount = process.env.MPESA_FOUNDER_AMOUNT || process.env.FOUNDER_PREORDER_AMOUNT;
  if (amount && Number.parseFloat(amount) > 0) {
    return Math.ceil(Number.parseFloat(amount));
  }

  const cents = Number.parseInt(process.env.STRIPE_FOUNDER_AMOUNT_CENTS || '', 10);
  if (Number.isFinite(cents) && cents > 0) {
    return Math.ceil(cents / 100);
  }

  throw new Error('MPESA_FOUNDER_AMOUNT or FOUNDER_PREORDER_AMOUNT must be configured.');
};

const getTimestamp = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
};

const getAccessToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET must be configured.');
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const response = await fetch(`${getMpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
    cache: 'no-store',
  });

  const payload = (await response.json()) as MpesaTokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.errorMessage || 'Could not authenticate with M-Pesa.');
  }

  return payload.access_token;
};

export async function POST(request: NextRequest) {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortcode || !passkey) {
    return NextResponse.json(
      { message: 'MPESA_SHORTCODE and MPESA_PASSKEY must be configured.' },
      { status: 503 },
    );
  }

  let payload: { phone?: string } = {};
  try {
    payload = (await request.json()) as { phone?: string };
  } catch {
    return NextResponse.json({ message: 'Invalid M-Pesa payload.' }, { status: 400 });
  }

  const phone = normalizeMpesaPhone(payload.phone || '');
  if (!phone) {
    return NextResponse.json(
      { message: 'Enter a valid Kenyan Safaricom phone number.' },
      { status: 400 },
    );
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const callbackUrl = process.env.MPESA_CALLBACK_URL || `${origin}/api/mpesa/callback`;
  const amount = getFounderAmount();
  const timestamp = getTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  const partyB = process.env.MPESA_PARTY_B || shortcode;
  const accountReference = process.env.MPESA_ACCOUNT_REFERENCE || 'JamiiAide';
  const transactionDescription = process.env.MPESA_TRANSACTION_DESC || 'Jamii Aide founder preorder';

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'M-Pesa is not configured.' },
      { status: 503 },
    );
  }

  const response = await fetch(`${getMpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: partyB,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDescription,
    }),
    cache: 'no-store',
  });

  const stk = (await response.json()) as MpesaStkResponse;
  if (!response.ok || stk.ResponseCode !== '0' || !stk.CheckoutRequestID) {
    return NextResponse.json(
      { message: stk.errorMessage || stk.ResponseDescription || 'Could not start M-Pesa STK Push.' },
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
          customer_id,
          amount_total,
          currency,
          payment_status,
          status,
          offer_code,
          raw_event
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
        ON CONFLICT (checkout_session_id) DO UPDATE
        SET
          payment_provider = EXCLUDED.payment_provider,
          customer_id = EXCLUDED.customer_id,
          amount_total = EXCLUDED.amount_total,
          currency = EXCLUDED.currency,
          payment_status = EXCLUDED.payment_status,
          status = EXCLUDED.status,
          raw_event = EXCLUDED.raw_event;
      `,
      [
        stk.CheckoutRequestID,
        'mpesa',
        phone,
        amount * 100,
        'kes',
        'pending',
        'stk_push_sent',
        'founding_member',
        JSON.stringify(stk),
      ],
    );
  } catch (error) {
    console.error('M-Pesa founder preorder persistence failed:', error);
  }

  return NextResponse.json({
    ok: true,
    checkoutRequestId: stk.CheckoutRequestID,
    merchantRequestId: stk.MerchantRequestID,
    message: stk.CustomerMessage || 'Check your phone for the M-Pesa prompt.',
  });
}
