import { useLocation } from "wouter";
import { useResponsive } from "@/hooks/use-responsive";
import { useLanguage } from "@/context/LanguageContext";

const P = "#2D5A27";

export default function PromoStrip() {
  const [, navigate] = useLocation();
  const { isMobile, isTablet } = useResponsive();
  const { t, lang } = useLanguage();

  const promos = [
    { labelBn: "ফ্ল্যাশ ডিল", labelEn: "FLASH DEAL", tagBn: "৩০% ছাড়", tagEn: "30% OFF", tagColor: "#D64545", titleBn: "সুন্দরবনের মধু", titleEn: "Sundarbans Wild Honey", subBn: "সীমিত স্টক · আজ রাতেই শেষ", subEn: "Limited stock · Ends tonight", icon: "hive", bg: "linear-gradient(135deg, #FFF7ED 0%, #FEE2A0 100%)", border: "#F59E0B30", slug: "honey" },
    { labelBn: "নতুন পণ্য", labelEn: "NEW ARRIVAL", tagBn: "তাজা", tagEn: "FRESH", tagColor: P, titleBn: "সিলেটের সবুজ চা", titleEn: "Sylhet Green Tea", subBn: "প্রথম বসন্তের ফসল", subEn: "First flush spring harvest", icon: "local_cafe", bg: "linear-gradient(135deg, #F0FDF4 0%, #D1FAE5 100%)", border: "#2D5A2730", slug: "tea-coffee" },
    { labelBn: "সেরা বিক্রয়", labelEn: "BEST SELLER", tagBn: "#১", tagEn: "#1", tagColor: "#7C3AED", titleBn: "রাজশাহীর সরিষার তেল", titleEn: "Rajshahi Mustard Oil", subBn: "ঠান্ডা চাপা, পাথর ভাঙা", subEn: "Cold-pressed stone mill", icon: "oil_barrel", bg: "linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)", border: "#7C3AED30", slug: "grocery" },
  ];

  return (
    <section style={{ marginTop: isMobile ? 32 : 80 }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3,1fr)", gap: isMobile ? 10 : 20 }}>
        {promos.map((p) => (
          <PromoCard key={p.slug} promo={p} onClick={() => navigate(`/category/${p.slug}`)} compact={isMobile} lang={lang} />
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
