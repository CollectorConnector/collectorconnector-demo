import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "CollectorConnector",
  description: "Where collectors meet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        
        {/* Global Navigation */}
        <Nav />

        {/* Page Content */}
        <main className="pt-16">
          {children}
        </main>

      </body>
    </html>
  );
}
