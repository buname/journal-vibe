export const DB_OFFLINE_MESSAGE =
  "Database is offline — start PostgreSQL to save. Nothing was written to disk.";

export function isDbConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const name = "name" in error ? String(error.name) : "";
  const message = "message" in error ? String(error.message) : "";

  return (
    name.includes("PrismaClientInitializationError") ||
    message.includes("Can't reach database server") ||
    message.includes("Connection refused")
  );
}

export function dbActionError(error: unknown, fallback: string): string {
  if (isDbConnectionError(error)) {
    return DB_OFFLINE_MESSAGE;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function rethrowIfRedirect(error: unknown): void {
  if (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  ) {
    throw error;
  }
}
