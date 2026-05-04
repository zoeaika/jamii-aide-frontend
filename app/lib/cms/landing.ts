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
  heroTitle: 'Professional Home Care for Your Loved Ones',
  heroSubtitle:
    'Connect with qualified caregivers, nurses, physiotherapists for personalized home care services in the comfort of your home. Get the support you need with their health and wellbeing, manage doctor appointments, ensuring your peace of mind.',
  featuresTitle: 'Trusted Caregiving and Nursing Support',
  featuresSubtitle: 'Built for families managing elderly care from another country, city, town, or county',
  pricingTitle: 'Plans That Fit Your Needs',
  pricingSubtitle: 'From occasional check-ins to daily care',
  waitlistTitle: 'Join the Founder Waitlist',
  waitlistSubtitle: 'Share your interest and help shape the care services we build first. Founding members get 50% off their first 3 months.',
  ctaTitle: 'Help Shape Jamii Aide',
  ctaSubtitle:
    'Your answers will guide what we build, who we hire, and the services we provide for elderly family members in Kenya.',
  footerTagline:
    'Coordinated, trusted care for families supporting aging loved ones from afar.',
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
