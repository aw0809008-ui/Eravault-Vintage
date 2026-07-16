"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { signUp, getSession, seedDemoData, isSupabaseConfigured } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  useEffect(() => { getSession().then(s => { if (s) router.push("/dashboard"); }); }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    if (!isSupabaseConfigured()) { setError("Supabase not configured"); setLoading(false); return; }
    try {
      const result = await signUp(email, password, name);
      if (result.session) { setTimeout(() => seedDemoData(), 1000); router.push("/dashboard"); router.refresh(); }
      else { setError("Check your email to confirm, then sign in."); setLoading(false); }
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Signup failed"); setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[--bg]">
      <div className="w-full max-w-[360px] animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 font-bold text-xl bg-[--bg-accent] text-[--bg]">E</div>
          <h1 className="text-xl font-bold text-[--text]">Eravault Vintage</h1>
        </div>
        <div className="border border-[--border] rounded-xl p-5 bg-[--bg-el]">
          <h2 className="text-base font-semibold text-[--text] mb-1">Create account</h2>
          <p className="text-xs text-[--text-dim] mb-5">Free with demo data</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <div className={`${error.includes("email") ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-red-500/10 border-red-500/20 text-red-500"} border text-xs rounded-lg px-3 py-2.5`}>{error}</div>}
            <div className="space-y-1.5"><Label htmlFor="name">Name</Label><Input id="name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" placeholder="Min 6 chars" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : "Create Account"}</Button>
          </form>
          <p className="mt-5 text-center text-xs text-[--text-dim]">Have an account? <Link href="/login" className="font-medium text-[--text] hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
