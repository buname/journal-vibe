"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteTrade } from "@/lib/actions/trade";
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

type TradeDeleteButtonProps = {
  tradeId: string;
};

export function TradeDeleteButton({ tradeId }: TradeDeleteButtonProps) {
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
          <DialogTitle>Delete this trade?</DialogTitle>
          <DialogDescription>
            This removes the trade log permanently. This action cannot be undone.
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
                formData.set("id", tradeId);
                const result = await deleteTrade(formData);
                if (result?.error) {
                  toast.error(result.error);
                  return;
                }
                toast.success("Trade deleted.");
                setOpen(false);
                router.push("/trades");
                router.refresh();
              });
            }}
          >
            {pending ? "Deleting…" : "Delete trade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
