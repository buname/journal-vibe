"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteBacktest } from "@/lib/actions/backtest";
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

type BacktestDeleteButtonProps = {
  backtestId: string;
};

export function BacktestDeleteButton({
  backtestId,
}: BacktestDeleteButtonProps) {
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
          <DialogTitle>Delete this backtest?</DialogTitle>
          <DialogDescription>
            This removes the backtest note permanently. This action cannot be
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
                formData.set("id", backtestId);
                const result = await deleteBacktest(formData);
                if (result?.error) {
                  toast.error(result.error);
                  return;
                }
                toast.success("Backtest deleted.");
                setOpen(false);
                router.push("/backtests");
                router.refresh();
              });
            }}
          >
            {pending ? "Deleting…" : "Delete backtest"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
