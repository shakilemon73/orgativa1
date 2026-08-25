import { useState, useEffect } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useResponsive } from "@/hooks/use-responsive";
import { getCMSData, PageContent } from "@/lib/cms-store";
import { Heart, ShieldCheck, Award, Leaf, Users, FlaskConical, ChevronRight, CheckCircle2 } from "lucide-react";

const P = "#2D5A27";

export default function OurStoryPage() {
  const { lang, t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const [data, setData] = useState<PageContent>(() => getCMSData().our_story);

  useEffect(() => {
    setData(getCMSData().our_story);
  }, []);

  const px = isMobile ? "16px" : isTablet ? "24px" : "48px";
  const title = lang === "en" ? data.titleEn : data.titleBn;
  const subtitle = lang === "en" ? data.subtitleEn : data.subtitleBn;
  const content = lang === "en" ? data.contentEn : data.contentBn;

  return (
    <div style={{ backgroundColor: "#F9FAF8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      {/* Header Banner */}
      <div style={{ backgroundColor: "#0D1F0B", color: "#fff", padding: isMobile ? "32px 0" : "56px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: `0 ${px}`, position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14, fontFamily: "'Inter', sans-serif" }}>
            <Link href="/" style={{ color: "#9ACA94", textDecoration: "none" }}>{t("হোম", "Home")}</Link>
            <ChevronRight size={14} />
            <span style={{ color: "#fff" }}>{title}</span>
          </div>

          <div style={{ maxWidth: 720 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "rgba(154,202,148,0.15)", border: "1px solid rgba(154,202,148,0.3)", borderRadius: 999, padding: "4px 14px", marginBottom: 12 }}>
              <Leaf size={14} className="text-[#9ACA94]" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#9ACA94", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>
                {t("আমাদের পথচলা ও দর্শন", "OUR JOURNEY & VISION")}
              </span>
            </div>
            <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: isMobile ? 26 : 42, margin: "0 0 12px", fontWeight: 400, color: "#fff", lineHeight: 1.2 }}>
              {title}
            </h1>
            <p style={{ fontSize: isMobile ? 14 : 16, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: `${isMobile ? 28 : 48}px ${px}` }}>
        
        {/* Core Pillars Cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 16, marginBottom: 44 }}>
          {[
            { icon: ShieldCheck, titleBn: "১০০% খাঁটি ও আসল", titleEn: "100% Pure & Authentic", subBn: "ভেজাল ও প্রিজারভেটিভ মুক্ত", subEn: "Zero chemical preservatives" },
            { icon: Users, titleBn: "কৃষকদের পাশে", titleEn: "Empowering Farmers", subBn: "ন্যায্য মূল্য ও সামাজিক সম্মান", subEn: "Fair wages for eco-farmers" },
            { icon: FlaskConical, titleBn: "ল্যাব সার্টিফাইড", titleEn: "Lab Certified", subBn: "প্রতি ব্যাচ আধুনিক ল্যাবে টেস্টেড", subEn: "Advanced batch testing" },
            { icon: Award, titleBn: "প্রিমিয়াম কোয়ালিটি", titleEn: "Premium Quality", subBn: "হাতে বাছাইকৃত সেরা জৈব ফসল", subEn: "Handpicked harvest" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: 20, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#EAF4E8", color: P, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Icon size={22} />
                </div>
                <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#1F2937", fontFamily: "'Inter', sans-serif" }}>
                  {lang === "en" ? item.titleEn : item.titleBn}
                </h4>
                <p style={{ margin: 0, fontSize: 12, color: "#6B7280", fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>
                  {lang === "en" ? item.subEn : item.subBn}
                </p>
              </div>
            );
          })}
        </div>

        {/* Story Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr", gap: 32, alignItems: "start" }}>
          
          {/* Main Document Card */}
          <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: isMobile ? 20 : 36, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {content}
            </div>
          </div>

          {/* Side Visual Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ backgroundColor: "#0D1F0B", color: "#fff", borderRadius: 16, padding: 28, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "relative", zIndex: 2 }}>
                <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ACA94", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
                  {t("আমাদের প্রতিশ্রুতি", "OUR COMMITMENT")}
                </span>
                <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: 22, fontWeight: 400, margin: "8px 0 12px", color: "#fff" }}>
                  {t("বিশুদ্ধতাই আমাদের শক্তি", "Purity is Our Utmost Strength")}
                </h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: "0 0 20px", fontFamily: "'Inter', sans-serif" }}>
                  {t("আমরা বিশ্বাস করি সঠিক ও খাঁটি খাবারই একটি সুস্থ পরিবারের মূল ভিত্তি। তাই প্রতিটি অর্গ্যানিক পণ্যের মান ধরে রাখতে আমরা কোনো আপস করি না।", "We firmly believe authentic nutrition forms the cornerstone of a healthy family. We compromise on nothing.")}
                </p>
                
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    t("১০০% পাম অয়েল ও রাসায়নিক প্রিজারভেটিভ মুক্ত", "100% Free from Palm Oil & Additives"),
                    t("সরাসরি সুন্দরবনের অভিজ্ঞ মৌয়ালদের মাধ্যমে মধু সংগৃহীত", "Honey sourced directly by native Mouwals"),
                    t("ঐতিহ্যবাহী বিলোনা পদ্ধতিতে প্রস্তুত খাঁটি গাওয়া ঘি", "Pure Bilona ghee prepared from fresh butter"),
                  ].map((text, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <CheckCircle2 size={16} className="text-[#9ACA94]" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#fff", fontFamily: "'Inter', sans-serif" }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Farm Image Card */}
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #E5E7EB", backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                alt="Orgativa Organic Farming"
                style={{ width: "100%", height: 220, objectFit: "cover" }}
              />
              <div style={{ padding: 16, textAlign: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: P, fontFamily: "'Inter', sans-serif" }}>
                  🌿 {t("বাংলাদেশের প্রত্যন্ত প্রাকৃতিক খামারসমূহ", "Organic Eco-Farms Across Bangladesh")}
                </span>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
