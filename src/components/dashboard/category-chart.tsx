"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTheme } from "@/lib/theme";

const CD = ["#fafafa","#a1a1aa","#71717a","#52525b","#3f3f46","#27272a"];
const CL = ["#18181b","#3f3f46","#52525b","#71717a","#a1a1aa","#d4d4d8"];

export function CategoryChart({ data }: { data: { name: string; value: number }[] }) {
  const { theme } = useTheme();
  const c = theme === "dark" ? CD : CL;
  const d = theme === "dark";
  if (data.length === 0) return <div className="h-52 flex items-center justify-center text-sm text-[--text-dim]">No data yet</div>;
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={36} outerRadius={68} paddingAngle={2} dataKey="value" strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={c[i % c.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: d ? "#18181b" : "#fff", border: `1px solid ${d ? "#3f3f46" : "#e4e4e7"}`, borderRadius: "8px", fontSize: "12px", color: d ? "#fafafa" : "#09090b" }} />
          <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" iconSize={7} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
