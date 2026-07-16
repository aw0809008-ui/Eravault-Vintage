"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { signIn, getSession, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  useEffect(() => { getSession().then(s => { if (s) router.push("/dashboard"); }); }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    if (!isSupabaseConfigured()) { setError("Supabase not configured"); setLoading(false); return; }
    try { await signIn(email, password); router.push("/dashboard"); router.refresh(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex bg-[--c-bg]">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-[480px] bg-[#111827] flex-col justify-between p-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold">E</div>
          <span className="text-white font-semibold">Eravault Vintage</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight">Manage your vintage<br />inventory with ease</h2>
          <p className="text-gray-400 mt-3 text-sm leading-relaxed">Track sourcing, listings, sales and profits.<br />Built for Fleek sellers.</p>
        </div>
        <p className="text-gray-500 text-xs">© 2025 Eravault Vintage</p>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold">E</div>
            <span className="font-semibold text-[--c-text]">Eravault Vintage</span>
          </div>

          <h1 className="text-2xl font-bold text-[--c-text]">Welcome back</h1>
          <p className="text-[--c-text-3] text-sm mt-1 mb-6">Sign in to your account</p>

          <form onSubmit={onSubmit} className="space-y-4">
            {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[13px] rounded-lg px-4 py-3">{error}</div>}
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="space-y-1.5"><Label>Password</Label><Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : "Sign in"}</Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-[--c-text-3]">
            Don&apos;t have an account? <Link href="/signup" className="text-[--c-accent] font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
