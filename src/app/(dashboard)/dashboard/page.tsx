"use client";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, DollarSign, TrendingUp, Tag, Truck, ArrowUpRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { getInventory, type InventoryItem } from "@/lib/supabase";

export default function DashboardPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getInventory().then(i => { setItems(i); setLoading(false); }); }, []);

  const sold = items.filter((i: InventoryItem) => (i.status === "Sold" || i.status === "Shipped") && i.sellingPrice);
  const rev = sold.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sellingPrice || "0"), 0);
  const cost = sold.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sourcingCost || "0"), 0);
  const cats = items.reduce((a: Record<string, number>, i: InventoryItem) => { a[i.category] = (a[i.category] || 0) + 1; return a; }, {});
  const now = new Date();
  const monthly = Array.from({ length: 6 }, (_, idx) => {
    const n = 5 - idx; const d = new Date(now.getFullYear(), now.getMonth() - n, 1); const me = new Date(now.getFullYear(), now.getMonth() - n + 1, 0);
    const mi = sold.filter((x: InventoryItem) => { const sd = x.soldDate ? new Date(x.soldDate) : null; return sd && sd >= d && sd <= me; });
    return { month: d.toLocaleString("en-US", { month: "short" }), revenue: mi.reduce((s: number, x: InventoryItem) => s + parseFloat(x.sellingPrice || "0"), 0), items: mi.length };
  });
  const recent = [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  const metrics = [
    { l: "Items", v: items.length, i: Package, f: false },
    { l: "Active", v: items.filter((i: InventoryItem) => i.status === "Active on Fleek").length, i: Tag, f: false },
    { l: "Sold", v: sold.length, i: ShoppingBag, f: false },
    { l: "Invested", v: items.reduce((s: number, i: InventoryItem) => s + parseFloat(i.sourcingCost || "0"), 0), i: DollarSign, f: true },
    { l: "Revenue", v: rev, i: Truck, f: true },
    { l: "Profit", v: rev - cost, i: TrendingUp, f: true },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h1 className="text-xl md:text-2xl font-bold text-[--text]">Dashboard</h1><p className="text-xs text-[--text-dim] mt-0.5">Overview</p></div>
        <Link href="/inventory?add=true"><Button size="sm"><Plus className="w-3.5 h-3.5" />Add Item</Button></Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map(m => <Card key={m.l}><CardContent className="p-4">{loading ? <div className="space-y-2"><Skeleton className="h-7 w-7 rounded" /><Skeleton className="h-5 w-14" /><Skeleton className="h-3 w-10" /></div> : <>
          <div className="w-7 h-7 rounded-md bg-[--bg-hover] flex items-center justify-center mb-2"><m.i className="w-3.5 h-3.5 text-[--text-sub]" /></div>
          <p className="text-lg font-bold text-[--text]">{m.f ? formatCurrency(m.v) : m.v}</p>
          <p className="text-[11px] text-[--text-dim] mt-0.5">{m.l}</p>
        </>}</CardContent></Card>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-52 w-full" /> : <SalesChart data={monthly} />}</CardContent></Card>
        <Card><CardHeader><CardTitle>Categories</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-52 w-full" /> : <CategoryChart data={Object.entries(cats).map(([n, v]) => ({ name: n, value: v as number }))} />}</CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent</CardTitle><Link href="/inventory"><Button variant="ghost" size="sm">All <ArrowUpRight className="w-3 h-3 ml-1" /></Button></Link></CardHeader>
        <CardContent>{loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-lg" /><div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-40" /><Skeleton className="h-3 w-20" /></div><Skeleton className="h-5 w-14 rounded" /></div>)}</div>
        : recent.length === 0 ? <div className="text-center py-10"><Package className="w-10 h-10 mx-auto mb-3 text-[--text-dim]" /><p className="text-sm text-[--text-sub]">No items yet</p><Link href="/inventory?add=true"><Button className="mt-3" size="sm"><Plus className="w-3.5 h-3.5" />Add</Button></Link></div>
        : <div className="space-y-1">{recent.map(item => (
          <Link key={item.id} href="/inventory" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[--bg-hover] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[--bg-hover] flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-[--text-sub]" /></div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-[--text] truncate">{item.itemName}</p><p className="text-[11px] text-[--text-dim]">{item.category} · {formatDate(item.updatedAt)}</p></div>
            <div className="flex items-center gap-2 shrink-0"><span className="text-sm font-medium text-[--text] hidden sm:block">{item.sellingPrice ? formatCurrency(item.sellingPrice) : formatCurrency(item.sourcingCost)}</span><StatusBadge status={item.status} /></div>
          </Link>
        ))}</div>}</CardContent>
      </Card>
    </div>
  );
}
