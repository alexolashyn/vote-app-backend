# Deployment Guide

## Overview

The backend uses a fully automated CI/CD pipeline built with GitHub Actions and deployed to [Render](https://render.com).

```
develop branch  →  Staging  (vote-app-backend-staging.onrender.com)
master branch   →  Production  (vote-app-backend.onrender.com)
```

---

## Environments

| Environment | Branch | URL |
|-------------|--------|-----|
| Staging | `develop` | `$STAGING_URL` (GitHub Variable) |
| Production | `master` | `$PRODUCTION_URL` (GitHub Variable) |

Both environments run on Render Web Service with a shared PostgreSQL database.

---

## CI/CD Pipeline

Every push to `develop` or `master`, and every pull request, triggers the pipeline automatically.

### Jobs

```
lint ──┬── test ──┬── build ──── version* ──── deploy-production*
       └── e2e ───┘             └── deploy-staging**
```

`*` runs only on `master`  
`**` runs only on `develop`

| Job | What it does |
|-----|-------------|
| **lint** | Runs ESLint across all source files |
| **test** | Runs unit tests with code coverage, uploads report to Codecov |
| **e2e** | Runs end-to-end tests against a local SQLite database |
| **build** | Compiles TypeScript via `nest build`, saves `dist/` as a build artifact (7 days) |
| **version** | Bumps version and creates a git tag using Semantic Versioning |
| **deploy-staging** | Triggers Render staging deploy, waits, runs health check |
| **deploy-production** | Triggers Render production deploy, waits, runs health check |

---

## Versioning

Versions are bumped automatically on every merge to `master` based on commit messages ([Conventional Commits](https://www.conventionalcommits.org)):

| Commit message | Version bump | Example |
|----------------|-------------|---------|
| `BREAKING CHANGE` in body | Major | `v1.2.3 → v2.0.0` |
| `feat: ...` | Minor | `v1.2.3 → v1.3.0` |
| `fix: ...`, `ci: ...`, etc. | Patch | `v1.2.3 → v1.2.4` |

A git tag (e.g. `v1.0.1`) is created and pushed automatically. Tags are visible in the GitHub **Tags** tab.

---

## Deployment Strategy (Blue-Green)

Two live environments (staging and production) are maintained at all times.

1. New code is deployed to **staging** first (via `develop` branch)
2. After manual verification on staging, a PR merges `develop` → `master`
3. The pipeline deploys to **production** and runs a health check (`GET /health`)
4. If the health check passes — deployment is complete
5. If it fails — the pipeline errors and the previous version stays live on Render

---

## Health Check

After every deployment the pipeline polls `GET /health` until it returns `200 OK` or times out.

- Staging: 10 attempts × 20 s = max 3 min 20 s
- Production: 15 attempts × 20 s = max 5 min

---

## How to Deploy

### Deploy to Staging
```bash
git checkout develop
# make changes, commit
git push origin develop
# pipeline runs automatically
```

### Deploy to Production
```bash
# option 1 — via Pull Request (recommended)
# open PR: develop → master on GitHub

# option 2 — direct merge
git checkout master
git merge develop
git push origin master
```

---

## Rollback

### Via Render Dashboard (recommended)
1. Open [Render Dashboard](https://dashboard.render.com)
2. Select the service (`vote-app-backend` or `vote-app-backend-staging`)
3. Go to **Events**
4. Find the last successful deploy → click **Rollback**

### Via Git
```bash
# revert the last commit and push to master
git revert HEAD
git push origin master
# pipeline will deploy the reverted version
```

---

## Required GitHub Secrets & Variables

| Type | Name | Description |
|------|------|-------------|
| Secret | `RENDER_DEPLOY_HOOK_URL` | Render production deploy hook |
| Secret | `RENDER_STAGING_DEPLOY_HOOK_URL` | Render staging deploy hook |
| Secret | `CODECOV_TOKEN` | Codecov upload token |
| Variable | `PRODUCTION_URL` | Production service URL |
| Variable | `STAGING_URL` | Staging service URL |

---

## Render Service Configuration

| Field | Value |
|-------|-------|
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `node ./node_modules/.bin/typeorm migration:run -d dist/data-source.js && node dist/main` |
| Node Version | 20 |

### Environment Variables (both services)

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Internal Database URL from Render PostgreSQL |
| `JWT_SECRET` | your secret key |
| `JWT_EXPIRES_IN` | `1h` |
| `PORT` | `4000` |
