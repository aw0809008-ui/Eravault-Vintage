"use client";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, DollarSign, TrendingUp, Tag, Truck, ArrowUpRight, Plus, Flame, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency, timeAgo, getGreeting, profitPercent } from "@/lib/utils";
import Link from "next/link";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { getInventory, getUser, type InventoryItem } from "@/lib/supabase";

export default function DashboardPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    Promise.all([getInventory(), getUser()]).then(([inv, user]) => {
      setItems(inv);
      setUserName(user?.user_metadata?.name || user?.email?.split("@")[0] || "");
      setLoading(false);
    });
  }, []);

  const sold = items.filter((i: InventoryItem) => (i.status === "Sold" || i.status === "Shipped") && i.sellingPrice);
  const active = items.filter((i: InventoryItem) => i.status === "Active on Fleek");
  const sourced = items.filter((i: InventoryItem) => i.status === "Sourced");
  const rev = sold.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sellingPrice || "0"), 0);
  const cost = sold.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sourcingCost || "0"), 0);
  const totalInvested = items.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sourcingCost || "0"), 0);
  const profit = rev - cost;
  const avgProfit = sold.length > 0 ? profit / sold.length : 0;

  const cats = items.reduce((a: Record<string, number>, i: InventoryItem) => { a[i.category] = (a[i.category] || 0) + 1; return a; }, {});
  const now = new Date();
  const monthly = Array.from({ length: 6 }, (_, idx) => {
    const n = 5 - idx; const d = new Date(now.getFullYear(), now.getMonth() - n, 1); const me = new Date(now.getFullYear(), now.getMonth() - n + 1, 0);
    const mi = sold.filter((x: InventoryItem) => { const sd = x.soldDate ? new Date(x.soldDate) : null; return sd && sd >= d && sd <= me; });
    return { month: d.toLocaleString("en-US", { month: "short" }), revenue: mi.reduce((s: number, x: InventoryItem) => s + parseFloat(x.sellingPrice || "0"), 0), items: mi.length };
  });
  const recent = [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);

  // Status distribution for bar
  const statusCounts = { sourced: sourced.length, active: active.length, sold: sold.length };
  const total = items.length || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          {loading ? <Skeleton className="h-7 w-48 mb-1.5" /> : (
            <h1 className="text-[24px] font-bold text-on-surface tracking-tight">
              {getGreeting()}{userName ? `, ${userName}` : ""} 👋
            </h1>
          )}
          <p className="text-[13px] text-on-surface-3 mt-0.5">
            {loading ? "" : items.length === 0 ? "Start by adding your first item" : `${items.length} items · ${active.length} active · ${sold.length} sold`}
          </p>
        </div>
        <Link href="/inventory?add=true"><Button><Plus className="w-4 h-4" />Add Item</Button></Link>
      </div>

      {/* Status Distribution Bar */}
      {!loading && items.length > 0 && (
        <div className="space-y-2">
          <div className="flex h-2.5 rounded-full overflow-hidden bg-surface-2">
            {statusCounts.sourced > 0 && <div className="bg-blue h-full transition-all" style={{ width: `${(statusCounts.sourced / total) * 100}%` }} />}
            {statusCounts.active > 0 && <div className="bg-green h-full transition-all" style={{ width: `${(statusCounts.active / total) * 100}%` }} />}
            {statusCounts.sold > 0 && <div className="bg-orange h-full transition-all" style={{ width: `${(statusCounts.sold / total) * 100}%` }} />}
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue" /><span className="text-on-surface-3">Sourced {statusCounts.sourced}</span></span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green" /><span className="text-on-surface-3">Active {statusCounts.active}</span></span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange" /><span className="text-on-surface-3">Sold {statusCounts.sold}</span></span>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { l: "Total Items", v: items.length, i: Package, f: false, c: "from-blue-500 to-indigo-600" },
          { l: "Active Listings", v: active.length, i: Tag, f: false, c: "from-emerald-500 to-teal-600" },
          { l: "Total Sold", v: sold.length, i: ShoppingBag, f: false, c: "from-violet-500 to-purple-600" },
          { l: "Invested", v: totalInvested, i: DollarSign, f: true, c: "from-rose-500 to-pink-600" },
          { l: "Revenue", v: rev, i: Truck, f: true, c: "from-cyan-500 to-blue-600" },
          { l: "Net Profit", v: profit, i: TrendingUp, f: true, c: "from-green-500 to-emerald-600" },
        ].map(m => (
          <Card key={m.l}>
            <CardContent className="p-4">
              {loading ? <div className="space-y-3"><Skeleton className="h-8 w-8 rounded-xl" /><Skeleton className="h-6 w-16" /><Skeleton className="h-3 w-12" /></div> : <>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${m.c} flex items-center justify-center mb-3 shadow-sm`}><m.i className="w-4 h-4 text-white" /></div>
                <p className={`text-[20px] font-bold tracking-tight ${m.f && m.v < 0 ? 'text-red' : 'text-on-surface'}`}>{m.f ? formatCurrency(m.v) : m.v}</p>
                <p className="text-[11px] text-on-surface-3 mt-0.5 font-medium">{m.l}</p>
              </>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Highlights Row */}
      {!loading && sold.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/0 border-primary/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Flame className="w-5 h-5 text-primary" /></div>
              <div><p className="text-[20px] font-bold text-on-surface">{formatCurrency(avgProfit)}</p><p className="text-[11px] text-on-surface-3">Avg Profit/Item</p></div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green/5 to-green/0 border-green/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center shrink-0"><Target className="w-5 h-5 text-green" /></div>
              <div><p className="text-[20px] font-bold text-on-surface">{rev > 0 ? Math.round((profit / rev) * 100) : 0}%</p><p className="text-[11px] text-on-surface-3">Profit Margin</p></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-48 w-full rounded-xl" /> : <SalesChart data={monthly} />}</CardContent></Card>
        <Card><CardHeader><CardTitle>By Category</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-48 w-full rounded-xl" /> : <CategoryChart data={Object.entries(cats).map(([n, v]) => ({ name: n, value: v as number }))} />}</CardContent></Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Link href="/inventory"><Button variant="ghost" size="sm" className="text-primary">View all<ArrowUpRight className="w-3.5 h-3.5 ml-1" /></Button></Link>
        </CardHeader>
        <CardContent>
          {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="flex items-center gap-3"><Skeleton className="h-11 w-11 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div></div>)}</div>
            : recent.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4"><Package className="w-7 h-7 text-on-surface-3" /></div>
                <h3 className="text-[15px] font-semibold text-on-surface">No items yet</h3>
                <p className="text-[13px] text-on-surface-3 mt-1">Add your first vintage piece to get started</p>
                <Link href="/inventory?add=true"><Button className="mt-4" size="sm"><Plus className="w-3.5 h-3.5" />Add Item</Button></Link>
              </div>
            ) : (
              <div className="space-y-1">{recent.map(item => {
                const pct = profitPercent(item.sourcingCost, item.sellingPrice);
                return (
                  <Link key={item.id} href="/inventory" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 transition-all group">
                    {item.images ? (
                      <div className="w-11 h-11 rounded-xl overflow-hidden border border-line shrink-0"><img src={item.images.split(',')[0]} alt="" className="w-full h-full object-cover" /></div>
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-primary" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{item.itemName}</p>
                      <p className="text-[11px] text-on-surface-3 mt-0.5">{item.category} · {timeAgo(item.updatedAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-bold text-on-surface">{item.sellingPrice ? formatCurrency(item.sellingPrice) : formatCurrency(item.sourcingCost)}</p>
                      {pct !== null && <p className={`text-[11px] font-semibold ${pct >= 0 ? 'text-green' : 'text-red'}`}>{pct >= 0 ? '+' : ''}{pct}%</p>}
                      {pct === null && <StatusBadge status={item.status} />}
                    </div>
                  </Link>
                );
              })}</div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
