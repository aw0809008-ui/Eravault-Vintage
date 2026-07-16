"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesChartProps {
  data: { month: string; revenue: number; items: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
  if (data.every((d) => d.revenue === 0)) {
    return (
      <div className="h-64 flex items-center justify-center text-stone-400 text-sm">
        No sales data yet. Start selling to see trends!
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#78716c" }}
            axisLine={{ stroke: "#d6d3d1" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#78716c" }}
            axisLine={{ stroke: "#d6d3d1" }}
            tickFormatter={(v: number) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e7e5e4",
              borderRadius: "8px",
              fontSize: "13px",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
          />
          <Bar
            dataKey="revenue"
            fill="#d97706"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
