import "./globals.css";
import Link from "next/link";
import React from "react";

export const metadata = {
 title: "CollectorConnector",
 description: "Where collectors meet",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
   <html lang="en">
     <head />
     <body
       style={{
         margin: 0,
         padding: 0,
         background: "#000",
         color: "#fff",
         fontFamily: "system-ui, sans-serif",
       }}
> 
       {/* NAVBAR */}
       <header
         style={{
           width: "100%",
           padding: "14px 24px",
           display: "flex",
           justifyContent: "space-between",
           alignItems: "center",
           background: "#000",
           borderBottom: "1px solid rgba(255,255,255,0.08)",
           position: "sticky",
           top: 0,
           zIndex: 50,
         }}
> 
         {/* LEFT SIDE */}
         <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
           <Link href="/" style={{ display: "flex", alignItems: "center" }}>
             <img
               src="/CC-MAIN-Logo.png"
               alt="CollectorConnector"
               style={{ height: 32, objectFit: "contain" }}
             />
           </Link>

           <nav
             style={{
               display: "flex",
               gap: 20,
               fontSize: 15,
               color: "#A1A1A1",
               fontWeight: 500,
             }}
> 
             <Link href="/" style={{ color: "#A1A1A1", textDecoration: "none" }}>
               Home
             </Link>
             <Link href="/explore" style={{ color: "#A1A1A1", textDecoration: "none" }}>
               Explore
             </Link>
             <Link href="/upload" style={{ color: "#A1A1A1", textDecoration: "none" }}>
               Upload
             </Link>
             <Link href="/profile/1" style={{ color: "#A1A1A1", textDecoration: "none" }}>
               Account
             </Link>
           </nav>
         </div>

         {/* RIGHT SIDE */}
         <div
           style={{
             display: "flex",
             gap: 16,
             fontSize: 14,
             alignItems: "center",
             color: "#A1A1A1",
           }}
> 
           <a href="https://urldefense.com/v3/__https://www.ebay.com__;!!PueBjVrnR72GDHWe!SZqQgWsS75Y9vEkAPZTO_fOKrJFGSSdOxXz5xdwO0lEKi51cP8zWIq4pAT0aam5X3-988I6Ohzecz0LkZpxae6-X-CrYLUu_Sqw$" target="_blank" rel="noreferrer" style={{ color: "#A1A1A1" }}>
             eBay
           </a>
           <a href="https://urldefense.com/v3/__https://www.whatnot.com__;!!PueBjVrnR72GDHWe!SZqQgWsS75Y9vEkAPZTO_fOKrJFGSSdOxXz5xdwO0lEKi51cP8zWIq4pAT0aam5X3-988I6Ohzecz0LkZpxae6-X-CrY_g33DF0$" target="_blank" rel="noreferrer" style={{ color: "#A1A1A1" }}>
             Whatnot
           </a>
           <a href="https://urldefense.com/v3/__https://www.instagram.com__;!!PueBjVrnR72GDHWe!SZqQgWsS75Y9vEkAPZTO_fOKrJFGSSdOxXz5xdwO0lEKi51cP8zWIq4pAT0aam5X3-988I6Ohzecz0LkZpxae6-X-CrYmgwOL24$" target="_blank" rel="noreferrer" style={{ color: "#A1A1A1" }}>
             Instagram
           </a>
           <a href="https://urldefense.com/v3/__https://www.youtube.com__;!!PueBjVrnR72GDHWe!SZqQgWsS75Y9vEkAPZTO_fOKrJFGSSdOxXz5xdwO0lEKi51cP8zWIq4pAT0aam5X3-988I6Ohzecz0LkZpxae6-X-CrY1GnL_o0$" target="_blank" rel="noreferrer" style={{ color: "#A1A1A1" }}>
             YouTube
           </a>
           <a href="https://urldefense.com/v3/__https://discord.com__;!!PueBjVrnR72GDHWe!SZqQgWsS75Y9vEkAPZTO_fOKrJFGSSdOxXz5xdwO0lEKi51cP8zWIq4pAT0aam5X3-988I6Ohzecz0LkZpxae6-X-CrY4Fj9_fY$" target="_blank" rel="noreferrer" style={{ color: "#A1A1A1" }}>
             Discord
           </a>
         </div>
       </header>

       {/* PAGE CONTENT */}
       <main style={{ minHeight: "100vh" }}>{children}</main>
     </body>
   </html>
 );
}
