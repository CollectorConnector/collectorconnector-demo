// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Collector Connector",
  description: "Where collectors meet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans bg-black text-white antialiased min-h-screen m-0 p-0`}
      >
        {/* Full-viewport wrapper to contain fixed header properly */}
        <div className="relative min-h-screen">
          {/* Fixed header can stay full-width, but content below is centred */}
          {children}
        </div>
      </body>
    </html>
  );
}
