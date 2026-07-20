import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { PWARegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "Eravault — Vintage Inventory",
  description: "Premium vintage clothing inventory management",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Eravault" },
  icons: { icon: "/favicon.png", apple: "/icons/icon-192x192.png" },
};
export const viewport: Viewport = { themeColor: "#9A6B2F", width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23b8894a'/><text y='.9em' font-size='80' x='50%' text-anchor='middle' fill='white' font-family='serif' font-weight='bold'>E</text></svg>" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-page text-on-surface">
        <ThemeProvider>{children}<PWARegister /></ThemeProvider>
      </body>
    </html>
  );
}
