"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  createTrade,
  updateTrade,
  type TradeActionState,
} from "@/lib/actions/trade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { cn } from "@/lib/utils";
import { formatInputDate } from "@/lib/format";
import { INSTRUMENTS, findInstrument } from "@/lib/trading/instruments";

type TradeFormProps =
  | { mode: "create" }
  | {
      mode: "edit";
      trade: {
        id: string;
        symbol: string;
        direction: "LONG" | "SHORT";
        instrumentType: string | null;
        pointValue: number | null;
        entryPrice: number;
        exitPrice: number;
        stopPrice: number | null;
        size: number;
        fees: number;
        session: string | null;
        entryTime: Date | null;
        notes: string | null;
        date: Date;
        tags: string[];
        images: string[];
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

  const editDefaults =
    props.mode === "edit"
      ? {
          symbol: props.trade.symbol,
          instrumentType: props.trade.instrumentType ?? "",
          pointValue:
            props.trade.pointValue != null
              ? String(props.trade.pointValue)
              : "",
        }
      : { symbol: "", instrumentType: "", pointValue: "" };

  const [instrument, setInstrument] = useState(editDefaults.instrumentType);
  const [symbol, setSymbol] = useState(editDefaults.symbol);
  const [pointValue, setPointValue] = useState(editDefaults.pointValue);

  function onInstrumentChange(value: string) {
    setInstrument(value);
    const found = findInstrument(value);
    if (found) {
      setSymbol(found.symbol);
      setPointValue(String(found.pointValue));
    }
  }

  const defaults =
    props.mode === "edit"
      ? {
          symbol: props.trade.symbol,
          direction: props.trade.direction,
          instrumentType: props.trade.instrumentType ?? "",
          pointValue:
            props.trade.pointValue != null ? String(props.trade.pointValue) : "",
          entryPrice: String(props.trade.entryPrice),
          exitPrice: String(props.trade.exitPrice),
          stopPrice:
            props.trade.stopPrice != null ? String(props.trade.stopPrice) : "",
          size: String(props.trade.size),
          fees: String(props.trade.fees),
          session: props.trade.session ?? "",
          entryTime: props.trade.entryTime
            ? formatDateTimeLocal(props.trade.entryTime)
            : "",
          notes: props.trade.notes ?? "",
          date: formatInputDate(props.trade.date),
          tags: props.trade.tags.join(", "),
          images: props.trade.images,
        }
      : {
          symbol: "",
          direction: "LONG" as const,
          instrumentType: "",
          pointValue: "",
          entryPrice: "",
          exitPrice: "",
          stopPrice: "",
          size: "",
          fees: "0",
          session: "",
          entryTime: "",
          notes: "",
          date: formatInputDate(new Date()),
          tags: "",
          images: [] as string[],
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
        <div className="space-y-2">
          <Label htmlFor="instrumentType">Instrument</Label>
          <select
            id="instrumentType"
            name="instrumentType"
            value={instrument}
            onChange={(event) => onInstrumentChange(event.target.value)}
            className={selectCn}
          >
            <option value="">Custom / other</option>
            {INSTRUMENTS.map((item) => (
              <option key={item.symbol} value={item.symbol}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol</Label>
          <Input
            id="symbol"
            name="symbol"
            required
            maxLength={32}
            value={symbol}
            onChange={(event) => setSymbol(event.target.value)}
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
          <Label htmlFor="pointValue">Point value ($/pt)</Label>
          <Input
            id="pointValue"
            name="pointValue"
            type="number"
            inputMode="decimal"
            step="any"
            value={pointValue}
            onChange={(event) => setPointValue(event.target.value)}
            placeholder="e.g. 2 for MNQ"
          />
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
          <Label htmlFor="stopPrice">Stop</Label>
          <Input
            id="stopPrice"
            name="stopPrice"
            type="number"
            inputMode="decimal"
            step="any"
            defaultValue={defaults.stopPrice}
            placeholder="Optional — enables R multiple"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Size (contracts)</Label>
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
          (exit − entry) × point value × size − fees
        </span>{" "}
        for longs (inverse for shorts). Set a stop to record the R multiple.
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

      <div className="space-y-2">
        <Label>Images</Label>
        <ImageUploader
          name="images"
          defaultValue={defaults.images}
          altLabel="Trade screenshot"
        />
        <p className="text-xs text-muted-foreground">
          Optional. Attach chart screenshots for this trade.
        </p>
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
