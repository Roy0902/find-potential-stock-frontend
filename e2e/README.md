# E2E Tests

Playwright UI and API suite for the find-potential-stock frontend and backend.

This folder is a self-contained copy of the suite from
`../../find-potential-stock/local-env`, which remains the workflow source of truth
(specs, seed data and the freeze guard). Keep the two in sync when tests change.

## Requirements

- Node.js 22 or later.
- PostgreSQL with the `find_potential_stock` schema and deterministic seed.
- The backend repository at `../../find-potential-stock-backend`.
- Chromium for Playwright.

This repository does not ship the database setup scripts. In the workspace, prepare the
database from `local-env`:

```bash
npm --prefix ../../find-potential-stock/local-env run db:setup
npm --prefix ../../find-potential-stock/local-env run db:reset
```

Point `DATABASE_URL` at an equivalent database if yours is elsewhere.

## Install

```bash
cd e2e
npm install
npx playwright install chromium
```

## Run

```bash
npm test                 # all UI and API tests
npm run test:smoke       # @smoke only
npm run test:headed      # headed browser
npm run test:report      # open the last HTML report
npm run typecheck
```

The default command starts the backend, the SSR failure proxy and the frontend. Set
`START_WEB_SERVER=0` to use servers you start yourself; then start the backend on
`API_URL` and the frontend with `API_PROXY_TARGET=http://127.0.0.1:3100`.

The verified replacement suite for the scenarios blocked in
`10-verification/report.md` is:

```bash
npx playwright test tests/specs/followup.spec.ts
```

A raw `npm test` also runs the original frozen tests, including their known-red
scenarios.

## Environment

| Variable | Default | Purpose |
| :-- | :-- | :-- |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/find_potential_stock` | Direct database access for arranging test data |
| `URL` | `http://localhost:5173` | Playwright base URL |
| `API_URL` | `http://localhost:3000` | Backend used by API tests and the SSR proxy target |
| `WEB_SERVER_URL` | `http://localhost:5173` | Frontend readiness URL for `webServer` |
| `START_WEB_SERVER` | starts the servers | Set to `0` to manage servers yourself |
| `FAILURE_PROXY_URL` | `http://127.0.0.1:3100` | SSR API failure-injection proxy |
| `DB_RESET_COMMAND` | `npm --prefix ../../find-potential-stock/local-env run db:reset` | Reseed between admin follow-up tests |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `owner` / `change-me` | Owner login for `npm run auth:setup` |

`.env` is not loaded automatically; export these variables in your shell or CI job. Local
environment files (`.env`, `.env.*`, including `.env.example`) are gitignored; use the table above
as the template.

## Layout

```
playwright.config.ts       chromiumheadless project, webServer wiring, reporters
tests/
  fixtures/setup.ts        registers the page and gates page.goto on hydration
  utils/hydration.ts       React Router + React commit readiness check
  utils/api-failure.ts     toggles the SSR API failure proxy
  utils/db.ts              direct database access for test arrangement
  support/api-failure-proxy.mjs  passthrough proxy for SSR error-state tests
  storage-setup/           writes playwright/.auth/owner.json
  specs/                   UI journeys
  api/                     API contract tests
  testdata/api/            API baselines
  harness.spec.ts          harness self-check
```

## SSR notes

- HTML is server-rendered before React hydrates. The `page` fixture wraps `page.goto`
  and waits for the React Router payload plus React's DOM commit before interaction.
- Server loaders fetch data in Node, so `page.route` cannot intercept them. Use
  `withApiFailure()` from `tests/utils/api-failure.ts` instead.
- The webServer entries force `SCRAPE_ENABLED=false` and `SCRAPE_RUN_ON_START=false`
  so live scraping cannot change fixture counts during a run.
