"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTheme } from "@/lib/theme";
const COLORS = ["#f59e0b","#22c55e","#3b82f6","#ef4444","#8b5cf6","#ec4899","#06b6d4"];
export function CategoryChart({ data }: { data: { name: string; value: number }[] }) {
  const { theme } = useTheme(); const d = theme === "dark";
  if (data.length === 0) return <div className="h-52 flex items-center justify-center text-sm text-on-surface-3 font-semibold">No data yet</div>;
  return <div className="h-52"><ResponsiveContainer width="100%" height="100%"><PieChart>
    <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={72} paddingAngle={4} dataKey="value" strokeWidth={0} cornerRadius={4}>{data.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie>
    <Tooltip contentStyle={{backgroundColor:d?"#111113":"#fff",border:`1px solid ${d?"#27272a":"#e8e0d4"}`,borderRadius:"14px",fontSize:"12px",fontWeight:600,color:d?"#f0ece6":"#1a1612",boxShadow:"0 12px 40px rgba(0,0,0,0.15)"}} />
    <Legend wrapperStyle={{fontSize:"11px",fontWeight:600}} iconType="circle" iconSize={8} />
  </PieChart></ResponsiveContainer></div>;
}
