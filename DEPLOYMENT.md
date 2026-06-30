# Jamii Aide Frontend Deployment

Two Vercel projects serve two branches from this repo.

| Vercel project | Git branch | Domain | Purpose |
|----------------|------------|--------|---------|
| Landing (existing) | `main` | `jamiiaide.com` | Marketing site + waitlist/checkout API routes |
| App (new) | `production` or `develop` | `app.jamiiaide.com` | Full web app (auth, dashboard, admin, nurse) |

## 1. Create the App Vercel project

1. [Vercel Dashboard](https://vercel.com/new) → **Add New Project** → import this GitHub repo.
2. **Settings → Git → Production Branch:** `production` (recommended) or `develop`.
3. Framework: Next.js (auto-detected).
4. Add environment variables (Production + Preview):

```env
NEXT_PUBLIC_API_URL=https://api.jamiiaide.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your Google OAuth web client ID>
NEXT_PUBLIC_API_TIMEOUT_MS=15000
```

See [`.env.production.example`](.env.production.example).

5. Deploy and confirm the build succeeds.

## 2. DNS for `app.jamiiaide.com`

In your domain registrar (where `jamiiaide.com` is managed):

| Type | Name | Value |
|------|------|-------|
| CNAME | `app` | Value shown in Vercel → Domains (e.g. `cname.vercel-dns.com`) |

Then in the **App** Vercel project → **Domains** → add `app.jamiiaide.com`.

Keep the existing landing project on `jamiiaide.com` unchanged.

## 3. Google OAuth (production)

In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → your Web client:

- **Authorized JavaScript origins:** add `https://app.jamiiaide.com`
- Keep `http://localhost:3000` for local dev on the same client, or use a separate dev client.

Use the production client ID in Vercel env var `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

## 4. Local development

Keep [`.env.local`](.env.local) on localhost values:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Do not point `.env.local` at production unless doing a one-off smoke test, then revert.

## 5. CLI deploy (optional)

```bash
npm i -g vercel
vercel login
vercel link          # link to the App project
vercel --prod        # deploy production branch
```

## 6. Smoke test after deploy

1. Open `https://app.jamiiaide.com/login`
2. Register or log in
3. Confirm redirect to `/dashboard`, `/nurse/dashboard`, or `/admin/dashboard` by role
4. Open `/dashboard/appointments` and confirm API data loads (backend must be live at `api.jamiiaide.com`)
