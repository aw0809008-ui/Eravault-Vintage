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
    // Load from local storage
    const items = getLocalInventory();

    // Calculate stats
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

    // Category breakdown
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

    // Monthly sales (last 6 months)
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

    // Recent items
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
      color: "bg-blue-500",
      format: "number" as const,
    },
    {
      label: "Active Listings",
      value: stats?.activeListings ?? 0,
      icon: Tag,
      color: "bg-green-500",
      format: "number" as const,
    },
    {
      label: "Total Sold",
      value: stats?.totalSold ?? 0,
      icon: ShoppingBag,
      color: "bg-amber-500",
      format: "number" as const,
    },
    {
      label: "Sourcing Investment",
      value: stats?.sourcingInvestment ?? 0,
      icon: DollarSign,
      color: "bg-red-500",
      format: "currency" as const,
    },
    {
      label: "Total Revenue",
      value: stats?.totalRevenue ?? 0,
      icon: Truck,
      color: "bg-purple-500",
      format: "currency" as const,
    },
    {
      label: "Net Profit",
      value: stats?.netProfit ?? 0,
      icon: TrendingUp,
      color: "bg-emerald-500",
      format: "currency" as const,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
            Dashboard
          </h1>
          <p className="text-stone-500 mt-1">
            Your vintage inventory at a glance
          </p>
        </div>
        <Link href="/inventory?add=true">
          <Button>
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((metric) => (
          <Card key={metric.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ) : (
                <>
                  <div
                    className={`w-8 h-8 ${metric.color} rounded-lg flex items-center justify-center mb-3`}
                  >
                    <metric.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold">
                    {metric.format === "currency"
                      ? formatCurrency(metric.value)
                      : metric.value}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">{metric.label}</p>
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
            <CardTitle className="text-base">Sales Trend</CardTitle>
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
            <CardTitle className="text-base">Category Breakdown</CardTitle>
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

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Link href="/inventory">
            <Button variant="ghost" size="sm" className="text-amber-600">
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
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 font-medium">No items yet</p>
              <p className="text-stone-400 text-sm mt-1">
                Add your first vintage piece to get started
              </p>
              <Link href="/inventory?add=true">
                <Button className="mt-4" size="sm">
                  <Plus className="w-4 h-4" />
                  Add First Item
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentItems.map((item) => (
                <Link
                  key={item.id}
                  href="/inventory"
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 flex-shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate group-hover:text-amber-700 transition-colors">
                      {item.itemName}
                    </p>
                    <p className="text-xs text-stone-400">
                      {item.category} · {formatDate(item.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-stone-900 hidden sm:block">
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
