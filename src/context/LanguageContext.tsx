import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "bn" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (bnText: string, enText: string) => string;
  formatPrice: (price: number) => string;
  formatNum: (num: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("orgativa_lang");
    return (saved === "en" || saved === "bn") ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("orgativa_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const toggleLang = () => {
    setLangState((prev) => (prev === "bn" ? "en" : "bn"));
  };

  const t = (bnText: string, enText: string): string => {
    if (lang === "bn") return bnText || enText;
    return enText || bnText;
  };

  const formatNum = (num: number | string): string => {
    const str = String(num);
    if (lang === "bn") {
      return str.replace(/\d/g, (digit) => banglaDigits[parseInt(digit, 10)]);
    }
    return str;
  };

  const formatPrice = (price: number): string => {
    if (lang === "bn") {
      const bnStr = price.toLocaleString("en-US").replace(/\d/g, (d) => banglaDigits[parseInt(d, 10)]);
      return `৳${bnStr}`;
    }
    return `৳${price.toLocaleString("en-US")}`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, formatPrice, formatNum }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
