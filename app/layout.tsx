import "./globals.css";
import { Inter } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CollectorConnector",
  description: "Collect, connect, and showcase your items",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <Nav />

        <main className="pt-16">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
