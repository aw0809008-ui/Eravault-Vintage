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
  const [collapsed, setCollapsed] = useState(false);

  async function logout() { await signOut(); router.push("/login"); }

  return (
    <div className="min-h-screen flex bg-[--bg]">
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col bg-[--bg-sub] border-r border-[--border] transition-all duration-200",
        collapsed ? "lg:w-16" : "lg:w-56",
        open ? "w-56 translate-x-0 animate-slide-in" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-3 h-14 border-b border-[--border]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[--bg-accent] text-[--bg] flex items-center justify-center font-bold text-sm shrink-0">E</div>
            {!collapsed && <span className="font-semibold text-sm text-[--text]">Eravault</span>}
          </Link>
          <button className="lg:hidden text-[--text-dim] cursor-pointer" onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {nav.map(n => {
            const active = path === n.href || (n.href !== "/dashboard" && path.startsWith(n.href));
            return (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                className={cn("flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors",
                  active ? "bg-[--bg-accent] text-[--bg]" : "text-[--text-sub] hover:text-[--text] hover:bg-[--bg-hover]"
                )}>
                <n.icon className="w-4 h-4 shrink-0" />{!collapsed && <span>{n.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="border-t border-[--border] p-2 space-y-0.5">
          <button onClick={toggleTheme} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium w-full text-[--text-sub] hover:text-[--text] hover:bg-[--bg-hover] transition-colors cursor-pointer">
            {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            {!collapsed && <span>{theme === "dark" ? "Light" : "Dark"}</span>}
          </button>
          <button onClick={logout} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium w-full text-[--text-sub] hover:text-red-500 hover:bg-[--bg-hover] transition-colors cursor-pointer">
            <LogOut className="w-4 h-4 shrink-0" />{!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse */}
        <button className="hidden lg:flex items-center justify-center py-2.5 border-t border-[--border] text-[--text-dim] hover:text-[--text] cursor-pointer transition-colors" onClick={() => setCollapsed(!collapsed)}>
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>

        {/* User */}
        <div className="border-t border-[--border] p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[--bg-hover] border border-[--border] flex items-center justify-center shrink-0 text-[11px] font-semibold text-[--text-sub]">
              {(user?.name || "?")[0].toUpperCase()}
            </div>
            {!collapsed && <div className="min-w-0"><p className="text-xs font-medium text-[--text] truncate">{user?.name}</p><p className="text-[11px] text-[--text-dim] truncate">{user?.email}</p></div>}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-[--bg-sub] border-b border-[--border] px-4 h-12 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="text-[--text-sub] cursor-pointer"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-[--bg-accent] text-[--bg] flex items-center justify-center font-bold text-[10px]">E</div><span className="font-semibold text-sm text-[--text]">Eravault</span></div>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-1.5 text-[--text-sub] cursor-pointer">{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
            <button onClick={logout} className="p-1.5 text-[--text-sub] hover:text-red-500 cursor-pointer"><LogOut className="w-4 h-4" /></button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
