"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Package, TrendingUp, TrendingDown, DollarSign, ShoppingBag, ArrowRight, Plus, BarChart3, Clock, Star, ArrowUpRight, Layers, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const catBarColors = ["from-[#c49a62] to-[#885935]", "from-emerald-500 to-teal-600", "from-blue-500 to-indigo-600", "from-violet-500 to-purple-600", "from-rose-500 to-pink-600"];
  const catDotColors = ["bg-[#c49a62]", "bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-rose-500"];

  if (loading) return (
    <div className="space-y-6">
      <div className="rounded-3xl p-6 sm:p-8 animate-shimmer h-[120px]" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">{[1,2,3,4].map(i => <div key={i} className="rounded-2xl border border-line/60 bg-surface p-5"><Skeleton className="h-10 w-10 rounded-xl mb-3" /><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-7 w-28" /></div>)}</div>
      <div className="grid lg:grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="rounded-2xl border border-line/60 bg-surface p-5"><Skeleton className="h-5 w-32 mb-4" /><div className="space-y-3">{[1,2,3].map(j => <Skeleton key={j} className="h-16 w-full rounded-xl" />)}</div></div>)}</div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ═══════ HERO BANNER ═══════ */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 animate-fade-in" style={{ background: "linear-gradient(135deg, #1a1612 0%, #2d2318 40%, #3d2e1c 70%, #1a1612 100%)" }}>
        <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#c49a62]/20 to-[#885935]/5 blur-xl" />
        <div className="absolute bottom-[-30px] left-[-30px] w-[150px] h-[150px] rounded-full bg-gradient-to-br from-[#c49a62]/10 to-transparent blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#d1b385] text-2xl">✦</span>
              <span className="text-[11px] font-bold text-[#c49a62]/60 uppercase tracking-[0.2em]">Dashboard</span>
            </div>
            <h1 className="text-[26px] sm:text-[34px] font-black text-white tracking-tight leading-[1.1]">Your Vintage Empire</h1>
            <p className="text-[13px] text-white/40 mt-2 max-w-sm">Track your sourcing, sales, and profits — all in one beautiful place.</p>
          </div>
          <Button onClick={() => router.push("/inventory?add=true")} className="shrink-0 bg-gradient-to-r from-[#d1b385] via-[#c49a62] to-[#885935] border-0 text-white font-bold shadow-lg shadow-[#c49a62]/25 hover:shadow-[#c49a62]/40 transition-colors duration-200">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Item</span><span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* ═══════ STAT CARDS ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Items", value: String(totalItems), sub: sourcedItems + " sourced", icon: Package, gradient: "from-[#d1b385] via-[#c49a62] to-[#885935]", shadow: "shadow-[#c49a62]/20", bgGlow: "bg-gradient-to-br from-[#c49a62]/8 to-[#885935]/3" },
          { label: "Portfolio", value: formatCurrency(portfolioValue), sub: activeItems + " active", icon: Wallet, gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20", bgGlow: "bg-gradient-to-br from-emerald-500/8 to-teal-500/3" },
          { label: "Revenue", value: formatCurrency(totalRevenue), sub: soldItems + " sold", icon: DollarSign, gradient: "from-blue-500 to-indigo-600", shadow: "shadow-indigo-500/20", bgGlow: "bg-gradient-to-br from-blue-500/8 to-indigo-500/3" },
          { label: "Profit", value: formatCurrency(totalProfit), sub: totalProfit >= 0 ? "Positive ↑" : "Negative ↓", icon: totalProfit >= 0 ? TrendingUp : TrendingDown, gradient: totalProfit >= 0 ? "from-emerald-500 to-teal-600" : "from-red-500 to-rose-600", shadow: totalProfit >= 0 ? "shadow-emerald-500/20" : "shadow-red-500/20", bgGlow: totalProfit >= 0 ? "bg-gradient-to-br from-emerald-500/8 to-green-500/3" : "bg-gradient-to-br from-red-500/8 to-rose-500/3" },
        ].map((s, i) => (
          <div key={i} className="relative rounded-2xl border border-line/60 bg-surface  overflow-hidden group hover:border-line transition-colors duration-200 animate-fade-in-up" >
            <div className="p-4 sm:p-5 relative z-10">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3 shadow-lg ${s.shadow} transition-colors duration-200`}>
                <s.icon className="w-5 h-5 text-white drop-shadow-sm" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-on-surface-3 font-bold uppercase tracking-[0.1em]">{s.label}</p>
              <p className="text-[20px] sm:text-[26px] font-black text-on-surface leading-none mt-1.5 tracking-tight animate-counter-up">{s.value}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-3 h-3 text-on-surface-3" />
                <span className="text-[10px] sm:text-[11px] text-on-surface-3 font-semibold">{s.sub}</span>
              </div>
            </div>
            <div className={`absolute inset-0 ${s.bgGlow}  transition-none`} />
          </div>
        ))}
      </div>

      {/* ═══════ THIS MONTH ═══════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Sourced this month", value: thisMonth.length, icon: ShoppingBag, gradient: "from-[#d1b385] to-[#a4713e]" },
          { label: "Sold this month", value: soldThisMonth.length, icon: Star, gradient: "from-emerald-500 to-teal-600" },
          { label: "Total invested", value: formatCurrency(totalCost), icon: BarChart3, gradient: "from-blue-500 to-indigo-600", hideOnMobile: true },
        ].map((item, idx) => (
          <div key={idx} className={`rounded-2xl border border-line/60 bg-surface  p-4 sm:p-5 flex items-center gap-4 hover:border-line transition-colors duration-200 animate-fade-in-up ${item.hideOnMobile ? "hidden sm:flex" : ""}`} >
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-on-surface-3 font-bold uppercase tracking-wider">{item.label}</p>
              <p className="text-[20px] sm:text-[22px] font-black text-on-surface tracking-tight leading-none mt-1">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════ RECENT + CATEGORIES ═══════ */}
      <div className="grid lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="lg:col-span-3 animate-fade-in-up" >
          <div className="rounded-2xl border border-line/60 bg-surface  overflow-hidden">
            <div className="p-5 sm:p-6 pb-0">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d1b385] via-[#c49a62] to-[#885935] flex items-center justify-center shadow-lg shadow-[#c49a62]/20">
                    <Clock className="w-[18px] h-[18px] text-white" />
                  </div>
                  <div>
                    <h3 className="text-[15px] sm:text-[17px] font-black text-on-surface tracking-tight">Recent Items</h3>
                    <p className="text-[10px] text-on-surface-3">Latest inventory additions</p>
                  </div>
                </div>
                <button onClick={() => router.push("/inventory")} className="text-[12px] text-primary font-bold flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer group">
                  View all <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
            <div className="px-5 sm:px-6 pb-5 sm:pb-6">
              {recentItems.length === 0 ? (
                <div className="text-center py-14 text-on-surface-3">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-surface-2 flex items-center justify-center"><Package className="w-7 h-7 text-on-surface-3/30" /></div>
                  <p className="text-[14px] font-bold text-on-surface">No items yet</p>
                  <p className="text-[12px] mt-1 text-on-surface-3">Add your first vintage piece to get started</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentItems.map((item, idx) => {
                    const imgs = item.images ? item.images.split(",").filter(Boolean) : [];
                    const pcs = parseInt(item.pieces) || 1;
                    const price = (parseFloat(item.sellingPrice || item.sourcingCost) || 0) * pcs;
                    return (
                      <div key={item.id} onClick={() => router.push("/inventory")} className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl hover:bg-surface-2/80 transition-all cursor-pointer group animate-fade-in" >
                        {imgs[0] ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-line/50 shrink-0 shadow-sm"><img src={imgs[0]} alt="" className="w-full h-full object-cover  transition-none" /></div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-surface-2 to-surface-3 flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-on-surface-3/50" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] sm:text-[13px] font-bold text-on-surface truncate group-hover:text-primary transition-colors">{item.itemName}</p>
                          <p className="text-[10px] sm:text-[11px] text-on-surface-3 mt-0.5">{item.category} · {item.size}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[13px] sm:text-[14px] font-black text-on-surface">{formatCurrency(price)}</p>
                          <div className="scale-[0.85] origin-right mt-0.5"><StatusBadge status={item.status} /></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 animate-fade-in-up" >
          <div className="rounded-2xl border border-line/60 bg-surface  overflow-hidden h-full">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Layers className="w-[18px] h-[18px] text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] sm:text-[17px] font-black text-on-surface tracking-tight">Categories</h3>
                  <p className="text-[10px] text-on-surface-3">Inventory breakdown</p>
                </div>
              </div>
              {topCategories.length === 0 ? (
                <div className="text-center py-14 text-on-surface-3"><div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-surface-2 flex items-center justify-center"><Layers className="w-7 h-7 text-on-surface-3/30" /></div><p className="text-[14px] font-bold text-on-surface">No data yet</p></div>
              ) : (
                <div className="space-y-5">
                  {topCategories.map(([cat, count], i) => {
                    const pct = Math.round((count / totalItems) * 100);
                    return (
                      <div key={cat} className="animate-fade-in" >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${catDotColors[i % catDotColors.length]}`} /><span className="text-[12px] sm:text-[13px] font-bold text-on-surface">{cat}</span></div>
                          <div className="flex items-center gap-2"><span className="text-[11px] text-on-surface-3 font-semibold">{count}</span><span className="text-[10px] text-on-surface-3/60 font-medium">{pct}%</span></div>
                        </div>
                        <div className="w-full rounded-full h-2 bg-surface-2 overflow-hidden"><div className={`h-2 rounded-full bg-gradient-to-r ${catBarColors[i % catBarColors.length]} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
