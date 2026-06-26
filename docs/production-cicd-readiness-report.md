# Production CI/CD Readiness Report — CDP Integration

**Date:** 2026-06-23
**Scope:** Audit and fix production deployment configuration so the recent CDP-related changes can be deployed without errors.

## Executive Summary

The CI/CD and deployment configuration has been updated to support the new CDP (Customer Data Platform) service and the Payload CMS ↔ CDP/Superset integration. All type-checks still pass. The main remaining work is creating the AWS resources that do not yet exist (CDP ECR repository, ECS service, Secrets Manager secrets) and running the CDP database migration.

## Files Changed

| File | Change |
|------|--------|
| `Dockerfile.payload-cms` | Added `ARG NEXT_PUBLIC_CDP_DASHBOARD_URL` + `ENV` so the admin dashboard link is baked in at build time. |
| `Dockerfile.web` | Added `ARG NEXT_PUBLIC_CDP_ENDPOINT` + `ENV` so the web frontend tracker URL is baked in at build time. |
| `payload-cms/.env.example` | Added `PAYLOAD_URL` and production-ready comments for `PAYLOAD_COOKIE_DOMAIN` / `NEXT_PUBLIC_CDP_DASHBOARD_URL`. |
| `web/.env.example` | Added build-time comment and production example for `NEXT_PUBLIC_CDP_ENDPOINT`. |
| `cdp/.env.example` | Rewritten: renamed `PAYLOAD_CMS_URL` → `PAYLOAD_URL`, added `PAYLOAD_COOKIE_DOMAIN`, Superset SSO vars (`PAYLOAD_DB_URI`, `PAYLOAD_SSO_ALLOWED_ROLES`, etc.), and production examples. |
| `cdp/next.config.ts` | Made the CORS `Access-Control-Allow-Origin` header dynamic from `PAYLOAD_URL` instead of hard-coding `http://cms.busrom.local`. |
| `docker/superset/superset_config.py` | Made CORS origins dynamic via `SUPERSET_CORS_ORIGINS` env var instead of hard-coding local domains. |
| `.aws-infrastructure-production.env` | Added CDP & Superset ECR repositories/URIs and service placeholders; corrected CMS naming to `busrom-payload-cms-production`. |
| `scripts/ecs-task-definitions/cms-task-definition.json` | Updated to match current production (port 3002, container name `busrom-payload-cms`, CPU/memory 1024/2048, added `PAYLOAD_COOKIE_DOMAIN`, `NEXT_PUBLIC_CDP_DASHBOARD_URL`, correct Secrets Manager paths). |
| `scripts/ecs-task-definitions/web-task-definition.json` | Added `NEXT_PUBLIC_CDP_ENDPOINT` environment variable and corrected secret paths. |
| `scripts/ecs-task-definitions/cdp-task-definition.json` | **New.** CDP Fargate task definition template with `PAYLOAD_URL`, `PAYLOAD_COOKIE_DOMAIN`, `DATABASE_URL`, `PAYLOAD_SECRET`, `ETL_API_KEY`. |
| `copilot/cdp/manifest.yml` | Fixed `COOKIE_DOMAIN` → `PAYLOAD_COOKIE_DOMAIN`, added `NEXT_PUBLIC_CDP_ENDPOINT`, `CDP_ANONYMIZE_IP`, `ETL_API_KEY` secret, and production-ready values. |
| `.github/workflows/ci.yml` | Added CDP type-check job, CDP Docker build test, and build args for `NEXT_PUBLIC_CDP_DASHBOARD_URL` / `NEXT_PUBLIC_CDP_ENDPOINT`. |
| `.github/workflows/deploy-aws.yml` | Added CDP build/push/deploy job, build args for Payload CMS (`NEXT_PUBLIC_CDP_DASHBOARD_URL`) and Web (`NEXT_PUBLIC_CDP_ENDPOINT`), switched CMS/Web deploy steps to use local task-definition templates, added CDP health-check URL. |

## New Environment Variables / Build Args Added

### Build-time args (must reach Docker build)

| Service | Variable | Dockerfile default | Workflow secret |
|---------|----------|--------------------|-----------------|
| Payload CMS | `NEXT_PUBLIC_CDP_DASHBOARD_URL` | `https://cdp.busromhouse.com/` | `NEXT_PUBLIC_CDP_DASHBOARD_URL_PRODUCTION` / `_STAGING` |
| Web | `NEXT_PUBLIC_CDP_ENDPOINT` | `https://cdp.busromhouse.com/api/analytics/track` | `NEXT_PUBLIC_CDP_ENDPOINT_PRODUCTION` / `_STAGING` |

### Runtime environment / secrets

| Service | Variable | Where configured | Notes |
|---------|----------|------------------|-------|
| Payload CMS | `PAYLOAD_COOKIE_DOMAIN` | ECS task definition env | `.busromhouse.com` so `payload-token` is shared with CDP/Superset. |
| Payload CMS | `PAYLOAD_SECRET` | Secrets Manager → `PAYLOAD_SECRET` | Already exists; must match CDP/Superset. |
| CDP | `PAYLOAD_URL` | ECS task definition / Copilot env | Canonical CMS URL used for redirects and JWT validation. |
| CDP | `PAYLOAD_COOKIE_DOMAIN` | ECS task definition / Copilot env | `.busromhouse.com`. |
| CDP | `DATABASE_URL` | Secrets Manager → `CDP_DATABASE_URL` | **New secret required.** Same Postgres instance, separate `busrom_cdp` DB. |
| CDP | `PAYLOAD_SECRET` | Secrets Manager → `PAYLOAD_SECRET` | Reuses CMS secret. |
| CDP | `ETL_API_KEY` | Secrets Manager → `CDP_ETL_API_KEY` | **New secret required.** |
| CDP | `NEXT_PUBLIC_CDP_ENDPOINT` | ECS task definition / Copilot env | For documentation; not currently read by CDP source. |
| Superset | `PAYLOAD_SECRET` | Runtime env | Reuses CMS secret. |
| Superset | `PAYLOAD_COOKIE_DOMAIN` | Runtime env | `.busromhouse.com`. |
| Superset | `PAYLOAD_CMS_URL` | Runtime env | Canonical CMS URL (e.g. `https://cms.busromhouse.com`). |
| Superset | `PAYLOAD_DB_URI` | Runtime env | URI of the Payload CMS Postgres database. |
| Superset | `PAYLOAD_SSO_ALLOWED_ROLES` | Runtime env | Comma-separated Payload role codes allowed into Superset. |
| Superset | `PAYLOAD_SSO_DEFAULT_ROLE` | Runtime env | Fallback Superset role (default `Gamma`). |
| Superset | `PAYLOAD_SSO_ROLE_MAPPING` | Runtime env | Optional JSON role mapping. |
| Superset | `SUPERSET_CORS_ORIGINS` | Runtime env | Comma-separated origins allowed by CORS (e.g. `https://cms.busromhouse.com,https://cdp.busromhouse.com`). |

## PAYLOAD_URL vs PAYLOAD_CMS_URL Resolution

**Decision:** Update configuration to use `PAYLOAD_URL` everywhere.

- The CDP code (`cdp/src/middleware.ts`, `cdp/src/lib/auth.ts`) already reads `PAYLOAD_URL`.
- The old `cdp/.env.example` used `PAYLOAD_CMS_URL`, which would have been ignored at runtime.
- `copilot/cdp/manifest.yml` already set `PAYLOAD_URL` correctly.
- The ECS task definition template now sets `PAYLOAD_URL`.
- Superset SSO still uses `PAYLOAD_CMS_URL` (hard-coded in `docker/superset/custom_security.py`) and is documented as a separate Superset-specific variable.

This is the least-disruptive option because no CDP source code had to change.

## Verification Performed

- `cd payload-cms && npx tsc --noEmit` ✅
- `cd cdp && npm run type-check` ✅
- All ECS task-definition JSON templates are valid JSON ✅
- Dockerfiles contain required `ARG` lines for new build-time variables ✅
- Workflows reference all required secrets/env vars ✅
- No `cdp.busrom.local` or hard-coded local CORS origins remain in production-facing source/config (`cdp/next.config.ts`, `docker/superset/superset_config.py`) ✅

## AWS Read-Only Discovery

Using the `AdministratorAccess-660753258365` SSO profile:

- **ECR repositories:** `busrom-payload-cms-production`, `busrom-web-production`, `busrom-web-staging`. **No CDP or Superset repository exists yet.**
- **ECS cluster:** `busrom-cluster-production`.
- **ECS services:** `busrom-payload-cms-production`, `busrom-web-production`. **No CDP service exists yet.**
- **Secrets Manager:** CMS/Web secrets exist under `busrom/production/*`. **No CDP-specific or Superset SSO secrets exist yet.**

No mutating AWS commands were executed.

## Remaining Manual Steps for the User

1. **Create AWS Secrets Manager secrets** (production):
   - `busrom/production/CDP_DATABASE_URL` — e.g. `postgresql://user:pass@host:5432/busrom_cdp?sslmode=require`
   - `busrom/production/CDP_ETL_API_KEY` — long random string
   - `busrom/production/PAYLOAD_COOKIE_DOMAIN` — `.busromhouse.com`
   - `busrom/production/NEXT_PUBLIC_CDP_ENDPOINT` — `https://cdp.busromhouse.com/api/analytics/track`
   - `busrom/production/NEXT_PUBLIC_CDP_DASHBOARD_URL` — `https://cdp.busromhouse.com/`
   - For Superset SSO (if deploying Superset):
     - `busrom/production/PAYLOAD_DB_URI`
     - `busrom/production/PAYLOAD_SSO_ALLOWED_ROLES`
     - `busrom/production/PAYLOAD_SSO_DEFAULT_ROLE`
     - `busrom/production/PAYLOAD_SSO_ROLE_MAPPING`
     - `busrom/production/SUPERSET_SECRET_KEY`
     - `busrom/production/SUPERSET_CORS_ORIGINS`

2. **Create GitHub repository secrets** (Settings → Secrets and variables → Actions):
   - `NEXT_PUBLIC_CDP_ENDPOINT_PRODUCTION`
   - `NEXT_PUBLIC_CDP_ENDPOINT_STAGING` (optional)
   - `NEXT_PUBLIC_CDP_DASHBOARD_URL_PRODUCTION`
   - `NEXT_PUBLIC_CDP_DASHBOARD_URL_STAGING` (optional)
   - `ECR_REPOSITORY_CDP_PRODUCTION` (defaults to `busrom-cdp-production`)
   - `ECR_REPOSITORY_CDP_STAGING` (defaults to `busrom-cdp-staging`)
   - `ECS_SERVICE_CDP_PRODUCTION` (defaults to `busrom-cdp-production`)
   - `ECS_SERVICE_CDP_STAGING` (defaults to `busrom-cdp-staging`)
   - `AWS_ACCOUNT_ID` (defaults to `660753258365`)

3. **Create AWS ECR repository** for CDP:
   ```bash
   aws ecr create-repository --repository-name busrom-cdp-production --region us-east-1
   ```
   (and `busrom-superset-production` if deploying Superset).

4. **Create the CDP ECS service** (Fargate) or deploy via Copilot **before** the first `deploy-cdp` workflow run:
   - Use `scripts/ecs-task-definitions/cdp-task-definition.json` as the task definition base.
   - Target group / listener rules for `cdp.busromhouse.com` must be configured on the ALB.

5. **Run the CDP database migration** before the first deploy:
   ```bash
   cd cdp
   DATABASE_URL="postgresql://..." npm run db:migrate
   ```
   The migration file `cdp/src/db/migrations/0001_crazy_microchip.sql` must be applied.

6. **Verify Superset deployment** (if applicable):
   - Build and push `docker/superset/Dockerfile` to `busrom-superset-production`.
   - Ensure the Superset service receives `PAYLOAD_SECRET`, `PAYLOAD_COOKIE_DOMAIN`, `PAYLOAD_CMS_URL`, `PAYLOAD_DB_URI`, `PAYLOAD_SSO_ALLOWED_ROLES`, and `SUPERSET_CORS_ORIGINS`.

## Unresolved Blockers / Warnings

1. **Domain mismatch in live Payload CMS config.** The currently running CMS task sets `NEXT_PUBLIC_SERVER_URL=https://cms.busrom.com`, while this report and templates assume `https://cms.busromhouse.com`. Decide which domain is canonical and update the live task definition / CMS config accordingly.
2. **CDP ECS service does not exist yet.** The `deploy-cdp` job will fail on first run unless the service, target group, and listener rules are created first.
3. **Superset is not yet managed by the GitHub workflow.** Only the CDP Next.js service was added to CI/CD. Superset image build/push/deploy remains a manual step (or Copilot-managed).
4. **Weak break-glass admin in `docker/superset/start.sh`.** The default Superset admin is created with password `admin123`. Rotate this immediately after first Superset deploy.
5. **`.env.example` files retain localhost defaults.** Local development defaults (`http://localhost:3003`) are still present, but each variable now has a production example in the comments. No production-facing config (Dockerfile, task definition, workflow) contains these placeholders.
