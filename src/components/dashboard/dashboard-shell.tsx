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
  const path = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [col, setCol] = useState(false);
  async function logout() { await signOut(); router.push("/login"); }

  return (
    <div className="min-h-screen flex bg-page">
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={cn("fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col bg-sidebar-bg transition-all duration-200",
        col ? "lg:w-[60px]" : "lg:w-[220px]",
        open ? "w-[220px] translate-x-0 animate-slide-in" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between px-3 h-[52px] border-b border-white/[0.08]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-sidebar-active text-white flex items-center justify-center font-bold text-xs shrink-0">E</div>
            {!col && <span className="font-semibold text-[13px] text-white/90">Eravault</span>}
          </Link>
          <button className="lg:hidden text-white/40 cursor-pointer" onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
        </div>

        <nav className="flex-1 py-2.5 px-2 space-y-0.5">
          {nav.map(n => {
            const a = path === n.href || (n.href !== "/dashboard" && path.startsWith(n.href));
            return <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-colors", a ? "bg-sidebar-active text-white" : "text-gray-400 hover:bg-sidebar-hover hover:text-white")}>
              <n.icon className="w-4 h-4 shrink-0" />{!col && n.label}
            </Link>;
          })}
        </nav>

        <div className="border-t border-white/[0.08] px-2 py-2 space-y-0.5">
          <button onClick={toggleTheme} className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium w-full text-gray-400 hover:bg-sidebar-hover hover:text-white transition-colors cursor-pointer">
            {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            {!col && (theme === "dark" ? "Light mode" : "Dark mode")}
          </button>
          <button onClick={logout} className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium w-full text-gray-500 hover:text-red-400 hover:bg-sidebar-hover transition-colors cursor-pointer">
            <LogOut className="w-4 h-4 shrink-0" />{!col && "Sign out"}
          </button>
        </div>

        <button className="hidden lg:flex items-center justify-center py-2.5 border-t border-white/[0.08] text-gray-500 hover:text-white cursor-pointer transition-colors" onClick={() => setCol(!col)}>
          <ChevronLeft className={cn("w-4 h-4 transition-transform", col && "rotate-180")} />
        </button>

        {!col && <div className="border-t border-white/[0.08] px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-sidebar-hover border border-white/10 flex items-center justify-center text-[11px] font-semibold text-white/50 shrink-0">{(user?.name||"?")[0].toUpperCase()}</div>
            <div className="min-w-0"><p className="text-[12px] font-medium text-white/80 truncate">{user?.name}</p><p className="text-[11px] text-gray-500 truncate">{user?.email}</p></div>
          </div>
        </div>}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-surface border-b border-line px-4 h-12 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="text-on-surface-2 cursor-pointer"><Menu className="w-5 h-5" /></button>
          <span className="font-semibold text-[13px] text-on-surface">Eravault</span>
          <button onClick={toggleTheme} className="p-1.5 text-on-surface-3 cursor-pointer">{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
        </header>
        <main className="flex-1 p-4 md:p-5 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
