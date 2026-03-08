// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Nav from "../components/Nav";

export const metadata: Metadata = {
  title: "CollectorConnector",
  description: "Where collectors meet",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-black text-white antialiased">
        <div className="min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1">
            {/* Centered container applied once, so every page sits nicely */}
            <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
              {children}
            </div>
          </main>
          <footer className="border-t border-white/10">
            <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-zinc-400">
              © {new Date().getFullYear()} CollectorConnector. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
