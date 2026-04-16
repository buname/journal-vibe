-- Add session + entryTime columns and indexes to TradeLog
-- Run in Supabase SQL Editor after the initial schema is applied.

ALTER TABLE "TradeLog" ADD COLUMN IF NOT EXISTS "session"   TEXT;
ALTER TABLE "TradeLog" ADD COLUMN IF NOT EXISTS "entryTime" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "TradeLog_userId_idx"  ON "TradeLog" ("userId");
CREATE INDEX IF NOT EXISTS "TradeLog_date_idx"    ON "TradeLog" ("date");
CREATE INDEX IF NOT EXISTS "TradeLog_session_idx" ON "TradeLog" ("session");
