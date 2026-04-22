export default function SuccessPage() {
  return (
    <div style={{ padding: "40px", color: "#fff" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "900", marginBottom: "10px" }}>
        Payment Successful 🎉
      </h1>

      <p style={{ fontSize: "18px", marginBottom: "20px" }}>
        Thank you for your purchase! The seller has been notified.
      </p>

      <a
        href="/"
        style={{
          background: "#22c55e",
          color: "#000",
          padding: "14px 22px",
          borderRadius: "12px",
          fontWeight: "900",
          fontSize: "16px",
          textDecoration: "none",
        }}
      >
        Return Home
      </a>
    </div>
  );
}

