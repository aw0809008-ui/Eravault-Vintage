"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Database, Loader2, Check, Smartphone, Download } from "lucide-react";
import { getUser, getInventory, seedDemoData, type InventoryItem } from "@/lib/supabase";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "done">("idle");
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    Promise.all([getUser(), getInventory()]).then(([user, items]) => {
      if (user) { setName(user.user_metadata?.name || user.email?.split("@")[0] || ""); setEmail(user.email || ""); }
      setItemCount(items.length);
      setLoading(false);
    });
  }, []);

  async function handleSeedData() {
    setSeedStatus("loading");
    await seedDemoData();
    const items = await getInventory();
    setItemCount(items.length);
    setSeedStatus("done");
    setTimeout(() => setSeedStatus("idle"), 3000);
  }

  async function handleExport() {
    const items = await getInventory();
    const csv = [
      ["ID", "Item Name", "Category", "Size", "Grade", "Cost (£)", "Price (£)", "Status", "Sourcing Date", "Sold Date", "Notes", "Listing Link", "Images", "Videos"].join(","),
      ...items.map((item: InventoryItem) => [item.id, `"${item.itemName.replace(/"/g, '""')}"`, item.category, item.size, item.condition, item.sourcingCost, item.sellingPrice || "", item.status, item.sourcingDate, item.soldDate || "", `"${(item.notes || "").replace(/"/g, '""')}"`, item.listingLink || "", item.images || "", item.videos || ""].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `eravault-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div><h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1><p className="mt-1" style={{ color: 'var(--text-muted)' }}>Account & data</p></div>

      <Card><CardHeader><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}><User className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} /></div><div><CardTitle className="text-base">Profile</CardTitle><CardDescription>Your account</CardDescription></div></div></CardHeader>
        <CardContent className="space-y-4">{loading ? <div className="space-y-4"><div className="h-10 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-tertiary)' }} /><div className="h-10 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-tertiary)' }} /></div> : <><div className="space-y-2"><Label>Name</Label><Input value={name} disabled /></div><div className="space-y-2"><Label>Email</Label><Input value={email} disabled /></div></>}</CardContent>
      </Card>

      <Card><CardHeader><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}><Smartphone className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} /></div><div><CardTitle className="text-base">Install App</CardTitle><CardDescription>Add to device</CardDescription></div></div></CardHeader>
        <CardContent><div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}><p className="text-sm" style={{ color: 'var(--text-secondary)' }}><strong>iOS:</strong> Safari → Share → Add to Home Screen<br /><strong>Android:</strong> Chrome → Menu → Install App</p></div></CardContent>
      </Card>

      <Card><CardHeader><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}><Database className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} /></div><div><CardTitle className="text-base">Data</CardTitle><CardDescription>{itemCount} items · Stored in Supabase</CardDescription></div></div></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}><div><p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Export CSV</p></div><Button variant="outline" size="sm" onClick={handleExport} disabled={itemCount === 0}><Download className="w-3 h-3" />Export</Button></div>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}><div><p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Demo Data</p></div><Button variant="outline" size="sm" onClick={handleSeedData} disabled={seedStatus === "loading"}>{seedStatus === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : seedStatus === "done" ? <Check className="w-3 h-3" /> : "Load"}</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}
