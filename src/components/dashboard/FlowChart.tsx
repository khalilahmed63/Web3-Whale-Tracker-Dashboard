"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SpotlightPanel } from "@/components/dashboard/SpotlightPanel";

interface FlowChartPoint {
  bucketStart: string;
  inflowUsd: number;
  outflowUsd: number;
}

interface FlowChartProps {
  data: FlowChartPoint[];
  isDark?: boolean;
  isLoading?: boolean;
}

export function FlowChart({ data, isDark = false, isLoading = false }: FlowChartProps) {
  const gridColor = isDark ? "#3f3f46" : "#e4e4e7";
  const axisColor = isDark ? "#a1a1aa" : "#71717a";
  const tooltipStyle = {
    backgroundColor: isDark ? "#111827" : "#ffffff",
    borderColor: isDark ? "#374151" : "#e4e4e7",
    color: isDark ? "#e5e7eb" : "#111827",
  };

  return (
    <SpotlightPanel
      className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-xl shadow-black/25 transition duration-300 hover:border-zinc-600"
      glowColor="rgba(99,102,241,0.14)"
      glowSizePx={320}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">Inflow vs outflow (last 12h)</h2>
        <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300 ring-1 ring-zinc-700">Live trend</span>
      </div>
      <div className="mt-4 h-72 min-h-72 min-w-0">
        {isLoading ? (
          <div className="grid h-full grid-cols-12 items-end gap-2 rounded-lg border border-zinc-700 px-4 pb-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="animate-pulse rounded-t bg-zinc-700/80"
                style={{ height: `${20 + ((i * 11) % 65)}%` }}
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-400">
            <div className="text-center">
              <p className="text-lg">📈</p>
              <p className="mt-1">No flow data available yet.</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="bucketStart"
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: "2-digit" })}
                stroke={axisColor}
              />
              <YAxis stroke={axisColor} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
              <Tooltip
                formatter={(value) => `$${Number(value ?? 0).toLocaleString()}`}
                labelFormatter={(value) => new Date(value).toLocaleString()}
                contentStyle={tooltipStyle}
              />
              <Area type="monotone" dataKey="inflowUsd" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.18} />
              <Area type="monotone" dataKey="outflowUsd" stroke="#f43f5e" strokeWidth={2} fill="#f43f5e" fillOpacity={0.16} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </SpotlightPanel>
  );
}
