"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { backtestUpsertSchema } from "@/lib/validations/backtest";

export type BacktestActionState =
  | { status: "idle" }
  | { status: "error"; message: string };

function formBacktestPayload(formData: FormData) {
  return {
    strategy: String(formData.get("strategy") ?? ""),
    timeframe: String(formData.get("timeframe") ?? ""),
    winningTrades: String(formData.get("winningTrades") ?? ""),
    totalTrades: String(formData.get("totalTrades") ?? ""),
    expectancy: String(formData.get("expectancy") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    date: String(formData.get("date") ?? ""),
    tags: String(formData.get("tags") ?? ""),
  };
}

function calculateBacktestWinRate(
  winningTrades: number,
  totalTrades: number,
): number {
  if (totalTrades <= 0) return 0;
  return (winningTrades / totalTrades) * 100;
}

function revalidateBacktestSurfaces() {
  revalidatePath("/backtests");
  revalidatePath("/notebook");
  revalidatePath("/dashboard");
}

export async function createBacktest(
  _prevState: BacktestActionState,
  formData: FormData,
): Promise<BacktestActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in." };
  }

  const parsed = backtestUpsertSchema.safeParse(formBacktestPayload(formData));
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(" ");
    return { status: "error", message };
  }

  await prisma.backtestNote.create({
    data: {
      userId: session.user.id,
      strategy: parsed.data.strategy,
      timeframe: parsed.data.timeframe,
      winRate: calculateBacktestWinRate(
        parsed.data.winningTrades,
        parsed.data.totalTrades,
      ),
      expectancy: parsed.data.expectancy,
      notes: parsed.data.notes,
      date: parsed.data.date,
      tags: parsed.data.tags,
    },
  });

  revalidateBacktestSurfaces();
  redirect("/backtests");
}

export async function updateBacktest(
  _prevState: BacktestActionState,
  formData: FormData,
): Promise<BacktestActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { status: "error", message: "Missing backtest id." };
  }

  const parsed = backtestUpsertSchema.safeParse(formBacktestPayload(formData));
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(" ");
    return { status: "error", message };
  }

  const existing = await prisma.backtestNote.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return { status: "error", message: "Backtest note not found." };
  }

  await prisma.backtestNote.update({
    where: { id },
    data: {
      strategy: parsed.data.strategy,
      timeframe: parsed.data.timeframe,
      winRate: calculateBacktestWinRate(
        parsed.data.winningTrades,
        parsed.data.totalTrades,
      ),
      expectancy: parsed.data.expectancy,
      notes: parsed.data.notes,
      date: parsed.data.date,
      tags: parsed.data.tags,
    },
  });

  revalidateBacktestSurfaces();
  revalidatePath(`/backtests/${id}`);
  redirect("/backtests");
}

export async function deleteBacktest(
  formData: FormData,
): Promise<{ error?: string } | undefined> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing backtest id." };
  }

  const result = await prisma.backtestNote.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (result.count === 0) {
    return { error: "Backtest note not found." };
  }

  revalidateBacktestSurfaces();
  return undefined;
}
