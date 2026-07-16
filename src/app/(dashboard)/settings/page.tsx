"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Database, Loader2, Check, Smartphone, Download } from "lucide-react";
import { getLocalUser, seedDemoData, getLocalInventory, saveLocalInventory } from "@/lib/local-storage";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [seedStatus, setSeedStatus] = useState<"idle" | "loading" | "done">("idle");
  const [clearStatus, setClearStatus] = useState<"idle" | "loading" | "done">("idle");
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const user = getLocalUser();
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    setItemCount(getLocalInventory().length);
    setLoading(false);
  }, []);

  function handleSeedData() {
    setSeedStatus("loading");
    // Clear existing and seed fresh
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
      ["ID", "Item Name", "Category", "Size", "Condition", "Sourcing Cost", "Selling Price", "Status", "Sourcing Date", "Sold Date", "Notes", "Listing Link"].join(","),
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
        item.listingLink || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eravauly-inventory-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
          Settings
        </h1>
        <p className="text-stone-500 mt-1">
          Manage your account and data
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-12 bg-stone-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-stone-100 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-12 bg-stone-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-stone-100 rounded-lg animate-pulse" />
              </div>
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

      {/* App Installation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <CardTitle className="text-base">Install App</CardTitle>
              <CardDescription>Add Eravauly to your device</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <h4 className="font-semibold text-stone-900 mb-2">📱 Mobile Install</h4>
            <p className="text-sm text-stone-600 mb-3">
              Install Eravauly as an app on your phone for quick access and offline support.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-medium text-amber-700">iOS:</span>
                <span className="text-stone-600">Tap Share → Add to Home Screen</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-amber-700">Android:</span>
                <span className="text-stone-600">Tap Menu → Install App / Add to Home Screen</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <CardTitle className="text-base">Data Management</CardTitle>
              <CardDescription>
                {itemCount} items in local storage
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-stone-900">
                Export to CSV
              </p>
              <p className="text-xs text-stone-400">
                Download your inventory data
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={itemCount === 0}
            >
              <Download className="w-3 h-3" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-stone-900">
                Load Demo Data
              </p>
              <p className="text-xs text-stone-400">
                Replace with sample vintage items
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedData}
              disabled={seedStatus === "loading"}
            >
              {seedStatus === "loading" ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </>
              ) : seedStatus === "done" ? (
                <>
                  <Check className="w-3 h-3" />
                  Done!
                </>
              ) : (
                "Load Demo"
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
            <div>
              <p className="text-sm font-medium text-red-900">
                Clear All Data
              </p>
              <p className="text-xs text-red-400">
                Permanently delete all inventory items
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
              disabled={clearStatus === "loading" || itemCount === 0}
              className="border-red-200 text-red-600 hover:bg-red-100"
            >
              {clearStatus === "loading" ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Clearing...
                </>
              ) : clearStatus === "done" ? (
                <>
                  <Check className="w-3 h-3" />
                  Cleared!
                </>
              ) : (
                "Clear Data"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">✨</span>
          </div>
          <h3 className="font-bold text-lg">Eravauly Vintage</h3>
          <p className="text-stone-500 text-sm mt-1">
            Inventory Management for Fleek Sellers
          </p>
          <p className="text-xs text-stone-400 mt-4">
            Version 1.0.0 · Made with ❤️ for vintage lovers
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
