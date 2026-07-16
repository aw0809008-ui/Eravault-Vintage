"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3 } from "lucide-react";
import { getLocalInventory, type InventoryItem } from "@/lib/local-storage";

interface CategoryData {
  name: string;
  value: number;
}

interface MonthlySale {
  month: string;
  revenue: number;
  items: number;
}

export default function AnalyticsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryData[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localItems = getLocalInventory();
    setItems(localItems);

    // Category breakdown
    const catBreakdown = localItems.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    setCategoryBreakdown(
      Object.entries(catBreakdown).map(([name, value]) => ({ name, value }))
    );

    // Monthly sales
    const soldItems = localItems.filter(
      (i) => (i.status === "Sold" || i.status === "Shipped") && i.sellingPrice
    );
    const now = new Date();
    const monthly: MonthlySale[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = d.toLocaleString("en-US", { month: "short" });
      const monthItems = soldItems.filter((item) => {
        const sd = item.soldDate ? new Date(item.soldDate) : null;
        return sd && sd >= d && sd <= monthEnd;
      });
      monthly.push({
        month: monthName,
        revenue: monthItems.reduce(
          (sum, item) => sum + parseFloat(item.sellingPrice || "0"),
          0
        ),
        items: monthItems.length,
      });
    }
    setMonthlySales(monthly);

    setLoading(false);
  }, []);

  // Compute additional metrics
  const avgSourcingCost =
    items.length > 0
      ? items.reduce((sum, i) => sum + parseFloat(i.sourcingCost || "0"), 0) /
        items.length
      : 0;

  const soldItems = items.filter(
    (i) => (i.status === "Sold" || i.status === "Shipped") && i.sellingPrice
  );

  const avgSellingPrice =
    soldItems.length > 0
      ? soldItems.reduce(
          (sum, i) => sum + parseFloat(i.sellingPrice || "0"),
          0
        ) / soldItems.length
      : 0;

  const avgProfitPerItem =
    soldItems.length > 0
      ? soldItems.reduce(
          (sum, i) =>
            sum +
            (parseFloat(i.sellingPrice || "0") -
              parseFloat(i.sourcingCost || "0")),
          0
        ) / soldItems.length
      : 0;

  const totalRevenue = soldItems.reduce(
    (sum, i) => sum + parseFloat(i.sellingPrice || "0"),
    0
  );
  const totalCost = soldItems.reduce(
    (sum, i) => sum + parseFloat(i.sourcingCost || "0"),
    0
  );
  const netProfit = totalRevenue - totalCost;

  const profitMargin =
    totalRevenue > 0
      ? ((netProfit / totalRevenue) * 100).toFixed(1)
      : "0";

  // Condition breakdown
  const conditionBreakdown = items.reduce(
    (acc, item) => {
      acc[item.condition] = (acc[item.condition] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Top performing categories (by profit)
  const categoryProfits: Record<string, { revenue: number; cost: number; count: number }> = {};
  soldItems.forEach((item) => {
    if (!categoryProfits[item.category]) {
      categoryProfits[item.category] = { revenue: 0, cost: 0, count: 0 };
    }
    categoryProfits[item.category].revenue += parseFloat(item.sellingPrice || "0");
    categoryProfits[item.category].cost += parseFloat(item.sourcingCost || "0");
    categoryProfits[item.category].count += 1;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
          Analytics
        </h1>
        <p className="text-stone-500 mt-1">
          Deep dive into your vintage business performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Avg. Sourcing Cost",
            value: formatCurrency(avgSourcingCost),
            icon: DollarSign,
            color: "text-blue-600 bg-blue-100",
          },
          {
            label: "Avg. Selling Price",
            value: formatCurrency(avgSellingPrice),
            icon: TrendingUp,
            color: "text-green-600 bg-green-100",
          },
          {
            label: "Avg. Profit/Item",
            value: formatCurrency(avgProfitPerItem),
            icon: avgProfitPerItem >= 0 ? TrendingUp : TrendingDown,
            color:
              avgProfitPerItem >= 0
                ? "text-emerald-600 bg-emerald-100"
                : "text-red-600 bg-red-100",
          },
          {
            label: "Profit Margin",
            value: `${profitMargin}%`,
            icon: Percent,
            color: "text-amber-600 bg-amber-100",
          },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ) : (
                <>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${metric.color}`}
                  >
                    <metric.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-bold">{metric.value}</p>
                  <p className="text-xs text-stone-500 mt-1">{metric.label}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <SalesChart data={monthlySales} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <CategoryChart data={categoryBreakdown} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Condition & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Condition Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded" />
                ))}
              </div>
            ) : Object.keys(conditionBreakdown).length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-sm">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No data yet
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(conditionBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cond, count]) => {
                    const pct =
                      items.length > 0
                        ? ((count / items.length) * 100).toFixed(0)
                        : "0";
                    return (
                      <div key={cond}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-stone-700 font-medium">
                            {cond}
                          </span>
                          <span className="text-stone-500">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Category Performance (Sold)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" />
                ))}
              </div>
            ) : Object.keys(categoryProfits).length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-sm">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No sales data yet
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(categoryProfits)
                  .sort(
                    (a, b) =>
                      b[1].revenue -
                      b[1].cost -
                      (a[1].revenue - a[1].cost)
                  )
                  .map(([cat, data]) => {
                    const profit = data.revenue - data.cost;
                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-3 bg-stone-50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-stone-900">
                            {cat}
                          </p>
                          <p className="text-xs text-stone-400">
                            {data.count} sold · {formatCurrency(data.revenue)}{" "}
                            revenue
                          </p>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            profit >= 0
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          {profit >= 0 ? "+" : ""}
                          {formatCurrency(profit)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
