import { useState, useEffect } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useResponsive } from "@/hooks/use-responsive";
import { getCMSData, FAQItem } from "@/lib/cms-store";
import { HelpCircle, Search, ChevronDown, ChevronRight, MessageSquare, ShieldCheck, Truck, CreditCard, Sparkles } from "lucide-react";

const P = "#2D5A27";

export default function FaqPage() {
  const { lang, t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const [faqs, setFaqs] = useState<FAQItem[]>(() => getCMSData().faqs);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ "faq-1": true });

  useEffect(() => {
    setFaqs(getCMSData().faqs);
  }, []);

  const px = isMobile ? "16px" : isTablet ? "24px" : "48px";

  const categories = [
    { id: "all", labelBn: "সব প্রশ্ন", labelEn: "All Questions", icon: HelpCircle },
    { id: "authenticity", labelBn: "বিশুদ্ধতা ও মান", labelEn: "Purity & Quality", icon: ShieldCheck },
    { id: "shipping", labelBn: "ডেলিভারি সংক্রান্ত", labelEn: "Shipping & Delivery", icon: Truck },
    { id: "payment", labelBn: "পেমেন্ট ও রিফান্ড", labelEn: "Payment & Refunds", icon: CreditCard },
  ];

  const filteredFaqs = faqs.filter(f => {
    const matchesCategory = activeCategory === "all" || f.category === activeCategory;
    const q = lang === "en" ? f.questionEn : f.questionBn;
    const a = lang === "en" ? f.answerEn : f.answerBn;
    const matchesSearch = !searchQuery.trim() || 
      q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function toggleFaq(id: string) {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div style={{ backgroundColor: "#F9FAF8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      {/* Header Banner */}
      <div style={{ backgroundColor: "#0D1F0B", color: "#fff", padding: isMobile ? "28px 0" : "44px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: `0 ${px}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14, fontFamily: "'Inter', sans-serif" }}>
            <Link href="/" style={{ color: "#9ACA94", textDecoration: "none" }}>{t("হোম", "Home")}</Link>
            <ChevronRight size={14} />
            <span style={{ color: "#fff" }}>{t("প্রশ্নোত্তর (FAQs)", "Frequently Asked Questions")}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(45,90,39,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <HelpCircle size={24} className="text-[#9ACA94]" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: isMobile ? 24 : 34, margin: 0, fontWeight: 400, color: "#fff" }}>
                {t("সাধারণ প্রশ্ন ও উত্তর (FAQs)", "Frequently Asked Questions")}
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontFamily: "'Inter', sans-serif" }}>
                {t("আমাদের অর্গানিক পণ্য, অর্ডার ও ডেলিভারি সংক্রান্ত প্রয়োজনীয় সকল তথ্যাবলী", "Everything you need to know about our organic purity, ordering & delivery")}
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", maxWidth: 600 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("আপনার কাঙ্ক্ষিত প্রশ্ন লিখে খুঁজুন (যেমন: মধু, ডেলিভারি)...", "Search questions (e.g. honey purity, delivery)...")}
              style={{
                width: "100%",
                padding: "14px 20px 14px 48px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
                outline: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            />
            <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)" }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: `${isMobile ? 28 : 48}px ${px}` }}>
        {/* Category Tabs */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
          {categories.map(cat => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  backgroundColor: active ? P : "#fff",
                  color: active ? "#fff" : "#374151",
                  border: `1px solid ${active ? P : "#E5E7EB"}`,
                  borderRadius: 999,
                  padding: "10px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: active ? "0 4px 12px rgba(45,90,39,0.2)" : "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.15s ease"
                }}
              >
                <Icon size={16} />
                <span>{lang === "en" ? cat.labelEn : cat.labelBn}</span>
              </button>
            );
          })}
        </div>

        {/* FAQs Accordion List */}
        {filteredFaqs.length === 0 ? (
          <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: 48, textAlign: "center" }}>
            <HelpCircle size={40} style={{ color: "#9CA3AF", margin: "0 auto 12px" }} />
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#1F2937", fontFamily: "'Inter', sans-serif" }}>
              {t("কোনো প্রশ্ন পাওয়া যায়নি", "No matching questions found")}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#6B7280", fontFamily: "'Inter', sans-serif" }}>
              {t("অন্য কোনো শব্দ দিয়ে আবার চেষ্টা করুন অথবা আমাদের কাস্টমার সাপোর্টে যোগাযোগ করুন।", "Try searching with a different keyword or contact our support team.")}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredFaqs.map((faq) => {
              const isOpen = !!openIds[faq.id];
              const question = lang === "en" ? faq.questionEn : faq.questionBn;
              const answer = lang === "en" ? faq.answerEn : faq.answerBn;

              return (
                <div
                  key={faq.id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 14,
                    border: `1px solid ${isOpen ? "#C5E1C1" : "#E5E7EB"}`,
                    overflow: "hidden",
                    boxShadow: isOpen ? "0 4px 14px rgba(45,90,39,0.06)" : "0 1px 3px rgba(0,0,0,0.02)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    style={{
                      width: "100%",
                      padding: "18px 20px",
                      backgroundColor: "transparent",
                      border: "none",
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      cursor: "pointer"
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: isOpen ? P : "#1F2937", fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>
                      {question}
                    </span>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: isOpen ? "#EAF4E8" : "#F3F4F6",
                        color: isOpen ? P : "#6B7280",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease"
                      }}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ padding: "0 20px 20px", borderTop: "1px solid #F3F4F6", paddingTop: 14 }}>
                      <p style={{ margin: 0, fontSize: 14, color: "#4B5563", lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
                        {answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Still Have Questions Banner */}
        <div style={{ marginTop: 40, backgroundColor: "#EAF4E8", borderRadius: 16, padding: isMobile ? 24 : 32, border: "1px solid #C5E1C1", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h3 style={{ margin: "0 0 6px", fontFamily: "'Noto Serif', serif", fontSize: 20, color: P }}>
              {t("আরও কোন প্রশ্ন আছে?", "Still have questions?")}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#374151", fontFamily: "'Inter', sans-serif" }}>
              {t("আমাদের কাস্টমার কেয়ার প্রতিনিধি আপনার সহায়তায় সার্বক্ষণিক প্রস্তুত।", "Our friendly support team is always ready to help you.")}
            </p>
          </div>
          <Link
            href="/contact"
            style={{
              backgroundColor: P,
              color: "#fff",
              textDecoration: "none",
              borderRadius: 10,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(45,90,39,0.2)"
            }}
          >
            <MessageSquare size={16} />
            <span>{t("যোগাযোগ করুন", "Contact Us")}</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
