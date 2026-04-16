-- Manual schema for Supabase SQL Editor (PostgreSQL)
-- Matches prisma/schema.prisma models. Run once on an empty public schema
-- (or drop tables in reverse dependency order first).
--
-- Prisma generates CUIDs in the app; id columns have no DB default.
-- After creating tables, use `npx prisma migrate resolve` / baseline if you
-- adopt Prisma migrations later, or keep managing schema manually.

-- ---------------------------------------------------------------------------
-- "User"
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "User" (
  "id"            TEXT NOT NULL,
  "name"          TEXT,
  "email"         TEXT,
  "emailVerified" TIMESTAMP(3),
  "image"         TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" ("email");

-- ---------------------------------------------------------------------------
-- "Account"
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Account" (
  "id"                 TEXT NOT NULL,
  "userId"             TEXT NOT NULL,
  "type"               TEXT NOT NULL,
  "provider"           TEXT NOT NULL,
  "providerAccountId"  TEXT NOT NULL,
  "refresh_token"      TEXT,
  "access_token"       TEXT,
  "expires_at"         INTEGER,
  "token_type"         TEXT,
  "scope"              TEXT,
  "id_token"           TEXT,
  "session_state"      TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Account_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key"
  ON "Account" ("provider", "providerAccountId");

CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account" ("userId");

-- ---------------------------------------------------------------------------
-- "Session"
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Session" (
  "id"           TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "expires"      TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session" ("sessionToken");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session" ("userId");

-- ---------------------------------------------------------------------------
-- "VerificationToken"
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token"      TEXT NOT NULL,
  "expires"    TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key"
  ON "VerificationToken" ("identifier", "token");

-- ---------------------------------------------------------------------------
-- "DailyJournal"
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "DailyJournal" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "title"     TEXT NOT NULL,
  "content"   TEXT NOT NULL,
  "date"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tags"      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DailyJournal_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DailyJournal_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "DailyJournal_userId_idx" ON "DailyJournal" ("userId");
CREATE INDEX IF NOT EXISTS "DailyJournal_date_idx" ON "DailyJournal" ("date");

-- ---------------------------------------------------------------------------
-- "TradeLog"
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "TradeLog" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "symbol"      TEXT NOT NULL,
  "direction"   TEXT NOT NULL,
  "entryPrice"  DOUBLE PRECISION NOT NULL,
  "exitPrice"   DOUBLE PRECISION NOT NULL,
  "size"        DOUBLE PRECISION NOT NULL,
  "fees"        DOUBLE PRECISION NOT NULL DEFAULT 0,
  "pnl"         DOUBLE PRECISION NOT NULL,
  "notes"       TEXT,
  "date"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tags"        TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TradeLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TradeLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "TradeLog_userId_idx" ON "TradeLog" ("userId");
CREATE INDEX IF NOT EXISTS "TradeLog_date_idx" ON "TradeLog" ("date");

-- ---------------------------------------------------------------------------
-- "BacktestNote"
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "BacktestNote" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "strategy"    TEXT NOT NULL,
  "timeframe"   TEXT NOT NULL,
  "winRate"     DOUBLE PRECISION NOT NULL,
  "expectancy"  DOUBLE PRECISION NOT NULL,
  "notes"       TEXT,
  "date"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tags"        TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BacktestNote_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BacktestNote_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "BacktestNote_userId_idx" ON "BacktestNote" ("userId");
CREATE INDEX IF NOT EXISTS "BacktestNote_date_idx" ON "BacktestNote" ("date");
