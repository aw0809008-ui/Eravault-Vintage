"use client";
import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

export function PWARegister() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const h = (e: BeforeInstallPromptEvent) => { e.preventDefault(); setDeferredPrompt(e); setTimeout(() => setShow(true), 3000); };
    window.addEventListener("beforeinstallprompt", h as EventListener);
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !localStorage.getItem("eravault_ios_d")) { setIsIOS(true); setTimeout(() => setShow(true), 3000); }
    return () => window.removeEventListener("beforeinstallprompt", h as EventListener);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 z-50 animate-fade-in">
      <div className="rounded-xl p-4 bg-[--bg-el] border border-[--border] shadow-lg">
        <button onClick={() => { setShow(false); localStorage.setItem("eravault_ios_d","1"); }} className="absolute top-3 right-3 text-[--text-dim]"><X className="w-4 h-4" /></button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[--bg-accent] text-[--bg] flex items-center justify-center shrink-0"><Download className="w-5 h-5" /></div>
          <div><p className="text-sm font-medium text-[--text]">Install Eravault</p><p className="text-xs text-[--text-dim]">{isIOS ? "Add to Home Screen" : "Install app"}</p></div>
        </div>
        {isIOS ? (
          <div className="mt-3 p-2.5 rounded-lg bg-[--bg-hover] text-xs text-[--text-sub] space-y-1.5"><div className="flex items-center gap-2">1. Tap <Share className="w-3.5 h-3.5" /> Share</div><div>2. &quot;Add to Home Screen&quot;</div></div>
        ) : (
          <button onClick={async () => { if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; } setShow(false); }} className="mt-3 w-full py-2 rounded-lg bg-[--bg-accent] text-[--bg] text-sm font-medium">Install</button>
        )}
      </div>
    </div>
  );
}
interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }>; }
