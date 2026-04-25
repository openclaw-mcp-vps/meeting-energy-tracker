"use client";

import type { EnergyTrendPoint } from "@/lib/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface EnergyChartProps {
  trend: EnergyTrendPoint[];
}

function shortDateLabel(isoDate: string) {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime())
    ? isoDate
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

export function EnergyChart({ trend }: EnergyChartProps) {
  const chartData = trend.map((point) => ({
    ...point,
    dayLabel: shortDateLabel(point.day),
    avgEnergy: point.avgEnergy ?? 0
  }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
        No meeting history yet. Sync your calendar to see team energy and meeting load trends.
      </div>
    );
  }

  return (
    <div className="h-80 w-full rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-100">Energy vs. Meeting Load</h3>
        <p className="text-xs text-slate-400">Last {chartData.length} active days</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData} margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="minutesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="dayLabel" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="energy"
            domain={[0, 5]}
            tick={{ fill: "#22d3ee", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="minutes"
            orientation="right"
            tick={{ fill: "#fb923c", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              borderColor: "#1e293b",
              borderRadius: "0.5rem"
            }}
          />
          <Area
            yAxisId="minutes"
            type="monotone"
            dataKey="meetingMinutes"
            stroke="#f97316"
            fill="url(#minutesGradient)"
            strokeWidth={2}
            name="Meeting minutes"
          />
          <Area
            yAxisId="energy"
            type="monotone"
            dataKey="avgEnergy"
            stroke="#22d3ee"
            fill="url(#energyGradient)"
            strokeWidth={2}
            name="Avg energy"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
