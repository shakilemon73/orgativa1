import React from "react";

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function WorldClassCategoryMenuIcon({ size = 20, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <rect x="3" y="3.5" width="7" height="7" rx="2.5" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2" />
      <rect x="14" y="3.5" width="7" height="7" rx="2.5" stroke={color} strokeWidth="2" />
      <rect x="3" y="13.5" width="7" height="7" rx="2.5" stroke={color} strokeWidth="2" />
      <path d="M14 15.5H21" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M14 19.5H19" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function GroceryCategoryIcon({ size = 18, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M4 10h16l-1.4 8.4A2 2 0 0 1 16.6 20H7.4a2 2 0 0 1-2-1.6L4 10z" fill={color} fillOpacity="0.1" />
      <path d="M8 10V6a4 4 0 0 1 8 0v4" />
      <path d="M9 14a3 3 0 0 0 6 0" />
    </svg>
  );
}

export function WellnessCategoryIcon({ size = 18, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={color} fillOpacity="0.1" />
      <path d="M12 8v7" />
      <path d="M12 11c-2-1.5-3.5-1-3.5 1 0 1.5 1.5 2 3.5 1" />
    </svg>
  );
}

export function DryFruitsCategoryIcon({ size = 18, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M12 2.5C7.5 2.5 4 6.8 4 11.5c0 4.2 3.2 8 7.5 9.5 1 .3 2.1.2 3-.3 4-2.5 5.8-7 4.8-11.8C18.2 5.8 15.5 2.5 12 2.5z" fill={color} fillOpacity="0.1" />
      <path d="M12 6.5c-2 2-3 4.5-3 7" />
      <path d="M12 10.5c2 1 3.5 2.8 4 4.5" />
    </svg>
  );
}

export function HoneyCategoryIcon({ size = 18, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M8 3h8v3H8z" />
      <path d="M6 6h12l1 5c.5 2.5-.5 5-2.5 6.5L15 20H9l-1.5-2.5C5.5 16 4.5 13.5 5 11L6 6z" fill={color} fillOpacity="0.1" />
      <path d="M12 10a2 2 0 0 1 2 2c0 1.8-2 3.8-2 3.8s-2-2-2-3.8a2 2 0 0 1 2-2z" fill={color} />
    </svg>
  );
}

export function SpicesCategoryIcon({ size = 18, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M4 11a8 8 0 0 0 16 0H4z" fill={color} fillOpacity="0.1" />
      <path d="M7 19h10" />
      <path d="M12 3v4" />
      <path d="M8 5l8 2" />
      <path d="M16 5l-8 2" />
    </svg>
  );
}

export function TeaCoffeeCategoryIcon({ size = 18, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M17 8h2a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-2" />
      <path d="M3 8h14v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" fill={color} fillOpacity="0.1" />
      <path d="M7 2c0 2 2 2 2 4" />
      <path d="M11 2c0 2 2 2 2 4" />
    </svg>
  );
}

export function GrainsCategoryIcon({ size = 18, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M12 22V3" />
      <path d="M12 3c2.5 0 4.5 1.5 4.5 3.5S14.5 10 12 10" fill={color} fillOpacity="0.1" />
      <path d="M12 3c-2.5 0-4.5 1.5-4.5 3.5S9.5 10 12 10" fill={color} fillOpacity="0.1" />
      <path d="M12 9.5c2.5 0 4.5 1.5 4.5 3.5S14.5 16.5 12 16.5" fill={color} fillOpacity="0.1" />
      <path d="M12 9.5c-2.5 0-4.5 1.5-4.5 3.5S9.5 16.5 12 16.5" fill={color} fillOpacity="0.1" />
    </svg>
  );
}

export function AllProductsCategoryIcon({ size = 18, color = "currentColor", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill={color} fillOpacity="0.1" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

export function CategoryIcon({ slug, size = 18, color = "currentColor", style }: { slug: string; size?: number; color?: string; style?: React.CSSProperties }) {
  switch (slug) {
    case "grocery":
      return <GroceryCategoryIcon size={size} color={color} style={style} />;
    case "wellness":
      return <WellnessCategoryIcon size={size} color={color} style={style} />;
    case "dry-fruits":
      return <DryFruitsCategoryIcon size={size} color={color} style={style} />;
    case "honey":
      return <HoneyCategoryIcon size={size} color={color} style={style} />;
    case "spices":
      return <SpicesCategoryIcon size={size} color={color} style={style} />;
    case "tea-coffee":
      return <TeaCoffeeCategoryIcon size={size} color={color} style={style} />;
    case "grains":
      return <GrainsCategoryIcon size={size} color={color} style={style} />;
    case "all":
      return <AllProductsCategoryIcon size={size} color={color} style={style} />;
    default:
      return <AllProductsCategoryIcon size={size} color={color} style={style} />;
  }
}
