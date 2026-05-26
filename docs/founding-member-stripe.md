# Founding Member Payments

The landing page uses Next.js API routes for founding member preorders, so the full backend does not need to be hosted yet.

## Shared environment variables

Required:

```txt
NEXT_PUBLIC_SITE_URL=https://your-domain.com
FOUNDER_PREORDER_AMOUNT=50.00
FOUNDER_PREORDER_CURRENCY=USD
```

## Stripe

Configure the founder product with either a Stripe Price ID:

```txt
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_FOUNDER_PRICE_ID=price_...
```

Or an inline amount:

```txt
STRIPE_FOUNDER_AMOUNT_CENTS=5000
STRIPE_FOUNDER_CURRENCY=usd
STRIPE_FOUNDER_PRODUCT_NAME=Jamii Aide Founding Member Preorder
```

Point the Stripe webhook endpoint to:

```txt
https://your-domain.com/api/stripe/webhook
```

Listen for:

```txt
checkout.session.completed
```

Successful founder payments are stored in the `public.founder_preorders` table when `DATABASE_URL` is configured.

## PayPal

Create REST app credentials in PayPal Developer Dashboard, then add:

```txt
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_FOUNDER_AMOUNT=50.00
PAYPAL_FOUNDER_CURRENCY=USD
```

Use `PAYPAL_ENV=live` with live credentials when you are ready for production.

## Pesapal

Create Pesapal API 3.0 credentials, register this IPN URL in Pesapal, then copy the returned IPN ID:

```txt
https://your-domain.com/api/pesapal/ipn
```

Add:

```txt
PESAPAL_ENV=sandbox
PESAPAL_CONSUMER_KEY=...
PESAPAL_CONSUMER_SECRET=...
PESAPAL_IPN_ID=...
PESAPAL_FOUNDER_AMOUNT=5000
PESAPAL_FOUNDER_CURRENCY=KES
PESAPAL_DEFAULT_EMAIL=Saidika@jamiiaide.com
PESAPAL_DEFAULT_PHONE=+254700000000
```

Use `PESAPAL_ENV=live` with live credentials when you are ready for production.

## M-Pesa

Create Safaricom Daraja credentials for Lipa na M-Pesa Online / STK Push, then add:

```txt
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379
MPESA_PASSKEY=...
MPESA_FOUNDER_AMOUNT=5000
MPESA_ACCOUNT_REFERENCE=JamiiAide
MPESA_TRANSACTION_DESC=Jamii Aide founder preorder
```

The callback URL is:

```txt
https://your-domain.com/api/mpesa/callback
```

For production, set:

```txt
MPESA_ENV=live
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
```

Localhost cannot receive Safaricom callbacks directly. Use a public deployed URL or a tunneling tool when testing callbacks locally.
