"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, Trophy, Flame } from "lucide-react";
import { getInventory, type InventoryItem } from "@/lib/supabase";

export default function AnalyticsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { getInventory().then(i => { setItems(i); setLoading(false); }); }, []);

  const sold = items.filter((i: InventoryItem) => (i.status === "Sold" || i.status === "Shipped") && i.sellingPrice);
  const avgCost = items.length > 0 ? items.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sourcingCost || "0"), 0) / items.length : 0;
  const avgPrice = sold.length > 0 ? sold.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sellingPrice || "0"), 0) / sold.length : 0;
  const avgProfit = sold.length > 0 ? sold.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sellingPrice || "0") - parseFloat(i.sourcingCost || "0"), 0) / sold.length : 0;
  const totalRev = sold.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sellingPrice || "0"), 0);
  const totalCost = sold.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sourcingCost || "0"), 0);
  const margin = totalRev > 0 ? Math.round(((totalRev - totalCost) / totalRev) * 100) : 0;

  // Best performer
  const bestItem = sold.length > 0 ? sold.reduce((best, item) => {
    const p = parseFloat(item.sellingPrice || "0") - parseFloat(item.sourcingCost || "0");
    const bp = parseFloat(best.sellingPrice || "0") - parseFloat(best.sourcingCost || "0");
    return p > bp ? item : best;
  }, sold[0]) : null;
  const bestProfit = bestItem ? parseFloat(bestItem.sellingPrice || "0") - parseFloat(bestItem.sourcingCost || "0") : 0;

  const cats = items.reduce((a: Record<string, number>, i: InventoryItem) => { a[i.category] = (a[i.category] || 0) + 1; return a; }, {});
  const conds = items.reduce((a: Record<string, number>, i: InventoryItem) => { a[i.condition] = (a[i.condition] || 0) + 1; return a; }, {});

  const now = new Date();
  const monthly = Array.from({ length: 6 }, (_, idx) => {
    const n = 5 - idx; const d = new Date(now.getFullYear(), now.getMonth() - n, 1); const me = new Date(now.getFullYear(), now.getMonth() - n + 1, 0);
    const mi = sold.filter((x: InventoryItem) => { const sd = x.soldDate ? new Date(x.soldDate) : null; return sd && sd >= d && sd <= me; });
    return { month: d.toLocaleString("en-US", { month: "short" }), revenue: mi.reduce((s: number, x: InventoryItem) => s + parseFloat(x.sellingPrice || "0"), 0), items: mi.length };
  });

  const catProfits: Record<string, { revenue: number; cost: number; count: number }> = {};
  sold.forEach((i: InventoryItem) => { if (!catProfits[i.category]) catProfits[i.category] = { revenue: 0, cost: 0, count: 0 }; catProfits[i.category].revenue += parseFloat(i.sellingPrice || "0"); catProfits[i.category].cost += parseFloat(i.sourcingCost || "0"); catProfits[i.category].count++; });

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-[22px] font-bold text-on-surface tracking-tight">Analytics</h1><p className="text-[13px] text-on-surface-3 mt-0.5">Business performance insights</p></div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Avg Cost", v: formatCurrency(avgCost), i: DollarSign, c: "from-blue-500 to-indigo-600" },
          { l: "Avg Sell Price", v: formatCurrency(avgPrice), i: TrendingUp, c: "from-emerald-500 to-teal-600" },
          { l: "Avg Profit/Item", v: formatCurrency(avgProfit), i: avgProfit >= 0 ? Flame : TrendingDown, c: avgProfit >= 0 ? "from-green-500 to-emerald-600" : "from-red-500 to-rose-600" },
          { l: "Profit Margin", v: `${margin}%`, i: Percent, c: "from-violet-500 to-purple-600" },
        ].map(m => (
          <Card key={m.l}><CardContent className="p-4">{loading ? <div className="space-y-3"><Skeleton className="h-8 w-8 rounded-xl" /><Skeleton className="h-6 w-20" /><Skeleton className="h-3 w-16" /></div> : <>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${m.c} flex items-center justify-center mb-3 shadow-sm`}><m.i className="w-4 h-4 text-white" /></div>
            <p className="text-[20px] font-bold text-on-surface tracking-tight">{m.v}</p>
            <p className="text-[11px] text-on-surface-3 mt-0.5 font-medium">{m.l}</p>
          </>}</CardContent></Card>
        ))}
      </div>

      {/* Best Performer */}
      {!loading && bestItem && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/0 border-primary/15">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Trophy className="w-6 h-6 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-on-surface-3 font-medium">Best Performer</p>
              <p className="text-[15px] font-bold text-on-surface truncate">{bestItem.itemName}</p>
              <p className="text-[12px] text-on-surface-3">{bestItem.category} · Cost {formatCurrency(bestItem.sourcingCost)} → Sold {formatCurrency(bestItem.sellingPrice)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[20px] font-bold text-green">+{formatCurrency(bestProfit)}</p>
              <p className="text-[11px] text-green font-semibold">{parseFloat(bestItem.sourcingCost) > 0 ? Math.round((bestProfit / parseFloat(bestItem.sourcingCost)) * 100) : 0}% ROI</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-48 w-full" /> : <SalesChart data={monthly} />}</CardContent></Card>
        <Card><CardHeader><CardTitle>Inventory by Category</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-48 w-full" /> : <CategoryChart data={Object.entries(cats).map(([n, v]) => ({ name: n, value: v as number }))} />}</CardContent></Card>
      </div>

      {/* Condition + Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>By Condition Grade</CardTitle></CardHeader>
          <CardContent>{loading ? <Skeleton className="h-32 w-full" /> : Object.keys(conds).length === 0 ? <div className="py-8 text-center text-[13px] text-on-surface-3"><BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />No data</div> : (
            <div className="space-y-3">{Object.entries(conds).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([c, count]) => {
              const pct = items.length > 0 ? Math.round(((count as number) / items.length) * 100) : 0;
              return <div key={c}><div className="flex justify-between text-[13px] mb-1"><span className="font-medium text-on-surface">Grade {c}</span><span className="text-on-surface-3">{count as number} ({pct}%)</span></div><div className="w-full rounded-full h-2 bg-surface-2"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div></div>;
            })}</div>
          )}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Category Performance</CardTitle></CardHeader>
          <CardContent>{loading ? <Skeleton className="h-32 w-full" /> : Object.keys(catProfits).length === 0 ? <div className="py-8 text-center text-[13px] text-on-surface-3"><BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />No sales data</div> : (
            <div className="space-y-2.5">{Object.entries(catProfits).sort((a, b) => (b[1].revenue - b[1].cost) - (a[1].revenue - a[1].cost)).map(([cat, d]) => {
              const p = d.revenue - d.cost; const roi = d.cost > 0 ? Math.round((p / d.cost) * 100) : 0;
              return <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-surface-2">
                <div><p className="text-[13px] font-semibold text-on-surface">{cat}</p><p className="text-[11px] text-on-surface-3">{d.count} sold · {formatCurrency(d.revenue)} rev</p></div>
                <div className="text-right"><p className={`text-[14px] font-bold ${p >= 0 ? "text-green" : "text-red"}`}>{p >= 0 ? "+" : ""}{formatCurrency(p)}</p><p className={`text-[11px] font-semibold ${roi >= 0 ? "text-green" : "text-red"}`}>{roi}% ROI</p></div>
              </div>;
            })}</div>
          )}</CardContent>
        </Card>
      </div>
    </div>
  );
}
