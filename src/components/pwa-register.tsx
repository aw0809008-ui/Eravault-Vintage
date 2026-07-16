"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

export function PWARegister() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("SW registration failed:", err);
      });
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    // Android/Desktop install prompt
    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a delay
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);

    // iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
    
    if (isIOS && !isInStandaloneMode) {
      // Check if user has dismissed before
      const dismissed = localStorage.getItem("eravauly_ios_prompt_dismissed");
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
    localStorage.setItem("eravauly_ios_prompt_dismissed", "true");
    setShowIOSPrompt(false);
  };

  if (!showInstallPrompt && !showIOSPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-fade-in">
      <div className="bg-stone-900 text-white rounded-2xl shadow-2xl p-4 border border-stone-800">
        <button
          onClick={() => {
            setShowInstallPrompt(false);
            dismissIOSPrompt();
          }}
          className="absolute top-3 right-3 text-stone-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Install Eravauly</h3>
            <p className="text-stone-400 text-sm mt-1">
              {showIOSPrompt
                ? "Add to Home Screen for the best experience"
                : "Install the app for quick access"}
            </p>
          </div>
        </div>

        {showIOSPrompt ? (
          <div className="mt-4 bg-stone-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-stone-300">1. Tap</span>
              <Share className="w-4 h-4 text-blue-400" />
              <span className="text-stone-300">Share button</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-2">
              <span className="text-stone-300">2. Select</span>
              <span className="font-medium text-white">&quot;Add to Home Screen&quot;</span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleInstall}
            className="mt-4 w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
