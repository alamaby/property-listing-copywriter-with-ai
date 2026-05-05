# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next`)
- No test runner is configured.

Path alias: `@/*` → `./src/*`.

## Next.js 16 specifics (read before writing any Next code)

This project uses Next.js 16 + React 19. Several conventions differ from older Next.js you may have seen in training data:

- **Middleware lives in `src/proxy.ts`, not `middleware.ts`.** It exports a `proxy()` function (not `middleware()`). The `config.matcher` shape is the same.
- Route handler params are async (e.g. `{ params: Promise<{ id: string }> }`) — see commit `13cf53b`.
- `AGENTS.md` instructs reading `node_modules/next/dist/docs/` before writing Next code; if that path is absent (fresh worktree without `node_modules`), run `npm install` first.

## Architecture

### Auth + route gating
Supabase Auth via `@supabase/ssr`. Client factories under `src/utils/supabase/`:
- `client.ts` — browser client
- `server.ts` — RSC / route-handler client (cookies via `next/headers`)
- `service-role.ts` — bypasses RLS; **only** for trusted server code (ledger writes, log writes)
- `middleware.ts` — session refresh helper used by `proxy.ts`

`src/proxy.ts` refreshes the session and gates `/dashboard/*` (redirects unauthed to `/login`) and `/login|/register` (redirects authed users to `/dashboard`).

### Credit ledger
Credits are an append-only ledger, not a counter. Balance = `SUM(amount)` over `credit_transactions` for the user. Transaction types: `EARN`, `USAGE` (negative amount), `EXPIRED`, `WELCOME_BONUS`, `REFUND`. New users get 3 welcome credits via the `handle_new_user` trigger on `auth.users` insert.

When deducting credits, write with the **service-role client** to bypass RLS (RLS only grants SELECT to the owner). Canonical pattern in `src/app/api/generate-copy/route.ts`: check balance with the user-scoped client, then insert the `-1 USAGE` row with the service-role client.

### AI generation
`src/app/api/generate-copy/route.ts` (edge runtime) is the core flow:
1. Validate + sanitize input
2. Auth check via user-scoped Supabase client
3. Pull profile prefs (signature, writing style, language) via server action
4. Check credit balance (sum ledger)
5. Pick provider: `ACTIVE_AI_PROVIDER` env switches between OpenRouter (default, `OPENROUTER_MODEL`) and Google Gemini (`GEMINI_MODEL`). Both go through the Vercel AI SDK's `generateText`.
6. On success/failure, log to `llm_logs` with the service-role client; on success, insert the `-1 USAGE` row.
7. Strip ` ```json ` fences from model output before `JSON.parse`.

Adding a new provider: extend the model-selection branch and update the `actualModelUsed` log field.

### Database
Schema in `supabase/migrations/*.sql`. Core tables: `profiles`, `credit_transactions`, `llm_logs` (later migrations add daily-claim / referral). RLS is on for all three; admin reads use the `is_admin()` `SECURITY DEFINER` helper to avoid recursion. Run migrations manually in the Supabase SQL Editor.

### UI
- shadcn/ui, style `radix-nova`, components in `src/components/ui/`. Use `cn()` from `@/lib/utils`.
- Tailwind CSS 4 (PostCSS plugin); global theme tokens in `src/app/globals.css` — use theme variables, not hex literals (see commit `fd4b6a3`).
- `next-themes` for dark mode; `sonner` for toasts.
- i18n: `next-i18next` with `en` + `id` locales (`src/i18n/locales/`).

### Observability
`/api/health` is pinged daily by `.github/workflows/health-check.yml` against the Vercel deployment. Keep it cheap and dependency-free.

## Conventions worth preserving

- Prefer the service layer (`src/services/*`) over inlining Supabase queries in route handlers.
- Server actions live in `src/app/actions/` (auth, credit, profile) and `src/app/dashboard/*/actions.ts` for page-local actions.
- Use the service-role client **only** for ledger writes and log writes — never for reads on behalf of a user.
