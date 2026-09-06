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
import { DatePicker } from "@/components/ui/date-picker";
import { ImageUploader } from "@/components/ui/image-uploader";
import { DayRatingSlider } from "@/components/journal/day-rating-slider";
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
        images: string[];
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
          images: props.journal.images,
        }
      : {
          title: "",
          content: "",
          date: formatInputDate(new Date()),
          rating: null as number | null,
          tags: "",
          images: [] as string[],
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

      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 sm:p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Quick check-in
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Day</Label>
            <DatePicker name="date" defaultValue={defaults.date} />
          </div>
          <div className="sm:col-span-2">
            <DayRatingSlider name="rating" defaultValue={defaults.rating} />
          </div>
        </div>
      </div>

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
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={defaults.tags}
          placeholder="comma, separated, tags"
        />
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

      <div className="space-y-2">
        <Label>Images</Label>
        <ImageUploader
          name="images"
          defaultValue={defaults.images}
          altLabel="Journal image"
        />
        <p className="text-xs text-muted-foreground">
          Optional. Attach screenshots or photos for this entry.
        </p>
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
