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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSession().then(s => { if (s) router.push("/dashboard"); });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setError("Supabase not configured");
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, name);
      // Seed demo data after signup
      setTimeout(() => seedDemoData(), 1000);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 font-bold text-2xl" style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}>E</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Eravault</h1>
          <p className="text-xs font-medium tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>VINTAGE</p>
        </div>

        <div className="border rounded-2xl p-6 shadow-lg theme-transition" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Create account</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Free • Demo data included</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg px-4 py-3">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : "Create Account"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--text-primary)' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
