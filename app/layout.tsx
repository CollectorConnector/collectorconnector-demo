<header
  style={{
    width: "100%",
    padding: "14px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(10,10,10,0.92)",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 50,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  }}
>
  {/* LEFT SIDE — LOGO + NAV */}
  <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
    {/* MAIN LOGO */}
    <Link href="/" style={{ display: "flex", alignItems: "center" }}>
      <img
        src="/CC-MAIN-Logo.png"   // your main logo file
        alt="CollectorConnector"
        style={{ height: 32, objectFit: "contain" }}
      />
    </Link>

    {/* NAV LINKS */}
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

  {/* RIGHT SIDE — EXTERNAL LINKS */}
  <div
    style={{
      display: "flex",
      gap: 16,
      fontSize: 14,
      alignItems: "center",
      color: "#A1A1A1",
    }}
  >
    <a href="https://www.ebay.com" target="_blank" rel="noreferrer" style={{ color: "#A1A1A1" }}>
      eBay
    </a>
    <a href="https://www.whatnot.com" target="_blank" rel="noreferrer" className="hide-mobile" style={{ color: "#A1A1A1" }}>
      Whatnot
    </a>
    <a href="https://www.instagram.com" target="_blank" rel="noreferrer" style={{ color: "#A1A1A1" }}>
      Instagram
    </a>
    <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="hide-mobile" style={{ color: "#A1A1A1" }}>
      YouTube
    </a>
    <a href="https://discord.com" target="_blank" rel="noreferrer" className="hide-mobile" style={{ color: "#A1A1A1" }}>
      Discord
    </a>
  </div>
</header>
