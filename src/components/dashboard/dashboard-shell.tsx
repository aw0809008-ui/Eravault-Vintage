"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  User,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { clearLocalUser } from "@/lib/local-storage";

interface DashboardShellProps {
  children: React.ReactNode;
  user: { name: string; email: string } | null;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    clearLocalUser();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col transition-all duration-300",
          "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/50",
          collapsed ? "lg:w-20" : "lg:w-72",
          sidebarOpen
            ? "w-72 translate-x-0 animate-slide-in-left"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-20 border-b border-slate-800/50">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
              <Crown className="w-5 h-5 text-slate-900" />
            </div>
            {!collapsed && (
              <div>
                <span className="font-bold text-xl text-slate-100 tracking-tight">Eravault</span>
                <span className="text-xs text-yellow-500 block -mt-0.5 font-medium">VINTAGE</span>
              </div>
            )}
          </Link>
          <button
            className="lg:hidden text-slate-400 hover:text-slate-100 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 text-yellow-400 border border-yellow-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-yellow-400")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          className="hidden lg:flex items-center justify-center py-4 border-t border-slate-800/50 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              "w-5 h-5 transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
        </button>

        {/* User section */}
        <div className="border-t border-slate-800/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center flex-shrink-0 border border-slate-700">
              <User className="w-4 h-4 text-slate-400" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{user?.name || "Guest"}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || "Not signed in"}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 px-4 h-16 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-slate-100 cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-slate-900" />
            </div>
            <span className="font-bold text-slate-100">Eravault</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-9 w-9"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
