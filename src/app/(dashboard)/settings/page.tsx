"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Database, Loader2, Check, Smartphone, Download, Shield, UserCheck, UserX, Clock, Zap, Mail, Crown } from "lucide-react";
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
    <div className="space-y-6 sm:space-y-8 max-w-2xl">
      {/* ═══════ HEADER ═══════ */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 animate-fade-in" style={{ background: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)" }}>
        <div className="absolute top-[-40px] right-[-40px] w-[180px] h-[180px] rounded-full bg-gradient-to-br from-amber-500/15 to-transparent blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚙️</span>
            <span className="text-[11px] font-bold text-[#c49a62]/60 uppercase tracking-[0.2em]">Settings</span>
          </div>
          <h1 className="text-[26px] sm:text-[34px] font-black text-white tracking-tight leading-[1.1]">Account & Data</h1>
          <p className="text-[13px] text-white/40 mt-2">Manage your account, data exports, and preferences.</p>
        </div>
      </div>

      {/* ═══════ ADMIN PANEL ═══════ */}
      {admin && (
        <div className="rounded-2xl border border-violet-500/20 bg-surface  overflow-hidden animate-fade-in-up" >
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-on-surface tracking-tight flex items-center gap-2">Admin Panel <Crown className="w-3.5 h-3.5 text-[#c49a62]" /></h3>
                <p className="text-[11px] text-on-surface-3">Manage user access requests</p>
              </div>
            </div>
            {pendingUsers.length === 0 ? (
              <div className="py-8 text-center rounded-xl bg-surface-2/50 border border-line/30">
                <Shield className="w-10 h-10 mx-auto mb-3 text-on-surface-3/20" />
                <p className="text-[13px] text-on-surface-3 font-bold">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-2/60 border border-line/30 hover:border-line/60 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-[13px] font-black text-primary">
                        {(u.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-on-surface">{u.name}</p>
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
                        <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-lg"><Check className="w-3 h-3" />Approved</span>
                      ) : (
                        <span className="text-[11px] font-bold text-red-500 flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg"><UserX className="w-3 h-3" />Rejected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ PROFILE ═══════ */}
      <div className="rounded-2xl border border-line/60 bg-surface  overflow-hidden animate-fade-in-up" >
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d1b385] via-[#c49a62] to-[#885935] flex items-center justify-center shadow-lg shadow-[#c49a62]/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-on-surface tracking-tight">Profile</h3>
              <p className="text-[11px] text-on-surface-3">Account information {admin && <span className="text-primary font-bold">· Admin</span>}</p>
            </div>
          </div>
          {loading ? (
            <div className="space-y-3"><div className="h-12 rounded-xl animate-shimmer" /><div className="h-12 rounded-xl animate-shimmer" /></div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-[0.15em] font-bold text-on-surface-3">Full Name</Label>
                <div className="flex items-center gap-3 h-12 px-4 rounded-xl bg-surface-2/60 border border-line/30">
                  <User className="w-4 h-4 text-on-surface-3" />
                  <span className="text-[13px] font-semibold text-on-surface">{name}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-[0.15em] font-bold text-on-surface-3">Email Address</Label>
                <div className="flex items-center gap-3 h-12 px-4 rounded-xl bg-surface-2/60 border border-line/30">
                  <Mail className="w-4 h-4 text-on-surface-3" />
                  <span className="text-[13px] font-semibold text-on-surface">{email}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ INSTALL APP ═══════ */}
      <div className="rounded-2xl border border-line/60 bg-surface  overflow-hidden animate-fade-in-up" >
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-on-surface tracking-tight">Install App</h3>
              <p className="text-[11px] text-on-surface-3">Add to your phone as a native app</p>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-2/60 border border-line/30">
              <span className="text-lg">🍎</span>
              <p className="text-[13px] text-on-surface"><span className="font-bold">iOS:</span> <span className="text-on-surface-2">Safari → Share → Add to Home Screen</span></p>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-2/60 border border-line/30">
              <span className="text-lg">🤖</span>
              <p className="text-[13px] text-on-surface"><span className="font-bold">Android:</span> <span className="text-on-surface-2">Chrome → Menu → Install App</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ DATA MANAGEMENT ═══════ */}
      <div className="rounded-2xl border border-line/60 bg-surface  overflow-hidden animate-fade-in-up" >
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-on-surface tracking-tight">Data Management</h3>
              <p className="text-[11px] text-on-surface-3">{itemCount} items · Secured by Supabase</p>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-2/60 border border-line/30 hover:border-line/60 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Download className="w-4 h-4 text-blue" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-on-surface">Export to CSV</p>
                  <p className="text-[11px] text-on-surface-3 mt-0.5">Download your inventory data</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={itemCount === 0}><Download className="w-3.5 h-3.5" />Export</Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-2/60 border border-line/30 hover:border-line/60 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-orange" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-on-surface">Load Demo Data</p>
                  <p className="text-[11px] text-on-surface-3 mt-0.5">Sample vintage items for testing</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSeed} disabled={seedStatus === "loading"}>
                {seedStatus === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : seedStatus === "done" ? <><Check className="w-3.5 h-3.5" />Done!</> : <><Clock className="w-3.5 h-3.5" />Load</>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
