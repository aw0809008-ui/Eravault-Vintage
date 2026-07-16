"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Package, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";
import { adminLogin, getSession, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  useEffect(() => { getSession().then(s => { if (s) router.push("/dashboard"); }); }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    if (!isSupabaseConfigured()) { setError("System not configured"); setLoading(false); return; }
    try { await adminLogin(email, password); router.push("/dashboard"); router.refresh(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[520px] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex-col justify-between p-12 text-white">
        <div className="absolute top-20 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-32 -left-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-glow" style={{animationDelay:'1s'}} />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg border border-white/10">E</div>
            <div><span className="font-bold text-lg">Eravault</span><span className="text-indigo-200 text-xs block -mt-0.5">VINTAGE</span></div>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-[32px] font-bold leading-[1.2] tracking-tight">Manage your vintage<br/>inventory like a pro</h2>
          <p className="text-indigo-200 text-[15px] leading-relaxed max-w-sm">Track every piece from sourcing to sale. Built for Fleek sellers.</p>
          <div className="space-y-3 pt-2">
            {[{icon:Package,text:"Track inventory & listings"},{icon:TrendingUp,text:"Monitor profits in real-time"},{icon:Shield,text:"Secure cloud storage"}].map((f,i) => (
              <div key={i} className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10"><f.icon className="w-4 h-4 text-indigo-200" /></div><span className="text-[14px] text-indigo-100">{f.text}</span></div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-indigo-300/60 text-xs">© 2025 Eravault Vintage</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 bg-page">
        <div className="w-full max-w-[400px] animate-fade-in">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-white">E</div>
            <div><span className="font-bold text-on-surface">Eravault</span><span className="text-on-surface-3 text-[10px] block -mt-0.5">VINTAGE</span></div>
          </div>
          <h1 className="text-[26px] font-bold text-on-surface tracking-tight">Welcome back</h1>
          <p className="text-on-surface-3 text-[14px] mt-1.5 mb-8">Sign in to your account</p>

          <form onSubmit={onSubmit} className="space-y-5">
            {error && <div className={`text-[13px] rounded-xl px-4 py-3 flex items-center gap-2 border ${error.includes("pending")?"bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400":error.includes("rejected")?"bg-red-500/10 border-red-500/20 text-red":"bg-red-500/10 border-red-500/20 text-red-500"}`}><div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />{error}</div>}
            <div className="space-y-2"><Label>Email address</Label><Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-11" /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="h-11" /></div>
            <Button type="submit" className="w-full h-11 text-[14px]" disabled={loading}>{loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : "Sign in"}</Button>
          </form>

          <div className="mt-8 pt-6 border-t border-line text-center">
            <p className="text-[13px] text-on-surface-3">Need access? <Link href="/signup" className="text-primary font-semibold hover:underline">Request access</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
