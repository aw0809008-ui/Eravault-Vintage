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
      if (!u) { router.push("/login"); return; }
      setUser({ name: u.user_metadata?.name || u.email?.split("@")[0] || "User", email: u.email || "" });
      setLoading(false);
    });
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[--bg]">
      <div className="w-7 h-7 border-2 border-[--border] border-t-[--text] rounded-full animate-spin" />
    </div>
  );

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
