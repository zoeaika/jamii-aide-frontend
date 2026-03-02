export type LandingPageContent = {
  heroTitle: string;
  heroSubtitle: string;
  featuresTitle: string;
  featuresSubtitle: string;
  pricingTitle: string;
  pricingSubtitle: string;
  waitlistTitle: string;
  waitlistSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  footerTagline: string;
};

export const defaultLandingPageContent: LandingPageContent = {
  heroTitle: 'Professional In-Home Healthcare for Your Loved Ones',
  heroSubtitle:
    'Connect with qualified nurses/caregivers for personalized care at home. Track health, manage appointments, and ensure the best care for your family.',
  featuresTitle: 'Everything You Need to Care from Afar',
  featuresSubtitle: 'A complete healthcare coordination platform for families',
  pricingTitle: 'Plans That Fit Your Needs',
  pricingSubtitle: 'From occasional check-ins to daily care',
  waitlistTitle: 'Join the Waitlist',
  waitlistSubtitle: 'Get early access updates as we roll out the full platform.',
  ctaTitle: 'Ready to Start Caring?',
  ctaSubtitle:
    'Join thousands of families providing quality healthcare to their loved ones across Kenya',
  footerTagline:
    'Connecting families across borders through trusted healthcare coordination.',
};

const mergeLandingContent = (
  overrides?: Partial<LandingPageContent>,
): LandingPageContent => ({
  ...defaultLandingPageContent,
  ...overrides,
});

const toObject = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  return value as Record<string, unknown>;
};

const normalizePayload = (payload: unknown): Partial<LandingPageContent> => {
  const root = toObject(payload);
  if (!root) {
    return {};
  }

  // Support common CMS response envelopes:
  // 1) { heroTitle: ... }
  // 2) { data: { heroTitle: ... } }
  // 3) { data: { attributes: { heroTitle: ... } } } (e.g. Strapi)
  const data = toObject(root.data) || root;
  const attributes = toObject(data.attributes) || data;

  const allowedKeys: Array<keyof LandingPageContent> = [
    'heroTitle',
    'heroSubtitle',
    'featuresTitle',
    'featuresSubtitle',
    'pricingTitle',
    'pricingSubtitle',
    'waitlistTitle',
    'waitlistSubtitle',
    'ctaTitle',
    'ctaSubtitle',
    'footerTagline',
  ];

  const normalized: Partial<LandingPageContent> = {};
  for (const key of allowedKeys) {
    const value = attributes[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      normalized[key] = value;
    }
  }

  return normalized;
};

export async function getLandingPageContent(options?: {
  preview?: boolean;
}): Promise<LandingPageContent> {
  const preview = Boolean(options?.preview);
  const apiUrl = process.env.CMS_API_URL;

  if (!apiUrl) {
    return defaultLandingPageContent;
  }

  const token = preview
    ? process.env.CMS_PREVIEW_ACCESS_TOKEN || process.env.CMS_ACCESS_TOKEN
    : process.env.CMS_ACCESS_TOKEN;

  const endpointPath = process.env.CMS_LANDING_PAGE_PATH || '/landing-page';
  const url = `${apiUrl.replace(/\/$/, '')}${endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: preview ? 'no-store' : 'force-cache',
      next: preview ? undefined : { revalidate: 120 },
    });

    if (!response.ok) {
      return defaultLandingPageContent;
    }

    const payload = await response.json();
    const normalized = normalizePayload(payload);
    return mergeLandingContent(normalized);
  } catch {
    return defaultLandingPageContent;
  }
}
