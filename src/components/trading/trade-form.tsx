"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  createTrade,
  updateTrade,
  type TradeActionState,
} from "@/lib/actions/trade";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { cn } from "@/lib/utils";
import { formatInputDate } from "@/lib/format";
import { INSTRUMENTS, findInstrument } from "@/lib/trading/instruments";

const SESSION_OPTIONS = [
  { value: "", label: "Auto" },
  { value: "London", label: "London" },
  { value: "New York", label: "New York" },
  { value: "Asia", label: "Asia" },
  { value: "Out Of Session", label: "Out" },
];

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

export function TradeForm(props: TradeFormProps) {
  const action = props.mode === "create" ? createTrade : updateTrade;
  const [state, formAction, pending] = useActionState(action, initialState);

  const initialInstrument =
    props.mode === "edit" && findInstrument(props.trade.instrumentType)
      ? (props.trade.instrumentType as string)
      : INSTRUMENTS[0].symbol;

  const [instrument, setInstrument] = useState(initialInstrument);
  const [direction, setDirection] = useState<"LONG" | "SHORT">(
    props.mode === "edit" ? props.trade.direction : "LONG",
  );
  const [session, setSession] = useState(
    props.mode === "edit" ? (props.trade.session ?? "") : "",
  );

  const activePointValue = findInstrument(instrument)?.pointValue ?? 1;

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

      <input type="hidden" name="symbol" value={instrument} />
      <input type="hidden" name="instrumentType" value={instrument} />
      <input type="hidden" name="direction" value={direction} />

      <div className="space-y-2">
        <Label>Instrument</Label>
        <div className="flex gap-2">
          {INSTRUMENTS.map((item) => {
            const active = item.symbol === instrument;
            return (
              <button
                key={item.symbol}
                type="button"
                onClick={() => setInstrument(item.symbol)}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.symbol}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          ${activePointValue} per point · PnL is calculated automatically.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Direction</Label>
        <div className="flex gap-2">
          {(["LONG", "SHORT"] as const).map((dir) => {
            const active = dir === direction;
            return (
              <button
                key={dir}
                type="button"
                onClick={() => setDirection(dir)}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm font-semibold transition-colors",
                  active
                    ? dir === "LONG"
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-rose-500 bg-rose-500 text-white"
                    : "border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {dir === "LONG" ? "Long" : "Short"}
              </button>
            );
          })}
        </div>
      </div>

      <input type="hidden" name="session" value={session} />

      <div className="space-y-2">
        <Label>Session</Label>
        <div className="flex flex-wrap gap-2">
          {SESSION_OPTIONS.map((option) => {
            const active = option.value === session;
            return (
              <button
                key={option.value || "auto"}
                type="button"
                onClick={() => setSession(option.value)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Trade date</Label>
          <DatePicker name="date" defaultValue={defaults.date} />
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
      </div>

      <p className="text-xs text-muted-foreground">
        PnL is computed on save as{" "}
        <span className="font-medium text-foreground">
          (exit − entry) × ${activePointValue} × contracts
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
