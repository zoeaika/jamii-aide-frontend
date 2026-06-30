#!/usr/bin/env bash
# Smoke-test production endpoints after frontend/backend deploy.
# Usage: ./scripts/smoke-test-production.sh

set -euo pipefail

API_BASE="${API_BASE:-https://api.jamiiaide.com/api}"
APP_BASE="${APP_BASE:-https://app.jamiiaide.com}"

echo "== API reachability =="
curl -fsS -o /dev/null -w "GET ${API_BASE}/auth/me/ → HTTP %{http_code}\n" "${API_BASE}/auth/me/" || true

echo ""
echo "== App frontend =="
curl -fsS -o /dev/null -w "GET ${APP_BASE}/login → HTTP %{http_code}\n" "${APP_BASE}/login"
curl -fsS -o /dev/null -w "GET ${APP_BASE}/register → HTTP %{http_code}\n" "${APP_BASE}/register"

echo ""
echo "Manual checks:"
echo "  1. Log in at ${APP_BASE}/login"
echo "  2. Confirm role-based redirect (dashboard / nurse / admin)"
echo "  3. Load ${APP_BASE}/dashboard/appointments with a test user"
