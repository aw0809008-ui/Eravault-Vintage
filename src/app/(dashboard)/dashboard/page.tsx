"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Tag,
  Truck,
  ArrowUpRight,
  Plus,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { getLocalInventory, type InventoryItem } from "@/lib/local-storage";

interface Stats {
  totalItems: number;
  activeListings: number;
  totalSold: number;
  sourcingInvestment: number;
  totalRevenue: number;
  netProfit: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface MonthlySale {
  month: string;
  revenue: number;
  items: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryData[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);
  const [recentItems, setRecentItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const items = getLocalInventory();

    const totalItems = items.length;
    const activeListings = items.filter(
      (i) => i.status === "Active on Fleek"
    ).length;
    const totalSold = items.filter(
      (i) => i.status === "Sold" || i.status === "Shipped"
    ).length;

    const sourcingInvestment = items.reduce(
      (sum, i) => sum + parseFloat(i.sourcingCost || "0"),
      0
    );

    const soldItems = items.filter(
      (i) =>
        (i.status === "Sold" || i.status === "Shipped") && i.sellingPrice
    );
    const totalRevenue = soldItems.reduce(
      (sum, i) => sum + parseFloat(i.sellingPrice || "0"),
      0
    );
    const soldCost = soldItems.reduce(
      (sum, i) => sum + parseFloat(i.sourcingCost || "0"),
      0
    );
    const netProfit = totalRevenue - soldCost;

    setStats({
      totalItems,
      activeListings,
      totalSold,
      sourcingInvestment,
      totalRevenue,
      netProfit,
    });

    const catBreakdown = items.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    setCategoryBreakdown(
      Object.entries(catBreakdown).map(([name, value]) => ({ name, value }))
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

    const recent = [...items]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5);
    setRecentItems(recent);

    setLoading(false);
  }, []);

  const metricCards = [
    {
      label: "Total Items",
      value: stats?.totalItems ?? 0,
      icon: Package,
      gradient: "from-blue-500 to-cyan-500",
      format: "number" as const,
    },
    {
      label: "Active Listings",
      value: stats?.activeListings ?? 0,
      icon: Tag,
      gradient: "from-emerald-500 to-teal-500",
      format: "number" as const,
    },
    {
      label: "Total Sold",
      value: stats?.totalSold ?? 0,
      icon: ShoppingBag,
      gradient: "from-yellow-500 to-amber-500",
      format: "number" as const,
    },
    {
      label: "Investment",
      value: stats?.sourcingInvestment ?? 0,
      icon: DollarSign,
      gradient: "from-red-500 to-rose-500",
      format: "currency" as const,
    },
    {
      label: "Revenue",
      value: stats?.totalRevenue ?? 0,
      icon: Truck,
      gradient: "from-purple-500 to-violet-500",
      format: "currency" as const,
    },
    {
      label: "Net Profit",
      value: stats?.netProfit ?? 0,
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      format: "currency" as const,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 flex items-center gap-3">
            Dashboard
            <Crown className="w-8 h-8 text-yellow-500" />
          </h1>
          <p className="text-slate-500 mt-2">
            Your premium vintage collection overview
          </p>
        </div>
        <Link href="/inventory?add=true">
          <Button variant="gold">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((metric) => (
          <Card key={metric.label} className="group hover:border-slate-700 transition-all duration-300">
            <CardContent className="p-5">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-8 rounded-xl" />
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ) : (
                <>
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${metric.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <metric.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-100">
                    {metric.format === "currency"
                      ? formatCurrency(metric.value)
                      : metric.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{metric.label}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-300">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : (
              <SalesChart data={monthlySales} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-300">Category Mix</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : (
              <CategoryChart data={categoryBreakdown} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base text-slate-300">Recent Activity</CardTitle>
          <Link href="/inventory">
            <Button variant="ghost" size="sm" className="text-yellow-500 hover:text-yellow-400">
              View all
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">No items yet</p>
              <p className="text-slate-600 text-sm mt-1">
                Add your first vintage piece
              </p>
              <Link href="/inventory?add=true">
                <Button className="mt-6" variant="gold" size="sm">
                  <Plus className="w-4 h-4" />
                  Add First Item
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentItems.map((item) => (
                <Link
                  key={item.id}
                  href="/inventory"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-800/50 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 rounded-xl flex items-center justify-center text-yellow-500 flex-shrink-0 border border-yellow-500/20">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-yellow-400 transition-colors">
                      {item.itemName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.category} · {formatDate(item.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-slate-200 hidden sm:block">
                      {item.sellingPrice
                        ? formatCurrency(item.sellingPrice)
                        : formatCurrency(item.sourcingCost)}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
