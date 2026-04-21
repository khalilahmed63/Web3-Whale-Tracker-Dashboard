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

interface FlowChartPoint {
  bucketStart: string;
  inflowUsd: number;
  outflowUsd: number;
}

interface FlowChartProps {
  data: FlowChartPoint[];
}

export function FlowChart({ data }: FlowChartProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900">Inflow vs outflow (last 12h)</h2>
      <div className="mt-4 h-72">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-zinc-200 text-sm text-zinc-500">
            No flow data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis
                dataKey="bucketStart"
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: "2-digit" })}
                stroke="#71717a"
              />
              <YAxis stroke="#71717a" tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
              <Tooltip
                formatter={(value) => `$${Number(value ?? 0).toLocaleString()}`}
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Area type="monotone" dataKey="inflowUsd" stroke="#059669" fill="#10b981" fillOpacity={0.15} />
              <Area type="monotone" dataKey="outflowUsd" stroke="#dc2626" fill="#ef4444" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
