import "./globals.css";

export const metadata = {
  title: "Collector Connector",
  description: "Where collectors meet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Header stays full width */}
        <Header />

        {/* ⭐ Centered body wrapper ⭐ */}
        <div className="page-body">
          <main>{children}</main>
        </div>

        {/* Footer stays full width */}
        <Footer />
      </body>
    </html>
  );
}
