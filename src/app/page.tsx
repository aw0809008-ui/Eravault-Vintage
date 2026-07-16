"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/supabase";
export default function Home() {
  const router = useRouter();
  useEffect(() => { getSession().then(s => router.push(s ? "/dashboard" : "/login")); }, [router]);
  return <div className="min-h-screen flex items-center justify-center bg-page"><div className="w-7 h-7 border-2 border-line border-t-primary rounded-full animate-spin" /></div>;
}
