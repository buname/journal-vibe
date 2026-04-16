import type { NotebookKind } from "@/types/notebook";

export type NotebookFilter = "all" | NotebookKind;

export function parseNotebookKind(raw: string | undefined): NotebookFilter {
  if (raw === "journal" || raw === "trade" || raw === "backtest") {
    return raw;
  }
  return "all";
}
