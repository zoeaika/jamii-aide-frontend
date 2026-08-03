const PAYPAL_RETRY_DELAYS_MS = [750, 1500];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getPayPalBaseUrl = () =>
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

export const paypalFetch = async (url: string, init: RequestInit) => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= PAYPAL_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await fetch(url, {
        ...init,
        cache: 'no-store',
      });
    } catch (error) {
      lastError = error;

      if (attempt < PAYPAL_RETRY_DELAYS_MS.length) {
        await sleep(PAYPAL_RETRY_DELAYS_MS[attempt]);
      }
    }
  }

  throw lastError;
};

export const getPayPalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be configured.');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await paypalFetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const payload = (await response.json()) as { access_token?: string; error_description?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || 'Could not authenticate with PayPal.');
  }

  return payload.access_token;
};
