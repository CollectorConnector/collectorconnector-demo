export default function AuthLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        position: "relative",
      }}
    >
      {/* Subtle white neon glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "420px",
          height: "420px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />

      {/* Actual page content */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 380 }}>
        {children}
      </div>
    </div>
  );
}
