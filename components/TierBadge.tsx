
// components/TierBadge.tsx

type TierName = "Emerald" | "Gold" | "Platinum";

const TIER_STYLES: Record<
  TierName,
  { bg: string; text: string; glow: string; dot: string }
> = {
  Emerald: { bg: "#0B2F24", text: "#4ADE80", glow: "0 0 20px #4ADE80AA", dot: "#34D399" },
  Gold: { bg: "#3A3009", text: "#FACC15", glow: "0 0 20px #FACC15AA", dot: "#F59E0B" },
  Platinum: { bg: "#21262C", text: "#93C5FD", glow: "0 0 20px #93C5FDAA", dot: "#60A5FA" },
};

type Props = {
  tier?: string | null;       // raw DB value; we'll normalize
  size?: "sm" | "md" | "lg";  // visual size
  showCount?: boolean;        // show trailing count text
  countText?: string;         // override count text
  titleOverride?: string;     // custom tooltip
};

export default function TierBadge({
  tier = "Emerald",
  size = "md",
  showCount = true,
  countText,
  titleOverride,
}: Props) {
  const name = normalizeTier(tier);
  const style = TIER_STYLES[name];

  const SIZES = {
    sm: { padV: 4, padH: 10, fs: 11, gap: 8, dot: 8, radius: 999 },
    md: { padV: 6, padH: 12, fs: 13, gap: 10, dot: 10, radius: 999 },
    lg: { padV: 8, padH: 14, fs: 14, gap: 12, dot: 12, radius: 999 },
  } as const;
  const s = SIZES[size];

  const effectiveCount = showCount
    ? countText ?? (name === "Gold" ? "1 of 1" : "Member")
    : "";

  return (
    <span
      role="img"
      aria-label={`${name} tier${effectiveCount ? ` – ${effectiveCount}` : ""}`}
      title={titleOverride ?? `${name} Tier`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: s.gap,
        padding: `${s.padV}px ${s.padH}px`,
        borderRadius: s.radius,
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.text}55`,
        boxShadow: style.glow,
        fontSize: s.fs,
        fontWeight: 700,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      {/* coin/dot */}
      <span
        aria-hidden="true"
        style={{
          width: s.dot,
          height: s.dot,
          borderRadius: "50%",
          background: style.dot,
          boxShadow: `0 0 10px ${style.text}`,
        }}
      />
      {/* label */}
      <span>{name}</span>

      {/* divider + count (optional) */}
      {effectiveCount && (
        <>
          <span
            aria-hidden="true"
            style={{ width: 1, height: s.dot + 6, background: `${style.text}33` }}
          />
          <span style={{ opacity: 0.9, fontWeight: 600, color: style.text }}>
            {effectiveCount}
          </span>
        </>
      )}
    </span>
  );
}

function normalizeTier(raw?: string | null): TierName {
  const v = String(raw ?? "").toLowerCase();
  if (v.startsWith("gold")) return "Gold";
  if (v.startsWith("plat")) return "Platinum";
  if (v.startsWith("emer")) return "Emerald";
  return "Emerald";
}
