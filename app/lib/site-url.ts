import { NextRequest } from 'next/server';

export const getSiteOrigin = (request: NextRequest) => {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredUrl) {
    return request.nextUrl.origin;
  }

  try {
    return new URL(configuredUrl).origin;
  } catch {
    return request.nextUrl.origin;
  }
};
