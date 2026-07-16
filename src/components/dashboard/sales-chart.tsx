"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/lib/theme";

export function SalesChart({ data }: { data: { month: string; revenue: number; items: number }[] }) {
  const { theme } = useTheme();
  const d = theme === "dark";
  if (data.every(x => x.revenue === 0)) return <div className="h-48 flex items-center justify-center text-sm text-[--c-text-3]">No sales data yet</div>;
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top:5,right:5,left:-20,bottom:5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={d?"#2a2a2e":"#e2e5ea"} />
          <XAxis dataKey="month" tick={{fontSize:11,fill:d?"#55555e":"#9ca3af"}} axisLine={{stroke:d?"#2a2a2e":"#e2e5ea"}} />
          <YAxis tick={{fontSize:11,fill:d?"#55555e":"#9ca3af"}} axisLine={{stroke:d?"#2a2a2e":"#e2e5ea"}} tickFormatter={(v:number)=>`£${v}`} />
          <Tooltip contentStyle={{backgroundColor:d?"#161618":"#fff",border:`1px solid ${d?"#2a2a2e":"#e2e5ea"}`,borderRadius:"8px",fontSize:"12px",color:d?"#ececef":"#111827"}}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v:any)=>[`£${Number(v).toFixed(2)}`,"Revenue"]} />
          <Bar dataKey="revenue" fill={d?"#6366f1":"#4f46e5"} radius={[4,4,0,0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
