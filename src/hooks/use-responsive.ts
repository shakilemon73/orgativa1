import { useState, useEffect } from "react";

const getWidth = () => (typeof window !== "undefined" ? window.innerWidth : 1280);

export function useResponsive() {
  const [width, setWidth] = useState(getWidth);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
}
