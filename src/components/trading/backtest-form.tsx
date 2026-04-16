"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createBacktest,
  updateBacktest,
  type BacktestActionState,
} from "@/lib/actions/backtest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatInputDate } from "@/lib/format";

type BacktestFormProps =
  | { mode: "create" }
  | {
      mode: "edit";
      backtest: {
        id: string;
        strategy: string;
        timeframe: string;
        winRate: number;
        expectancy: number;
        notes: string | null;
        date: Date;
        tags: string[];
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
          winRate: String(props.backtest.winRate),
          expectancy: String(props.backtest.expectancy),
          notes: props.backtest.notes ?? "",
          date: formatInputDate(props.backtest.date),
          tags: props.backtest.tags.join(", "),
        }
      : {
          strategy: "",
          timeframe: "",
          winRate: "",
          expectancy: "",
          notes: "",
          date: formatInputDate(new Date()),
          tags: "",
        };

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
          <Label htmlFor="winRate">Win rate (%)</Label>
          <Input
            id="winRate"
            name="winRate"
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            max={100}
            required
            defaultValue={defaults.winRate}
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
