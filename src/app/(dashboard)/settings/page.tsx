"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Database, Loader2, Check, Smartphone, Download, Shield, UserCheck, UserX, Clock } from "lucide-react";
import { getUser, getInventory, seedDemoData, isAdmin, getPendingUsers, approveUser, rejectUser, type InventoryItem } from "@/lib/supabase";

export default function SettingsPage() {
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true); const [admin, setAdmin] = useState(false);
  const [seedStatus, setSeedStatus] = useState<"idle"|"loading"|"done">("idle");
  const [itemCount, setItemCount] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getUser(), getInventory()]).then(([u, items]) => {
      if (u) { setName(u.user_metadata?.name || u.email?.split("@")[0] || ""); setEmail(u.email || ""); setAdmin(isAdmin(u.email)); }
      setItemCount(items.length); setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (admin) { getPendingUsers().then(setPendingUsers); }
  }, [admin]);

  async function handleApprove(id: string) {
    setActionLoading(id);
    try { await approveUser(id); setPendingUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'approved' } : u)); }
    catch (e) { console.error(e); }
    setActionLoading(null);
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    try { await rejectUser(id); setPendingUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'rejected' } : u)); }
    catch (e) { console.error(e); }
    setActionLoading(null);
  }

  async function handleSeed() { setSeedStatus("loading"); await seedDemoData(); setItemCount((await getInventory()).length); setSeedStatus("done"); setTimeout(() => setSeedStatus("idle"), 3000); }
  
  function handleExport() {
    getInventory().then(items => {
      const csv = ["ID,Item Name,Category,Size,Grade,Cost,Price,Status", ...items.map((i: InventoryItem) => [i.id, `"${i.itemName}"`, i.category, i.size, i.condition, i.sourcingCost, i.sellingPrice, i.status].join(","))].join("\n");
      const b = new Blob([csv], { type: "text/csv" }); const u = URL.createObjectURL(b);
      const a = document.createElement("a"); a.href = u; a.download = `eravault-${new Date().toISOString().split("T")[0]}.csv`; a.click(); URL.revokeObjectURL(u);
    });
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div><h1 className="text-[22px] font-bold text-on-surface tracking-tight">Settings</h1><p className="text-[13px] text-on-surface-3 mt-0.5">Account & data management</p></div>

      {/* Admin Panel */}
      {admin && (
        <Card className="border-primary/30 bg-primary-soft">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm"><Shield className="w-4 h-4 text-white" /></div>
              <div><CardTitle>Admin Panel</CardTitle><CardDescription>Manage access requests</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <p className="text-[13px] text-on-surface-3 py-4 text-center">No pending requests</p>
            ) : (
              <div className="space-y-2">
                {pendingUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-line">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-[11px] font-bold text-on-surface-3">{(u.name || "?")[0].toUpperCase()}</div>
                      <div>
                        <p className="text-[13px] font-medium text-on-surface">{u.name}</p>
                        <p className="text-[11px] text-on-surface-3">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.status === 'pending' ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleReject(u.id)} disabled={actionLoading === u.id} className="text-red-500 hover:bg-red-500/10 border-red-500/20">
                            {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" onClick={() => handleApprove(u.id)} disabled={actionLoading === u.id}>
                            {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><UserCheck className="w-3 h-3" />Approve</>}
                          </Button>
                        </>
                      ) : u.status === 'approved' ? (
                        <span className="text-[11px] font-medium text-emerald-500 flex items-center gap-1"><Check className="w-3 h-3" />Approved</span>
                      ) : (
                        <span className="text-[11px] font-medium text-red-500 flex items-center gap-1"><UserX className="w-3 h-3" />Rejected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile */}
      <Card>
        <CardHeader><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center"><User className="w-4 h-4 text-on-surface-3" /></div><div><CardTitle>Profile</CardTitle><CardDescription>Account info {admin && <span className="text-primary font-medium">· Admin</span>}</CardDescription></div></div></CardHeader>
        <CardContent className="space-y-3">{loading ? <div className="space-y-3"><div className="h-10 rounded-xl animate-pulse bg-surface-2" /><div className="h-10 rounded-xl animate-pulse bg-surface-2" /></div> : <>
          <div className="space-y-1.5"><Label>Name</Label><Input value={name} disabled className="h-10" /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input value={email} disabled className="h-10" /></div>
        </>}</CardContent>
      </Card>

      {/* Install */}
      <Card>
        <CardHeader><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center"><Smartphone className="w-4 h-4 text-on-surface-3" /></div><div><CardTitle>Install App</CardTitle><CardDescription>Add to your phone</CardDescription></div></div></CardHeader>
        <CardContent><div className="p-4 rounded-xl bg-surface-2 text-[13px] text-on-surface-2 space-y-1"><p><strong className="text-on-surface">iOS:</strong> Safari → Share → Add to Home Screen</p><p><strong className="text-on-surface">Android:</strong> Chrome → Menu → Install App</p></div></CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center"><Database className="w-4 h-4 text-on-surface-3" /></div><div><CardTitle>Data</CardTitle><CardDescription>{itemCount} items · Secured by Supabase</CardDescription></div></div></CardHeader>
        <CardContent className="space-y-2.5">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2"><div><p className="text-[13px] font-medium text-on-surface">Export to CSV</p><p className="text-[11px] text-on-surface-3 mt-0.5">Download inventory data</p></div><Button variant="outline" size="sm" onClick={handleExport} disabled={itemCount === 0}><Download className="w-3.5 h-3.5" />Export</Button></div>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2"><div><p className="text-[13px] font-medium text-on-surface">Load Demo Data</p><p className="text-[11px] text-on-surface-3 mt-0.5">Sample vintage items</p></div><Button variant="outline" size="sm" onClick={handleSeed} disabled={seedStatus === "loading"}>{seedStatus === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : seedStatus === "done" ? <><Check className="w-3.5 h-3.5" />Done!</> : <><Clock className="w-3.5 h-3.5" />Load</>}</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}
