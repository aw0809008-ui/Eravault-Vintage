"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3 } from "lucide-react";
import { getInventory, type InventoryItem } from "@/lib/supabase";

export default function AnalyticsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getInventory().then(i => { setItems(i); setLoading(false); }); }, []);

  const avgCost = items.length > 0 ? items.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sourcingCost || "0"), 0) / items.length : 0;
  const soldItems = items.filter((i: InventoryItem) => (i.status === "Sold" || i.status === "Shipped") && i.sellingPrice);
  const avgPrice = soldItems.length > 0 ? soldItems.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sellingPrice || "0"), 0) / soldItems.length : 0;
  const avgProfit = soldItems.length > 0 ? soldItems.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sellingPrice || "0") - parseFloat(i.sourcingCost || "0"), 0) / soldItems.length : 0;
  const totalRev = soldItems.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sellingPrice || "0"), 0);
  const totalCost = soldItems.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sourcingCost || "0"), 0);
  const margin = totalRev > 0 ? (((totalRev - totalCost) / totalRev) * 100).toFixed(1) : "0";

  const catBreakdown = items.reduce((acc: Record<string, number>, item: InventoryItem) => { acc[item.category] = (acc[item.category] || 0) + 1; return acc; }, {});
  const categoryData = Object.entries(catBreakdown).map(([name, value]) => ({ name, value: value as number }));
  const condBreakdown = items.reduce((acc: Record<string, number>, item: InventoryItem) => { acc[item.condition] = (acc[item.condition] || 0) + 1; return acc; }, {});

  const now = new Date();
  const monthlySales = Array.from({ length: 6 }, (_, idx) => {
    const i = 5 - idx; const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const me = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const mi = soldItems.filter((item: InventoryItem) => { const sd = item.soldDate ? new Date(item.soldDate) : null; return sd && sd >= d && sd <= me; });
    return { month: d.toLocaleString("en-US", { month: "short" }), revenue: mi.reduce((s: number, item: InventoryItem) => s + parseFloat(item.sellingPrice || "0"), 0), items: mi.length };
  });

  const catProfits: Record<string, { revenue: number; cost: number; count: number }> = {};
  soldItems.forEach((item: InventoryItem) => { if (!catProfits[item.category]) catProfits[item.category] = { revenue: 0, cost: 0, count: 0 }; catProfits[item.category].revenue += parseFloat(item.sellingPrice || "0"); catProfits[item.category].cost += parseFloat(item.sourcingCost || "0"); catProfits[item.category].count += 1; });

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics</h1><p className="mt-1" style={{ color: 'var(--text-muted)' }}>Performance insights</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ label: "Avg Cost", value: formatCurrency(avgCost), icon: DollarSign }, { label: "Avg Price", value: formatCurrency(avgPrice), icon: TrendingUp }, { label: "Avg Profit", value: formatCurrency(avgProfit), icon: avgProfit >= 0 ? TrendingUp : TrendingDown }, { label: "Margin", value: `${margin}%`, icon: Percent }].map(m => (
          <Card key={m.label}><CardContent className="p-4">{loading ? <div className="space-y-3"><Skeleton className="h-8 w-8 rounded-lg" /><Skeleton className="h-6 w-20" /></div> : <><div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-tertiary)' }}><m.icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></div><p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{m.value}</p><p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{m.label}</p></>}</CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-56 w-full" /> : <SalesChart data={monthlySales} />}</CardContent></Card>
        <Card><CardHeader><CardTitle>Categories</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-56 w-full" /> : <CategoryChart data={categoryData} />}</CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Conditions</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-32 w-full" /> : Object.keys(condBreakdown).length === 0 ? <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}><BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />No data</div> : <div className="space-y-3">{Object.entries(condBreakdown).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([c, count]) => { const pct = items.length > 0 ? (((count as number) / items.length) * 100).toFixed(0) : "0"; return <div key={c}><div className="flex justify-between text-sm mb-1"><span style={{ color: 'var(--text-primary)' }}>{c}</span><span style={{ color: 'var(--text-muted)' }}>{count as number} ({pct}%)</span></div><div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}><div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }} /></div></div>; })}</div>}</CardContent></Card>
        <Card><CardHeader><CardTitle>Category Profit</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-32 w-full" /> : Object.keys(catProfits).length === 0 ? <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}><BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />No sales</div> : <div className="space-y-3">{Object.entries(catProfits).sort((a, b) => (b[1].revenue - b[1].cost) - (a[1].revenue - a[1].cost)).map(([cat, data]) => { const p = data.revenue - data.cost; return <div key={cat} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}><div><p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{cat}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{data.count} sold · {formatCurrency(data.revenue)}</p></div><span className={`text-sm font-bold ${p >= 0 ? "text-green-500" : "text-red-500"}`}>{p >= 0 ? "+" : ""}{formatCurrency(p)}</span></div>; })}</div>}</CardContent></Card>
      </div>
    </div>
  );
}
