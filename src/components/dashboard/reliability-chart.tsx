"use client";

import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Aggregate } from "@/lib/mock-data";
import { useMemo } from "react";
import { format } from "date-fns";

interface ReliabilityChartProps {
  data: Aggregate[];
}

export function ReliabilityChart({ data }: ReliabilityChartProps) {
  const chartData = useMemo(() => {
    const aggregated = data.reduce((acc, curr) => {
      const date = format(new Date(curr.ts), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = { date, saidiHours: 0, saifiEvents: 0, count: 0 };
      }
      acc[date].saidiHours += curr.saidiHours;
      acc[date].saifiEvents += curr.saifiEvents;
      acc[date].count++;
      return acc;
    }, {} as Record<string, { date: string; saidiHours: number; saifiEvents: number, count: number }>);
    
    return Object.values(aggregated)
      .map(d => ({
        ...d,
        saidiHours: d.saidiHours / d.count, // Average SAIDI across communities
        saifiEvents: d.saifiEvents, // Sum of SAIFI events
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Reliability Metrics (30-Day Trend)</CardTitle>
        <CardDescription>Average outage duration and frequency across all communities.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full pr-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tickFormatter={(str) => format(new Date(str), "MMM d")}
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              label={{ value: 'SAIFI (Events)', angle: -90, position: 'insideLeft', offset: 10, fill: 'hsl(var(--foreground))' }}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'SAIDI (Hours)', angle: 90, position: 'insideRight', offset: 10, fill: 'hsl(var(--foreground))' }}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value, name) => {
                if (name === "saidiHours") return [`${Number(value).toFixed(2)} hrs`, "SAIDI"];
                if (name === "saifiEvents") return [`${value} events`, "SAIFI"];
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="saifiEvents" name="SAIFI" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="saidiHours" name="SAIDI" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
