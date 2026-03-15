import "./globals.css";
import Nav from "@/components/Nav";
import type { ReactNode } from "react";

export const metadata = {
  title: "CollectorConnector",
  description: "Where collectors meet",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">

        <Nav />

        <main className="pt-16">
          {children}
        </main>

      </body>
    </html>
  );
}
