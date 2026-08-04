import React from "react";
import { useResponsive } from "@/hooks/use-responsive";

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
  className?: string;
  variant?: "light" | "dark";
}

export default function Logo({
  size = 36,
  showText = true,
  textColor,
  subtextColor,
  variant = "light",
}: LogoProps) {
  const [imgError, setImgError] = React.useState(false);
  const { width } = useResponsive();

  const defaultTextColor = textColor || (variant === "dark" ? "#FFFFFF" : "#0D1F0B");
  const defaultSubtextColor = subtextColor || (variant === "dark" ? "rgba(255,255,255,0.6)" : "#8FA888");

  // Premium fluid typography and responsive sizing
  const shouldShowText = showText && width > 340;
  const shouldShowTagline = width > 385;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: Math.max(8, size * 0.22), userSelect: "none" }}>
      {!imgError ? (
        <img
          src="/assets/orgativa_logo.png"
          alt="Orgativa Logo"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          style={{
            height: size,
            width: size,
            objectFit: "cover",
            borderRadius: Math.round(size * 0.25),
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(45,90,39,0.12)",
          }}
        />
      ) : (
        /* Crisp inline SVG vector fallback */
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0 }}
        >
          <rect width="40" height="40" rx="10" fill="#2D5A27" />
          <path
            d="M20 7C20 7 29 12 29 22C29 27.5 24.5 32 19 32C13.5 32 10 27.5 10 21C10 13 16.5 8.5 20 7Z"
            fill="#6DAF67"
            opacity="0.9"
          />
          <path
            d="M20 7C20 7 14 13 14 20C14 25.5 17.5 29 21 29C25.5 29 27 24.5 27 20C27 13 22 8.5 20 7Z"
            fill="#E2B04A"
            opacity="0.85"
          />
          <path
            d="M20 12V28M20 19L24 16M20 23L16 20"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {shouldShowText && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "'Noto Serif', serif",
              fontSize: Math.max(14, Math.round(size * 0.5)),
              fontWeight: 700,
              color: defaultTextColor,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Orgativa
          </span>
          {shouldShowTagline && (
            <span
              style={{
                fontSize: Math.max(7, Math.round(size * 0.23)),
                color: defaultSubtextColor,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                marginTop: 2,
                lineHeight: 1,
                whiteSpace: "nowrap"
              }}
            >
              Pure Organic
            </span>
          )}
        </div>
      )}
    </div>
  );
}
