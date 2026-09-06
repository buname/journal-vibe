"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  FlaskConical,
  LineChart,
  NotebookPen,
  TrendingUp,
} from "lucide-react";
import { CartesianGrid, Line, LineChart as ReLineChart, XAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitHubCalendar } from "@/components/ui/git-hub-calendar";
import {
  FullScreenCalendar,
  type CalendarData,
} from "@/components/ui/fullscreen-calendar";
import { MonthlyPnlSummary } from "@/components/ui/monthly-pnl-summary";
import { TiltCard } from "@/components/ui/tilt-card";
import { EnterBookButton } from "@/components/gate/enter-book-button";
import {
  buildDemoContribution,
  buildDemoPnlSessions,
  startOfCurrentMonth,
} from "@/lib/gate/demo-data";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/line-chart";

const rooms = [
  {
    title: "Trades",
    body: "Log MNQ, MES, MYM fills with entry, exit, stop, and size. PnL and R are computed from the tape — not typed as a story.",
    icon: LineChart,
    span: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Journal",
    body: "Session notes while the tape is still fresh — what you saw, what you felt, what you would repeat.",
    icon: NotebookPen,
    span: "md:col-span-1",
  },
  {
    title: "Timeline",
    body: "Journals, fills, and backtests in the order of the day. One scroll through the book.",
    icon: BookOpen,
    span: "md:col-span-1",
  },
  {
    title: "Backtests",
    body: "Store setup notes with win rate and expectancy. The hypothesis stays next to the evidence.",
    icon: FlaskConical,
    span: "md:col-span-2",
  },
] as const;

type PnlSession = {
  id: string;
  title: string;
  symbol: string;
  date: string;
  pnl: number;
  r: number;
};

const chartData = [
  { month: "Jan", r: 1.2 },
  { month: "Feb", r: 0.8 },
  { month: "Mar", r: 1.6 },
  { month: "Apr", r: -0.4 },
  { month: "May", r: 2.1 },
  { month: "Jun", r: 1.4 },
  { month: "Jul", r: 0.6 },
  { month: "Aug", r: 1.9 },
];

const chartConfig = {
  r: {
    label: "Cumulative R",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function sessionsToCalendarData(sessions: PnlSession[]): CalendarData[] {
  const byDay = new Map<string, CalendarData>();

  for (const session of sessions) {
    const day = new Date(session.date);
    const key = format(day, "yyyy-MM-dd");

    if (!byDay.has(key)) {
      byDay.set(key, { day, events: [] });
    }

    byDay.get(key)!.events.push({
      id: session.id,
      name: session.title,
      time: `${session.pnl >= 0 ? "+" : ""}$${Math.abs(session.pnl).toLocaleString()}`,
      datetime: session.date,
      pnl: session.pnl,
      r: session.r,
      symbol: session.symbol,
    });
  }

  return Array.from(byDay.values());
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function GateLanding({ signedIn }: { signedIn: boolean }) {
  const demoNow = useMemo(() => new Date(), []);
  const pnlSessions = useMemo(() => buildDemoPnlSessions(demoNow), [demoNow]);
  const contributionData = useMemo(
    () => buildDemoContribution(demoNow),
    [demoNow],
  );
  const [calendarMonth, setCalendarMonth] = useState(() => startOfCurrentMonth());
  const calendarData = useMemo(() => sessionsToCalendarData(pnlSessions), [pnlSessions]);

  return (
    <div className="gate-landing">
      <Reveal className="mx-auto max-w-6xl px-5 pb-8 pt-20 md:px-10 md:pt-28">
        <h2 className="max-w-3xl font-[family-name:var(--font-gate)] text-3xl font-normal tracking-tight md:text-5xl">
          A private book for the session
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Not a broker. Not a feed. A place to capture fills, write what you saw,
          and review the work when the market closes.
        </p>
      </Reveal>

      <div className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-4 md:px-10">
        {rooms.map((room, index) => {
          const Icon = room.icon;
          return (
            <Reveal key={room.title} delay={index * 0.08} className={room.span}>
              <TiltCard
                tiltLimit={12}
                scale={1.03}
                className="gate-bento-card h-full rounded-2xl border border-border/60 bg-card p-6 shadow-[0_8px_30px_-20px_rgba(61,90,128,0.25)]"
              >
                <div className="relative z-20">
                  <div className="mb-4 inline-flex rounded-xl border border-primary/15 bg-primary/8 p-2.5 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">{room.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {room.body}
                  </p>
                </div>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mx-auto max-w-6xl px-5 pb-16 md:px-10">
        <TiltCard tiltLimit={6} scale={1.01} className="rounded-xl">
          <Card className="gate-bento-card overflow-hidden border-border/60 bg-card shadow-[0_8px_30px_-20px_rgba(61,90,128,0.22)]">
            <CardHeader>
              <CardTitle className="text-xl">Day by day</CardTitle>
              <CardDescription>
                Trading calendar for fills — green when the day nets positive, red when it
                does not. Journal days and notes live on the same timeline.
              </CardDescription>
            </CardHeader>
            <MonthlyPnlSummary sessions={pnlSessions} month={calendarMonth} />
            <CardContent className="p-0">
              <FullScreenCalendar
                data={calendarData}
                readOnly
                initialMonth={calendarMonth}
                onMonthChange={setCalendarMonth}
                className="rounded-b-xl"
              />
              <p className="px-4 pb-4 text-xs text-muted-foreground md:px-6">
                Sample month for layout — signed in, your book maps real trades and journal
                days here.
              </p>
            </CardContent>
          </Card>
        </TiltCard>
      </Reveal>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 pb-20 md:grid-cols-2 md:px-10">
        <Reveal delay={0.05}>
          <TiltCard tiltLimit={10} scale={1.02} className="h-full rounded-xl">
            <Card className="gate-bento-card h-full overflow-hidden border-border/60 bg-card shadow-[0_8px_30px_-20px_rgba(61,90,128,0.22)]">
              <CardHeader>
                <CardTitle className="text-xl">Show up</CardTitle>
                <CardDescription>
                  Each square is a day you touched the book — a trade logged, a journal
                  entry written, or a session reviewed. Consistency beats intensity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GitHubCalendar
                  data={contributionData}
                  entryLabel="touchpoints"
                  colors={["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]}
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Sample streak — yours fills from trades, notebook days, and timeline
                  activity.
                </p>
              </CardContent>
            </Card>
          </TiltCard>
        </Reveal>

        <Reveal delay={0.12}>
          <TiltCard tiltLimit={10} scale={1.02} className="h-full rounded-xl">
            <Card className="gate-bento-card h-full overflow-hidden border-border/60 bg-card shadow-[0_8px_30px_-20px_rgba(61,90,128,0.22)]">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
                Review the curve
                <Badge
                  variant="outline"
                  className="ml-1 border-none bg-primary/10 text-primary"
                >
                  <TrendingUp className="mr-1 h-3.5 w-3.5" />
                  R
                </Badge>
              </CardTitle>
              <CardDescription>
                Cumulative R from logged fills — one lens on the trading side of the book,
                not the whole story.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                id="gate-r-curve"
                config={chartConfig}
                className="h-[220px] w-full"
              >
                <ReLineChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Line
                    dataKey="r"
                    type="linear"
                    stroke="var(--color-r)"
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                </ReLineChart>
              </ChartContainer>
              <p className="mt-3 text-xs text-muted-foreground">
                Sample curve for layout — live dashboard uses your trade history.
              </p>
            </CardContent>
            </Card>
          </TiltCard>
        </Reveal>
      </div>

      <Reveal className="border-t border-border/60 bg-primary/5 px-5 py-16 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h3 className="font-[family-name:var(--font-gate)] text-2xl md:text-3xl">
              Ready to open the book?
            </h3>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Google sign-in keeps the journal on your account. Nothing is public.
            </p>
          </div>
          <EnterBookButton
            signedIn={signedIn}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            label={signedIn ? "Open the book" : "Sign in"}
          />
        </div>
      </Reveal>
    </div>
  );
}
