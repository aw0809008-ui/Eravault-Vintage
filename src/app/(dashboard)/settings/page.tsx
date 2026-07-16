"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Database, Loader2, Check, Smartphone, Download } from "lucide-react";
import { getUser, getInventory, seedDemoData, type InventoryItem } from "@/lib/supabase";

export default function SettingsPage() {
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [seedStatus, setSeedStatus] = useState<"idle"|"loading"|"done">("idle");
  const [itemCount, setItemCount] = useState(0);
  useEffect(() => { Promise.all([getUser(),getInventory()]).then(([u,items])=>{ if(u){setName(u.user_metadata?.name||u.email?.split("@")[0]||"");setEmail(u.email||"");} setItemCount(items.length);setLoading(false); }); }, []);
  async function handleSeed() { setSeedStatus("loading"); await seedDemoData(); setItemCount((await getInventory()).length); setSeedStatus("done"); setTimeout(()=>setSeedStatus("idle"),3000); }
  function handleExport() { getInventory().then(items => { const csv=["ID,Item Name,Category,Size,Grade,Cost,Price,Status",...items.map((i:InventoryItem)=>[i.id,`"${i.itemName}"`,i.category,i.size,i.condition,i.sourcingCost,i.sellingPrice,i.status].join(","))].join("\n"); const b=new Blob([csv],{type:"text/csv"}); const u=URL.createObjectURL(b); const a=document.createElement("a");a.href=u;a.download=`eravault-${new Date().toISOString().split("T")[0]}.csv`;a.click();URL.revokeObjectURL(u); }); }

  return (
    <div className="space-y-5 animate-fade-in max-w-xl">
      <div><h1 className="text-xl font-bold text-on-surface">Settings</h1><p className="text-[13px] text-on-surface-3 mt-0.5">Account & data</p></div>
      <Card><CardHeader><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center"><User className="w-4 h-4 text-on-surface-3" /></div><div><CardTitle>Profile</CardTitle><CardDescription>Account info</CardDescription></div></div></CardHeader>
        <CardContent className="space-y-3">{loading?<div className="space-y-3"><div className="h-9 rounded-lg animate-pulse bg-surface-2" /><div className="h-9 rounded-lg animate-pulse bg-surface-2" /></div>:<><div className="space-y-1"><Label>Name</Label><Input value={name} disabled /></div><div className="space-y-1"><Label>Email</Label><Input value={email} disabled /></div></>}</CardContent></Card>
      <Card><CardHeader><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center"><Smartphone className="w-4 h-4 text-on-surface-3" /></div><div><CardTitle>Install</CardTitle><CardDescription>Add to device</CardDescription></div></div></CardHeader>
        <CardContent><div className="p-3 rounded-lg bg-surface-2 text-xs text-on-surface-2"><strong className="text-on-surface">iOS:</strong> Safari → Share → Add to Home Screen<br/><strong className="text-on-surface">Android:</strong> Chrome → Menu → Install</div></CardContent></Card>
      <Card><CardHeader><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center"><Database className="w-4 h-4 text-on-surface-3" /></div><div><CardTitle>Data</CardTitle><CardDescription>{itemCount} items · Supabase</CardDescription></div></div></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2"><span className="text-[13px] text-on-surface">Export CSV</span><Button variant="outline" size="sm" onClick={handleExport} disabled={itemCount===0}><Download className="w-3 h-3" />Export</Button></div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2"><span className="text-[13px] text-on-surface">Demo Data</span><Button variant="outline" size="sm" onClick={handleSeed} disabled={seedStatus==="loading"}>{seedStatus==="loading"?<Loader2 className="w-3 h-3 animate-spin" />:seedStatus==="done"?<Check className="w-3 h-3" />:"Load"}</Button></div>
        </CardContent></Card>
    </div>
  );
}
