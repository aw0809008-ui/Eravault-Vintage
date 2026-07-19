"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, BarChart3, Settings, LogOut, Menu, X, ChevronLeft, Sun, Moon, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, accent: "from-amber-500 to-orange-600" },
  { href: "/inventory", label: "Inventory", icon: Package, accent: "from-emerald-500 to-teal-600" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, accent: "from-blue-500 to-indigo-600" },
  { href: "/chat", label: "Chat Inbox", icon: MessageCircle, accent: "from-pink-500 to-rose-600" },
  { href: "/settings", label: "Settings", icon: Settings, accent: "from-slate-400 to-slate-600" },
];

export function DashboardShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string } | null }) {
  const path = usePathname(); const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false); const [col, setCol] = useState(false);
  async function logout() { await signOut(); router.push("/login"); }

  return (
    <div className="min-h-screen flex bg-page">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* ─── SIDEBAR ─── */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
        col ? "lg:w-[76px]" : "lg:w-[264px]",
        open ? "w-[272px] translate-x-0 animate-slide-in" : "-translate-x-full lg:translate-x-0"
      )} style={{
        background: `linear-gradient(180deg, var(--color-sidebar-bg) 0%, color-mix(in srgb, var(--color-sidebar-bg), black 25%) 100%)`,
      }}>

        {/* ── Logo ── */}
        <div className="flex items-center justify-between px-5 h-[72px] shrink-0 border-b border-white/[0.04]">
          <Link href="/dashboard" className="flex items-center gap-3.5 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-primary via-primary to-[color:color-mix(in_srgb,var(--color-primary),#000_25%)] flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-105">
                <img src="/favicon.png" alt="E" className="w-6 h-6 rounded-sm" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green border-2 border-sidebar-bg" />
            </div>
            {!col && <div className="overflow-hidden">
              <span className="font-bold text-[17px] text-white tracking-tight block leading-tight">Eravault</span>
              <span className="text-[9px] text-primary/60 block font-bold tracking-[0.2em] uppercase leading-tight">VINTAGE</span>
            </div>}
          </Link>
          <button className="lg:hidden text-white/25 hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-white/5 rounded-lg" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        {/* ── Nav ── */}
        <div className="px-3 mt-5 flex-1 overflow-y-auto">
          {!col && <p className="text-[9px] text-white/[0.12] font-bold tracking-[0.18em] uppercase px-3 mb-3 select-none">Menu</p>}
          <nav className="space-y-1">
            {nav.map((n, i) => {
              const a = path === n.href || (n.href !== "/dashboard" && path.startsWith(n.href));
              return <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={cn(
                "flex items-center gap-3 px-3 py-[11px] rounded-[14px] text-[13px] font-medium transition-all duration-200 group relative",
                a
                  ? "text-white"
                  : "text-white/35 hover:text-white/70 hover:bg-white/[0.03]"
              )} style={a ? {
                background: `linear-gradient(135deg, color-mix(in srgb, var(--color-sidebar-active) 18%, transparent), color-mix(in srgb, var(--color-sidebar-active) 6%, transparent))`,
                boxShadow: `0 0 0 1px color-mix(in srgb, var(--color-sidebar-active) 15%, transparent), 0 4px 12px -4px color-mix(in srgb, var(--color-sidebar-active) 15%, transparent)`,
              } : { animationDelay: `${i * 30}ms` }}>
                {a && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full bg-primary" style={{ boxShadow: '0 0 8px var(--color-primary)' }} />}
                <div className={cn(
                  "w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 transition-all duration-200",
                  a ? `bg-gradient-to-br ${n.accent} shadow-md` : "bg-white/[0.04] group-hover:bg-white/[0.07]"
                )}>
                  <n.icon className={cn("w-[16px] h-[16px]", a ? "text-white" : "text-white/40 group-hover:text-white/60")} />
                </div>
                {!col && <span className="flex-1 truncate">{n.label}</span>}
              </Link>;
            })}
          </nav>
        </div>

        {/* ── Bottom ── */}
        <div className="px-3 pb-2 space-y-0.5 shrink-0">
          <div className="mx-3 my-3 h-px bg-white/[0.04]" />
          <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-[13px] font-medium w-full text-white/25 hover:text-white/60 hover:bg-white/[0.03] transition-all cursor-pointer group">
            <div className="w-8 h-8 rounded-[10px] bg-white/[0.04] group-hover:bg-white/[0.07] flex items-center justify-center transition-all">
              {theme === "dark"
                ? <Sun className="w-4 h-4 text-amber-400/70 group-hover:text-amber-400" />
                : <Moon className="w-4 h-4 text-blue/50 group-hover:text-blue" />}
            </div>
            {!col && (theme === "dark" ? "Light Mode" : "Dark Mode")}
          </button>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-[13px] font-medium w-full text-white/15 hover:text-red-400 hover:bg-red-500/[0.05] transition-all cursor-pointer group">
            <div className="w-8 h-8 rounded-[10px] bg-white/[0.04] group-hover:bg-red-500/10 flex items-center justify-center transition-all">
              <LogOut className="w-4 h-4 text-white/20 group-hover:text-red-400" />
            </div>
            {!col && "Sign Out"}
          </button>
        </div>

        {/* ── Collapse ── */}
        <button className="hidden lg:flex items-center justify-center py-4 border-t border-white/[0.03] text-white/10 hover:text-white/40 cursor-pointer transition-colors" onClick={() => setCol(!col)}>
          <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", col && "rotate-180")} />
        </button>

        {/* ── User ── */}
        {!col && <div className="px-4 py-4 border-t border-white/[0.03] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-primary to-[color:color-mix(in_srgb,var(--color-primary),#000_35%)] flex items-center justify-center text-[14px] font-bold text-white shrink-0 shadow-lg shadow-primary/15 ring-[3px] ring-primary/10">{(user?.name||"?")[0].toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white/80 truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-white/20 truncate leading-tight mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>}
      </aside>

      {/* ─── MAIN ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-surface/90 backdrop-blur-xl border-b border-line px-4 h-[56px] flex items-center justify-between sticky top-0 z-30" style={{ boxShadow: '0 1px 8px -2px rgba(0,0,0,0.06)' }}>
          <button onClick={() => setOpen(true)} className="text-on-surface-2 cursor-pointer p-2 hover:bg-surface-2 rounded-xl transition-colors"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-[color:color-mix(in_srgb,var(--color-primary),#000_25%)] flex items-center justify-center shadow-sm shadow-primary/20">
              <img src="/favicon.png" alt="" className="w-4 h-4 rounded-sm" />
            </div>
            <span className="font-bold text-[15px] text-on-surface tracking-tight">Eravault</span>
          </div>
          <button onClick={toggleTheme} className="p-2 text-on-surface-3 cursor-pointer hover:bg-surface-2 rounded-xl transition-colors">{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
