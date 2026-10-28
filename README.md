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

## Environment

| Variable | Default | Purpose |
| :-- | :-- | :-- |
| `VITE_API_URL` | empty | API base URL. Empty means same-origin `/api`, which the dev server proxies. Set it when the API is on another host. |
| `API_PROXY_TARGET` | `http://localhost:3000` in development | Backend URL used by SSR loaders. Set this in the SSR runtime environment when the API is not reachable at that address. |

The dev proxy target is `http://localhost:3000` in `vite.config.ts`.

## Routes

| Route | Page |
| :-- | :-- |
| `/` | Latest comments, forum sidebar, search bar |
| `/search?q=&forum=&page=` | Search results in the same layout |
| `/comments/:id` | Thread header and full reply tree |
| `/about` | Sources, detection explanation, disclaimer |
| `/admin/login` | Owner sign in |
| `/admin` | Search, hide/unhide, delete, block/unblock, blocked list, action log, collection status |
| `*` | "Page not found" |

## Project structure

```
app/
  root.tsx                SSR document and shared layout
  routes.ts               route table
  entry.client.tsx        browser hydration entry
  entry.server.tsx        server rendering entry
  routes/                 route loaders and page adapters
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

The Playwright suite lives in `../find-potential-stock/local-env/`:

```bash
cd ../find-potential-stock/local-env
npm run db:reset
npx playwright test --project=chromiumheadless
```

The Playwright config starts both the backend (`../../find-potential-stock-backend`) and this dev server unless
`START_WEB_SERVER=0`, so they do not need to be running separately. `URL` overrides the base URL.

## Deployment

`npm run build` produces client assets and an SSR server bundle. Run `npm run start` on a Node.js
host; set `PORT` when the default server port conflicts with the backend (for example, in
PowerShell use `$env:PORT = "5173"` before starting). Production deployments must route browser `/api`
requests to the backend with a same-origin
reverse proxy, and set `API_PROXY_TARGET` in the SSR runtime so server loaders can reach the backend.
Admin loaders forward only the incoming session cookie to the backend; do not forward it to other
origins.
