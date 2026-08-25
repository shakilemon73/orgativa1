import { useState } from "react";
import { useLocation } from "wouter";
import { getCategoryLabel, type Category } from "@/data/products";
import { useCategories } from "@/lib/supabase-hooks";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useResponsive } from "@/hooks/use-responsive";
import { CategoryIcon } from "@/components/CategoryIcons";

const P = "#2D5A27";

export default function Categories() {
  const [, navigate] = useLocation();
  const { isMobile, isTablet } = useResponsive();
  const { data: categories } = useCategories();
  const { lang, t, formatNum } = useLanguage();
  const { getSetting } = useSiteSettings();

  const sectionTag = lang === "en" 
    ? getSetting("category_section_tag_en", "NATURE'S BEST")
    : getSetting("category_section_tag_bn", "প্রকৃতির সেরা");

  const sectionTitle = lang === "en"
    ? getSetting("category_section_title_en", "Shop By Category")
    : getSetting("category_section_title_bn", "বিভাগ অনুযায়ী কেনাকাটা");

  return (
    <section style={{ marginTop: isMobile ? 48 : 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: isMobile ? 20 : 32 }}>
        <div>
          <p style={{ fontSize: 11, color: P, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.15em", fontFamily: "'Inter',sans-serif", margin: "0 0 6px" }}>
            {sectionTag}
          </p>
          <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: isMobile ? 24 : 32, color: "#1A1C1C", fontWeight: 400, margin: 0, lineHeight: 1.2 }}>
            {sectionTitle}
          </h2>
        </div>
        <a href="/category/all" onClick={(e) => { e.preventDefault(); navigate("/category/all"); }}
          style={{ fontSize: 13, color: P, fontFamily: "'Inter',sans-serif", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, borderBottom: "1px solid rgba(45,90,39,0.3)", paddingBottom: 2, whiteSpace: "nowrap" }}>
          {isMobile ? t("সব", "All") : t("সব বিভাগ", "All Categories")}
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
        </a>
      </div>

      {/* Category pill chips — scrollable on mobile */}
      {isMobile ? (
        <div className="scroll-x" style={{ display: "flex", gap: 10, paddingBottom: 4, marginBottom: 20 }}>
          {categories.map((cat) => (
            <MobileCategoryPill key={cat.slug} cat={cat} onClick={() => navigate(`/category/${cat.slug}`)} lang={lang} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${isTablet ? Math.min(categories.length, 4) : Math.min(categories.length, 7)}, 1fr)`, gap: 12, marginBottom: isTablet ? 16 : 0 }}>
          {categories.map((cat) => (
            <CategoryPill key={cat.slug} cat={cat} onClick={() => navigate(`/category/${cat.slug}`)} lang={lang} />
          ))}
        </div>
      )}

      {/* Feature cards */}
      {categories.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "repeat(2,1fr)" : `repeat(${Math.min(categories.length, 4)},1fr)`, gap: isMobile ? 12 : 20, marginTop: isMobile ? 0 : 20 }}>
          {categories.slice(0, 4).map((cat) => (
            <CategoryFeatureCard key={cat.slug} cat={cat} onClick={() => navigate(`/category/${cat.slug}`)} compact={isMobile} lang={lang} formatNum={formatNum} />
          ))}
        </div>
      )}
    </section>
  );
}

function MobileCategoryPill({ cat, onClick, lang }: { cat: Category; onClick: () => void; lang: "bn" | "en" }) {
  const label = getCategoryLabel(cat, lang);
  return (
    <button onClick={onClick}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 14, backgroundColor: "#fff", border: "1.5px solid #EAF0E9", cursor: "pointer", flexShrink: 0, minWidth: 78, transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
      onTouchStart={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#DFF2D8"; (e.currentTarget as HTMLElement).style.borderColor = P; }}
      onTouchEnd={(e) => { setTimeout(() => { (e.currentTarget as HTMLElement).style.backgroundColor = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#EAF0E9"; }, 200); }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: "#F2F7F1", display: "flex", alignItems: "center", justifyContent: "center", color: P, overflow: "hidden" }}>
        {cat.image ? (
          <img src={cat.image} alt={label} style={{ width: 26, height: 26, objectFit: "contain" }} />
        ) : (
          <CategoryIcon slug={cat.slug} size={20} color={P} />
        )}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#2B332A", fontFamily: "'Inter',sans-serif", textAlign: "center", lineHeight: 1.2, whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );
}

function CategoryPill({ cat, onClick, lang }: { cat: Category; onClick: () => void; lang: "bn" | "en" }) {
  const [hovered, setHovered] = useState(false);
  const label = getCategoryLabel(cat, lang);
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "16px 10px", borderRadius: 14, backgroundColor: hovered ? "#EBF4EA" : "#fff", border: hovered ? `1.5px solid ${P}` : "1.5px solid #EAF0E9", cursor: "pointer", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: hovered ? "0 6px 18px rgba(45,90,39,0.12)" : "0 2px 6px rgba(0,0,0,0.02)" }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: hovered ? P : "#F2F7F1", display: "flex", alignItems: "center", justifyContent: "center", color: hovered ? "#fff" : P, transition: "all 0.2s", overflow: "hidden" }}>
        {cat.image && !hovered ? (
          <img src={cat.image} alt={label} style={{ width: 28, height: 28, objectFit: "contain" }} />
        ) : (
          <CategoryIcon slug={cat.slug} size={22} color={hovered ? "#fff" : P} />
        )}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: hovered ? P : "#2B332A", fontFamily: "'Inter',sans-serif", textAlign: "center", lineHeight: 1.2 }}>{label}</span>
    </button>
  );
}

function CategoryFeatureCard({ cat, onClick, compact, lang, formatNum }: { cat: Category; onClick: () => void; compact?: boolean; lang: "bn" | "en"; formatNum: (num: number) => string }) {
  const [hovered, setHovered] = useState(false);
  const label = getCategoryLabel(cat, lang);
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer", borderRadius: compact ? 12 : 14, overflow: "hidden", backgroundColor: "#fff", border: "1px solid #E8E8E8", transition: "box-shadow 0.3s, transform 0.3s", boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.04)", transform: hovered ? "translateY(-4px)" : "translateY(0)" }}>
      <div style={{ aspectRatio: "4/3", backgroundColor: "#F3F3F4", overflow: "hidden", position: "relative" }}>
        {cat.image ? (
          <img src={cat.image} alt={label} style={{ width: "100%", height: "100%", objectFit: "contain", padding: compact ? "14px" : "20px", transform: hovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.6s ease" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F2F7F1" }}>
            <CategoryIcon slug={cat.slug} size={48} color={P} />
          </div>
        )}
        <div style={{ position: "absolute", top: 8, right: 8, backgroundColor: P, color: "#fff", borderRadius: 6, padding: "2px 7px", fontSize: 9, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>
          {formatNum(cat.count || 0)}+
        </div>
      </div>
      <div style={{ padding: compact ? "10px 12px" : "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Noto Serif',serif", fontSize: compact ? 15 : 18, color: hovered ? P : "#1A1C1C", fontWeight: 400, transition: "color 0.2s" }}>{label}</span>
        <div style={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: hovered ? P : "#F3F3F4", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: hovered ? "#fff" : "#737973" }}>arrow_forward</span>
        </div>
      </div>
    </div>
  );
}
