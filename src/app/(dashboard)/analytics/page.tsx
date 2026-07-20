"use client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, Trophy, Flame, ArrowUpRight, Target, Award, PieChart } from "lucide-react";
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

  const condGradients: Record<string, string> = { A: "from-emerald-400 to-teal-500", B: "from-blue-400 to-indigo-500", C: "from-orange-400 to-red-500", AB: "from-teal-400 to-cyan-500", BC: "from-[#d1b385] to-[#a4713e]", ABC: "from-pink-400 to-rose-500" };
  const condDots: Record<string, string> = { A: "bg-emerald-400", B: "bg-blue-400", C: "bg-orange-400", AB: "bg-teal-400", BC: "bg-amber-400", ABC: "bg-pink-400" };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ═══════ HEADER ═══════ */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 animate-fade-in" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)" }}>
        <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full bg-gradient-to-br from-blue-400/15 to-indigo-500/5 blur-2xl" />
        <div className="absolute bottom-[-30px] left-[30%] w-[150px] h-[150px] rounded-full bg-gradient-to-br from-violet-400/10 to-transparent blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-400/90 text-2xl">📊</span>
            <span className="text-[11px] font-bold text-blue-300/60 uppercase tracking-[0.2em]">Analytics</span>
          </div>
          <h1 className="text-[26px] sm:text-[34px] font-black text-white tracking-tight leading-[1.1]">
            Performance Insights
          </h1>
          <p className="text-[13px] text-white/40 mt-2">Deep dive into your business numbers.</p>
        </div>
      </div>

      {/* ═══════ KEY METRICS ═══════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { l: "Avg Cost", v: formatCurrency(avgCost), i: DollarSign, gradient: "from-blue-400 via-indigo-500 to-purple-600", shadow: "shadow-indigo-500/20" },
          { l: "Avg Sell Price", v: formatCurrency(avgPrice), i: TrendingUp, gradient: "from-emerald-400 via-green-500 to-teal-600", shadow: "shadow-emerald-500/20" },
          { l: "Avg Profit/Item", v: formatCurrency(avgProfit), i: avgProfit >= 0 ? Flame : TrendingDown, gradient: avgProfit >= 0 ? "from-green-400 via-emerald-500 to-teal-600" : "from-red-400 via-rose-500 to-red-600", shadow: avgProfit >= 0 ? "shadow-emerald-500/20" : "shadow-red-500/20" },
          { l: "Profit Margin", v: `${margin}%`, i: Percent, gradient: "from-violet-400 via-purple-500 to-indigo-600", shadow: "shadow-purple-500/20" },
        ].map((m, idx) => (
          <div key={m.l} className="relative rounded-2xl border border-line/60 bg-surface/80 backdrop-blur-sm overflow-hidden group hover:border-line transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms` }}>
            <div className="p-4 sm:p-5 relative z-10">
              {loading ? (
                <div className="space-y-3"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-7 w-24" /><Skeleton className="h-3 w-16" /></div>
              ) : (
                <>
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${m.gradient} flex items-center justify-center mb-3 shadow-lg ${m.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <m.i className="w-5 h-5 text-white drop-shadow-sm" />
                  </div>
                  <p className="text-[22px] sm:text-[26px] font-black text-on-surface tracking-tight leading-none animate-counter-up">{m.v}</p>
                  <p className="text-[10px] sm:text-[11px] text-on-surface-3 mt-2 font-bold uppercase tracking-[0.1em]">{m.l}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ═══════ BEST PERFORMER ═══════ */}
      {!loading && bestItem && (
        <div className="relative rounded-2xl border border-amber-500/20 overflow-hidden animate-fade-in-up" style={{ animationDelay: "250ms", background: "linear-gradient(135deg, rgba(245,158,11,0.04) 0%, rgba(217,119,6,0.02) 100%)" }}>
          <div className="p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#d1b385] via-[#c49a62] to-[#885935] flex items-center justify-center shrink-0 shadow-xl shadow-[#c49a62]/25 animate-float">
              <Trophy className="w-8 h-8 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <p className="text-[11px] text-on-surface-3 font-bold uppercase tracking-[0.15em]">Best Performer</p>
              </div>
              <p className="text-[18px] sm:text-[22px] font-black text-on-surface truncate tracking-tight">{bestItem.itemName}</p>
              <p className="text-[12px] text-on-surface-3 mt-1">{bestItem.category} · Cost {formatCurrency(bestItem.sourcingCost)} → Sold {formatCurrency(bestItem.sellingPrice)}</p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-[26px] sm:text-[32px] font-black text-green flex items-center gap-1 leading-none">
                <ArrowUpRight className="w-6 h-6" />
                +{formatCurrency(bestProfit)}
              </p>
              <p className="text-[12px] text-green font-bold mt-1">{parseFloat(bestItem.sourcingCost) > 0 ? Math.round((bestProfit / parseFloat(bestItem.sourcingCost)) * 100) : 0}% ROI</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ CHARTS ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="rounded-2xl border border-line/60 bg-surface/80 backdrop-blur-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <div className="p-5 sm:p-6 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d1b385] via-[#c49a62] to-[#885935] flex items-center justify-center shadow-lg shadow-[#c49a62]/20">
                <BarChart3 className="w-[18px] h-[18px] text-white" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-on-surface tracking-tight">Monthly Revenue</h3>
                <p className="text-[10px] text-on-surface-3">Last 6 months trend</p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6 pt-2">{loading ? <Skeleton className="h-52 w-full rounded-xl" /> : <SalesChart data={monthly} />}</div>
        </div>

        <div className="rounded-2xl border border-line/60 bg-surface/80 backdrop-blur-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: "350ms" }}>
          <div className="p-5 sm:p-6 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <PieChart className="w-[18px] h-[18px] text-white" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-on-surface tracking-tight">Inventory by Category</h3>
                <p className="text-[10px] text-on-surface-3">Distribution overview</p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6 pt-2">{loading ? <Skeleton className="h-52 w-full rounded-xl" /> : <CategoryChart data={Object.entries(cats).map(([n, v]) => ({ name: n, value: v as number }))} />}</div>
        </div>
      </div>

      {/* ═══════ CONDITION + CATEGORY PERF ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Condition Grade */}
        <div className="rounded-2xl border border-line/60 bg-surface/80 backdrop-blur-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <div className="p-5 sm:p-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Target className="w-[18px] h-[18px] text-white" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-on-surface tracking-tight">Condition Grades</h3>
                <p className="text-[10px] text-on-surface-3">Quality breakdown</p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6 pt-3">
            {loading ? <Skeleton className="h-32 w-full rounded-xl" /> : Object.keys(conds).length === 0 ? (
              <div className="py-10 text-center text-on-surface-3"><BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-20" /><p className="font-bold">No data</p></div>
            ) : (
              <div className="space-y-4">{Object.entries(conds).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([c, count]) => {
                const pct = items.length > 0 ? Math.round(((count as number) / items.length) * 100) : 0;
                const grad = condGradients[c] || "from-gray-400 to-gray-500";
                const dot = condDots[c] || "bg-gray-400";
                return <div key={c}>
                  <div className="flex justify-between text-[13px] mb-2">
                    <span className="font-bold text-on-surface flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                      Grade {c}
                    </span>
                    <span className="text-on-surface-3 font-semibold">{count as number} · {pct}%</span>
                  </div>
                  <div className="w-full rounded-full h-2.5 bg-surface-2 overflow-hidden">
                    <div className={`h-2.5 rounded-full bg-gradient-to-r ${grad} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                  </div>
                </div>;
              })}</div>
            )}
          </div>
        </div>

        {/* Category Performance */}
        <div className="rounded-2xl border border-line/60 bg-surface/80 backdrop-blur-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: "450ms" }}>
          <div className="p-5 sm:p-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 via-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-[#c49a62]/20">
                <Trophy className="w-[18px] h-[18px] text-white" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-on-surface tracking-tight">Category Performance</h3>
                <p className="text-[10px] text-on-surface-3">Profit by category</p>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6 pt-3">
            {loading ? <Skeleton className="h-32 w-full rounded-xl" /> : Object.keys(catProfits).length === 0 ? (
              <div className="py-10 text-center text-on-surface-3"><BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-20" /><p className="font-bold">No sales data</p></div>
            ) : (
              <div className="space-y-2.5">{Object.entries(catProfits).sort((a, b) => (b[1].revenue - b[1].cost) - (a[1].revenue - a[1].cost)).map(([cat, d]) => {
                const p = d.revenue - d.cost; const roi = d.cost > 0 ? Math.round((p / d.cost) * 100) : 0;
                return <div key={cat} className="flex items-center justify-between p-4 rounded-xl bg-surface-2/60 hover:bg-surface-2 transition-all duration-200 border border-line/30 hover:border-line/60">
                  <div><p className="text-[13px] font-bold text-on-surface">{cat}</p><p className="text-[11px] text-on-surface-3 mt-0.5">{d.count} sold · {formatCurrency(d.revenue)} rev</p></div>
                  <div className="text-right"><p className={`text-[16px] font-black ${p >= 0 ? "text-green" : "text-red"}`}>{p >= 0 ? "+" : ""}{formatCurrency(p)}</p><p className={`text-[11px] font-bold ${roi >= 0 ? "text-green" : "text-red"}`}>{roi}% ROI</p></div>
                </div>;
              })}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
