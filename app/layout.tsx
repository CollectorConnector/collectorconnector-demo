import "./globals.css";
import Header from "@/components/Header";
import type { ReactNode } from "react";

export const metadata = {
  title: "CollectorConnector",
  description: "Where collectors meet",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">

        <Header />

        <main className="pt-14">
          {children}
        </main>

      </body>
    </html>
  );
}
