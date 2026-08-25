import { useState, useEffect } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useResponsive } from "@/hooks/use-responsive";
import { getCMSData, PageContent } from "@/lib/cms-store";
import { RotateCcw, ShieldCheck, DollarSign, PhoneCall, FileText, ChevronRight } from "lucide-react";

const P = "#2D5A27";

export default function ReturnsRefundPage() {
  const { lang, t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const [data, setData] = useState<PageContent>(() => getCMSData().returns_refund);

  useEffect(() => {
    setData(getCMSData().returns_refund);
  }, []);

  const px = isMobile ? "16px" : isTablet ? "24px" : "48px";
  const title = lang === "en" ? data.titleEn : data.titleBn;
  const subtitle = lang === "en" ? data.subtitleEn : data.subtitleBn;
  const content = lang === "en" ? data.contentEn : data.contentBn;

  return (
    <div style={{ backgroundColor: "#F9FAF8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      {/* Breadcrumbs Banner */}
      <div style={{ backgroundColor: "#0D1F0B", color: "#fff", padding: isMobile ? "24px 0" : "36px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: `0 ${px}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>
            <Link href="/" style={{ color: "#9ACA94", textDecoration: "none" }}>{t("হোম", "Home")}</Link>
            <ChevronRight size={14} />
            <span style={{ color: "#fff" }}>{title}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(45,90,39,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <RotateCcw size={24} className="text-[#9ACA94]" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: isMobile ? 24 : 34, margin: 0, fontWeight: 400, color: "#fff" }}>
                {title}
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontFamily: "'Inter', sans-serif" }}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: `${isMobile ? 28 : 48}px ${px}` }}>
        {/* Quick Guarantee Badges */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, marginBottom: 36 }}>
          {[
            { icon: ShieldCheck, titleBn: "৭ দিনের রিটার্ন সুবিধা", titleEn: "7-Day Easy Returns", subBn: "ক্ষতিগ্রস্ত বা ত্রুটিযুক্ত পণ্যে", subEn: "On damaged or wrong items" },
            { icon: DollarSign, titleBn: "২৪-৪৮ ঘণ্টায় রিফান্ড", titleEn: "24-48 Hour Refund", subBn: "বিকাশ, নগদ বা সরাসরি ব্যাংকে", subEn: "To bKash, Nagad or Bank" },
            { icon: PhoneCall, titleBn: "হটলাইন সহায়তা", titleEn: "Instant Helpline", subBn: "+880 1700-000000 (সকাল ৯টা-রাত ১০টা)", subEn: "+880 1700-000000 (9 AM - 10 PM)" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: 20, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: "#EAF4E8", color: P, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1F2937", fontFamily: "'Inter', sans-serif" }}>
                    {lang === "en" ? item.titleEn : item.titleBn}
                  </h4>
                  <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "'Inter', sans-serif", marginTop: 2, display: "block" }}>
                    {lang === "en" ? item.subEn : item.subBn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Card */}
        <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: isMobile ? 20 : 40, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, marginBottom: 24, borderBottom: "1px solid #F3F4F6", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6B7280", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
              <FileText size={16} />
              <span>{t("সর্বশেষ আপডেট:", "Last updated:")} {data.lastUpdated || "2026-08-01"}</span>
            </div>
            <span style={{ backgroundColor: "#EAF4E8", color: P, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, fontFamily: "'Inter', sans-serif" }}>
              {t("১০০% মানি-ব্যাক গ্যারান্টি", "100% Money Back Guarantee")}
            </span>
          </div>

          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-line" }}>
            {content}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
