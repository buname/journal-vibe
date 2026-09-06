"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { JournalEntryCard } from "@/components/journal/journal-entry-card";
import { Input } from "@/components/ui/input";

type JournalEntryListItem = {
  id: string;
  title: string;
  date: Date;
  rating: number | null;
  tags: string[];
  images: string[];
  excerpt: string;
};

type JournalEntryListProps = {
  entries: JournalEntryListItem[];
};

export function JournalEntryList({ entries }: JournalEntryListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return entries;

    return entries.filter((entry) => {
      const haystack = [
        entry.title,
        entry.excerpt,
        ...entry.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [entries, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tracking-tight">All entries</h2>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search entries…"
            className="pl-9"
            aria-label="Search journal entries"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          {query.trim()
            ? "No entries match your search."
            : "No entries yet."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
