"use client";

import Image from "next/image";

export interface TierBadgeProps {
  tier: "FOUNDER" | "GOLD" | "SILVER" | "BRONZE" | "DIAMOND";
  size?: "sm" | "md" | "lg";
}

export default function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const sizes = {
    sm: 20,
    md: 28,
    lg: 36,
  };

  const icons: Record<string, string> = {
    FOUNDER: "/founder.png",
    GOLD: "/gold.png",
    SILVER: "/silver.png",
    BRONZE: "/bronze.png",
    DIAMOND: "/diamond.png",
  };

  const src = icons[tier] ?? icons["BRONZE"];

  return (
    <Image
      src={src}
      alt={`${tier} badge`}
      width={sizes[size]}
      height={sizes[size]}
      style={{ borderRadius: 8 }}
    />
  );
}
