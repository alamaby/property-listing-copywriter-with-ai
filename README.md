# AI Property Copywriter

A web application for generating property listing copywriting using AI. Built with Next.js, Supabase, and OpenRouter API.

## Features

- 🔐 **Authentication** - Login and register with Supabase Auth
- 🤖 **AI Copywriting** - Automatically generate property copy using AI (Claude via OpenRouter)
- 💰 **Credit System** - Each user gets free credits to generate copy
- 📊 **Dashboard** - Manage and view copy generation history
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui

## Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account
- [OpenRouter](https://openrouter.ai) API Key

## Project Setup

### 1. Clone Repository

```bash
git clone https://github.com/alamaby/property-listing-copywriter-with-ai.git
cd ai-property
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=anthropic/claude-3-haiku
```

### 4. Setup Database

Run migrations in Supabase SQL Editor:

```bash
# Migration file location:
supabase/migrations/20240101000000_init_schema.sql
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run development server |
| `npm run build` | Build for production |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL + Auth)
- **AI**: [OpenRouter](https://openrouter.ai) (Claude 3 Haiku)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Icons**: [Lucide React](https://lucide.dev)

## Folder Structure

```
src/
├── app/              # Next.js App Router
│   ├── api/          # API Routes
│   ├── dashboard/    # Dashboard pages
│   ├── login/        # Login page
│   ├── register/     # Register page
│   └── page.tsx      # Landing page
├── components/       # React components
│   └── ui/           # shadcn/ui components
├── lib/              # Utility functions
├── services/         # Business logic services
└── utils/            # Helper utilities
    └── supabase/     # Supabase clients

supabase/
└── migrations/       # Database migrations
```

## Deploy

This app can be deployed to [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Don't forget to set up environment variables in the Vercel dashboard.

## License

MIT
