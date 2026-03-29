"use client";

import { usePathname } from "next/navigation";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const steps = ["/onboarding/step1", "/onboarding/step2", "/onboarding/step3", "/onboarding/finish"];
  const currentIndex = steps.indexOf(pathname);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      padding: "40px 20px",
      maxWidth: 480,
      margin: "0 auto",
      color: "#fff"
    }}>
      
      {/* Progress Bar */}
      <div style={{
        height: 6,
        background: "#333",
        borderRadius: 4,
        marginBottom: 32,
        overflow: "hidden"
      }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#4ade80",
            transition: "0.3s"
          }}
        />
      </div>

      {children}
    </div>
  );
}

