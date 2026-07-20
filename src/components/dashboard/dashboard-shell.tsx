"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, BarChart3, Settings, LogOut, Menu, X, ChevronLeft, Sun, Moon, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, accent: "from-[#c49a62] to-[#885935]" },
  { href: "/inventory", label: "Inventory", icon: Package, accent: "from-emerald-500 to-teal-600" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, accent: "from-blue-500 to-indigo-600" },
  { href: "/chat", label: "Chat Inbox", icon: MessageCircle, accent: "from-[#d1b385] to-[#a4713e]" },
  { href: "/settings", label: "Settings", icon: Settings, accent: "from-stone-400 to-stone-600" },
];

export function DashboardShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string } | null }) {
  const path = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [col, setCol] = useState(false);
  async function logout() { await signOut(); router.push("/login"); }

  return (
    <div className="min-h-screen flex bg-page">
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* ─────── SIDEBAR ─────── */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col transition-colors duration-200 ease-[cubic-bezier(.16,1,.3,1)]",
          col ? "lg:w-[80px]" : "lg:w-[270px]",
          open ? "w-[280px] translate-x-0 animate-slide-in" : "-translate-x-full lg:translate-x-0"
        )}
        style={{
          background: theme === "dark"
            ? "linear-gradient(180deg, #0a0a0b 0%, #050506 100%)"
            : "linear-gradient(180deg, #1a1612 0%, #0f0d0a 100%)",
        }}
      >
        {/* ── Logo ── */}
        <div className="flex items-center justify-between px-5 h-[76px] shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d1b385] via-[#c49a62] to-[#885935] flex items-center justify-center shadow-lg shadow-[#c49a62]/20 group- transition-colors duration-200  ">
                <span className="text-white font-serif font-black text-lg drop-shadow-sm">E</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-[2.5px] border-[#0a0a0b] shadow-sm shadow-emerald-400/50" />
            </div>
            {!col && (
              <div className="overflow-hidden">
                <span className="font-black text-[18px] text-white tracking-tight block leading-tight">Eravault</span>
                <span className="text-[9px] text-[#c49a62]/80 block font-extrabold tracking-[0.25em] uppercase leading-tight">VINTAGE</span>
              </div>
            )}
          </Link>
          <button className="lg:hidden text-white/40 hover:text-white transition-colors cursor-pointer p-2 hover:bg-white/5 rounded-xl active:scale-95" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#c49a62]/15 to-transparent" />

        {/* ── Nav ── */}
        <div className="px-3 mt-5 flex-1 overflow-y-auto">
          {!col && <p className="text-[10px] text-white/[0.2] font-black tracking-[0.25em] uppercase px-3 mb-4 select-none">MENU</p>}
          <nav className="space-y-1.5">
            {nav.map((n, i) => {
              const active = path === n.href || (n.href !== "/dashboard" && path.startsWith(n.href));
              return (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-2xl text-[13px] font-semibold transition-colors duration-200 group relative overflow-hidden",
                    active ? "text-white" : "text-white/30 hover:text-white/70 hover:bg-white/[0.03]"
                  )}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {active && <div className={`absolute inset-0 bg-gradient-to-r ${n.accent} opacity-[0.12] rounded-2xl`} />}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[22px] rounded-r-full bg-gradient-to-b from-[#d1b385] to-[#b8894a]"
                      style={{ boxShadow: "0 0 14px rgba(196,154,98,0.6)" }} />
                  )}
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 relative",
                    active ? `bg-gradient-to-br ${n.accent} shadow-lg` : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                  )}>
                    <n.icon className={cn("w-[17px] h-[17px] relative z-10", active ? "text-white drop-shadow-sm" : "text-white/30 group-hover:text-white/60")} />
                  </div>
                  {!col && <span className="flex-1 truncate relative z-10">{n.label}</span>}
                  {active && !col && <div className="w-1.5 h-1.5 rounded-full bg-white/40 mr-1 relative z-10" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Bottom ── */}
        <div className="px-3 pb-3 space-y-1 shrink-0">
          <div className="mx-3 my-3 h-px bg-gradient-to-r from-transparent via-[#c49a62]/10 to-transparent" />
          <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] font-semibold w-full text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] group-hover:bg-white/[0.08] flex items-center justify-center transition-colors duration-200">
              {theme === "dark" ? <Sun className="w-[17px] h-[17px] text-[#c49a62]/60 group-hover:text-[#d1b385] transition-colors" /> : <Moon className="w-[17px] h-[17px] text-blue/40 group-hover:text-blue transition-colors" />}
            </div>
            {!col && (theme === "dark" ? "Light Mode" : "Dark Mode")}
          </button>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] font-semibold w-full text-white/15 hover:text-red-400 hover:bg-red-500/[0.06] transition-all cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] group-hover:bg-red-500/10 flex items-center justify-center transition-colors duration-200">
              <LogOut className="w-[17px] h-[17px] text-white/15 group-hover:text-red-400 transition-colors" />
            </div>
            {!col && "Sign Out"}
          </button>
        </div>

        <button className="hidden lg:flex items-center justify-center py-4 border-t border-white/[0.04] text-white/10 hover:text-white/40 cursor-pointer transition-all hover:bg-white/[0.02]" onClick={() => setCol(!col)}>
          <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", col && "rotate-180")} />
        </button>

        {!col && (
          <div className="px-4 py-4 border-t border-white/[0.04] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d1b385] via-[#c49a62] to-[#885935] flex items-center justify-center text-[15px] font-black text-white shrink-0 shadow-lg shadow-[#c49a62]/20 ring-[3px] ring-[#c49a62]/10">
                {(user?.name || "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-white/85 truncate leading-tight">{user?.name}</p>
                <p className="text-[10px] text-white/25 truncate leading-tight mt-0.5">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ─────── MAIN ─────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-surface border-b border-line/50 px-4 h-[60px] flex items-center justify-between sticky top-0 z-30" style={{ boxShadow: "0 1px 12px -4px rgba(0,0,0,0.08)" }}>
          <button onClick={() => setOpen(true)} className="text-on-surface-2 cursor-pointer p-2 hover:bg-surface-2 rounded-xl transition-colors active:scale-95"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d1b385] via-[#c49a62] to-[#885935] flex items-center justify-center shadow-md shadow-[#c49a62]/20">
              <span className="text-white font-serif font-black text-[11px]">E</span>
            </div>
            <span className="font-black text-[16px] text-on-surface tracking-tight">Eravault</span>
          </div>
          <button onClick={toggleTheme} className="p-2 text-on-surface-3 cursor-pointer hover:bg-surface-2 rounded-xl transition-colors active:scale-95">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
