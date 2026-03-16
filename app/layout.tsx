// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans bg-black text-white antialiased min-h-screen`}
      >
        {/* Centred container for all pages */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}
