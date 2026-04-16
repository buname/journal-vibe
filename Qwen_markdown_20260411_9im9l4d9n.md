# Trading & Life Journal - Cursor AI Development Prompt

You are a senior full-stack architect building a personal Trading & Life Journal application. This is NOT a typical SaaS dashboard - it's a personal, fluid, note-focused digital notebook that combines daily life entries, market observations, trade details, backtest documentation, and PnL tracking in a unified timeline/notebook interface.

## TECH STACK
- **Framework:** Next.js 15+ (App Router, Server Components, Server Actions)
- **Language:** TypeScript (strict: true, zero `any`)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth v5 (Google provider + Prisma adapter)
- **UI:** shadcn/ui + Tailwind CSS + Lucide React
- **Forms:** React Hook Form + Zod + @hookform/resolvers
- **Charts:** Recharts
- **Utils:** sonner (toasts), nuqs (URL state), date-fns, clsx, tailwind-merge
- **State:** Server-first architecture. Client state only for interactivity
- **Env:** @t3-oss/env-nextjs for validation

## ARCHITECTURE PRINCIPLES
- **Folder Structure:** `app/(auth)`, `app/(journal)`, `app/(dashboard)`, `components/ui`, `components/editor`, `components/trading`, `components/layout`, `lib/actions`, `lib/utils`, `lib/validations`, `prisma/`, `types/`
- **Notebook Logic:** All content (journals, trades, backtests) displayed in timeline/calendar view or category-filtered cards
- **Server-First:** All data operations via Server Actions. Pass only serialized JSON to client
- **Styling:** Clean, focused, readable. Dark/Light mode mandatory
- **Relations:** Journals, trades, and backtests connectable via tags, dates, or explicit relations

---

## PHASE 1: CORE INFRASTRUCTURE, AUTH & DAILY JOURNAL ENGINE

**Setup & Configuration:**
1. Initialize Next.js 15 with TypeScript, Tailwind, ESLint, App Router, src/ directory
2. Install dependencies: prisma, @prisma/client, next-auth, react-hook-form, zod, @hookform/resolvers, sonner, lucide-react, @radix-ui/react-*, recharts, clsx, tailwind-merge, class-variance-authority, date-fns, nuqs, @t3-oss/env-nextjs
3. Run `npx shadcn@latest init` and add: button, input, dialog, table, card, dropdown-menu, toast, form, select, sheet, skeleton, calendar, textarea, popover

**Database Schema:**
Create `prisma/schema.prisma`:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
  journals  DailyJournal[]
  trades    TradeLog[]
  backtests BacktestNote[]
}

model DailyJournal {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  content   String   @db.Text
  date      DateTime @default(now())
  tags      String[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model TradeLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  symbol      String
  direction   String   // "LONG" | "SHORT"
  entryPrice  Float
  exitPrice   Float
  size        Float
  fees        Float    @default(0)
  pnl         Float
  notes       String?  @db.Text
  date        DateTime @default(now())
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model BacktestNote {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  strategy    String
  timeframe   String
  winRate     Float
  expectancy  Float
  notes       String?  @db.Text
  date        DateTime @default(now())
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}