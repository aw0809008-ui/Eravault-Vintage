"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTheme } from "@/lib/theme";

interface CategoryChartProps {
  data: { name: string; value: number }[];
}

const COLORS_DARK = ["#fafafa", "#a1a1aa", "#71717a", "#52525b", "#3f3f46", "#27272a", "#18181b"];
const COLORS_LIGHT = ["#0f172a", "#1e293b", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1"];

export function CategoryChart({ data }: CategoryChartProps) {
  const { theme } = useTheme();
  const colors = theme === "dark" ? COLORS_DARK : COLORS_LIGHT;

  if (data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
        No data yet
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
              border: `1px solid ${theme === "dark" ? "#3f3f46" : "#e2e8f0"}`,
              borderRadius: "8px",
              fontSize: "12px",
              color: theme === "dark" ? "#fafafa" : "#0f172a",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px" }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
