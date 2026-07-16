"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLocalUser } from "@/lib/local-storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getLocalUser();
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
