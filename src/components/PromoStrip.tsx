import { useLocation } from "wouter";
import { useResponsive } from "@/hooks/use-responsive";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useProducts, useCategories } from "@/lib/supabase-hooks";

const P = "#2D5A27";

export default function PromoStrip() {
  const [, navigate] = useLocation();
  const { isMobile, isTablet } = useResponsive();
  const { lang } = useLanguage();
  const { getSetting } = useSiteSettings();
  const { data: allProducts } = useProducts();
  const { data: allCategories } = useCategories();

  // Dynamic promo configuration from Admin Settings with elegant fallbacks
  const promos = [
    {
      labelBn: getSetting("promo_card1_label_bn", "ফ্ল্যাশ ডিল"),
      labelEn: getSetting("promo_card1_label_en", "FLASH DEAL"),
      tagBn: getSetting("promo_card1_tag_bn", "৩০% ছাড়"),
      tagEn: getSetting("promo_card1_tag_en", "30% OFF"),
      tagColor: getSetting("promo_card1_color", "#D64545"),
      titleBn: getSetting("promo_card1_title_bn", "সুন্দরবনের মধু"),
      titleEn: getSetting("promo_card1_title_en", "Sundarbans Wild Honey"),
      subBn: getSetting("promo_card1_sub_bn", "সীমিত স্টক · আজ রাতেই শেষ"),
      subEn: getSetting("promo_card1_sub_en", "Limited stock · Ends tonight"),
      icon: getSetting("promo_card1_icon", "hive"),
      bg: "linear-gradient(135deg, #FFF7ED 0%, #FEE2A0 100%)",
      border: "#F59E0B30",
      slug: getSetting("promo_card1_slug", "honey"),
      targetType: getSetting("promo_card1_target_type", "auto"),
    },
    {
      labelBn: getSetting("promo_card2_label_bn", "নতুন পণ্য"),
      labelEn: getSetting("promo_card2_label_en", "NEW ARRIVAL"),
      tagBn: getSetting("promo_card2_tag_bn", "তাজা"),
      tagEn: getSetting("promo_card2_tag_en", "FRESH"),
      tagColor: getSetting("promo_card2_color", P),
      titleBn: getSetting("promo_card2_title_bn", "সিলেটের সবুজ চা"),
      titleEn: getSetting("promo_card2_title_en", "Sylhet Green Tea"),
      subBn: getSetting("promo_card2_sub_bn", "প্রথম বসন্তের ফসল"),
      subEn: getSetting("promo_card2_sub_en", "First flush spring harvest"),
      icon: getSetting("promo_card2_icon", "local_cafe"),
      bg: "linear-gradient(135deg, #F0FDF4 0%, #D1FAE5 100%)",
      border: "#2D5A2730",
      slug: getSetting("promo_card2_slug", "tea-coffee"),
      targetType: getSetting("promo_card2_target_type", "auto"),
    },
    {
      labelBn: getSetting("promo_card3_label_bn", "সেরা বিক্রয়"),
      labelEn: getSetting("promo_card3_label_en", "BEST SELLER"),
      tagBn: getSetting("promo_card3_tag_bn", "#১"),
      tagEn: getSetting("promo_card3_tag_en", "#1"),
      tagColor: getSetting("promo_card3_color", "#7C3AED"),
      titleBn: getSetting("promo_card3_title_bn", "রাজশাহীর সরিষার তেল"),
      titleEn: getSetting("promo_card3_title_en", "Rajshahi Mustard Oil"),
      subBn: getSetting("promo_card3_sub_bn", "ঠান্ডা চাপা, পাথর ভাঙা"),
      subEn: getSetting("promo_card3_sub_en", "Cold-pressed stone mill"),
      icon: getSetting("promo_card3_icon", "oil_barrel"),
      bg: "linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)",
      border: "#7C3AED30",
      slug: getSetting("promo_card3_slug", "grocery"),
      targetType: getSetting("promo_card3_target_type", "auto"),
    },
  ];

  function handlePromoClick(promo: typeof promos[0]) {
    const slug = promo.slug;
    if (promo.targetType === "product") {
      navigate(`/product/${slug}`);
      return;
    }
    if (promo.targetType === "category") {
      navigate(`/category/${slug}`);
      return;
    }
    // Auto-detect
    const isProduct = allProducts.some(p => p.slug === slug);
    if (isProduct) {
      navigate(`/product/${slug}`);
    } else {
      navigate(`/category/${slug}`);
    }
  }

  return (
    <section style={{ marginTop: isMobile ? 32 : 80 }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3,1fr)", gap: isMobile ? 10 : 20 }}>
        {promos.map((p, idx) => (
          <PromoCard key={idx} promo={p} onClick={() => handlePromoClick(p)} compact={isMobile} lang={lang} />
        ))}
      </div>
    </section>
  );
}

function PromoCard({ promo, onClick, compact, lang }: { promo: any; onClick: () => void; compact?: boolean; lang: "bn" | "en" }) {
  const label = lang === "en" ? promo.labelEn : promo.labelBn;
  const tag = lang === "en" ? promo.tagEn : promo.tagBn;
  const title = lang === "en" ? promo.titleEn : promo.titleBn;
  const sub = lang === "en" ? promo.subEn : promo.subBn;

  return (
    <div onClick={onClick}
      style={{ background: promo.bg, border: `1px solid ${promo.border}`, borderRadius: 16, padding: compact ? "16px" : "24px 28px", cursor: "pointer", display: "flex", alignItems: "center", gap: compact ? 14 : 20, transition: "transform 0.2s, box-shadow 0.2s" }}
      onTouchStart={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
      onTouchEnd={(e) => { setTimeout(() => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }, 200); }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
      <div style={{ width: compact ? 48 : 56, height: compact ? 48 : 56, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: compact ? 24 : 28, color: promo.tagColor }}>{promo.icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: promo.tagColor, fontFamily: "'Inter',sans-serif" }}>{label}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: promo.tagColor, backgroundColor: `${promo.tagColor}18`, borderRadius: 4, padding: "1px 6px", fontFamily: "'Inter',sans-serif" }}>{tag}</span>
        </div>
        <p style={{ fontSize: compact ? 15 : 16, fontFamily: "'Noto Serif',serif", fontWeight: 400, color: "#1A1C1C", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
        <p style={{ fontSize: 12, color: "#737973", fontFamily: "'Inter',sans-serif", margin: 0 }}>{sub}</p>
      </div>
      <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#C3C8C1", flexShrink: 0 }}>chevron_right</span>
    </div>
  );
}
