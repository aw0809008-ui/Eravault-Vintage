"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/lib/theme";

interface SalesChartProps {
  data: { month: string; revenue: number; items: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (data.every((d) => d.revenue === 0)) {
    return (
      <div className="h-56 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
        No sales data yet
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e2e8f0"} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDark ? "#71717a" : "#64748b" }} axisLine={{ stroke: isDark ? "#3f3f46" : "#cbd5e1" }} />
          <YAxis tick={{ fontSize: 11, fill: isDark ? "#71717a" : "#64748b" }} axisLine={{ stroke: isDark ? "#3f3f46" : "#cbd5e1" }} tickFormatter={(v: number) => `$${v}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#18181b" : "#ffffff",
              border: `1px solid ${isDark ? "#3f3f46" : "#e2e8f0"}`,
              borderRadius: "8px",
              fontSize: "12px",
              color: isDark ? "#fafafa" : "#0f172a",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
          />
          <Bar dataKey="revenue" fill={isDark ? "#fafafa" : "#0f172a"} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
