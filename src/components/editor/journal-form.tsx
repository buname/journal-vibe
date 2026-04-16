"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createJournal,
  updateJournal,
  type JournalActionState,
} from "@/lib/actions/journal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { formatInputDate } from "@/lib/format";

type JournalFormProps =
  | { mode: "create" }
  | {
      mode: "edit";
      journal: {
        id: string;
        title: string;
        content: string;
        date: Date;
        rating: number | null;
        tags: string[];
      };
    };

const initialState: JournalActionState = { status: "idle" };

export function JournalForm(props: JournalFormProps) {
  const action = props.mode === "create" ? createJournal : updateJournal;
  const [state, formAction, pending] = useActionState(action, initialState);

  const defaults =
    props.mode === "edit"
      ? {
          title: props.journal.title,
          content: props.journal.content,
          date: formatInputDate(props.journal.date),
          rating: props.journal.rating,
          tags: props.journal.tags.join(", "),
        }
      : {
          title: "",
          content: "",
          date: formatInputDate(new Date()),
          rating: null as number | null,
          tags: "",
        };

  return (
    <form action={formAction} className="space-y-6">
      {props.mode === "edit" ? (
        <input type="hidden" name="id" value={props.journal.id} />
      ) : null}

      {state.status === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={defaults.title}
          placeholder="What stood out today?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Day</Label>
        <Input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={defaults.date}
        />
      </div>

      <div className="space-y-2">
        <Label>Day rating</Label>
        <StarRating name="rating" defaultValue={defaults.rating} />
        <p className="text-xs text-muted-foreground">
          How was your day? Tap a star to rate (tap again to clear).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={defaults.tags}
          placeholder="search|https://youtube.com/..., fish, squid"
        />
        <p className="text-xs text-muted-foreground">
          Optional. Use commas to separate tags. For a source link, use
          <span className="px-1 font-mono">keyword|https://...</span>
          format.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Notes</Label>
        <Textarea
          id="content"
          name="content"
          required
          rows={14}
          defaultValue={defaults.content}
          placeholder="Thoughts, plans, market notes…"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : props.mode === "create" ? "Create entry" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" disabled={pending} asChild>
          <Link href="/journal">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
