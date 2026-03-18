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
      <body className="bg-black text-white">
        <div className="page-body max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
