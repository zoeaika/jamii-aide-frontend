import { NextRequest, NextResponse } from 'next/server';
import { ensureFounderPreordersTable, getPgPool } from '@/app/lib/db';

export const runtime = 'nodejs';

type MpesaCallbackItem = {
  Name: string;
  Value?: string | number;
};

type MpesaCallbackPayload = {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number;
      ResultDesc?: string;
      CallbackMetadata?: {
        Item?: MpesaCallbackItem[];
      };
    };
  };
};

const getMetadataValue = (items: MpesaCallbackItem[] | undefined, name: string) =>
  items?.find((item) => item.Name === name)?.Value;

export async function POST(request: NextRequest) {
  let payload: MpesaCallbackPayload = {};

  try {
    payload = (await request.json()) as MpesaCallbackPayload;
  } catch {
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid callback payload.' }, { status: 400 });
  }

  const callback = payload.Body?.stkCallback;
  const checkoutRequestId = callback?.CheckoutRequestID;

  if (!callback || !checkoutRequestId) {
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Missing checkout request ID.' }, { status: 400 });
  }

  const items = callback.CallbackMetadata?.Item;
  const mpesaReceiptNumber = getMetadataValue(items, 'MpesaReceiptNumber');
  const amount = getMetadataValue(items, 'Amount');
  const phoneNumber = getMetadataValue(items, 'PhoneNumber');
  const isPaid = callback.ResultCode === 0;

  try {
    await ensureFounderPreordersTable();
    await getPgPool().query(
      `
        INSERT INTO public.founder_preorders (
          checkout_session_id,
          payment_provider,
          payment_intent_id,
          customer_id,
          amount_total,
          currency,
          payment_status,
          status,
          offer_code,
          paid_at,
          raw_event
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CASE WHEN $7 = 'paid' THEN NOW() ELSE NULL END, $10::jsonb)
        ON CONFLICT (checkout_session_id) DO UPDATE
        SET
          payment_provider = EXCLUDED.payment_provider,
          payment_intent_id = EXCLUDED.payment_intent_id,
          customer_id = COALESCE(EXCLUDED.customer_id, public.founder_preorders.customer_id),
          amount_total = COALESCE(EXCLUDED.amount_total, public.founder_preorders.amount_total),
          currency = EXCLUDED.currency,
          payment_status = EXCLUDED.payment_status,
          status = EXCLUDED.status,
          paid_at = CASE
            WHEN EXCLUDED.payment_status = 'paid' THEN COALESCE(public.founder_preorders.paid_at, NOW())
            ELSE public.founder_preorders.paid_at
          END,
          raw_event = EXCLUDED.raw_event;
      `,
      [
        checkoutRequestId,
        'mpesa',
        mpesaReceiptNumber ? String(mpesaReceiptNumber) : null,
        phoneNumber ? String(phoneNumber) : null,
        amount ? Math.round(Number(amount) * 100) : null,
        'kes',
        isPaid ? 'paid' : 'failed',
        callback.ResultDesc || (isPaid ? 'completed' : 'failed'),
        'founding_member',
        JSON.stringify(payload),
      ],
    );
  } catch (error) {
    console.error('M-Pesa callback handling failed:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Callback handling failed.' }, { status: 500 });
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
}
