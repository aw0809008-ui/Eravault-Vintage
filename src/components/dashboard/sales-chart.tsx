"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/lib/theme";
export function SalesChart({ data }: { data: { month: string; revenue: number; items: number }[] }) {
  const { theme } = useTheme(); const d = theme === "dark";
  if (data.every(x => x.revenue === 0)) return <div className="h-52 flex items-center justify-center text-sm text-on-surface-3 font-semibold">No sales data yet</div>;
  return <div className="h-52"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{top:5,right:5,left:-20,bottom:5}}>
    <defs>
      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={d ? "#c49a62" : "#b8894a"} />
        <stop offset="100%" stopColor={d ? "#885935" : "#6f4930"} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke={d?"#27272a":"#e8e0d4"} vertical={false} />
    <XAxis dataKey="month" tick={{fontSize:11,fill:d?"#52493e":"#9e8e7c",fontWeight:600}} axisLine={false} tickLine={false} />
    <YAxis tick={{fontSize:11,fill:d?"#52493e":"#9e8e7c",fontWeight:600}} axisLine={false} tickLine={false} tickFormatter={(v:number)=>`£${v}`} />
    <Tooltip contentStyle={{backgroundColor:d?"#111113":"#fff",border:`1px solid ${d?"#27272a":"#e8e0d4"}`,borderRadius:"14px",fontSize:"12px",fontWeight:600,color:d?"#f0ece6":"#1a1612",boxShadow:"0 12px 40px rgba(0,0,0,0.15)"}}
      cursor={{fill:d?"rgba(245,158,11,0.06)":"rgba(194,135,59,0.06)",radius:8}}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter={(v:any)=>[`£${Number(v).toFixed(2)}`,"Revenue"]} />
    <Bar dataKey="revenue" fill="url(#barGrad)" radius={[8,8,0,0]} maxBarSize={36} />
  </BarChart></ResponsiveContainer></div>;
}
