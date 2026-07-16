"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, BarChart3, Settings, LogOut, Menu, X, ChevronLeft, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string } | null }) {
  const path = usePathname(); const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false); const [col, setCol] = useState(false);
  async function logout() { await signOut(); router.push("/login"); }

  return (
    <div className="min-h-screen flex bg-page">
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={cn("fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col transition-all duration-200",
        "bg-gradient-to-b from-gray-900 to-gray-950",
        col ? "lg:w-[64px]" : "lg:w-[240px]",
        open ? "w-[240px] translate-x-0 animate-slide-in" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between px-4 h-[56px] border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-indigo-500/20">E</div>
            {!col && <div><span className="font-bold text-[14px] text-white">Eravault</span><span className="text-indigo-300/60 text-[10px] block -mt-0.5 font-medium tracking-wider">VINTAGE</span></div>}
          </Link>
          <button className="lg:hidden text-white/30 hover:text-white cursor-pointer transition-colors" onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
        </div>

        <nav className="flex-1 py-3 px-2.5 space-y-1">
          {nav.map(n => {
            const a = path === n.href || (n.href !== "/dashboard" && path.startsWith(n.href));
            return <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200",
              a ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/20 shadow-sm" : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
            )}>
              <n.icon className={cn("w-[18px] h-[18px] shrink-0", a && "text-indigo-400")} />{!col && n.label}
            </Link>;
          })}
        </nav>

        <div className="border-t border-white/[0.06] px-2.5 py-2 space-y-0.5">
          <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium w-full text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer">
            {theme === "dark" ? <Sun className="w-[18px] h-[18px] shrink-0" /> : <Moon className="w-[18px] h-[18px] shrink-0" />}
            {!col && (theme === "dark" ? "Light mode" : "Dark mode")}
          </button>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium w-full text-gray-500 hover:text-red-400 hover:bg-red-500/[0.05] transition-all cursor-pointer">
            <LogOut className="w-[18px] h-[18px] shrink-0" />{!col && "Sign out"}
          </button>
        </div>

        <button className="hidden lg:flex items-center justify-center py-3 border-t border-white/[0.06] text-gray-600 hover:text-gray-300 cursor-pointer transition-colors" onClick={() => setCol(!col)}>
          <ChevronLeft className={cn("w-4 h-4 transition-transform", col && "rotate-180")} />
        </button>

        {!col && <div className="border-t border-white/[0.06] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-[12px] font-bold text-indigo-300 shrink-0">{(user?.name||"?")[0].toUpperCase()}</div>
            <div className="min-w-0"><p className="text-[12px] font-medium text-white/80 truncate">{user?.name}</p><p className="text-[11px] text-gray-500 truncate">{user?.email}</p></div>
          </div>
        </div>}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-surface border-b border-line px-4 h-[52px] flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="text-on-surface-2 cursor-pointer p-1 hover:bg-surface-2 rounded-lg transition-colors"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-[10px]">E</div><span className="font-bold text-[13px] text-on-surface">Eravault</span></div>
          <button onClick={toggleTheme} className="p-1.5 text-on-surface-3 cursor-pointer hover:bg-surface-2 rounded-lg transition-colors">{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-7 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
