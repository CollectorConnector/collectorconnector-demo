// app/layout.tsx
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Global theming only — no header, no metadata, no providers for now */}
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
