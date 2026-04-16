"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteJournal } from "@/lib/actions/journal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type JournalDeleteButtonProps = {
  journalId: string;
};

export function JournalDeleteButton({ journalId }: JournalDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this entry?</DialogTitle>
          <DialogDescription>
            This removes the journal entry permanently. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const formData = new FormData();
                formData.set("id", journalId);
                const result = await deleteJournal(formData);
                if (result?.error) {
                  toast.error(result.error);
                  return;
                }
                toast.success("Entry deleted.");
                setOpen(false);
                router.push("/journal");
                router.refresh();
              });
            }}
          >
            {pending ? "Deleting…" : "Delete entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
