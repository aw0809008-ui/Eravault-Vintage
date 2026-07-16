"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    getSession().then(s => router.push(s ? "/dashboard" : "/login"));
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-primary)', borderTopColor: 'var(--accent)' }} />
    </div>
  );
}
