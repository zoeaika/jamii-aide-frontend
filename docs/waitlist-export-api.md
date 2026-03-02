# Waitlist Export API

Read-only admin export endpoint for landing-page waitlist signups.

## Waitlist Storage Mode

Waitlist submission route (`POST /api/waitlist`) supports two modes:

- `WAITLIST_TARGET=direct_db` (default): writes directly to PostgreSQL table `public.waitlist_signups`.
- `WAITLIST_TARGET=backend_api`: forwards signup payload to your backend endpoint.

When using backend mode, also set:

```bash
WAITLIST_BACKEND_API_URL=https://your-backend.example.com/api/waitlist/
WAITLIST_BACKEND_API_TOKEN=optional-bearer-token
```

## Endpoint

- `GET /api/admin/waitlist/export`

## Security

Set this environment variable:

```bash
WAITLIST_EXPORT_TOKEN=kWl6ISs7BViLCADXehbnT9fM0JUFwzm5Pt3yjdv84uNGxKHr
```

Pass token using one of:

- `Authorization: Bearer <WAITLIST_EXPORT_TOKEN>`
- `x-admin-export-token: <WAITLIST_EXPORT_TOKEN>`

## Query parameters

- `format`: `json` (default) or `csv`
- `limit`: number of rows, default `1000`, max `5000`

## Examples

JSON:

```bash
curl -H "Authorization: Bearer $WAITLIST_EXPORT_TOKEN" \
  "https://<your-domain>/api/admin/waitlist/export?format=json&limit=200"
```

CSV:

```bash
curl -H "Authorization: Bearer $WAITLIST_EXPORT_TOKEN" \
  "https://<your-domain>/api/admin/waitlist/export?format=csv&limit=200" \
  -o waitlist_signups.csv
```

## Notes

- This endpoint is read-only and does not change schema.
- Data source: `public.waitlist_signups`.
- Rows are returned newest first by `created_at`.
