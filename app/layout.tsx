import "./globals.css";

export const metadata = {
  title: "Collector Connector",
  description: "Where collectors meet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
