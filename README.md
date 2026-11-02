# Frontend

React 18 + React Router framework mode (SSR) + TypeScript with Tailwind CSS and shadcn/ui-compatible
components. Public comment archive, comment detail, about page, owner login and admin page.

Tailwind is configured in `tailwind.config.js` and `postcss.config.js`. Shared shadcn-style controls
live in `src/components/ui/`; use `Button`, `Input`, and the `cn` helper for new UI. The global
Tailwind entry point and theme tokens are in `src/styles.css`; page and component styling uses
Tailwind utility classes. Displayed English copy is centralized in `src/locales/en.ts`.

This folder lives at the workspace root (`C:\Users\pigcr\Documents\Workspace\find-potential-stock-frontend`), outside
the `find-potential-stock` git repository. The database tooling and Playwright suite stay in
`../find-potential-stock/local-env/`.

## Requirements

- Node.js 22 or later
- The backend running on `http://localhost:3000` (see `../find-potential-stock-backend/README.md`)

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173, SSR enabled, /api proxied to :3000
```

If the backend is not running, pages load but show "Something went wrong." with a Retry button.

## Scripts

| Script | Purpose |
| :-- | :-- |
| `npm run dev` | SSR development server on 5173 with `/api` proxied to `http://localhost:3000` |
| `npm run build` | Generate route types, type check, and build the SSR server/client bundles |
| `npm run start` | Run the built SSR server |
| `npm run dev:cf` | Run the app in the Cloudflare Workers runtime |
| `npm run build:cf` | Build the Cloudflare Workers bundle into `build-cloudflare/` |
| `npm run deploy:cf` | Build and deploy the Worker with Wrangler |

## Environment

| Variable | Default | Purpose |
| :-- | :-- | :-- |
| `VITE_API_URL` | empty | Build-time browser API base. Leave empty so the browser calls same-origin `/api`. |
| `API_PROXY_TARGET` | unset; SSR loaders fall back to `http://localhost:3000` | Runtime backend URL used by SSR loaders and the `/api` proxy. The `/api` proxy returns `503` until it is set. |
| `PORT` | `3000` for `start`, `5173` for `dev` | Listen port. The Docker image sets `8080`. |

`/api/*` is handled by `app/routes/api.proxy.ts` in production, so the SSR server proxies
browser requests to `API_PROXY_TARGET` itself. The Vite dev server still proxies `/api` to
`http://localhost:3000` for convenience.

## Routes

| Route | Page |
| :-- | :-- |
| `/` | Latest comments, forum sidebar, search bar |
| `/search?q=&forum=&page=` | Search results in the same layout |
| `/comments/:id` | Thread header and full reply tree |
| `/about` | Sources, detection explanation, disclaimer |
| `/admin/login` | Owner sign in |
| `/admin` | Search, hide/unhide, delete, block/unblock, blocked list, action log, collection status |
| `/health` | Liveness probe used by the Docker health check |
| `*` | "Page not found" |

## Project structure

```
app/
  root.tsx                SSR document and shared layout
  routes.ts               route table
  entry.client.tsx        browser hydration entry
  entry.server.tsx        Web Streams server rendering entry (Node + Workers)
  routes/                 route loaders and page adapters
  routes/api.proxy.ts     same-origin /api reverse proxy
workers/
  app.ts                  Cloudflare Worker entry
src/
  api/
    client.ts             fetch wrapper, ApiError, envelope unwrapping
    commentQueries.ts     listComments, getComment
    threadQueries.ts      getThread
    forumQueries.ts       listForums
    admin/auth.ts         login, logout
    admin/comments.ts     listAdminComments, setCommentHidden, deleteComment
    admin/authors.ts      listBlockedAuthors, blockAuthor, unblockAuthor
    admin/operations.ts   listActions, listScrapeRuns (collection/cron category)
    index.ts              re-exports
  types/                  common, comment, thread, forum, admin, index
  lib/                    format (author/time), urls (searchPath), constants
  locales/en.ts           displayed English copy and parameterized messages
  hooks/                  interactive admin data refresh
  components/
    ui/                  Tailwind/shadcn-style Button and Input primitives
    common/               StateMessage (base for empty/error panels)
    layout/               Bar (base header), SiteName, Header, AdminBar, Footer,
                          SkipLink, PageShell (bar + main + footer)
    search/               SearchBar
    forums/               ForumSidebar
    comments/             CommentCard, CommentGrid, Pagination, Empty/Error/Loading
    thread/               ThreadComment (recursive), ThreadHeader
    admin/                ConfirmDialog, AdminCommentRow, BlockedAuthorList,
                          ActionLog, ScrapeRunList, AdminSection
  pages/                  ArchivePage, CommentPage, AboutPage, NotFoundPage
  pages/admin/            AdminLoginPage, AdminPage
  styles.css              Tailwind entry point and theme tokens
```

Imports use the `@/` alias (`@/api`, `@/components/...`), configured in `vite.config.ts` and
`tsconfig.json`.

The public API modules are named `*Queries.ts` on purpose. A file at `src/api/comments.ts` would be
served by Vite at `/src/api/comments.ts`, which collides with Playwright route globs such as
`**/api/comments**` and blanks the page during failure tests.

## API contract

The backend wraps every response as `{ code, message, data }`. `api/client.ts` unwraps `.data` and
turns failures into `ApiError` (`status`, `code`, `message`, `sourceUrl`). Pages never parse the
envelope directly.

## UI contract

Locators and copy are fixed by
`../find-potential-stock/spec-to-test-workflow/find-potential-stock/04-checklist/shared-checklist.md`
§4: searchbox "Search comments", button "Search", nav "Forums", list "Comments", buttons
"Previous"/"Next"/"Load more", links "View original post"/"View on source site"/"View thread on
source site", copy "No comments match your search,", "Something went wrong.", "Page not found",
"Go to home", "This comment is no longer available,".

Changing these strings breaks the locked Playwright tests.

## Disclaimer

The footer shows "This project does not aim to provide financial advice." on every page, and the
About page repeats it. The backend exposes the same statement at `GET /api/disclaimer`.

## Testing

The committed Playwright suite is in `e2e/` (UI and API). It is a copy of the canonical
workflow suite in `../find-potential-stock/local-env/`, which also owns the database seed and
frozen plans.

```bash
# from this folder, prepare the database once
npm --prefix ../find-potential-stock/local-env run db:reset

cd e2e
npm install
npx playwright install chromium
npm test
```

The Playwright config starts the backend (`../../find-potential-stock-backend`), the SSR failure
proxy and this dev server unless `START_WEB_SERVER=0`. `URL` overrides the base URL. See
[`e2e/README.md`](e2e/README.md) for environment variables and the verified follow-up suite.

## Docker

The image is built on `node:22-bookworm-slim` (Debian 12 LTS) and runs as a non-root user on port
`8080`. It does not bake in a backend URL; pass `API_PROXY_TARGET` when the container starts.

```bash
docker build -t find-potential-stock-frontend .

docker run --rm -p 8080:8080 \
  -e API_PROXY_TARGET=https://api.example.com \
  find-potential-stock-frontend
```

The browser calls same-origin `/api`; the container proxies those requests to
`API_PROXY_TARGET`, and React Router loaders use the same value server-side. The image health check
calls `/health`, which does not depend on the backend. Docker is not required to run the app on a
Node host: `npm run build && npm start` works the same way.

## Cloudflare Workers

Cloudflare Pages does not run Docker images. This project targets Cloudflare Workers with static
assets, which is the current Cloudflare React Router deployment path.

```bash
# Local: point at a backend reachable from your machine.
cp .dev.vars.example .dev.vars
npm run dev:cf

# Production: deploy once, then store the backend URL as a Worker secret.
npm run deploy:cf
npx wrangler secret put API_PROXY_TARGET
```

Until the secret is set, `/api` returns `503` because no target is configured.

`API_PROXY_TARGET` must be a publicly reachable HTTPS URL. A Worker cannot reach a private Docker
container directly; expose the backend through a public hostname or a Cloudflare Tunnel.

The Worker entry is `workers/app.ts`, and its configuration is `wrangler.jsonc`. The Cloudflare
build uses `vite.cloudflare.config.ts` and writes the deployable Worker to `build-cloudflare/server/`,
keeping it separate from the Node/Docker `build/` output.

## Production notes

- `/api/*` is proxied by the app (`app/routes/api.proxy.ts`) in both Docker and Workers, so the
  browser stays same-origin and does not need CORS.
- Admin requests still forward the browser's `Origin` header to the backend. Set the backend's
  `CORS_ORIGIN` to the frontend's public origin, or accept same-origin proxied requests there.
- Admin loaders forward only the incoming session cookie to the backend; do not forward it to other
  origins.
- Set `PORT` when the Node server port conflicts with another process (for example, in PowerShell
  use `$env:PORT = "5173"` before `npm start`).
