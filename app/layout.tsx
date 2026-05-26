import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";

import "./globals.css";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "GriefPilot",
  description: "A calm place to organize after-loss tasks for families."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell min-h-screen">
          <header className="site-header border-b bg-background/90">
            <div className="site-header-inner mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/" className="brand-link flex items-center gap-2 font-semibold">
                <span className="brand-mark flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <ClipboardList className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>GriefPilot</span>
              </Link>
              <nav className="site-nav flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/onboarding">Start</Link>
                </Button>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
