import { NextRequest, NextResponse } from 'next/server';
import { ensureFounderPreordersTable, getPgPool } from '@/app/lib/db';
import { getPayPalAccessToken, getPayPalBaseUrl, paypalFetch } from '@/app/lib/paypal';
import { getSiteOrigin } from '@/app/lib/site-url';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const origin = getSiteOrigin(request);

  if (!token) {
    return NextResponse.redirect(`${origin}/founding-member/cancel`);
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const response = await paypalFetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${token}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const capture = (await response.json()) as Record<string, any>;
    if (!response.ok) {
      console.error('PayPal capture failed:', capture);
      return NextResponse.redirect(`${origin}/founding-member/cancel`);
    }

    const purchaseUnit = capture.purchase_units?.[0];
    const capturePayment = purchaseUnit?.payments?.captures?.[0];
    const amountValue = Number.parseFloat(capturePayment?.amount?.value || purchaseUnit?.amount?.value || '0');
    const currency = capturePayment?.amount?.currency_code || purchaseUnit?.amount?.currency_code || null;

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
        capture.id || token,
        'paypal',
        capturePayment?.id || null,
        capture.payer?.payer_id || null,
        capture.payer?.email_address || null,
        [capture.payer?.name?.given_name, capture.payer?.name?.surname].filter(Boolean).join(' ') || null,
        Number.isFinite(amountValue) ? Math.round(amountValue * 100) : null,
        currency ? String(currency).toLowerCase() : null,
        capturePayment?.status === 'COMPLETED' ? 'paid' : capturePayment?.status?.toLowerCase() || 'pending',
        capture.status || 'completed',
        'founding_member',
        JSON.stringify(capture),
      ],
    );

    return NextResponse.redirect(`${origin}/founding-member/success?provider=paypal&order_id=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error('PayPal capture handling failed:', error);
    return NextResponse.redirect(`${origin}/founding-member/cancel`);
  }
}
