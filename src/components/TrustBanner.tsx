import { useResponsive } from "@/hooks/use-responsive";
import { useLanguage } from "@/context/LanguageContext";

export default function TrustBanner() {
  const { isMobile, isTablet, width } = useResponsive();
  const { t } = useLanguage();

  const items = [
    { icon: "local_shipping", title: t("বিনামূল্যে ডেলিভারি", "Free Shipping"), desc: t("৳১,০০০+ অর্ডারে বিনামূল্যে ডেলিভারি", "Free delivery on orders over ৳1,000"), color: "#2D5A27" },
    { icon: "verified_user", title: t("১০০% খাঁটি পণ্য", "100% Authentic"), desc: t("ল্যাব-পরীক্ষিত ও প্রত্যয়িত অর্গানিক", "Lab-tested, certified organic products"), color: "#7C3AED" },
    { icon: "replay", title: t("সহজ ৭ দিনের রিটার্ন", "7-Day Returns"), desc: t("ঝামেলামুক্ত রিটার্ন পলিসি", "Easy hassle-free returns"), color: "#0891B2" },
    { icon: "support_agent", title: t("২৪/৭ গ্রাহক সহায়তা", "24/7 Support"), desc: t("হোয়াটসঅ্যাপ ও ফোন সহায়তা সবসময়", "Always available via WhatsApp and call"), color: "#D64545" },
  ];

  const cols = width < 520 ? "1fr" : width < 1024 ? "1fr 1fr" : "repeat(4,1fr)";
  const px = isMobile ? "20px" : isTablet ? "32px" : "48px";

  return (
    <div style={{ backgroundColor: "#fff", borderTop: "1px solid #EEEEEE", borderBottom: "1px solid #EEEEEE", padding: `${isMobile ? 24 : 40}px ${px}` }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: cols, gap: isMobile ? 20 : 28 }}>
        {items.map((item) => (
          <TrustItem key={item.title} item={item} compact={isMobile} />
        ))}
      </div>
    </div>
  );
}

function TrustItem({ item, compact }: { item: { icon: string; title: string; desc: string; color: string }; compact?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: compact ? 12 : 16 }}>
      <div style={{ width: compact ? 40 : 48, height: compact ? 40 : 48, borderRadius: 12, backgroundColor: `${item.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: compact ? 20 : 24, color: item.color }}>{item.icon}</span>
      </div>
      <div>
        <p style={{ fontSize: compact ? 13 : 14, fontWeight: 700, color: "#1A1C1C", fontFamily: "'Inter',sans-serif", margin: "0 0 3px" }}>{item.title}</p>
        <p style={{ fontSize: compact ? 11 : 12, color: "#737973", fontFamily: "'Inter',sans-serif", lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
      </div>
    </div>
  );
}
