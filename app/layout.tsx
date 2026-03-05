
// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "CollectorConnector",
  description: "Collectors unite.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "black", color: "white", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
