
// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "CollectorConnector",
  description: "Collectors unite.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "black", color: "#E5E7EB" }}>
        <Nav />
        <main style={{ minHeight: "calc(100vh - 64px - 68px)" }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
