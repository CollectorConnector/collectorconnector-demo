import "./globals.css";
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
        {/* ⭐ Centered body wrapper ⭐ */}
        <div className="page-body">
          <main>{children}</main>
        </div>

        {/* Footer stays global */}
        <Footer />
      </body>
    </html>
  );
}
