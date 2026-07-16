"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Database, Loader2, Check, Smartphone, Download, Link, RefreshCw } from "lucide-react";
import { getLocalUser, getLocalInventory, saveLocalInventory, seedDemoData } from "@/lib/local-storage";
import { getAppsScriptUrl, setAppsScriptUrl, isSheetConfigured, syncWithSheet } from "@/lib/google-sheets";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "done">("idle");
  const [clearStatus, setClearStatus] = useState<"idle" | "loading" | "done">("idle");
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [itemCount, setItemCount] = useState(0);
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetConnected, setSheetConnected] = useState(false);

  useEffect(() => {
    const user = getLocalUser();
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    setItemCount(getLocalInventory().length);
    setSheetUrl(getAppsScriptUrl());
    setSheetConnected(isSheetConfigured());
    setLoading(false);
  }, []);

  function handleSaveSheetUrl() {
    setAppsScriptUrl(sheetUrl);
    setSheetConnected(!!sheetUrl);
  }

  async function handleSync() {
    setSyncStatus("loading");
    try {
      const result = await syncWithSheet();
      if (result.success) {
        setItemCount(result.count || getLocalInventory().length);
        setSyncStatus("done");
      } else {
        setSyncStatus("error");
      }
    } catch {
      setSyncStatus("error");
    }
    setTimeout(() => setSyncStatus("idle"), 3000);
  }

  function handleSeedData() {
    setSeedStatus("loading");
    saveLocalInventory([]);
    seedDemoData();
    setItemCount(getLocalInventory().length);
    setSeedStatus("done");
    setTimeout(() => setSeedStatus("idle"), 3000);
  }

  function handleClearData() {
    setClearStatus("loading");
    saveLocalInventory([]);
    setItemCount(0);
    setClearStatus("done");
    setTimeout(() => setClearStatus("idle"), 3000);
  }

  function handleExport() {
    const items = getLocalInventory();
    const csv = [
      ["ID", "Item Name", "Category", "Size", "Grade", "Cost", "Price", "Status", "Sourcing Date", "Sold Date", "Notes", "Listing Link", "Images", "Videos"].join(","),
      ...items.map(item => [
        item.id,
        `"${item.itemName.replace(/"/g, '""')}"`,
        item.category,
        item.size,
        item.condition,
        item.sourcingCost,
        item.sellingPrice || "",
        item.status,
        item.sourcingDate,
        item.soldDate || "",
        `"${(item.notes || "").replace(/"/g, '""')}"`,
        item.listingLink || "",
        item.images || "",
        item.videos || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eravault-inventory-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Manage your account and data</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <User className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <div className="h-10 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
              <div className="h-10 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} disabled />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Google Sheets Connection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: sheetConnected ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-tertiary)' }}>
              <Link className="w-5 h-5" style={{ color: sheetConnected ? '#22c55e' : 'var(--text-secondary)' }} />
            </div>
            <div>
              <CardTitle className="text-base">Google Sheets</CardTitle>
              <CardDescription>{sheetConnected ? "Connected" : "Not connected"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Apps Script URL</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="https://script.google.com/macros/s/..." 
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
              />
              <Button onClick={handleSaveSheetUrl} variant="outline">Save</Button>
            </div>
          </div>
          
          {sheetConnected && (
            <Button onClick={handleSync} variant="outline" className="w-full" disabled={syncStatus === "loading"}>
              {syncStatus === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" />Syncing...</> : 
               syncStatus === "done" ? <><Check className="w-4 h-4" />Synced!</> :
               syncStatus === "error" ? "Sync Failed - Retry" :
               <><RefreshCw className="w-4 h-4" />Sync with Sheet</>}
            </Button>
          )}

          <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1" style={{ color: 'var(--text-secondary)' }}>
              <li>Open your Google Sheet</li>
              <li>Extensions → Apps Script</li>
              <li>Paste the code (see SETUP.md)</li>
              <li>Deploy → Web app</li>
              <li>Paste the URL above</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Install App */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <Smartphone className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div>
              <CardTitle className="text-base">Install App</CardTitle>
              <CardDescription>Add to your device</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>📱 iOS & Android</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              <strong>iOS:</strong> Safari → Share → Add to Home Screen<br />
              <strong>Android:</strong> Chrome → Menu → Install App
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <Database className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div>
              <CardTitle className="text-base">Data</CardTitle>
              <CardDescription>{itemCount} items stored</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Export CSV</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Download your data</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={itemCount === 0}>
              <Download className="w-3 h-3" />Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Demo Data</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Load sample items</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSeedData} disabled={seedStatus === "loading"}>
              {seedStatus === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : seedStatus === "done" ? <Check className="w-3 h-3" /> : "Load"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/20" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
            <div>
              <p className="text-sm font-medium text-red-500">Clear All</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Delete everything</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearData} disabled={clearStatus === "loading" || itemCount === 0} className="border-red-500/30 text-red-500 hover:bg-red-500/10">
              {clearStatus === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : clearStatus === "done" ? <Check className="w-3 h-3" /> : "Clear"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
