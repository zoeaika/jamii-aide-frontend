# Headless CMS + Next.js Preview Setup (Vercel)

This project now supports draft preview mode for the landing page and webhook-based revalidation for published updates.

## 1) Required environment variables

Set these in local `.env.local` and in Vercel Project Settings -> Environment Variables:

```bash
NEXT_PREVIEW_SECRET=replace-with-long-random-string
REVALIDATE_SECRET=replace-with-another-long-random-string

CMS_API_URL=https://your-cms-api.example.com
CMS_LANDING_PAGE_PATH=/landing-page
CMS_ACCESS_TOKEN=published-read-token
CMS_PREVIEW_ACCESS_TOKEN=preview-read-token
```

Notes:
- `CMS_PREVIEW_ACCESS_TOKEN` can be the same as `CMS_ACCESS_TOKEN` if your CMS does not separate them.
- `CMS_LANDING_PAGE_PATH` defaults to `/landing-page` if omitted.

## 2) CMS response shape

The loader accepts these formats:

1. Flat payload:
```json
{ "heroTitle": "..." }
```

2. Nested under `data`:
```json
{ "data": { "heroTitle": "..." } }
```

3. Nested under `data.attributes` (Strapi-style):
```json
{ "data": { "attributes": { "heroTitle": "..." } } }
```

Supported editable keys:
- `heroTitle`
- `heroSubtitle`
- `featuresTitle`
- `featuresSubtitle`
- `pricingTitle`
- `pricingSubtitle`
- `waitlistTitle`
- `waitlistSubtitle`
- `ctaTitle`
- `ctaSubtitle`
- `footerTagline`

## 3) Preview URL in your CMS

In your CMS preview settings, use:

```text
https://<your-vercel-domain>/api/draft?secret=<NEXT_PREVIEW_SECRET>&slug=/
```

Example:
```text
https://jamii-aide.vercel.app/api/draft?secret=abc123&slug=/
```

When this URL is opened, Next.js enables draft mode and redirects to `/`.

To exit preview mode:

```text
https://<your-vercel-domain>/api/draft/disable
```

## 4) Publish webhook for instant production updates

Configure your CMS publish webhook:

- URL:
```text
https://<your-vercel-domain>/api/revalidate
```

- Method: `POST`
- JSON body:
```json
{
  "secret": "REVALIDATE_SECRET",
  "path": "/"
}
```

After publish, this revalidates the landing page cache on Vercel.

## 5) How it works in this codebase

- `app/page.tsx`: server entrypoint reads `draftMode()` and loads preview/published content.
- `app/components/LandingPageClient.tsx`: landing UI + waitlist form + preview banner.
- `app/lib/cms/landing.ts`: typed defaults + CMS fetch + payload normalization.
- `app/api/draft/route.ts`: enables draft mode with secret.
- `app/api/draft/disable/route.ts`: disables draft mode.
- `app/api/revalidate/route.ts`: on-demand cache revalidation for publish webhooks.
