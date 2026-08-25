import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useResponsive } from "@/hooks/use-responsive";
import { useCategories } from "@/lib/supabase-hooks";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import {
  WorldClassCategoryMenuIcon,
  GroceryCategoryIcon,
  WellnessCategoryIcon,
  DryFruitsCategoryIcon,
  HoneyCategoryIcon,
  SpicesCategoryIcon,
  TeaCoffeeCategoryIcon,
  GrainsCategoryIcon,
  AllProductsCategoryIcon,
  CategoryIcon
} from "@/components/CategoryIcons";
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  X,
  Phone,
  Truck,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Globe,
  Plus
} from "lucide-react";

const P = "#2D5A27";
const P_DARK = "#1a4016";
const P_LIGHT = "#F4F7F3";
const ACCENT = "#6daf67";

const navLinks = [
  { icon: GroceryCategoryIcon, labelBn: "মুদিখানা", labelEn: "Grocery", slug: "grocery" },
  { icon: WellnessCategoryIcon, labelBn: "স্বাস্থ্য", labelEn: "Wellness", slug: "wellness" },
  { icon: DryFruitsCategoryIcon, labelBn: "শুকনো ফল", labelEn: "Dry Fruits", slug: "dry-fruits" },
  { icon: HoneyCategoryIcon, labelBn: "মধু", labelEn: "Honey", slug: "honey" },
  { icon: SpicesCategoryIcon, labelBn: "মশলা", labelEn: "Spices", slug: "spices" },
  { icon: TeaCoffeeCategoryIcon, labelBn: "চা ও কফি", labelEn: "Tea & Coffee", slug: "tea-coffee" },
  { icon: GrainsCategoryIcon, labelBn: "শস্য", labelEn: "Grains", slug: "grains" },
];

export default function Header() {
  const { totalItems } = useCart();
  const { lang, setLang, t, formatNum } = useLanguage();
  const { settings, getSetting } = useSiteSettings();
  const { data: dynamicCategories } = useCategories();
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile, isTablet, isDesktop, width } = useResponsive();
  const useCompactHeader = width < 1024;

  const activeCategories = dynamicCategories && dynamicCategories.length > 0
    ? dynamicCategories.map(c => ({
        slug: c.slug,
        labelBn: c.label,
        labelEn: c.labelEn || c.label,
        icon: c.icon || "FolderTree",
        image: c.image
      }))
    : navLinks;

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
      <div style={{ backgroundColor: "#FAFBF9", borderBottom: "1px solid #EAF0E9", fontSize: 11, color: "#4A5548", fontFamily: "'Inter', sans-serif", fontWeight: 500, overflow: "hidden" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: useCompactHeader ? "6px 12px" : `6px ${px}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {!useCompactHeader && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, display: "inline-flex" }}>🌿</span>
              <span style={{ color: "#2D5A27", fontWeight: 600 }}>
                {lang === "en" ? getSetting("promo_topbar_text_en", "100% Premium Organic & Lab-Tested Products in Bangladesh") : getSetting("promo_topbar_text_bn", "বাংলাদেশের ১০০% প্রিমিয়াম জৈব ও ল্যাব-পরীক্ষিত পণ্য")}
              </span>
            </div>
          )}
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: useCompactHeader ? "space-between" : "flex-end", 
            width: useCompactHeader ? "100%" : "auto", 
            gap: useCompactHeader ? 6 : 16,
            overflowX: "auto",
            whiteSpace: "nowrap"
          }} className="no-scrollbar">
            <a href={`tel:${getSetting("contact_phone", "+880 1700-000000").replace(/\s+/g, "")}`} style={{ color: "#4A5548", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s", flexShrink: 0 }}>
              <Phone size={12} style={{ color: P, flexShrink: 0 }} />
              <span style={{ whiteSpace: "nowrap", fontSize: 11 }}>{useCompactHeader ? t("কল করুন", "Call Us") : getSetting("contact_phone", "+880 1700-000000")}</span>
            </a>
            <div style={{ width: 1, height: 12, backgroundColor: "#D1E3CF", flexShrink: 0 }} />
            
            <a href="/track" onClick={(e) => { e.preventDefault(); navigate("/track"); }} style={{ color: "#4A5548", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "color 0.2s", flexShrink: 0 }}>
              <Truck size={12} style={{ color: P, flexShrink: 0 }} />
              <span style={{ whiteSpace: "nowrap", fontSize: 11 }}>{t("ট্র্যাক অর্ডার", "Track")}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER LAYER ── */}
      <div style={{ 
        maxWidth: 1280, 
        margin: "0 auto", 
        padding: useCompactHeader ? (width < 380 ? "10px 10px" : "10px 14px") : `12px ${px}`,
        overflow: "hidden"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          flexWrap: "nowrap", 
          gap: useCompactHeader ? (width < 360 ? 6 : 10) : 24,
          width: "100%"
        }}>
          
          {/* Left: Hamburger menu (Mobile/Tablet only) + Logo */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: useCompactHeader ? (width < 360 ? 6 : 8) : 12, 
            flexShrink: 0,
            minWidth: 0
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
                  borderRadius: 11,
                  border: "1.5px solid #E2EBE0",
                  backgroundColor: "#FAFBF9",
                  cursor: "pointer",
                  color: P,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = P_LIGHT;
                  e.currentTarget.style.borderColor = P;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FAFBF9";
                  e.currentTarget.style.borderColor = "#E2EBE0";
                }}
              >
                <WorldClassCategoryMenuIcon size={20} color={P} />
              </button>
            )}
            
            <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}
              style={{ textDecoration: "none", display: "flex", alignItems: "center", userSelect: "none", minWidth: 0, overflow: "hidden" }}>
              <Logo size={useCompactHeader ? (width < 360 ? 30 : 34) : 42} showText={!useCompactHeader || width >= 400} />
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
          padding: width < 400 ? "0 10px 10px 10px" : "0 16px 12px 16px", 
          position: "relative",
          width: "100%",
          boxSizing: "border-box" 
        }}>
          <form onSubmit={handleSearchSubmit} style={{ position: "relative", width: "100%", margin: 0 }}>
            <div style={{
              display: "flex", 
              alignItems: "center",
              backgroundColor: "#FAFBF9",
              border: searchFocused ? `2px solid ${P}` : "1.5px solid #E2EBE0",
              borderRadius: 14, 
              padding: "0 5px 0 12px",
              height: 44,
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: searchFocused ? "0 4px 14px rgba(45,90,39,0.12)" : "none",
              width: "100%",
              boxSizing: "border-box"
            }}>
              <Search size={17} style={{ color: searchFocused ? P : "#8BA088", marginRight: 8, flexShrink: 0 }} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("১০০% অর্গানিক পণ্য খুঁজুন...", "Search organic products...")}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                style={{ 
                  flex: "1 1 auto",
                  minWidth: 0,
                  width: "100%", 
                  background: "transparent", 
                  border: "none", 
                  fontSize: 13, 
                  fontFamily: "'Inter', sans-serif", 
                  color: "#1A1C1C", 
                  outline: "none",
                  fontWeight: 500,
                  padding: "0 4px"
                }} 
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search query"
                  style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, color: "#99a896", flexShrink: 0, marginRight: 2 }}
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="submit"
                aria-label="Search submit"
                style={{
                  border: "none",
                  backgroundColor: P,
                  color: "#fff",
                  borderRadius: 10,
                  height: 34,
                  padding: "0 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background-color 0.2s",
                  boxShadow: "0 2px 6px rgba(45,90,39,0.2)"
                }}
              >
                <span>{t("খুঁজুন", "Search")}</span>
              </button>
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
                      gap: 7, 
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
                    <AllProductsCategoryIcon size={18} color={location === "/category/all" ? P : "#7C9079"} />
                    <span>{t("সব পণ্য", "All Products")}</span>
                  </a>
                </li>

                {activeCategories.map((link) => {
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
                          gap: 7, 
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
                        <CategoryIcon slug={link.slug} size={18} color={active ? P : "#7C9079"} />
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
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
                  <button 
                    onClick={() => { navigate("/category/all"); setMobileMenuOpen(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "none",
                      backgroundColor: location === "/category/all" ? "#EBF4EA" : "#FAFBF9",
                      color: location === "/category/all" ? P : "#1A1C1C",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: location === "/category/all" ? P : "#EAF0E9",
                        color: location === "/category/all" ? "#fff" : P,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <AllProductsCategoryIcon size={16} color={location === "/category/all" ? "#fff" : P} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: location === "/category/all" ? 700 : 600, fontFamily: "'Inter', sans-serif" }}>{t("সব পণ্য", "All Products")}</span>
                    </div>
                    <ChevronRight size={15} style={{ opacity: 0.5, color: location === "/category/all" ? P : "#8BA088" }} />
                  </button>

                  {activeCategories.map((link) => {
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
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: "none",
                          backgroundColor: active ? "#EBF4EA" : "#FAFBF9",
                          color: active ? P : "#1A1C1C",
                          cursor: "pointer",
                          textAlign: "left",
                          width: "100%",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            backgroundColor: active ? P : "#EAF0E9",
                            color: active ? "#fff" : P,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <CategoryIcon slug={link.slug} size={16} color={active ? "#fff" : P} />
                          </div>
                          <span style={{ fontSize: 14, fontWeight: active ? 700 : 600, fontFamily: "'Inter', sans-serif" }}>{label}</span>
                        </div>
                        <ChevronRight size={15} style={{ opacity: 0.5, color: active ? P : "#8BA088" }} />
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
                  <a href={`tel:${getSetting("contact_phone", "+880 1700-000000").replace(/\s+/g, "")}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#4B5563", fontSize: 13, fontWeight: 500 }}>
                    <Phone size={14} style={{ color: P }} />
                    <span>{getSetting("contact_phone", "+880 1700-000000")}</span>
                  </a>
                  <a href="/track" onClick={(e) => { e.preventDefault(); navigate("/track"); }} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#4B5563", fontSize: 13, fontWeight: 500 }}>
                    <Truck size={14} style={{ color: P }} />
                    <span>{t("অর্ডার ট্র্যাক করুন", "Track Order")}</span>
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
