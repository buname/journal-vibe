"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { format } from "date-fns";

import {
  createTrade,
  updateTrade,
  type TradeActionState,
} from "@/lib/actions/trade";
import { DbOfflineBanner } from "@/components/layout/db-offline-banner";
import { Button } from "@/components/ui/button";
import { ChoiceChip, ChoiceChipGroup } from "@/components/ui/choice-chip";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";
import { ImageUploader } from "@/components/ui/image-uploader";
import { formatTradeDuration } from "@/components/trading/trade-card-utils";
import { formatInputDate } from "@/lib/format";
import { DB_OFFLINE_MESSAGE } from "@/lib/db-errors";
import { INSTRUMENTS, findInstrument } from "@/lib/trading/instruments";

const SESSION_OPTIONS = [
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
        exitTime: Date | null;
        notes: string | null;
        date: Date;
        tags: string[];
        images: string[];
      };
    };

const initialState: TradeActionState = { status: "idle" };

function parseTradeDateYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 9, 30, 0, 0);
}

function mergeDateWithTime(ymd: string, time: Date): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const next = new Date(time);
  next.setFullYear(y, m - 1, d);
  return next;
}

function formatEntryTimeValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
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
  const [entryPrice, setEntryPrice] = useState(
    props.mode === "edit" ? String(props.trade.entryPrice) : "",
  );
  const [exitPrice, setExitPrice] = useState(
    props.mode === "edit" ? String(props.trade.exitPrice) : "",
  );
  const [stopPrice, setStopPrice] = useState(
    props.mode === "edit" && props.trade.stopPrice != null
      ? String(props.trade.stopPrice)
      : "",
  );
  const [size, setSize] = useState(
    props.mode === "edit" ? String(props.trade.size) : "",
  );
  const [notes, setNotes] = useState(
    props.mode === "edit" ? (props.trade.notes ?? "") : "",
  );

  const activePointValue = findInstrument(instrument)?.pointValue ?? 1;

  const defaults =
    props.mode === "edit"
      ? {
          tags: props.trade.tags.join(", "),
          date: formatInputDate(props.trade.date),
          images: props.trade.images,
        }
      : {
          tags: "",
          date: formatInputDate(new Date()),
          images: [] as string[],
        };

  const [tradeDate, setTradeDate] = useState(defaults.date);
  const [entryTimeDate, setEntryTimeDate] = useState<Date>(() => {
    if (props.mode === "edit" && props.trade.entryTime) {
      return new Date(props.trade.entryTime);
    }
    return parseTradeDateYmd(defaults.date);
  });
  const [exitTimeDate, setExitTimeDate] = useState<Date>(() => {
    if (props.mode === "edit" && props.trade.exitTime) {
      return new Date(props.trade.exitTime);
    }
    const base = parseTradeDateYmd(defaults.date);
    base.setHours(base.getHours() + 1);
    return base;
  });

  useEffect(() => {
    setEntryTimeDate((prev) => mergeDateWithTime(tradeDate, prev));
  }, [tradeDate]);

  useEffect(() => {
    setExitTimeDate((prev) => mergeDateWithTime(tradeDate, prev));
  }, [tradeDate]);

  const combinedEntryTime = tradeDate ? formatEntryTimeValue(entryTimeDate) : "";
  const combinedExitTime = tradeDate ? formatEntryTimeValue(exitTimeDate) : "";
  const durationLabel = formatTradeDuration(combinedEntryTime, combinedExitTime);

  return (
    <form action={formAction} className="mx-auto max-w-4xl space-y-8">
        {props.mode === "edit" ? (
          <input type="hidden" name="id" value={props.trade.id} />
        ) : null}

        {state.status === "error" ? (
          state.message === DB_OFFLINE_MESSAGE ? (
            <DbOfflineBanner message={state.message} />
          ) : (
            <p className="text-sm text-destructive" role="alert">
              {state.message}
            </p>
          )
        ) : null}

        <input type="hidden" name="symbol" value={instrument} />
        <input type="hidden" name="instrumentType" value={instrument} />
        <input type="hidden" name="direction" value={direction} />
        <input type="hidden" name="fees" value="0" />

        <div className="space-y-2">
          <Label>Instrument</Label>
          <ChoiceChipGroup>
            {INSTRUMENTS.map((item) => (
              <ChoiceChip
                key={item.symbol}
                layoutId="trade-instrument"
                active={item.symbol === instrument}
                onClick={() => setInstrument(item.symbol)}
                className="min-w-[4.5rem] flex-1"
              >
                {item.symbol}
              </ChoiceChip>
            ))}
          </ChoiceChipGroup>
          <p className="text-xs text-muted-foreground">
            ${activePointValue} per point.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Direction</Label>
          <ChoiceChipGroup>
            {(["LONG", "SHORT"] as const).map((dir) => (
              <ChoiceChip
                key={dir}
                layoutId="trade-direction"
                active={dir === direction}
                onClick={() => setDirection(dir)}
                activeClassName={
                  dir === "LONG" ? "bg-emerald-500" : "bg-rose-500"
                }
                className="flex-1"
              >
                {dir === "LONG" ? "Long" : "Short"}
              </ChoiceChip>
            ))}
          </ChoiceChipGroup>
        </div>

        <input type="hidden" name="session" value={session} />

        <div className="space-y-2">
          <Label>Session</Label>
          <ChoiceChipGroup>
            {SESSION_OPTIONS.map((option) => (
              <ChoiceChip
                key={option.value || "auto"}
                layoutId="trade-session"
                active={option.value === session}
                onClick={() => setSession(option.value)}
              >
                {option.label}
              </ChoiceChip>
            ))}
          </ChoiceChipGroup>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Trade date</Label>
            <DatePicker
              name="date"
              defaultValue={defaults.date}
              onChange={setTradeDate}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryTime">Entry time</Label>
            <TimePicker value={entryTimeDate} onChange={setEntryTimeDate} />
            <input type="hidden" name="entryTime" value={combinedEntryTime} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exitTime">Exit time</Label>
            <TimePicker value={exitTimeDate} onChange={setExitTimeDate} />
            <input type="hidden" name="exitTime" value={combinedExitTime} />
          </div>
        </div>

        {durationLabel ? (
          <p className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Duration: <span className="font-semibold text-foreground">{durationLabel}</span>
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="entryPrice">Entry</Label>
            <Input
              id="entryPrice"
              name="entryPrice"
              type="number"
              inputMode="decimal"
              step="any"
              required
              value={entryPrice}
              onChange={(event) => setEntryPrice(event.target.value)}
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
              value={exitPrice}
              onChange={(event) => setExitPrice(event.target.value)}
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
              value={stopPrice}
              onChange={(event) => setStopPrice(event.target.value)}
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
              value={size}
              onChange={(event) => setSize(event.target.value)}
            />
          </div>
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
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={5}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
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
