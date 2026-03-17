import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Collector Connector",
  description: "Where collectors meet",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Header />

        {/* ⭐ Centered body wrapper ⭐ */}
        <div className="page-body">
          <main>{children}</main>
        </div>

        <Footer />
      </body>
    </html>
  );
}
