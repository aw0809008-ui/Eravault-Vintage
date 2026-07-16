"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

export function PWARegister() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("SW registration failed:", err);
      });
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
    
    if (isIOS && !isInStandaloneMode) {
      const dismissed = localStorage.getItem("eravault_ios_prompt_dismissed");
      if (!dismissed) {
        setTimeout(() => setShowIOSPrompt(true), 3000);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("Install outcome:", outcome);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const dismissIOSPrompt = () => {
    localStorage.setItem("eravault_ios_prompt_dismissed", "true");
    setShowIOSPrompt(false);
  };

  if (!showInstallPrompt && !showIOSPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl shadow-black/50 p-5">
        <button
          onClick={() => {
            setShowInstallPrompt(false);
            dismissIOSPrompt();
          }}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/20">
            <Download className="w-7 h-7 text-slate-900" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-100">Install Eravault</h3>
            <p className="text-slate-400 text-sm mt-1">
              {showIOSPrompt
                ? "Add to Home Screen for quick access"
                : "Install for the best experience"}
            </p>
          </div>
        </div>

        {showIOSPrompt ? (
          <div className="mt-5 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-400">1. Tap</span>
              <Share className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400">Share</span>
            </div>
            <div className="flex items-center gap-3 text-sm mt-3">
              <span className="text-slate-400">2. Select</span>
              <span className="font-medium text-slate-200">&quot;Add to Home Screen&quot;</span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleInstall}
            className="mt-5 w-full bg-gradient-to-r from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700 text-slate-900 font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-500/20"
          >
            Install Now
          </button>
        )}
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
