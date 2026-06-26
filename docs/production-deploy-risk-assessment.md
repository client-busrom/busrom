# CDP Production Deployment Risk Assessment

**Project:** Busrom  
**Assessment date:** 2026-06-23  
**Scope:** Current working-tree changes related to CDP (Customer Data Platform), Payload CMS auth/cookie sharing, and Web frontend analytics.

## 1. Verdict

**DO NOT deploy to production as-is.** The current changes introduce several high-risk items that will cause CMS login/SSO failures, CDP API errors, and broken analytics if deployed without preparation.

## 2. Production-Relevant Changes

| File / Change | Deployed To | Required Config / Secret / Migration | Risk Level |
|---|---|---|---|
| `payload-cms/src/collections/Users.ts` — `auth.cookies.domain` now reads `PAYLOAD_COOKIE_DOMAIN` | CMS container runtime | `PAYLOAD_COOKIE_DOMAIN=.busromhouse.com` | **High** if wrong |
| `payload-cms/src/endpoints/auth-login.ts` — 2FA cookie clearing uses same domain | CMS container runtime | `PAYLOAD_COOKIE_DOMAIN` (must match cookie-set domain) | **High** if wrong |
| `payload-cms/src/components/admin/CustomNav.tsx` — new "数据分析" external link | CMS admin UI (client build) | `NEXT_PUBLIC_CDP_DASHBOARD_URL=https://cdp.busromhouse.com/` | Medium |
| `payload-cms/.env.example` | Documentation only | — | Low |
| `payload-cms/src/i18n/admin-labels.ts`, `custom-translations.ts` | CMS build | — | Low |
| `web/app/[locale]/layout.tsx` — mounts `<CDPProvider />` | Web build / runtime | — | Low (graceful degradation) |
| `web/app/components/CDPProvider.tsx`, `web/lib/analytics.ts` | Web client build | `NEXT_PUBLIC_CDP_ENDPOINT=https://cdp.busromhouse.com/api/analytics/track` | **High** if missing |
| `web/.env.example` | Documentation only | — | Low |
| `cdp/src/db/schema.ts` — `form_conversion_rate`, `leads`, `audit_logs`, trend columns | CDP runtime DB | Migration `0001_crazy_microchip.sql` | **High** if not run |
| `cdp/src/db/migrations/0001_crazy_microchip.sql` | Production `busrom_cdp` DB | Apply before CDP deploy | **High** if not run |
| `cdp/src/middleware.ts`, `cdp/src/lib/auth.ts` — JWT/role checks | CDP runtime | `PAYLOAD_SECRET`, `PAYLOAD_URL` | **High** if mismatch |
| `cdp/src/app/api/analytics/summary/route.ts` — uses new columns | CDP runtime | Migration + valid JWT | **High** if migration missing |
| `docker/superset/custom_security.py` — Superset SSO | Superset container runtime | `PAYLOAD_SECRET`, `PAYLOAD_COOKIE_DOMAIN`, `PAYLOAD_DB_URI`, `PAYLOAD_CMS_URL`, role mapping | **High** if misconfigured |
| `docker/nginx/production.conf` | Local/template only (uses `.busrom.local` upstreams) | Do **not** deploy as-is | **High** if deployed |
| `docs/*` | Documentation only | — | None |

## 3. Specific Question Answers

### Will Payload CMS login break if `PAYLOAD_COOKIE_DOMAIN` is missing or wrong?
- **Missing:** CMS login itself will still work because the code falls back to `undefined` (host-only cookie). However, cross-subdomain SSO to CDP and Superset will break, because the `payload-token` cookie will not be shared with `cdp.busromhouse.com`.
- **Wrong (e.g., `.busrom.local` in production):** Yes, login can break or behave inconsistently. The browser will refuse to send/store the cookie for `cms.busromhouse.com`, causing repeated redirects to the login page.
- **Required value:** `PAYLOAD_COOKIE_DOMAIN=.busromhouse.com` (leading dot so all subdomains can read it).

### Will the CMS "数据分析" nav link break if `NEXT_PUBLIC_CDP_DASHBOARD_URL` is missing?
- Yes. The component uses `process.env.NEXT_PUBLIC_CDP_DASHBOARD_URL || 'http://cdp.busrom.local/'`. If not set at **build time**, the production link points to the local development domain and will be unreachable.
- CMS build must receive `NEXT_PUBLIC_CDP_DASHBOARD_URL=https://cdp.busromhouse.com/`.

### Will CDP API break if the `busrom_cdp` migration is not run?
- Yes. `cdp/src/app/api/analytics/summary/route.ts` queries `trafficSummary.leads`, `trafficSummary.formConversionRate`, and the new `leads_change_*` columns. If `0001_crazy_microchip.sql` is not applied, these queries will fail with PostgreSQL `column does not exist` errors, returning HTTP 500.
- The `audit_logs` table is also created by this migration and is required by the CDP audit logging logic.

### Will Web frontend analytics break if `NEXT_PUBLIC_CDP_ENDPOINT` still points to `localhost:3003`?
- Yes. The `CDPProvider` initializes the tracker with that endpoint. In production, browser `fetch`/`sendBeacon` calls to `localhost:3003` will fail silently (the SDK catches errors). The website itself will keep functioning, but **no analytics data will be collected**.
- Must be set to `https://cdp.busromhouse.com/api/analytics/track` at Web build time.

### Are there any changes safe to deploy independently?
Yes:
- `payload-cms/src/i18n/*` translation changes.
- `web/lib/parsers/home-parser.ts` (`mediaData.sizes` fallback).
- `docs/*` documentation.
- Adding `<CDPProvider />` to `layout.tsx` is safe by itself because the SDK degrades gracefully when the endpoint is missing.

## 4. Additional Hidden Risks

### CDP env-var name mismatch
- `cdp/src/middleware.ts` and `cdp/src/lib/auth.ts` read `process.env.PAYLOAD_URL`.
- `cdp/.env.example` documents `PAYLOAD_CMS_URL`.
- If production is configured using the example file's variable name, CDP auth redirects and CMS URL derivation will fall back to `http://cms.busrom.local`.

### Build-time env vars are not wired into Dockerfiles
- `Dockerfile.web` does not define `ARG NEXT_PUBLIC_CDP_ENDPOINT`, so the fallback `localhost` URL is baked into the production image.
- `Dockerfile.payload-cms` does not define `ARG NEXT_PUBLIC_CDP_DASHBOARD_URL`, so the fallback `cdp.busrom.local` URL is baked into the admin UI.

### CDP production infrastructure is not provisioned
- `.aws-infrastructure-production.env` only lists `CMS_ECR_REPOSITORY` and `WEB_ECR_REPOSITORY`; there is no CDP ECR repo or ECS service recorded.
- Only `copilot/cdp/manifest.yml` exists as a deployment artifact. It uses `PAYLOAD_URL`, `DATABASE_URL`, and `PAYLOAD_SECRET`, but the copilot secrets paths point to `/copilot/busrom/production/cms/...` rather than CDP-specific paths.

### Superset SSO relies on direct Payload DB access
- `docker/superset/custom_security.py` connects to the Payload CMS PostgreSQL database to look up users/roles (`PAYLOAD_DB_URI`). This connection must be reachable from the Superset container and correctly configured in production.

## 5. Deployment Checklist

Before any production deployment:

- [ ] **Database**
  - [ ] Back up production `busrom_cdp` database.
  - [ ] Apply `cdp/src/db/migrations/0001_crazy_microchip.sql` to production `busrom_cdp`.
  - [ ] Verify `traffic_summary` has new columns: `form_conversion_rate`, `leads`, `leads_change_day`, `leads_change_week`, `leads_change_month`.
  - [ ] Verify `audit_logs` table exists.

- [ ] **Payload CMS**
  - [ ] Add `PAYLOAD_COOKIE_DOMAIN=.busromhouse.com` to CMS runtime secrets.
  - [ ] Ensure `PAYLOAD_SECRET` matches CDP and Superset.
  - [ ] Add build arg `NEXT_PUBLIC_CDP_DASHBOARD_URL=https://cdp.busromhouse.com/` to `Dockerfile.payload-cms`.
  - [ ] Update CI/CD and task definition to pass the new build arg.

- [ ] **Web Frontend**
  - [ ] Add build arg `NEXT_PUBLIC_CDP_ENDPOINT=https://cdp.busromhouse.com/api/analytics/track` to `Dockerfile.web`.
  - [ ] Update CI/CD and task definition to pass the new build arg.

- [ ] **CDP Service**
  - [ ] Provision CDP ECR repository / ECS service / ALB target or deploy via Copilot.
  - [ ] Set `DATABASE_URL` to production `busrom_cdp`.
  - [ ] Set `PAYLOAD_SECRET` to match CMS.
  - [ ] Set `PAYLOAD_URL=https://cms.busromhouse.com` (not `PAYLOAD_CMS_URL`, unless code is updated).
  - [ ] Set `ETL_API_KEY` to a strong random value.
  - [ ] Configure daily ETL trigger (cron/scheduler) or Vercel cron equivalent.

- [ ] **Superset (if deployed)**
  - [ ] Set `PAYLOAD_SECRET`, `PAYLOAD_COOKIE_DOMAIN=.busromhouse.com`, `PAYLOAD_CMS_URL=https://cms.busromhouse.com`, `PAYLOAD_DB_URI` to production Payload DB.
  - [ ] Configure `PAYLOAD_SSO_ALLOWED_ROLES` and role mapping.
  - [ ] Confirm Superset roles `Admin`, `Alpha`, `Gamma` exist.

- [ ] **Verification**
  - [ ] Log into CMS, click "数据分析", confirm it opens `https://cdp.busromhouse.com/`.
  - [ ] Confirm CDP `/api/analytics/summary?type=overview` returns 200 with valid JWT.
  - [ ] Confirm Web page loads and sends events to `https://cdp.busromhouse.com/api/analytics/track`.
  - [ ] Confirm Superset auto-login works from CMS.

## 6. Conclusion

Deploying the current tree without completing the checklist above will result in:
- Broken CMS→CDP/Superset SSO,
- Broken CDP analytics API (500 errors),
- Silent loss of all Web frontend analytics,
- A CMS nav link that points to a non-existent local domain,
- Potential Superset login loops.

The i18n and parser changes are safe, but all cookie/auth, build-time env-var, database-migration, and infrastructure prerequisites must be satisfied first.
