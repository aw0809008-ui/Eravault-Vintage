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
  const [items, setItems] = useState<InventoryItem[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { getInventory().then(i => { setItems(i); setLoading(false); }); }, []);

  const sold = items.filter((i:InventoryItem) => (i.status==="Sold"||i.status==="Shipped") && i.sellingPrice);
  const rev = sold.reduce((s:number,i:InventoryItem) => s+parseFloat(i.sellingPrice||"0"),0);
  const cost = sold.reduce((s:number,i:InventoryItem) => s+parseFloat(i.sourcingCost||"0"),0);
  const cats = items.reduce((a:Record<string,number>,i:InventoryItem) => {a[i.category]=(a[i.category]||0)+1;return a;},{});
  const now = new Date();
  const monthly = Array.from({length:6},(_,idx)=>{const n=5-idx;const d=new Date(now.getFullYear(),now.getMonth()-n,1);const me=new Date(now.getFullYear(),now.getMonth()-n+1,0);const mi=sold.filter((x:InventoryItem)=>{const sd=x.soldDate?new Date(x.soldDate):null;return sd&&sd>=d&&sd<=me;});return{month:d.toLocaleString("en-US",{month:"short"}),revenue:mi.reduce((s:number,x:InventoryItem)=>s+parseFloat(x.sellingPrice||"0"),0),items:mi.length};});
  const recent = [...items].sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime()).slice(0,5);

  const metrics = [
    {l:"Total Items",v:items.length,i:Package,f:false,g:"from-blue-500 to-indigo-600"},
    {l:"Active",v:items.filter((i:InventoryItem)=>i.status==="Active on Fleek").length,i:Tag,f:false,g:"from-emerald-500 to-teal-600"},
    {l:"Sold",v:sold.length,i:ShoppingBag,f:false,g:"from-violet-500 to-purple-600"},
    {l:"Invested",v:items.reduce((s:number,i:InventoryItem)=>s+parseFloat(i.sourcingCost||"0"),0),i:DollarSign,f:true,g:"from-rose-500 to-pink-600"},
    {l:"Revenue",v:rev,i:Truck,f:true,g:"from-cyan-500 to-blue-600"},
    {l:"Profit",v:rev-cost,i:TrendingUp,f:true,g:"from-green-500 to-emerald-600"},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-[22px] font-bold text-on-surface tracking-tight">Dashboard</h1><p className="text-[13px] text-on-surface-3 mt-0.5">Your vintage inventory at a glance</p></div>
        <Link href="/inventory?add=true"><Button><Plus className="w-4 h-4" />Add Item</Button></Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map(m => <Card key={m.l}><CardContent className="p-4">{loading ? <div className="space-y-3"><Skeleton className="h-8 w-8 rounded-xl" /><Skeleton className="h-6 w-16" /><Skeleton className="h-3 w-12" /></div> : <>
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${m.g} flex items-center justify-center mb-3 shadow-sm`}><m.i className="w-4 h-4 text-white" /></div>
          <p className="text-[20px] font-bold text-on-surface tracking-tight">{m.f?formatCurrency(m.v):m.v}</p>
          <p className="text-[11px] text-on-surface-3 mt-1 font-medium">{m.l}</p>
        </>}</CardContent></Card>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader><CardContent>{loading?<Skeleton className="h-48 w-full rounded-xl" />:<SalesChart data={monthly} />}</CardContent></Card>
        <Card><CardHeader><CardTitle>By Category</CardTitle></CardHeader><CardContent>{loading?<Skeleton className="h-48 w-full rounded-xl" />:<CategoryChart data={Object.entries(cats).map(([n,v])=>({name:n,value:v as number}))} />}</CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent Activity</CardTitle><Link href="/inventory"><Button variant="ghost" size="sm" className="text-primary">View all<ArrowUpRight className="w-3.5 h-3.5 ml-1" /></Button></Link></CardHeader>
        <CardContent>{loading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-24" /></div></div>)}</div>
        : recent.length===0 ? <div className="text-center py-12"><div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4"><Package className="w-6 h-6 text-on-surface-3" /></div><p className="text-[14px] font-medium text-on-surface-2">No items yet</p><p className="text-[12px] text-on-surface-3 mt-1">Add your first vintage piece to get started</p><Link href="/inventory?add=true"><Button className="mt-4" size="sm"><Plus className="w-3.5 h-3.5" />Add Item</Button></Link></div>
        : <div className="space-y-1">{recent.map(item=>(
          <Link key={item.id} href="/inventory" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 transition-all duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-primary" /></div>
            <div className="flex-1 min-w-0"><p className="text-[13px] font-medium text-on-surface truncate group-hover:text-primary transition-colors">{item.itemName}</p><p className="text-[11px] text-on-surface-3 mt-0.5">{item.category} · {formatDate(item.updatedAt)}</p></div>
            <div className="flex items-center gap-2.5 shrink-0"><span className="text-[13px] font-semibold text-on-surface hidden sm:block">{item.sellingPrice?formatCurrency(item.sellingPrice):formatCurrency(item.sourcingCost)}</span><StatusBadge status={item.status} /></div>
          </Link>))}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
