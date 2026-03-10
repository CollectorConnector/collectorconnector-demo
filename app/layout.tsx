import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Collector Connector",
  description: "Where collectors meet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">

        {/* NAVBAR */}
        <nav className="w-full border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          
          {/* MAIN LOGO ONLY */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo-main.png"
              alt="Collector Connector"
              className="h-8 w-auto opacity-90"
            />
          </Link>

          {/* NAV LINKS */}
          <div className="flex items-center gap-6 text-sm">
            <Link href="/">Home</Link>
            <Link href="/explore">Explore</Link>
            <Link href="/upload">Upload</Link>
            <Link href="/account">Account</Link>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="pt-6 pb-20 px-4">
          {children}
        </main>

      </body>
    </html>
  );
}
