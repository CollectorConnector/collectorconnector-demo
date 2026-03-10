import "./globals.css";

export const metadata = {
  title: "CollectorConnector",
  description: "Collect, connect, and showcase your items",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
