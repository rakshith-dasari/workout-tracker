"use client";

import { useEffect, useState } from "react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

type TrendPoint = {
  date: string;
  maxWeight: number;
  maxReps: number;
};

export function TrendChart({ exerciseName }: { exerciseName: string }) {
  const [data, setData] = useState<TrendPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!exerciseName) return;
    let isCancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/exercises/trend?name=${encodeURIComponent(exerciseName)}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load trend");
        return res.json();
      })
      .then((json: { series: TrendPoint[] }) => {
        if (isCancelled) return;
        setData(json.series ?? []);
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => {
        if (isCancelled) return;
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [exerciseName]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading trend…</div>;
  }
  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load trend: {error}
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No trend data available.
      </div>
    );
  }

  return (
    <ChartContainer
      config={{
        maxWeight: { label: "Max Weight", color: "hsl(240 100% 67%)" },

      }}
      className="w-full h-64"
    >
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="maxWeight"
          name="Weight"
          stroke="var(--color-maxWeight)"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ChartContainer>
  );
}

export default TrendChart;
