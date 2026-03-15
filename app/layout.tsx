import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CollectorConnector",
  description: "Where collectors meet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Global theming only — no header here */}
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
