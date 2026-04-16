"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { computeTradePnL } from "@/lib/trading/compute-pnl";
import { detectSession } from "@/lib/utils/tradingCalculations";
import { tradeUpsertSchema } from "@/lib/validations/trade";

export type TradeActionState =
  | { status: "idle" }
  | { status: "error"; message: string };

function formTradePayload(formData: FormData) {
  return {
    symbol: String(formData.get("symbol") ?? ""),
    direction: String(formData.get("direction") ?? ""),
    entryPrice: String(formData.get("entryPrice") ?? ""),
    exitPrice: String(formData.get("exitPrice") ?? ""),
    size: String(formData.get("size") ?? ""),
    fees: String(formData.get("fees") ?? ""),
    session: String(formData.get("session") ?? ""),
    entryTime: String(formData.get("entryTime") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    date: String(formData.get("date") ?? ""),
    tags: String(formData.get("tags") ?? ""),
  };
}

function revalidateTradeSurfaces() {
  revalidatePath("/trades");
  revalidatePath("/notebook");
  revalidatePath("/dashboard");
}

function resolveSession(
  explicitSession: string | undefined,
  entryTime: Date | undefined,
): string | undefined {
  if (explicitSession) return explicitSession;
  if (entryTime) return detectSession(entryTime);
  return undefined;
}

export async function createTrade(
  _prevState: TradeActionState,
  formData: FormData,
): Promise<TradeActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in." };
  }

  const parsed = tradeUpsertSchema.safeParse(formTradePayload(formData));
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.message)
      .join(" ");
    return { status: "error", message };
  }

  const pnl = computeTradePnL(parsed.data);
  const resolvedSession = resolveSession(
    parsed.data.session,
    parsed.data.entryTime,
  );

  await prisma.tradeLog.create({
    data: {
      userId: session.user.id,
      symbol: parsed.data.symbol,
      direction: parsed.data.direction,
      entryPrice: parsed.data.entryPrice,
      exitPrice: parsed.data.exitPrice,
      size: parsed.data.size,
      fees: parsed.data.fees,
      pnl,
      session: resolvedSession,
      entryTime: parsed.data.entryTime,
      notes: parsed.data.notes,
      date: parsed.data.date,
      tags: parsed.data.tags,
    },
  });

  revalidateTradeSurfaces();
  redirect("/trades");
}

export async function updateTrade(
  _prevState: TradeActionState,
  formData: FormData,
): Promise<TradeActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { status: "error", message: "Missing trade id." };
  }

  const parsed = tradeUpsertSchema.safeParse(formTradePayload(formData));
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.message)
      .join(" ");
    return { status: "error", message };
  }

  const existing = await prisma.tradeLog.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return { status: "error", message: "Trade not found." };
  }

  const pnl = computeTradePnL(parsed.data);
  const resolvedSession = resolveSession(
    parsed.data.session,
    parsed.data.entryTime,
  );

  await prisma.tradeLog.update({
    where: { id },
    data: {
      symbol: parsed.data.symbol,
      direction: parsed.data.direction,
      entryPrice: parsed.data.entryPrice,
      exitPrice: parsed.data.exitPrice,
      size: parsed.data.size,
      fees: parsed.data.fees,
      pnl,
      session: resolvedSession,
      entryTime: parsed.data.entryTime,
      notes: parsed.data.notes,
      date: parsed.data.date,
      tags: parsed.data.tags,
    },
  });

  revalidateTradeSurfaces();
  revalidatePath(`/trades/${id}`);
  redirect("/trades");
}

export async function deleteTrade(
  formData: FormData,
): Promise<{ error?: string } | undefined> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing trade id." };
  }

  const result = await prisma.tradeLog.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (result.count === 0) {
    return { error: "Trade not found." };
  }

  revalidateTradeSurfaces();
  return undefined;
}
