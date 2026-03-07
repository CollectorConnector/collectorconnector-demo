"use client";

interface TierBadgeProps {
  tier: "FOUNDER" | "GOLD" | "SILVER" | "BRONZE" | "EMERALD";
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
}

export default function TierBadge(props: TierBadgeProps) {
  const { tier, size = "md", showCount = false, count } = props;

  const sizes = {
    sm: { font: 10, pad: "2px 6px", radius: 6 },
    md: { font: 12, pad: "4px 10px", radius: 8 },
    lg: { font: 14, pad: "6px 14px", radius: 10 },
  };

  const style = sizes[size];

  const tierStyles: Record<string, { label: string; color: string; glow: string }> = {
  DIAMOND: {
    label: "Diamond",
    color: "#4FC3F7",
    glow: "0 0 100px rgba(79,195,247,0.6)",
  },
  FOUNDER: {
    label: "Founder",
    color: "#4D0888",
    glow: "0 0 100px rgba(74,222,128,0.6)",
  },
  GOLD: {
    label: "Gold",
    color: "#FACC15",
    glow: "0 0 100px rgba(250,204,21,0.6)",
  },
  SILVER: {
    label: "Silver",
    color: "#9CA3AF",
    glow: "0 0 100px rgba(156,163,175,0.6)",
  },
  BRONZE: {
    label: "Bronze",
    color: "#CD7F32",
    glow: "0 0 100px rgba(205,127,50,0.6)",
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
