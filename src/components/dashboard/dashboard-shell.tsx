"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, BarChart3, Settings, LogOut, Menu, X, ChevronLeft, Sun, Moon, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: "" },
  { href: "/inventory", label: "Inventory", icon: Package, badge: "" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, badge: "" },
  { href: "/chat", label: "Chat Inbox", icon: MessageCircle, badge: "NEW" },
  { href: "/settings", label: "Settings", icon: Settings, badge: "" },
];

export function DashboardShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string } | null }) {
  const path = usePathname(); const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false); const [col, setCol] = useState(false);
  async function logout() { await signOut(); router.push("/login"); }

  return (
    <div className="min-h-screen flex bg-page">
      {open && <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* ─── SIDEBAR ─── */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col transition-all duration-300 ease-out",
        "bg-gradient-to-b from-sidebar-bg via-sidebar-bg to-[color:color-mix(in_srgb,var(--color-sidebar-bg),black_15%)]",
        col ? "lg:w-[72px]" : "lg:w-[260px]",
        open ? "w-[270px] translate-x-0 animate-slide-in shadow-2xl shadow-black/40" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-[68px] shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-[color:color-mix(in_srgb,var(--color-primary),black_20%)] flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!col && <div className="overflow-hidden">
              <span className="font-bold text-[16px] text-white tracking-tight block leading-tight">Eravault</span>
              <span className="text-[9px] text-white/25 block font-semibold tracking-[0.2em] uppercase">VINTAGE</span>
            </div>}
          </Link>
          <button className="lg:hidden text-white/30 hover:text-white cursor-pointer p-1" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        {/* Nav */}
        <div className="px-3 mt-3 flex-1 overflow-y-auto">
          {!col && <p className="text-[9px] text-white/15 font-bold tracking-[0.15em] uppercase px-3 mb-3">Navigation</p>}
          <nav className="space-y-0.5">
            {nav.map(n => {
              const a = path === n.href || (n.href !== "/dashboard" && path.startsWith(n.href));
              return <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative",
                a
                  ? "bg-gradient-to-r from-primary/20 to-primary/[0.08] text-white shadow-sm border border-primary/15"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
              )}>
                {a && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary shadow-sm shadow-primary/50" />}
                <n.icon className={cn("w-[18px] h-[18px] shrink-0 transition-colors", a ? "text-primary" : "text-white/30 group-hover:text-white/60")} />
                {!col && <span className="flex-1">{n.label}</span>}
                {!col && n.badge && <span className="text-[8px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full leading-none">{n.badge}</span>}
              </Link>;
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="px-3 pb-2 space-y-0.5 shrink-0">
          <div className="mx-3 my-2 h-px bg-white/[0.05]" />
          <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium w-full text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all cursor-pointer group">
            {theme === "dark"
              ? <Sun className="w-[18px] h-[18px] shrink-0 text-orange/60 group-hover:text-orange" />
              : <Moon className="w-[18px] h-[18px] shrink-0 text-blue/60 group-hover:text-blue" />}
            {!col && (theme === "dark" ? "Light Mode" : "Dark Mode")}
          </button>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium w-full text-white/20 hover:text-red-400 hover:bg-red-500/[0.06] transition-all cursor-pointer group">
            <LogOut className="w-[18px] h-[18px] shrink-0 group-hover:text-red-400" />{!col && "Sign Out"}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button className="hidden lg:flex items-center justify-center py-3.5 border-t border-white/[0.04] text-white/15 hover:text-white/50 cursor-pointer transition-colors" onClick={() => setCol(!col)}>
          <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", col && "rotate-180")} />
        </button>

        {/* User */}
        {!col && <div className="px-4 py-3.5 border-t border-white/[0.04] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[color:color-mix(in_srgb,var(--color-primary),black_30%)] flex items-center justify-center text-[13px] font-bold text-white shrink-0 shadow-md shadow-primary/20 ring-2 ring-primary/10">{(user?.name||"?")[0].toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-white/80 truncate">{user?.name}</p>
              <p className="text-[10px] text-white/20 truncate">{user?.email}</p>
            </div>
          </div>
        </div>}
      </aside>

      {/* ─── MAIN ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-surface/80 backdrop-blur-xl border-b border-line px-4 h-[56px] flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="text-on-surface-2 cursor-pointer p-2 hover:bg-surface-2 rounded-xl transition-colors"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-[color:color-mix(in_srgb,var(--color-primary),black_20%)] flex items-center justify-center shadow-sm shadow-primary/20">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-[15px] text-on-surface">Eravault</span>
          </div>
          <button onClick={toggleTheme} className="p-2 text-on-surface-3 cursor-pointer hover:bg-surface-2 rounded-xl transition-colors">{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
