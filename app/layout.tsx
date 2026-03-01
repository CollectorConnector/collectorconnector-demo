
// app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'CollectorConnector',
  description: 'A home for collectors',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#0B0B0B', color: '#eaeaea', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
