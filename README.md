# journal-vibe

Personal trading and life journal built with Next.js, Auth.js, Prisma, and PostgreSQL.

## Features

- Google sign-in with Auth.js (NextAuth v5)
- Private journal, trades, and backtest notes
- Unified notebook timeline with filters
- Dashboard metrics and charts
- Daily perspective bar (refreshes on local day rollover at 03:00)
- Linked tags (`keyword|https://...`) that open source videos/articles

## Tech Stack

- Next.js 15 (App Router), React 19, TypeScript
- Auth.js / NextAuth v5 + Prisma Adapter
- Prisma ORM + PostgreSQL
- Tailwind CSS + shadcn/ui

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Fill required variables in `.env`:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

4. Run Prisma and start dev server:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Authentication Notes

- OAuth callback path: `/api/auth/callback/google`
- On Vercel, set env vars in project settings.
- `AUTH_URL` is optional when `trustHost: true`; only set it if you need to force a specific domain.

## Project Scripts

- `npm run dev` - Start local development server
- `npm run build` - Production build
- `npm run start` - Run production server
- `npm run lint` - Run lint checks

## Deployment

Deploy to Vercel and add the same environment variables from `.env` in Vercel Project Settings.
