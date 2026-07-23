"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import {
  createBacktest,
  updateBacktest,
  type BacktestActionState,
} from "@/lib/actions/backtest";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatInputDate } from "@/lib/format";
import { INSTRUMENTS, findInstrument } from "@/lib/trading/instruments";

const segClass = (active: boolean) =>
  cn(
    "flex-1 rounded-md border px-3 py-2 text-sm font-semibold transition-colors",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  );

type BacktestFormProps =
  | { mode: "create" }
  | {
      mode: "edit";
      backtest: {
        id: string;
        strategy: string;
        timeframe: string;
        direction: string | null;
        instrumentType: string | null;
        entryPrice: number | null;
        stopPrice: number | null;
        winRate: number;
        expectancy: number;
        notes: string | null;
        date: Date;
        tags: string[];
        images: string[];
      };
    };

const initialState: BacktestActionState = { status: "idle" };

export function BacktestForm(props: BacktestFormProps) {
  const action = props.mode === "create" ? createBacktest : updateBacktest;
  const [state, formAction, pending] = useActionState(action, initialState);

  const defaults =
    props.mode === "edit"
      ? {
          strategy: props.backtest.strategy,
          timeframe: props.backtest.timeframe,
          direction: props.backtest.direction ?? "",
          instrumentType: props.backtest.instrumentType ?? "",
          entryPrice:
            props.backtest.entryPrice != null
              ? String(props.backtest.entryPrice)
              : "",
          stopPrice:
            props.backtest.stopPrice != null
              ? String(props.backtest.stopPrice)
              : "",
          winningTrades: String(Math.round(props.backtest.winRate)),
          totalTrades: "100",
          expectancy: String(props.backtest.expectancy),
          notes: props.backtest.notes ?? "",
          date: formatInputDate(props.backtest.date),
          tags: props.backtest.tags.join(", "),
          images: props.backtest.images,
        }
      : {
          strategy: "",
          timeframe: "",
          direction: "",
          instrumentType: "",
          entryPrice: "",
          stopPrice: "",
          winningTrades: "",
          totalTrades: "",
          expectancy: "",
          notes: "",
          date: formatInputDate(new Date()),
          tags: "",
          images: [] as string[],
        };
  const [winningTrades, setWinningTrades] = useState(defaults.winningTrades);
  const [totalTrades, setTotalTrades] = useState(defaults.totalTrades);
  const [direction, setDirection] = useState(defaults.direction);
  const [instrument, setInstrument] = useState(
    findInstrument(defaults.instrumentType) ? defaults.instrumentType : "",
  );

  const computedWinRate = useMemo(() => {
    const wins = Number(winningTrades);
    const total = Number(totalTrades);

    if (!Number.isFinite(wins) || !Number.isFinite(total) || total <= 0) {
      return 0;
    }

    const boundedWins = Math.min(Math.max(wins, 0), total);
    return (boundedWins / total) * 100;
  }, [winningTrades, totalTrades]);

  return (
    <form action={formAction} className="space-y-6">
      {props.mode === "edit" ? (
        <input type="hidden" name="id" value={props.backtest.id} />
      ) : null}

      {state.status === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="strategy">Strategy</Label>
          <Input
            id="strategy"
            name="strategy"
            required
            maxLength={120}
            defaultValue={defaults.strategy}
            placeholder="ORB, mean reversion, pairs…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeframe">Timeframe</Label>
          <Input
            id="timeframe"
            name="timeframe"
            required
            maxLength={64}
            defaultValue={defaults.timeframe}
            placeholder="5m, 1h, daily…"
          />
        </div>
        <input type="hidden" name="direction" value={direction} />
        <input type="hidden" name="instrumentType" value={instrument} />
        <div className="space-y-2">
          <Label>Direction</Label>
          <div className="flex gap-2">
            {[
              { value: "", label: "Both" },
              { value: "LONG", label: "Long" },
              { value: "SHORT", label: "Short" },
            ].map((option) => (
              <button
                key={option.value || "both"}
                type="button"
                onClick={() => setDirection(option.value)}
                className={segClass(option.value === direction)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Instrument</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setInstrument("")}
              className={segClass(instrument === "")}
            >
              None
            </button>
            {INSTRUMENTS.map((item) => (
              <button
                key={item.symbol}
                type="button"
                onClick={() => setInstrument(item.symbol)}
                className={segClass(item.symbol === instrument)}
              >
                {item.symbol}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="entryPrice">Entry</Label>
          <Input
            id="entryPrice"
            name="entryPrice"
            type="number"
            inputMode="decimal"
            step="any"
            defaultValue={defaults.entryPrice}
            placeholder="Optional"
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
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Study date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={defaults.date}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="winningTrades">Winning trades</Label>
          <Input
            id="winningTrades"
            name="winningTrades"
            type="number"
            inputMode="numeric"
            step={1}
            min={0}
            required
            value={winningTrades}
            onChange={(event) => setWinningTrades(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalTrades">Total trades</Label>
          <Input
            id="totalTrades"
            name="totalTrades"
            type="number"
            inputMode="numeric"
            step={1}
            min={1}
            required
            value={totalTrades}
            onChange={(event) => setTotalTrades(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectancy">Expectancy (R)</Label>
          <Input
            id="expectancy"
            name="expectancy"
            type="number"
            inputMode="decimal"
            step="any"
            required
            defaultValue={defaults.expectancy}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="computedWinRate">Win rate (%)</Label>
          <Input
            id="computedWinRate"
            value={computedWinRate.toFixed(1)}
            readOnly
            aria-readonly
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
          rows={6}
          defaultValue={defaults.notes}
          placeholder="Sample size, curve fit warnings, screenshots…"
        />
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <ImageUploader
          name="images"
          defaultValue={defaults.images}
          altLabel="Backtest screenshot"
        />
        <p className="text-xs text-muted-foreground">
          Optional. Attach chart or result screenshots for this backtest.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving…"
            : props.mode === "create"
              ? "Save backtest"
              : "Update backtest"}
        </Button>
        <Button type="button" variant="outline" disabled={pending} asChild>
          <Link href="/backtests">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
