"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Package, TrendingUp, TrendingDown, DollarSign, ShoppingBag, ArrowRight, Plus, BarChart3, Clock, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getInventory, type InventoryItem } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => { setItems(await getInventory()); setLoading(false); }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const totalItems = items.length;
  const activeItems = items.filter(i => i.status === "Active on Fleek").length;
  const soldItems = items.filter(i => i.status === "Sold" || i.status === "Shipped").length;
  const sourcedItems = items.filter(i => i.status === "Sourced").length;

  const totalCost = items.reduce((s, i) => s + (parseFloat(i.sourcingCost) || 0) * (parseInt(i.pieces) || 1), 0);
  const totalRevenue = items.filter(i => i.status === "Sold" || i.status === "Shipped").reduce((s, i) => s + (parseFloat(i.sellingPrice) || 0) * (parseInt(i.pieces) || 1), 0);
  const totalProfit = totalRevenue - items.filter(i => i.status === "Sold" || i.status === "Shipped").reduce((s, i) => s + (parseFloat(i.sourcingCost) || 0) * (parseInt(i.pieces) || 1), 0);
  const portfolioValue = items.filter(i => i.status !== "Sold" && i.status !== "Shipped").reduce((s, i) => s + (parseFloat(i.sellingPrice || i.sourcingCost) || 0) * (parseInt(i.pieces) || 1), 0);

  const recentItems = [...items].slice(0, 6);
  const topCategories = Object.entries(items.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc; }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const now = new Date();
  const thisMonth = items.filter(i => { const d = new Date(i.sourcingDate); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const soldThisMonth = items.filter(i => i.soldDate && ["Sold","Shipped"].includes(i.status)).filter(i => { const d = new Date(i.soldDate!); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });

  if (loading) return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">{[1,2,3,4].map(i => <Card key={i}><CardContent className="p-4 sm:p-5"><Skeleton className="h-10 w-10 rounded-xl mb-3" /><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-7 w-28" /></CardContent></Card>)}</div>
      <div className="grid lg:grid-cols-2 gap-4">{[1,2].map(i => <Card key={i}><CardContent className="p-5"><Skeleton className="h-5 w-32 mb-4" /><div className="space-y-3">{[1,2,3].map(j => <Skeleton key={j} className="h-16 w-full rounded-xl" />)}</div></CardContent></Card>)}</div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* ── GREETING ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-on-surface tracking-tight flex items-center gap-2">
            Dashboard <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </h1>
          <p className="text-[12px] sm:text-[13px] text-on-surface-3 mt-0.5">Your vintage empire at a glance</p>
        </div>
        <Button onClick={() => router.push("/inventory?add=true")} className="shrink-0"><Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Item</span><span className="sm:hidden">Add</span></Button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          { label: "Total Items", value: totalItems, sub: sourcedItems + " sourced", icon: Package, color: "text-primary", bg: "bg-primary/10" },
          { label: "Portfolio", value: formatCurrency(portfolioValue), sub: activeItems + " active", icon: TrendingUp, color: "text-green", bg: "bg-green/10" },
          { label: "Revenue", value: formatCurrency(totalRevenue), sub: soldItems + " sold", icon: DollarSign, color: "text-blue", bg: "bg-blue/10" },
          { label: "Profit", value: formatCurrency(totalProfit), sub: totalProfit >= 0 ? "Positive ↑" : "Negative ↓", icon: totalProfit >= 0 ? TrendingUp : TrendingDown, color: totalProfit >= 0 ? "text-green" : "text-red", bg: totalProfit >= 0 ? "bg-green/10" : "bg-red/10" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-5">
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${s.bg} flex items-center justify-center mb-2.5 sm:mb-3 ${s.color}`}>
                <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-on-surface-3 font-medium">{s.label}</p>
              <p className="text-[16px] sm:text-[22px] font-bold text-on-surface leading-tight mt-0.5 truncate">{s.value}</p>
              <p className={`text-[10px] sm:text-[11px] mt-1 ${s.color} font-medium`}>{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── THIS MONTH STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <Card><CardContent className="p-3 sm:p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><ShoppingBag className="w-4 h-4 text-primary" /></div>
          <div><p className="text-[10px] text-on-surface-3">Sourced this month</p><p className="text-[15px] sm:text-[17px] font-bold text-on-surface">{thisMonth.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-3 sm:p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green/10 flex items-center justify-center shrink-0"><Star className="w-4 h-4 text-green" /></div>
          <div><p className="text-[10px] text-on-surface-3">Sold this month</p><p className="text-[15px] sm:text-[17px] font-bold text-on-surface">{soldThisMonth.length}</p></div>
        </CardContent></Card>
        <Card className="hidden sm:block"><CardContent className="p-3 sm:p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue/10 flex items-center justify-center shrink-0"><BarChart3 className="w-4 h-4 text-blue" /></div>
          <div><p className="text-[10px] text-on-surface-3">Total invested</p><p className="text-[15px] sm:text-[17px] font-bold text-on-surface">{formatCurrency(totalCost)}</p></div>
        </CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* ── RECENT ITEMS ── */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] sm:text-[16px] font-bold text-on-surface flex items-center gap-2"><Clock className="w-4 h-4 text-on-surface-3" /> Recent Items</h3>
                <button onClick={() => router.push("/inventory")} className="text-[12px] text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer">View all <ArrowRight className="w-3 h-3" /></button>
              </div>
              {recentItems.length === 0 ? (
                <div className="text-center py-10 text-on-surface-3"><Package className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-[13px]">No items yet</p></div>
              ) : (
                <div className="space-y-2">
                  {recentItems.map(item => {
                    const imgs = item.images ? item.images.split(',').filter(Boolean) : [];
                    const pcs = parseInt(item.pieces) || 1;
                    const price = (parseFloat(item.sellingPrice || item.sourcingCost) || 0) * pcs;
                    return (
                      <div key={item.id} onClick={() => router.push("/inventory")} className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer group">
                        {imgs[0] ? (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-line shrink-0"><img src={imgs[0]} alt="" className="w-full h-full object-cover" /></div>
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-surface-2 flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-on-surface-3" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] sm:text-[13px] font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{item.itemName}</p>
                          <p className="text-[10px] sm:text-[11px] text-on-surface-3">{item.category} · {item.size}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[12px] sm:text-[13px] font-bold text-on-surface">{formatCurrency(price)}</p>
                          <div className="scale-[0.85] origin-right"><StatusBadge status={item.status} /></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── TOP CATEGORIES ── */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <h3 className="text-[14px] sm:text-[16px] font-bold text-on-surface mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-on-surface-3" /> Categories</h3>
              {topCategories.length === 0 ? (
                <div className="text-center py-10 text-on-surface-3"><p className="text-[13px]">No data yet</p></div>
              ) : (
                <div className="space-y-3">
                  {topCategories.map(([cat, count], i) => {
                    const pct = Math.round((count / totalItems) * 100);
                    const colors = ["bg-primary", "bg-green", "bg-blue", "bg-orange", "bg-red"];
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[12px] sm:text-[13px] font-medium text-on-surface">{cat}</span>
                          <span className="text-[11px] text-on-surface-3">{count} items · {pct}%</span>
                        </div>
                        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-700`} style={{ width: pct + "%" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
