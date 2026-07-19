"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, BarChart3, Settings, LogOut, Menu, X, ChevronLeft, Sun, Moon, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/chat", label: "Chat Inbox", icon: MessageCircle },
];

export function DashboardShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string } | null }) {
  const path = usePathname(); const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false); const [col, setCol] = useState(false);
  async function logout() { await signOut(); router.push("/login"); }

  return (
    <div className="min-h-screen flex bg-page">
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col bg-sidebar-bg transition-all duration-200",
        col ? "lg:w-[64px]" : "lg:w-[250px]",
        open ? "w-[250px] translate-x-0 animate-slide-in" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-[60px]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/favicon.png" alt="E" className="w-8 h-8 rounded-lg shrink-0" />
            {!col && <div>
              <span className="font-bold text-[15px] text-white tracking-tight">Eravault</span>
              <span className="text-[10px] text-white/30 block -mt-0.5 font-medium tracking-[0.15em]">VINTAGE</span>
            </div>}
          </Link>
          <button className="lg:hidden text-white/30 hover:text-white cursor-pointer" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        {/* Nav */}
        <div className="px-3 mt-2">
          <p className="text-[10px] text-white/20 font-semibold tracking-[0.1em] uppercase px-3 mb-2">{!col && "Menu"}</p>
          <nav className="space-y-1">
            {nav.map(n => {
              const a = path === n.href || (n.href !== "/dashboard" && path.startsWith(n.href));
              return <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                a ? "bg-sidebar-active text-white shadow-lg shadow-sidebar-active/20" : "text-white/50 hover:text-white hover:bg-white/[0.06]"
              )}>
                <n.icon className={cn("w-[18px] h-[18px] shrink-0", a && "text-white")} />{!col && n.label}
              </Link>;
            })}
          </nav>
        </div>

        <div className="flex-1" />

        {/* Bottom */}
        <div className="px-3 pb-2 space-y-1">
          <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium w-full text-white/40 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer">
            {theme === "dark" ? <Sun className="w-[18px] h-[18px] shrink-0" /> : <Moon className="w-[18px] h-[18px] shrink-0" />}
            {!col && (theme === "dark" ? "Light Mode" : "Dark Mode")}
          </button>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium w-full text-white/30 hover:text-red-400 hover:bg-red-500/[0.06] transition-all cursor-pointer">
            <LogOut className="w-[18px] h-[18px] shrink-0" />{!col && "Sign Out"}
          </button>
        </div>

        {/* Collapse */}
        <button className="hidden lg:flex items-center justify-center py-3 border-t border-white/[0.06] text-white/20 hover:text-white/60 cursor-pointer" onClick={() => setCol(!col)}>
          <ChevronLeft className={cn("w-4 h-4 transition-transform", col && "rotate-180")} />
        </button>

        {/* User */}
        {!col && <div className="px-4 py-3.5 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-[12px] font-bold text-white shrink-0 shadow-md shadow-primary/30">{(user?.name||"?")[0].toUpperCase()}</div>
            <div className="min-w-0"><p className="text-[12px] font-medium text-white/80 truncate">{user?.name}</p><p className="text-[11px] text-white/25 truncate">{user?.email}</p></div>
          </div>
        </div>}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-surface/80 backdrop-blur-xl border-b border-line px-4 h-[52px] flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="text-on-surface-2 cursor-pointer p-1.5 hover:bg-surface-2 rounded-lg"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2"><img src="/favicon.png" alt="" className="w-6 h-6 rounded-md" /><span className="font-bold text-[14px] text-on-surface">Eravault</span></div>
          <button onClick={toggleTheme} className="p-1.5 text-on-surface-3 cursor-pointer hover:bg-surface-2 rounded-lg">{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-7 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
