import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CollectorConnector",
  description: "Collect, connect, and showcase your items",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>

        {/* FIXED NAV BAR */}
        <nav className="fixed top-0 left-0 w-full h-14 bg-black/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 z-50">
          <Link href="/" className="text-lg font-semibold">
            CollectorConnector
          </Link>

          <div className="flex items-center gap-6 text-sm">
            <Link href="/">Home</Link>
            <Link href="/explore">Explore</Link>
            <Link href="/collections/create">Add Item</Link>
            <Link href="/profile/me">Profile</Link>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="pt-16">
          {children}
        </main>

      </body>
    </html>
  );
}
