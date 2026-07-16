"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/lib/theme";

export function SalesChart({ data }: { data: { month: string; revenue: number; items: number }[] }) {
  const { theme } = useTheme();
  const d = theme === "dark";
  if (data.every(x => x.revenue === 0)) return <div className="h-52 flex items-center justify-center text-sm text-[--text-dim]">No sales data yet</div>;
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={d ? "#27272a" : "#e4e4e7"} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: d ? "#52525b" : "#a1a1aa" }} axisLine={{ stroke: d ? "#3f3f46" : "#d4d4d8" }} />
          <YAxis tick={{ fontSize: 11, fill: d ? "#52525b" : "#a1a1aa" }} axisLine={{ stroke: d ? "#3f3f46" : "#d4d4d8" }} tickFormatter={(v: number) => `£${v}`} />
          <Tooltip contentStyle={{ backgroundColor: d ? "#18181b" : "#fff", border: `1px solid ${d ? "#3f3f46" : "#e4e4e7"}`, borderRadius: "8px", fontSize: "12px", color: d ? "#fafafa" : "#09090b" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any) => [`£${Number(v).toFixed(2)}`, "Revenue"]} />
          <Bar dataKey="revenue" fill={d ? "#fafafa" : "#18181b"} radius={[4,4,0,0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
