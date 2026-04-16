"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createTrade,
  updateTrade,
  type TradeActionState,
} from "@/lib/actions/trade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatInputDate } from "@/lib/format";

type TradeFormProps =
  | { mode: "create" }
  | {
      mode: "edit";
      trade: {
        id: string;
        symbol: string;
        direction: "LONG" | "SHORT";
        entryPrice: number;
        exitPrice: number;
        size: number;
        fees: number;
        session: string | null;
        entryTime: Date | null;
        notes: string | null;
        date: Date;
        tags: string[];
      };
    };

const initialState: TradeActionState = { status: "idle" };

function formatDateTimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const selectCn = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
);

export function TradeForm(props: TradeFormProps) {
  const action = props.mode === "create" ? createTrade : updateTrade;
  const [state, formAction, pending] = useActionState(action, initialState);

  const defaults =
    props.mode === "edit"
      ? {
          symbol: props.trade.symbol,
          direction: props.trade.direction,
          entryPrice: String(props.trade.entryPrice),
          exitPrice: String(props.trade.exitPrice),
          size: String(props.trade.size),
          fees: String(props.trade.fees),
          session: props.trade.session ?? "",
          entryTime: props.trade.entryTime
            ? formatDateTimeLocal(props.trade.entryTime)
            : "",
          notes: props.trade.notes ?? "",
          date: formatInputDate(props.trade.date),
          tags: props.trade.tags.join(", "),
        }
      : {
          symbol: "",
          direction: "LONG" as const,
          entryPrice: "",
          exitPrice: "",
          size: "",
          fees: "0",
          session: "",
          entryTime: "",
          notes: "",
          date: formatInputDate(new Date()),
          tags: "",
        };

  return (
    <form action={formAction} className="space-y-6">
      {props.mode === "edit" ? (
        <input type="hidden" name="id" value={props.trade.id} />
      ) : null}

      {state.status === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="symbol">Symbol</Label>
          <Input
            id="symbol"
            name="symbol"
            required
            maxLength={32}
            defaultValue={defaults.symbol}
            placeholder="ES, NQ, BTC…"
            autoCapitalize="characters"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="direction">Direction</Label>
          <select
            id="direction"
            name="direction"
            defaultValue={defaults.direction}
            className={selectCn}
          >
            <option value="LONG">Long</option>
            <option value="SHORT">Short</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="session">Session</Label>
          <select
            id="session"
            name="session"
            defaultValue={defaults.session}
            className={selectCn}
          >
            <option value="">Auto-detect / none</option>
            <option value="London">London</option>
            <option value="New York">New York</option>
            <option value="Asia">Asia</option>
            <option value="Out Of Session">Out Of Session</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Trade date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={defaults.date}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="entryTime">Entry time</Label>
          <Input
            id="entryTime"
            name="entryTime"
            type="datetime-local"
            defaultValue={defaults.entryTime}
          />
          <p className="text-xs text-muted-foreground">
            Optional. Used for session auto-detect when session is blank.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="entryPrice">Entry</Label>
          <Input
            id="entryPrice"
            name="entryPrice"
            type="number"
            inputMode="decimal"
            step="any"
            required
            defaultValue={defaults.entryPrice}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exitPrice">Exit</Label>
          <Input
            id="exitPrice"
            name="exitPrice"
            type="number"
            inputMode="decimal"
            step="any"
            required
            defaultValue={defaults.exitPrice}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            name="size"
            type="number"
            inputMode="decimal"
            step="any"
            required
            defaultValue={defaults.size}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fees">Fees</Label>
          <Input
            id="fees"
            name="fees"
            type="number"
            inputMode="decimal"
            step="any"
            required
            defaultValue={defaults.fees}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        PnL is computed on save as{" "}
        <span className="font-medium text-foreground">
          (exit − entry) × size − fees
        </span>{" "}
        for longs, and the inverse for shorts.
      </p>

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
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={5}
          defaultValue={defaults.notes}
          placeholder="Context, screenshots links, emotions…"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving…"
            : props.mode === "create"
              ? "Log trade"
              : "Save trade"}
        </Button>
        <Button type="button" variant="outline" disabled={pending} asChild>
          <Link href="/trades">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
