"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { dbActionError, rethrowIfRedirect } from "@/lib/db-errors";
import { prisma } from "@/lib/db";
import { journalUpsertSchema } from "@/lib/validations/journal";

export type JournalActionState =
  | { status: "idle" }
  | { status: "error"; message: string };

function formJournalPayload(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    date: String(formData.get("date") ?? ""),
    tags: String(formData.get("tags") ?? ""),
    images: String(formData.get("images") ?? ""),
    rating: String(formData.get("rating") ?? "0"),
  };
}

export async function createJournal(
  _prevState: JournalActionState,
  formData: FormData,
): Promise<JournalActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in." };
  }

  const parsed = journalUpsertSchema.safeParse(formJournalPayload(formData));
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(" ");
    return { status: "error", message };
  }

  try {
    await prisma.dailyJournal.create({
      data: {
        userId: session.user.id,
        title: parsed.data.title,
        content: parsed.data.content,
        date: parsed.data.date,
        tags: parsed.data.tags,
        images: parsed.data.images,
        rating: parsed.data.rating,
      },
    });

    revalidatePath("/journal");
    revalidatePath("/notebook");
    revalidatePath("/dashboard");
    redirect("/journal?saved=1");
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      status: "error",
      message: dbActionError(error, "Could not save journal entry."),
    };
  }
}

export async function updateJournal(
  _prevState: JournalActionState,
  formData: FormData,
): Promise<JournalActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { status: "error", message: "Missing journal id." };
  }

  const parsed = journalUpsertSchema.safeParse(formJournalPayload(formData));
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(" ");
    return { status: "error", message };
  }

  try {
    const existing = await prisma.dailyJournal.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return { status: "error", message: "Journal entry not found." };
    }

    await prisma.dailyJournal.update({
      where: { id },
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        date: parsed.data.date,
        tags: parsed.data.tags,
        images: parsed.data.images,
        rating: parsed.data.rating,
      },
    });

    revalidatePath("/journal");
    revalidatePath(`/journal/${id}`);
    revalidatePath("/notebook");
    revalidatePath("/dashboard");
    redirect(`/journal/${id}?saved=1`);
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      status: "error",
      message: dbActionError(error, "Could not update journal entry."),
    };
  }
}

export async function deleteJournal(
  formData: FormData,
): Promise<{ error?: string } | undefined> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Missing journal id." };
  }

  try {
    const result = await prisma.dailyJournal.deleteMany({
      where: { id, userId: session.user.id },
    });

    if (result.count === 0) {
      return { error: "Journal entry not found." };
    }

    revalidatePath("/journal");
    revalidatePath("/notebook");
    revalidatePath("/dashboard");
    return undefined;
  } catch (error) {
    rethrowIfRedirect(error);
    return { error: dbActionError(error, "Could not delete journal entry.") };
  }
}
