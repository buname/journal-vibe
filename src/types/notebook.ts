export type NotebookKind = "journal" | "trade" | "backtest";

export type NotebookTimelineItem =
  | {
      kind: "journal";
      id: string;
      date: Date;
      title: string;
      rating: number | null;
      tags: string[];
      excerpt: string;
    }
  | {
      kind: "trade";
      id: string;
      date: Date;
      symbol: string;
      direction: string;
      pnl: number;
      tags: string[];
    }
  | {
      kind: "backtest";
      id: string;
      date: Date;
      strategy: string;
      timeframe: string;
      winRate: number;
      expectancy: number;
      tags: string[];
    };
