"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Zap, Globe, BarChart3, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { requestAccess, getSession, isSupabaseConfigured } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  useEffect(() => { getSession().then(s => { if (s) router.push("/dashboard"); }); }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    if (!isSupabaseConfigured()) { setError("System not configured"); setLoading(false); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
    try {
      await requestAccess(name, email, password);
      setSuccess(true);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Request failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[520px] relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 flex-col justify-between p-12 text-white">
        <div className="absolute top-32 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-20 -left-16 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl animate-glow" style={{animationDelay:'1s'}} />
        <div className="relative z-10"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg border border-white/10">E</div><div><span className="font-bold text-lg">Eravault</span><span className="text-emerald-200 text-xs block -mt-0.5">VINTAGE</span></div></div></div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-[32px] font-bold leading-[1.2] tracking-tight">Join the Eravault<br/>seller community</h2>
          <p className="text-emerald-200 text-[15px] leading-relaxed max-w-sm">Request access and start managing your vintage inventory professionally.</p>
          <div className="space-y-3 pt-2">
            {[{icon:Zap,text:"Approved in minutes"},{icon:Globe,text:"Access from any device"},{icon:BarChart3,text:"Real-time analytics"}].map((f,i) => (
              <div key={i} className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10"><f.icon className="w-4 h-4 text-emerald-200" /></div><span className="text-[14px] text-emerald-100">{f.text}</span></div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-emerald-300/60 text-xs">Admin approval required</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 bg-page">
        <div className="w-full max-w-[400px] animate-fade-in">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-white">E</div>
            <div><span className="font-bold text-on-surface">Eravault</span><span className="text-on-surface-3 text-[10px] block -mt-0.5">VINTAGE</span></div>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-8 h-8 text-emerald-500" /></div>
              <h2 className="text-[22px] font-bold text-on-surface">Request Sent!</h2>
              <p className="text-on-surface-3 text-[14px] mt-2 leading-relaxed max-w-sm mx-auto">Your access request has been sent to the admin. You&apos;ll be able to sign in once approved.</p>
              <Link href="/login"><Button className="mt-6">Go to Sign In</Button></Link>
            </div>
          ) : (
            <>
              <h1 className="text-[26px] font-bold text-on-surface tracking-tight">Request Access</h1>
              <p className="text-on-surface-3 text-[14px] mt-1.5 mb-8">Admin will review and approve your request</p>

              <form onSubmit={onSubmit} className="space-y-5">
                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] rounded-xl px-4 py-3 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{error}</div>}
                <div className="space-y-2"><Label>Full name</Label><Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required className="h-11" /></div>
                <div className="space-y-2"><Label>Email address</Label><Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-11" /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="h-11" /></div>
                <Button type="submit" className="w-full h-11 text-[14px]" disabled={loading}>{loading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending request...</> : "Request Access"}</Button>
              </form>

              <div className="mt-8 pt-6 border-t border-line text-center">
                <p className="text-[13px] text-on-surface-3">Already approved? <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link></p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
