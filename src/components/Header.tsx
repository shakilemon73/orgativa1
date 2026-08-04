import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useResponsive } from "@/hooks/use-responsive";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Phone,
  Truck,
  ShieldCheck,
  ChevronRight,
  Sprout,
  Sparkles,
  Leaf,
  Coffee,
  Wheat,
  Flame,
  Globe,
  Plus
} from "lucide-react";

const P = "#2D5A27";
const P_DARK = "#1a4016";
const P_LIGHT = "#F4F7F3";
const ACCENT = "#6daf67";

const navLinks = [
  { icon: ShoppingBag, labelBn: "মুদিখানা", labelEn: "Grocery", slug: "grocery" },
  { icon: Sprout, labelBn: "স্বাস্থ্য", labelEn: "Wellness", slug: "wellness" },
  { icon: Leaf, labelBn: "শুকনো ফল", labelEn: "Dry Fruits", slug: "dry-fruits" },
  { icon: Sparkles, labelBn: "মধু", labelEn: "Honey", slug: "honey" },
  { icon: Flame, labelBn: "মশলা", labelEn: "Spices", slug: "spices" },
  { icon: Coffee, labelBn: "চা ও কফি", labelEn: "Tea & Coffee", slug: "tea-coffee" },
  { icon: Wheat, labelBn: "শস্য", labelEn: "Grains", slug: "grains" },
];

export default function Header() {
  const { totalItems } = useCart();
  const { lang, setLang, t, formatNum } = useLanguage();
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile, isTablet, isDesktop, width } = useResponsive();
  const useCompactHeader = width < 1024;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on path change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
    }
  };

  const handleSuggestionClick = (keyword: string) => {
    setSearchQuery(keyword);
    navigate(`/category/all?search=${encodeURIComponent(keyword)}`);
    setSearchFocused(false);
  };

  const px = isMobile ? "16px" : isTablet ? "24px" : "48px";

  // Mock trending terms
  const trendingSearches = [
    t("গাওয়া ঘি", "Cow Ghee"),
    t("মধু", "Honey"),
    t("কাঠবাদাম", "Almonds"),
    t("কালিজিরা", "Black Seed Oil"),
    t("চিয়া সিড", "Chia Seeds"),
  ];

  return (
    <header style={{
      backgroundColor: "#fff",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.06)" : "0 1px 0 #EEF2ED",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    }}>
      {/* Custom Global CSS styles in component */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .header-nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background-color: ${P};
          transition: all 0.25s ease;
          transform: translateX(-50%);
        }
        .header-nav-link:hover::after {
          width: 70%;
        }
        .nav-active::after {
          width: 70% !important;
        }
      `}</style>

      {/* ── TOP ANNOUNCEMENT BAR ── */}
      <div style={{ backgroundColor: "#FAFBF9", borderBottom: "1px solid #EAF0E9", fontSize: 11, color: "#4A5548", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: useCompactHeader ? "6px 16px" : `6px ${px}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {!useCompactHeader && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, display: "inline-flex" }}>🌿</span>
              <span style={{ color: "#2D5A27", fontWeight: 600 }}>
                {t("বাংলাদেশের ১০০% প্রিমিয়াম জৈব ও ল্যাব-পরীক্ষিত পণ্য", "100% Premium Organic & Lab-Tested Products in Bangladesh")}
              </span>
            </div>
          )}
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: useCompactHeader ? "space-between" : "flex-end", 
            width: useCompactHeader ? "100%" : "auto", 
            gap: useCompactHeader ? 8 : 16 
          }}>
            <a href="tel:+8801700000000" style={{ color: "#4A5548", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s" }} className="hover:text-primary">
              <Phone size={12} style={{ color: P }} />
              <span style={{ whiteSpace: "nowrap" }}>{useCompactHeader ? t("কল", "Call") : t("+৮৮০ ১৭০০-০০০০০০", "+880 1700-000000")}</span>
            </a>
            <div style={{ width: 1, height: 12, backgroundColor: "#D1E3CF" }} />
            
            <a href="/track" onClick={(e) => { e.preventDefault(); navigate("/track"); }} style={{ color: "#4A5548", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s" }}>
              <Truck size={12} style={{ color: P }} />
              <span style={{ whiteSpace: "nowrap" }}>{t("ট্র্যাক অর্ডার", "Track")}</span>
            </a>
            <div style={{ width: 1, height: 12, backgroundColor: "#D1E3CF" }} />
            
            <a href="/admin/login" onClick={(e) => { e.preventDefault(); navigate("/admin/login"); }} style={{ color: "#4A5548", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s" }}>
              <ShieldCheck size={12} style={{ color: P }} />
              <span style={{ whiteSpace: "nowrap" }}>{t("অ্যাডমিন", "Admin")}</span>
            </a>

            {!useCompactHeader && (
              <>
                <div style={{ width: 1, height: 12, backgroundColor: "#D1E3CF" }} />
                <LanguageSwitcher lang={lang} setLang={setLang} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER LAYER ── */}
      <div style={{ 
        maxWidth: 1280, 
        margin: "0 auto", 
        padding: useCompactHeader ? (width < 400 ? "10px 8px" : "10px 14px") : `12px ${px}` 
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          flexWrap: "nowrap", 
          gap: useCompactHeader ? (width < 360 ? 4 : 8) : 24 
        }}>
          
          {/* Left: Hamburger menu (Mobile/Tablet only) + Logo */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: useCompactHeader ? (width < 360 ? 4 : 8) : 12, 
            flexShrink: 0 
          }}>
            {useCompactHeader && (
              <button 
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: "1.5px solid #E5EFE2",
                  backgroundColor: "#FAFBF9",
                  cursor: "pointer",
                  color: P,
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = P_LIGHT;
                  e.currentTarget.style.borderColor = P;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFBF9";
                  e.currentTarget.style.borderColor = "#E5EFE2";
                }}
              >
                {/* Custom Ultra-Premium Designer Hamburger Menu Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transition: "all 0.2s" }}>
                  <path d="M4 6H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M4 12H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M4 18H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
            
            <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}
              style={{ textDecoration: "none", display: "flex", alignItems: "center", userSelect: "none" }}>
              <Logo size={useCompactHeader ? 34 : 42} showText={!useCompactHeader || width >= 430} />
            </a>
          </div>

          {/* Center: Search Bar (Desktop only) */}
          {!useCompactHeader && (
            <div style={{ flex: "1 1 auto", maxWidth: 540, position: "relative" }}>
              <form onSubmit={handleSearchSubmit}>
                <div style={{
                  display: "flex", 
                  alignItems: "center",
                  backgroundColor: searchFocused ? "#fff" : "#FAFBF9",
                  border: searchFocused ? `2px solid ${P}` : "2px solid #EAF0E9",
                  borderRadius: 14, 
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: searchFocused ? "0 8px 24px rgba(45,90,39,0.08), 0 0 0 4px rgba(45,90,39,0.04)" : "none",
                  padding: "0 14px",
                  height: 46,
                }}>
                  <Search size={18} style={{ color: searchFocused ? P : "#8BA088", transition: "color 0.2s", marginRight: 10, flexShrink: 0 }} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("১০০% প্রিমিয়াম ন্যাচারাল পণ্য খুঁজুন...", "Search 100% premium natural products...")}
                    onFocus={() => setSearchFocused(true)} 
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    style={{ 
                      width: "100%", 
                      background: "transparent", 
                      border: "none", 
                      fontSize: 14, 
                      fontFamily: "'Inter', sans-serif", 
                      color: "#1A1C1C", 
                      outline: "none",
                      fontWeight: 500
                    }} 
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={() => setSearchQuery("")}
                      style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, color: "#99a896" }}
                    >
                      <X size={14} />
                    </button>
                  )}
                  {!isTablet && !searchFocused && (
                    <span style={{ 
                      fontSize: 10, 
                      color: "#8BA088", 
                      fontFamily: "'Inter', sans-serif", 
                      backgroundColor: "#EBF1EA", 
                      padding: "3px 8px", 
                      borderRadius: 6, 
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      marginLeft: 8,
                      flexShrink: 0
                    }}>
                      SEARCH
                    </span>
                  )}
                </div>
              </form>

              {/* Advanced Interactive Suggestion Panel */}
              <AnimatePresence>
                {searchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      backgroundColor: "#fff",
                      borderRadius: 16,
                      boxShadow: "0 10px 35px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)",
                      border: "1px solid #EAF0E9",
                      padding: 16,
                      zIndex: 110,
                      textAlign: "left"
                    }}
                  >
                    <p style={{ margin: "0 0 10px 0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#8B9E88", letterSpacing: "0.08em" }}>
                      🔥 {t("জনপ্রিয় অনুসন্ধান", "TRENDING SEARCHES")}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                      {trendingSearches.map((term, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(term)}
                          style={{
                            padding: "6px 14px",
                            backgroundColor: "#F4F7F3",
                            border: "1.5px solid #E6EFE4",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#385234",
                            cursor: "pointer",
                            transition: "all 0.15s"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = P;
                            e.currentTarget.style.color = "#fff";
                            e.currentTarget.style.borderColor = P;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#F4F7F3";
                            e.currentTarget.style.color = "#385234";
                            e.currentTarget.style.borderColor = "#E6EFE4";
                          }}
                        >
                          {term}
                        </button>
                      ))}
                    </div>

                    <div style={{ height: 1, backgroundColor: "#EAF0E9", marginBottom: 12 }} />

                    <p style={{ margin: "0 0 8px 0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#8B9E88", letterSpacing: "0.08em" }}>
                      🌿 {t("দ্রুত ব্রাউজ করুন", "POPULAR CATEGORIES")}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {navLinks.slice(0, 4).map((cat, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSuggestionClick(lang === "en" ? cat.labelEn : cat.labelBn)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 12px",
                            borderRadius: 10,
                            cursor: "pointer",
                            transition: "background 0.2s",
                          }}
                          className="search-suggest-item"
                        >
                          <cat.icon size={15} style={{ color: P }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1C1C" }}>
                            {lang === "en" ? cat.labelEn : cat.labelBn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Right: Actions (Wishlist, Language switcher on mobile, Cart) */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: useCompactHeader ? (width < 360 ? 4 : 6) : 12, 
            flexShrink: 0 
          }}>
            
            {/* Language switch on mobile/tablet to save space */}
            {useCompactHeader && <LanguageSwitcher lang={lang} setLang={setLang} />}

            {/* Account Profile button on Desktop */}
            {!useCompactHeader && (
              <button 
                onClick={() => navigate("/admin/dashboard")}
                aria-label={t("অ্যাডমিন প্যানেল", "Admin Dashboard")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  border: "1.5px solid #FAFBF9",
                  backgroundColor: "#FAFBF9",
                  cursor: "pointer",
                  color: "#4A5548",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#C2D9BC";
                  e.currentTarget.style.backgroundColor = P_LIGHT;
                  e.currentTarget.style.color = P;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#FAFBF9";
                  e.currentTarget.style.backgroundColor = "#FAFBF9";
                  e.currentTarget.style.color = "#4A5548";
                }}
              >
                <User size={19} />
              </button>
            )}

            {/* Premium World-Class Cart Button */}
            <button 
              onClick={() => navigate("/cart")} 
              aria-label={t(`ঝুড়ি, ${totalItems}টি পণ্য`, `Cart, ${totalItems} items`)}
              style={{
                display: "flex", 
                alignItems: "center", 
                gap: useCompactHeader ? 0 : 10,
                backgroundColor: totalItems > 0 ? P : "#FAFBF9",
                border: totalItems > 0 ? "none" : "1.5px solid #E5EFE2",
                borderRadius: 14, 
                padding: useCompactHeader ? "0" : "0 16px 0 14px",
                height: useCompactHeader ? 38 : 44,
                width: useCompactHeader ? 38 : "auto",
                justifyContent: "center",
                cursor: "pointer", 
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: totalItems > 0 ? "0 4px 14px rgba(45,90,39,0.25)" : "none"
              }}
              onMouseEnter={(e) => { 
                if (totalItems > 0) {
                  e.currentTarget.style.backgroundColor = P_DARK;
                  e.currentTarget.style.transform = "translateY(-1px)";
                } else {
                  e.currentTarget.style.backgroundColor = P_LIGHT;
                  e.currentTarget.style.borderColor = "#C2D9BC";
                }
              }}
              onMouseLeave={(e) => { 
                if (totalItems > 0) {
                  e.currentTarget.style.backgroundColor = P;
                  e.currentTarget.style.transform = "none";
                } else {
                  e.currentTarget.style.backgroundColor = "#FAFBF9";
                  e.currentTarget.style.borderColor = "#E5EFE2";
                }
              }}
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <ShoppingBag size={useCompactHeader ? 18 : 19} style={{ color: totalItems > 0 ? "#fff" : "#2D5A27" }} />
                {totalItems > 0 && (
                  <span style={{ 
                    position: "absolute", 
                    top: -6, 
                    right: -7, 
                    backgroundColor: "#E63946", 
                    color: "#fff", 
                    fontSize: 8, 
                    fontWeight: 800, 
                    width: 15, 
                    height: 15, 
                    borderRadius: "50%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    fontFamily: "'Inter', sans-serif", 
                    border: "1.5px solid #fff" 
                  }}>
                    {totalItems > 9 ? (lang === "en" ? "9+" : "৯+") : formatNum(totalItems)}
                  </span>
                )}
              </div>
              {!useCompactHeader && (
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 9, color: totalItems > 0 ? "rgba(255,255,255,0.75)" : "#8FA888", fontFamily: "'Inter', sans-serif", margin: 0, fontWeight: 600, letterSpacing: "0.02em", lineHeight: 1.1 }}>
                    {t("আমার ঝুড়ি", "MY CART")}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: totalItems > 0 ? "#fff" : "#1A1C1C", fontFamily: "'Inter', sans-serif", margin: "2px 0 0", lineHeight: 1.1 }}>
                    {totalItems === 0 ? t("খালি", "Empty") : `${formatNum(totalItems)}${t("টি পণ্য", " Items")}`}
                  </p>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE/TABLET SEARCH LAYER ── */}
      {useCompactHeader && (
        <div style={{ 
          padding: width < 400 ? "0 8px 10px 8px" : "0 16px 12px 16px", 
          position: "relative" 
        }}>
          <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
            <div style={{
              display: "flex", 
              alignItems: "center",
              backgroundColor: "#FAFBF9",
              border: searchFocused ? `2px solid ${P}` : "1.5px solid #E5EFE2",
              borderRadius: 12, 
              padding: "0 12px",
              height: 42,
              transition: "all 0.2s",
              boxShadow: searchFocused ? "0 4px 12px rgba(45,90,39,0.08)" : "none"
            }}>
              <Search size={16} style={{ color: searchFocused ? P : "#8BA088", marginRight: 8, flexShrink: 0 }} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("পণ্য খুঁজুন...", "Search products...")}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                style={{ 
                  width: "100%", 
                  background: "transparent", 
                  border: "none", 
                  fontSize: 13, 
                  fontFamily: "'Inter', sans-serif", 
                  color: "#1A1C1C", 
                  outline: "none",
                  fontWeight: 500
                }} 
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery("")}
                  style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, color: "#99a896" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Suggestions dropdown on Mobile/Tablet */}
            <AnimatePresence>
              {searchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    right: 0,
                    backgroundColor: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                    border: "1px solid #EAF0E9",
                    padding: 14,
                    zIndex: 110,
                    textAlign: "left"
                  }}
                >
                  <p style={{ margin: "0 0 8px 0", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#8B9E88", letterSpacing: "0.08em" }}>
                    🔥 {t("জনপ্রিয় অনুসন্ধান", "TRENDING SEARCHES")}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {trendingSearches.map((term, index) => (
                      <button
                        key={index}
                        type="button"
                        onMouseDown={() => handleSuggestionClick(term)}
                        style={{
                          padding: "5px 11px",
                          backgroundColor: "#F4F7F3",
                          border: "1px solid #E6EFE4",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#385234",
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      )}

      {/* ── DESKTOP/TABLET CATEGORIES STRIP ── */}
      {!useCompactHeader && (
        <div style={{ backgroundColor: "#FAFBF9", borderTop: "1px solid #EEF2ED", borderBottom: "1px solid #EEF2ED" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: `0 ${px}`, display: "flex", alignItems: "center" }}>
            
            {/* Horizontal Categories Menu with Hidden Scrollbar & Mask */}
            <nav style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              <ul className="no-scrollbar" style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 4, 
                padding: 0, 
                margin: 0, 
                listStyle: "none",
                overflowX: "auto",
                whiteSpace: "nowrap"
              }}>
                {/* Clean, Integrated "All Products" Link */}
                <li style={{ flexShrink: 0 }}>
                  <a 
                    href="/category/all"
                    onClick={(e) => { e.preventDefault(); navigate("/category/all"); }}
                    className={`header-nav-link ${location === "/category/all" ? "nav-active" : ""}`}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 6, 
                      color: location === "/category/all" ? P : "#3E4A3B", 
                      fontSize: 13, 
                      fontWeight: location === "/category/all" ? 700 : 600, 
                      textDecoration: "none", 
                      padding: "13px 18px 13px 0", // slightly more padding on right, none on left for alignment
                      transition: "color 0.2s ease", 
                      whiteSpace: "nowrap", 
                      fontFamily: "'Inter', sans-serif",
                      position: "relative"
                    }}
                    onMouseEnter={(e) => { if (location !== "/category/all") e.currentTarget.style.color = P; }}
                    onMouseLeave={(e) => { if (location !== "/category/all") e.currentTarget.style.color = "#3E4A3B"; }}
                  >
                    <Sparkles size={14} style={{ opacity: 0.9, color: location === "/category/all" ? P : "#7C9079" }} />
                    <span>{t("সব পণ্য", "All Products")}</span>
                  </a>
                </li>

                {navLinks.map((link) => {
                  const active = location === `/category/${link.slug}`;
                  const label = lang === "en" ? link.labelEn : link.labelBn;
                  return (
                    <li key={link.slug} style={{ flexShrink: 0 }}>
                      <a 
                        href={`/category/${link.slug}`}
                        onClick={(e) => { e.preventDefault(); navigate(`/category/${link.slug}`); }}
                        className={`header-nav-link ${active ? "nav-active" : ""}`}
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 6, 
                          color: active ? P : "#3E4A3B", 
                          fontSize: 13, 
                          fontWeight: active ? 700 : 600, 
                          textDecoration: "none", 
                          padding: "13px 18px", 
                          transition: "color 0.2s ease", 
                          whiteSpace: "nowrap", 
                          fontFamily: "'Inter', sans-serif",
                          position: "relative"
                        }}
                        onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = P; }}
                        onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "#3E4A3B"; }}
                      >
                        <link.icon size={14} style={{ opacity: 0.9, color: active ? P : "#7C9079" }} />
                        <span>{label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Right side badge */}
            {!isTablet && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 16, flexShrink: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ACCENT, display: "block", flexShrink: 0, boxShadow: `0 0 0 2px rgba(109,175,103,0.3)` }} />
                <span style={{ fontSize: 11, color: "#687D65", fontFamily: "'Inter', sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {t("১০০% খাঁটি ও অর্গানিক", "100% Organic certified")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BREATHTAKING MOBILE SLIDE OUT NAVIGATION DRAWER ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "#000",
                zIndex: 200,
                backdropFilter: "blur(2px)"
              }}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: "80%",
                maxWidth: 320,
                backgroundColor: "#fff",
                boxShadow: "4px 0 40px rgba(0,0,0,0.15)",
                zIndex: 210,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              {/* Drawer Header */}
              <div style={{ 
                padding: "16px 20px", 
                borderBottom: "1px solid #F3F4F6", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                backgroundColor: "#FAFBF9"
              }}>
                <Logo size={32} />
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "#EAF0E9",
                    color: P,
                    cursor: "pointer"
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }} className="no-scrollbar">
                
                {/* Brand Tagline */}
                <div style={{ backgroundColor: "#F4F7F3", borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: P, display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={12} /> {t("অর্গানিকে ভরসা রাখুন", "TRUST IN ORGANIC")}
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#5F705B", lineHeight: 1.4 }}>
                    {t("১০০% খাঁটি, প্রাকৃতিক ও ল্যাব সার্টিফাইড পণ্য আপনার দুয়ারে।", "100% pure, chemical-free and lab-tested organic formulations.")}
                  </p>
                </div>

                {/* Categories Title */}
                <p style={{ margin: "0 0 10px 0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#8BA088", letterSpacing: "0.08em" }}>
                  📁 {t("পণ্য ক্যাটাগরি সমূহ", "PRODUCT CATEGORIES")}
                </p>

                {/* Categories Links List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 24 }}>
                  <button 
                    onClick={() => { navigate("/category/all"); setMobileMenuOpen(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "none",
                      backgroundColor: location === "/category/all" ? "#EBF4EA" : "transparent",
                      color: location === "/category/all" ? P : "#1A1C1C",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ display: "flex", width: 8, height: 8, borderRadius: "50%", backgroundColor: P }} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{t("সব পণ্য", "All Products")}</span>
                    </div>
                    <ChevronRight size={14} style={{ opacity: 0.6 }} />
                  </button>

                  {navLinks.map((link) => {
                    const active = location === `/category/${link.slug}`;
                    const label = lang === "en" ? link.labelEn : link.labelBn;
                    return (
                      <button
                        key={link.slug}
                        onClick={() => { navigate(`/category/${link.slug}`); setMobileMenuOpen(false); }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: "none",
                          backgroundColor: active ? "#EBF4EA" : "transparent",
                          color: active ? P : "#1A1C1C",
                          cursor: "pointer",
                          textAlign: "left",
                          width: "100%"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <link.icon size={16} style={{ color: active ? P : "#7C9079" }} />
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
                        </div>
                        <ChevronRight size={14} style={{ opacity: 0.6 }} />
                      </button>
                    );
                  })}
                </div>

                <div style={{ height: 1, backgroundColor: "#F3F4F6", marginBottom: 20 }} />

                {/* Customer Support & Quick links */}
                <p style={{ margin: "0 0 10px 0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#8BA088", letterSpacing: "0.08em" }}>
                  📞 {t("গ্রাহক সেবা ও যোগাযোগ", "CUSTOMER SERVICES")}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <a href="tel:+8801700000000" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#4B5563", fontSize: 13, fontWeight: 500 }}>
                    <Phone size={14} style={{ color: P }} />
                    <span>+৮৮০ ১৭০০-০০০০০০</span>
                  </a>
                  <a href="/track" onClick={(e) => { e.preventDefault(); navigate("/track"); }} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#4B5563", fontSize: 13, fontWeight: 500 }}>
                    <Truck size={14} style={{ color: P }} />
                    <span>{t("অর্ডার ট্র্যাক করুন", "Track Order")}</span>
                  </a>
                  <a href="/admin/login" onClick={(e) => { e.preventDefault(); navigate("/admin/login"); }} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#4B5563", fontSize: 13, fontWeight: 500 }}>
                    <ShieldCheck size={14} style={{ color: P }} />
                    <span>{t("অ্যাডমিন প্যানেল লগইন", "Admin Login")}</span>
                  </a>
                </div>
              </div>

              {/* Drawer Footer Banner */}
              <div style={{ 
                padding: "16px 20px", 
                backgroundColor: P, 
                color: "#fff",
                textAlign: "center"
              }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Orgativa Organic</p>
                <p style={{ margin: "2px 0 0 0", fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Made with ❤️ in Bangladesh</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function LanguageSwitcher({ lang, setLang }: { lang: "bn" | "en"; setLang: (l: "bn" | "en") => void }) {
  return (
    <div style={{ 
      display: "inline-flex", 
      alignItems: "center", 
      backgroundColor: "#EBF3EA", 
      padding: "2px", 
      borderRadius: 20, 
      border: "1px solid #D1E3CF" 
    }}>
      <button
        type="button"
        onClick={() => setLang("bn")}
        style={{
          padding: "3px 10px",
          borderRadius: 16,
          border: "none",
          backgroundColor: lang === "bn" ? P : "transparent",
          color: lang === "bn" ? "#fff" : "#2D5A27",
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          cursor: "pointer",
          transition: "all 0.2s",
        }}>
        BN
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        style={{
          padding: "3px 10px",
          borderRadius: 16,
          border: "none",
          backgroundColor: lang === "en" ? P : "transparent",
          color: lang === "en" ? "#fff" : "#2D5A27",
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          cursor: "pointer",
          transition: "all 0.2s",
        }}>
        EN
      </button>
    </div>
  );
}
