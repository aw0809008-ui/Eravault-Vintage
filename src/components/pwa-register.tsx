"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

export function PWARegister() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !window.matchMedia("(display-mode: standalone)").matches) {
      const dismissed = localStorage.getItem("eravault_ios_dismissed");
      if (!dismissed) setTimeout(() => setShowIOSPrompt(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const dismiss = () => {
    localStorage.setItem("eravault_ios_dismissed", "true");
    setShowIOSPrompt(false);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt && !showIOSPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-fade-in">
      <div 
        className="rounded-xl p-4 shadow-lg border theme-transition"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
      >
        <button onClick={dismiss} className="absolute top-3 right-3" style={{ color: 'var(--text-muted)' }}>
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Install App</h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {showIOSPrompt ? "Add to Home Screen" : "Install for quick access"}
            </p>
          </div>
        </div>

        {showIOSPrompt ? (
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>1. Tap</span>
              <Share className="w-4 h-4" />
              <span>Share</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              <span>2. Select &quot;Add to Home Screen&quot;</span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleInstall}
            className="mt-4 w-full py-2.5 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            Install
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
