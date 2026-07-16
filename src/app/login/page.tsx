"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { getLocalUser, setLocalUser, seedDemoData } from "@/lib/local-storage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const user = getLocalUser();
    if (user) {
      router.push("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simple validation
    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }

    // For demo purposes, any valid email/password works
    // In production, this would validate against Google Sheets user data
    const user = {
      id: `user_${Date.now()}`,
      name: email.split("@")[0],
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    setLocalUser(user);
    seedDemoData(); // Load demo inventory if empty

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-amber-600/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900">Eravauly</h1>
          <p className="text-amber-600 font-medium">Vintage</p>
          <p className="text-stone-500 mt-2">Inventory Management for Fleek Sellers</p>
        </div>

        <Card className="shadow-xl border-stone-200/50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to manage your vintage inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-stone-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Sign up free
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-stone-400 mt-6">
          📱 Install as app for the best experience on mobile
        </p>
      </div>
    </div>
  );
}
