// app/auth/layout.tsx

import "../globals.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout wraps all pages inside /auth (login, signup, callback)
  // It inherits the root layout's <html> and <body>, so fonts stay consistent.
  return (
    <>
      {children}
    </>
  );
}
