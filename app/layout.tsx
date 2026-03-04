import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "CollectorConnector",
  description: "Create your collector profile",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#000", color: "#fff" }}>
        {children}
      </body>
    </html>
  );
}
