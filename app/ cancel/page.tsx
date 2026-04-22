export default function CancelPage() {
  return (
    <div style={{ padding: "40px", color: "#fff" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "900", marginBottom: "10px" }}>
        Payment Cancelled
      </h1>

      <p style={{ fontSize: "18px", marginBottom: "20px" }}>
        Your payment was cancelled. You can try again anytime.
      </p>

      <a
        href="/"
        style={{
          background: "#ef4444",
          color: "#fff",
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

