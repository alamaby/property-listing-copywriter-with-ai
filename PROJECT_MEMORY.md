# Project Memory — AI Property

Created: 2026-06-29

## Stack

- Next.js 15 (App Router, RSC, Server Actions), TypeScript, Tailwind CSS 4, shadcn/ui
- Supabase (Auth, Postgres, RLS) via `@supabase/ssr`
- i18n via next-i18next
- AI SDK (Google Gemini, OpenAI) via `ai` package

## Project Conventions

- Conventional Commits, 1 baris subject
- Prinsip: SOLID, Database as Code, Non-Destructive Migrations,
  End-to-End Type Safety, RLS, Optimal RSC, validation env,
  Clean Code, State Feedback & Submission Prevention,
  Data Fetching Optimization, i18n, First-Party Anti-Bot,
  Mobile-First Responsive Web Design
- Supabase client disusun di `src/utils/supabase/{client,server,middleware,service-role}.ts`
- Middleware file: `src/middleware.ts` (export fungsi `middleware`)
- Line ending: LF di repo (`* text=auto eol=lf` via `.gitattributes`)
- Agent tooling lokal: `.claude/`, `.kimchi/` di .gitignore

## Ringkasan Perubahan

### Commit: `refactor(supabase): consolidate clients, fix daily claim race, and normalize line endings`

**Tujuan:** Merapikan struktur Supabase client dan memperbaiki race condition pada daily claim credit.

**File penting yang diubah:**

| File | Perubahan |
|---|---|
| `src/middleware.ts` (new) | Menggantikan `src/proxy.ts` — middleware auth redirect (login↔dashboard) |
| `src/lib/supabase.ts` (hapus) | Tidak lagi digunakan |
| `src/lib/supabase/server.ts` (hapus) | Tidak lagi digunakan — semua import pindah ke `@/utils/supabase/server` |
| `src/proxy.ts` (hapus) | Digantikan `src/middleware.ts` |
| `src/app/actions/credit.ts` | Race condition fix: hapus check-then-insert, pakai partial unique index DB + map error code `23505` |
| `src/app/actions/auth.ts` | `signUp` return `{ success: true }` (tidak auto-redirect ke `/dashboard`) |
| `src/app/register/page.tsx` | Extract `RegisterForm` + `<Suspense>` (wajib Next.js 15), tambah `router.push('/login')` setelah 2 detik |
| `supabase/migrations/20260611000000_fix_daily_claim_race_condition.sql` (new) | Partial unique index `idx_daily_claim_per_user_per_day` |
| `.gitattributes` (new) | Normalisasi line ending ke LF untuk semua text file |
| `.gitignore` | Tambah `.claude/`, `.kimchi/`; untrack `supabase/.temp/cli-latest` |
| `src/app/actions/profile.ts`, `src/app/api/profile/route.ts`, `src/app/dashboard/page.tsx`, `src/app/dashboard/settings/actions.ts` | Update path import `@/lib/supabase/server` → `@/utils/supabase/server` |

**Keputusan teknis:**
- Daily claim uniqueness dijaga di DB (partial unique index), bukan di app layer.
- Email confirmation tetap aktif → signUp tidak bisa redirect ke /dashboard.
- `src/proxy.ts` diganti `src/middleware.ts` agar kompatibel dengan Next.js middleware API (export `middleware` not `proxy`).
- Line ending konsisten via `.gitattributes`, bukan `core.autocrlf` lokal (cross-platform).

## Risiko / TODO

- [ ] Apply migration `20260611000000_fix_daily_claim_race_condition.sql` ke dev/prod Supabase via `supabase db push`
- [ ] Verifikasi tidak ada duplicate `DAILY_CLAIM` di data lama sebelum index di-build (jika gagal, bersihkan dulu)
- [ ] Promosikan snippet RLS `supabase/snippets/Untitled query 434.sql` menjadi migration file resmi (allow self-INSERT `DAILY_CLAIM`)
- [x] Tambah `.claude/`, `.kimchi/`, `supabase/.temp/` ke `.gitignore` (sudah)
- [x] Hapus folder kosong `src/lib/supabase/` (sudah)
- [x] Normalisasi line ending via `.gitattributes` (sudah)

## Verifikasi yang Disarankan

```bash
pnpm tsc --noEmit
pnpm lint
pnpm build
git status --short      # pastikan working tree bersih
```

Untuk migration database:
```bash
supabase db push        # apply migration ke remote
pnpm dlx supabase db diff   # cek drift schema
```

## Propose Commit Message

- Untuk yang sudah di-commit: `refactor(supabase): consolidate clients, fix daily claim race, and normalize line endings`
- Untuk file ini: `docs: add PROJECT_MEMORY.md`
