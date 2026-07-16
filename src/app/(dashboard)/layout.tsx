"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getUser } from "@/lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then(u => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser({ name: u.user_metadata?.name || u.email?.split("@")[0] || "User", email: u.email || "" });
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-primary)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
