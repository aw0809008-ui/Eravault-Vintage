"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTheme } from "@/lib/theme";
const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#06b6d4","#ec4899","#8b5cf6"];
export function CategoryChart({ data }: { data: { name: string; value: number }[] }) {
  const { theme } = useTheme(); const d = theme === "dark";
  if (data.length === 0) return <div className="h-48 flex items-center justify-center text-sm text-on-surface-3">No data yet</div>;
  return <div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart>
    <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>{data.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie>
    <Tooltip contentStyle={{backgroundColor:d?"#141416":"#fff",border:`1px solid ${d?"#2c2c30":"#e4e4e7"}`,borderRadius:"8px",fontSize:"12px",color:d?"#ececef":"#111827"}} />
    <Legend wrapperStyle={{fontSize:"11px"}} iconType="circle" iconSize={7} />
  </PieChart></ResponsiveContainer></div>;
}
