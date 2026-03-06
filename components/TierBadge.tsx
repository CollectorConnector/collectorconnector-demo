"use client";

export interface TierBadgeProps {
  tier: "FOUNDER" | "GOLD" | "SILVER" | "BRONZE" | "EMERALD";
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
}

export default function TierBadge({
  tier,
  size = "md",
  showCount = false,
  count,
}: TierBadgeProps) {
  const sizes = {
    sm: { font: 10, pad: "2px 6px", radius: 6 },
    md: { font: 12, pad: "4px 10px", radius: 8 },
    lg: { font: 14, pad: "6px 14px", radius: 10 },
  };

  const style = sizes[size];

  const tierStyles: Record<string, { label: string; color: string; glow: string }> = {
    FOUNDER: {
      label: "Founder",
      color: "#4ADE80",
      glow: "0 0 10px rgba(74,222,128,0.6)",
    },
    GOLD: {
      label: "Gold",
      color: "#facc15",
      glow: "0 0 10px rgba(250,204,21,0.5)",
    },
    SILVER: {
      label: "Silver",
      color: "#e5e7eb",
      glow: "0 0 10px rgba(229,231,235,0.4)",
    },
    BRONZE: {
      label: "Bronze",
      color: "#cd7f32",
      glow: "0 0 10px rgba(205,127,50,0.4)",
    },
    EMERALD: {
      label: "Emerald Member",
      color: "#34d399",
      glow: "0 0 10px rgba(52,211,153,0.5)",
    },
  };

  const t = tierStyles[tier] ?? tierStyles["EMERALD"];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: style.pad,
        fontSize: style.font,
        fontWeight: 700,
        borderRadius: style.radius,
        color: t.color,
        border: `1px solid ${t.color}`,
        boxShadow: t.glow,
        whiteSpace: "nowrap",
      }}
    >
      {t.label}
      {showCount && count !== undefined && (
        <span style={{ opacity: 0.8 }}>· {count}</span>
      )}
    </span>
  );
}
