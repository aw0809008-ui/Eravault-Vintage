import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { PWARegister } from "@/components/pwa-register";

export const metadata: Metadata = { title: "Eravault Vintage", description: "Vintage clothing inventory for Fleek sellers", manifest: "/manifest.json", appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Eravault" } };
export const viewport: Viewport = { themeColor: "#0c0c0e", width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeProvider>{children}<PWARegister /></ThemeProvider>
      </body>
    </html>
  );
}
