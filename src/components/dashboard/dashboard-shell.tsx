"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, BarChart3, Settings, LogOut, Menu, X, ChevronLeft, User, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";

interface DashboardShellProps { children: React.ReactNode; user: { name: string; email: string } | null; }

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={cn("fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col transition-all duration-300 border-r theme-transition", collapsed ? "lg:w-[70px]" : "lg:w-64", sidebarOpen ? "w-64 translate-x-0 animate-slide-in-left" : "-translate-x-full lg:translate-x-0")} style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between px-4 h-16 border-b theme-transition" style={{ borderColor: 'var(--border-primary)' }}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-lg" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}>E</div>
            {!collapsed && <div><span className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Eravault</span><span className="text-[10px] block -mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>VINTAGE</span></div>}
          </Link>
          <button className="lg:hidden cursor-pointer" style={{ color: 'var(--text-muted)' }} onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200", isActive ? "bg-[--accent] text-[--bg-primary]" : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]")}>
                <item.icon className="w-5 h-5 flex-shrink-0" />{!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 py-2 border-t theme-transition" style={{ borderColor: 'var(--border-primary)' }}>
          <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover] transition-all">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}{!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>
        </div>

        <button className="hidden lg:flex items-center justify-center py-3 border-t theme-transition cursor-pointer" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }} onClick={() => setCollapsed(!collapsed)}>
          <ChevronLeft className={cn("w-5 h-5 transition-transform duration-200", collapsed && "rotate-180")} />
        </button>

        <div className="border-t p-3 theme-transition" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}><User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></div>
            {!collapsed && <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || "Guest"}</p><p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email || ""}</p></div>}
            <button onClick={handleLogout} title="Sign out" className="transition-colors cursor-pointer flex-shrink-0 hover:text-red-500" style={{ color: 'var(--text-muted)' }}><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden border-b px-4 h-14 flex items-center justify-between sticky top-0 z-30 theme-transition" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <button onClick={() => setSidebarOpen(true)} className="cursor-pointer" style={{ color: 'var(--text-secondary)' }}><Menu className="w-6 h-6" /></button>
          <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}>E</div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Eravault</span></div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-1" style={{ color: 'var(--text-secondary)' }}>{theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8"><LogOut className="w-4 h-4" /></Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
