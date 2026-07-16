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

  useEffect(() => {
    getInventory().then(i => { setItems(i); setLoading(false); });
  }, []);

  const totalItems = items.length;
  const activeListings = items.filter((i: InventoryItem) => i.status === "Active on Fleek").length;
  const totalSold = items.filter((i: InventoryItem) => i.status === "Sold" || i.status === "Shipped").length;
  const sourcingInvestment = items.reduce((sum: number, i: InventoryItem) => sum + parseFloat(i.sourcingCost || "0"), 0);
  const soldItems = items.filter((i: InventoryItem) => (i.status === "Sold" || i.status === "Shipped") && i.sellingPrice);
  const totalRevenue = soldItems.reduce((sum: number, i: InventoryItem) => sum + parseFloat(i.sellingPrice || "0"), 0);
  const soldCost = soldItems.reduce((sum: number, i: InventoryItem) => sum + parseFloat(i.sourcingCost || "0"), 0);
  const netProfit = totalRevenue - soldCost;

  const catBreakdown = items.reduce((acc: Record<string, number>, item: InventoryItem) => { acc[item.category] = (acc[item.category] || 0) + 1; return acc; }, {});
  const categoryBreakdown = Object.entries(catBreakdown).map(([name, value]) => ({ name, value: value as number }));

  const now = new Date();
  const monthlySales = Array.from({ length: 6 }, (_, idx) => {
    const i = 5 - idx;
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthItems = soldItems.filter((item: InventoryItem) => { const sd = item.soldDate ? new Date(item.soldDate) : null; return sd && sd >= d && sd <= monthEnd; });
    return { month: d.toLocaleString("en-US", { month: "short" }), revenue: monthItems.reduce((sum: number, item: InventoryItem) => sum + parseFloat(item.sellingPrice || "0"), 0), items: monthItems.length };
  });

  const recentItems = [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  const metricCards = [
    { label: "Total Items", value: totalItems, icon: Package, format: "number" as const },
    { label: "Active", value: activeListings, icon: Tag, format: "number" as const },
    { label: "Sold", value: totalSold, icon: ShoppingBag, format: "number" as const },
    { label: "Investment", value: sourcingInvestment, icon: DollarSign, format: "currency" as const },
    { label: "Revenue", value: totalRevenue, icon: Truck, format: "currency" as const },
    { label: "Profit", value: netProfit, icon: TrendingUp, format: "currency" as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Your inventory overview</p>
        </div>
        <Link href="/inventory?add=true"><Button><Plus className="w-4 h-4" />Add Item</Button></Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricCards.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              {loading ? <div className="space-y-3"><Skeleton className="h-8 w-8 rounded-lg" /><Skeleton className="h-6 w-16" /><Skeleton className="h-3 w-12" /></div> : (
                <>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-tertiary)' }}><metric.icon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></div>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{metric.format === "currency" ? formatCurrency(metric.value) : metric.value}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{metric.label}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-56 w-full rounded-lg" /> : <SalesChart data={monthlySales} />}</CardContent></Card>
        <Card><CardHeader><CardTitle>Categories</CardTitle></CardHeader><CardContent>{loading ? <Skeleton className="h-56 w-full rounded-lg" /> : <CategoryChart data={categoryBreakdown} />}</CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Link href="/inventory"><Button variant="ghost" size="sm">View all <ArrowUpRight className="w-3 h-3 ml-1" /></Button></Link>
        </CardHeader>
        <CardContent>
          {loading ? <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="flex items-center gap-4"><Skeleton className="h-10 w-10 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-24" /></div><Skeleton className="h-6 w-16 rounded-full" /></div>))}</div> : recentItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} /><p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No items yet</p>
              <Link href="/inventory?add=true"><Button className="mt-4" size="sm"><Plus className="w-4 h-4" />Add Item</Button></Link>
            </div>
          ) : (
            <div className="space-y-2">{recentItems.map((item) => (
              <Link key={item.id} href="/inventory" className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-[--bg-hover]">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-tertiary)' }}><Package className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.itemName}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.category} · {formatDate(item.updatedAt)}</p></div>
                <div className="flex items-center gap-3 flex-shrink-0"><span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-primary)' }}>{item.sellingPrice ? formatCurrency(item.sellingPrice) : formatCurrency(item.sourcingCost)}</span><StatusBadge status={item.status} /></div>
              </Link>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
