"use client";



import dynamic from "next/dynamic";



import type {

  RDistributionRow,

  SessionPerformanceRow,

} from "@/lib/utils/tradingCalculations";

import {

  Card,

  CardContent,

  CardDescription,

  CardHeader,

  CardTitle,

} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";



const RMultipleChart = dynamic(

  () =>

    import("@/components/charts/RMultipleChart").then((m) => m.RMultipleChart),

  { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-lg" /> },

);



const SessionRadarChart = dynamic(

  () =>

    import("@/components/charts/SessionRadarChart").then(

      (m) => m.SessionRadarChart,

    ),

  {

    ssr: false,

    loading: () => <Skeleton className="h-[26rem] w-full rounded-lg" />,

  },

);



type DashboardChartsProps = {

  rDistribution: RDistributionRow[];

  sessionPerformance: SessionPerformanceRow[];

};



export function DashboardCharts({

  rDistribution,

  sessionPerformance,

}: DashboardChartsProps) {

  return (

    <div className="grid gap-4 lg:grid-cols-3">

      <Card className="lg:col-span-2">

        <CardHeader>

          <CardTitle>R-multiple distribution</CardTitle>

          <CardDescription>

            How many trades landed at each R. Green = winners, red = losers.

          </CardDescription>

        </CardHeader>

        <CardContent>

          <RMultipleChart data={rDistribution} />

        </CardContent>

      </Card>

      <Card>

        <CardHeader>

          <CardTitle>Session radar</CardTitle>

          <CardDescription>

            Trade count, win rate &amp; PnL by market session.

          </CardDescription>

        </CardHeader>

        <CardContent>

          <SessionRadarChart data={sessionPerformance} />

        </CardContent>

      </Card>

    </div>

  );

}

