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
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    localStorage.setItem("orgativa_lang", "en");
    document.documentElement.lang = "en";
  }, []);

  const setLang = (newLang: Language) => {
    setLangState("en");
  };

  const toggleLang = () => {
    setLangState("en");
  };

  const t = (bnText: string, enText: string): string => {
    return enText || bnText;
  };

  const formatNum = (num: number | string): string => {
    return String(num);
  };

  const formatPrice = (price: number): string => {
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
