import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Collector Connector",
  description: "Where collectors meet",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <main className="app-main">
          {children}
        </main>
      </body>
    </html>
  );
}
