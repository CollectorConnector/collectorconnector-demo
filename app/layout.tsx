import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "CollectorConnector",
  description: "Collect. Connect. Showcase.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}
