import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useResponsive } from "@/hooks/use-responsive";
import { getCMSData } from "@/lib/cms-store";
import { Phone, Mail, MapPin, MessageSquare, Clock, Send, CheckCircle2, ChevronRight, Globe, AlertCircle } from "lucide-react";

const P = "#2D5A27";

export default function ContactPage() {
  const { lang, t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const cms = getCMSData();
  const info = cms.contact_info;

  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "General Query", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const px = isMobile ? "16px" : isTablet ? "24px" : "48px";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      setErrorMsg(t("অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং বার্তা সঠিকভাবে পূরণ করুন।", "Please fill in your Name, Phone number, and Message."));
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setForm({ name: "", phone: "", email: "", subject: "General Query", message: "" });
    }, 800);
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
            <span style={{ color: "#fff" }}>{t("যোগাযোগ করুন", "Contact Us")}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(45,90,39,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Mail size={24} className="text-[#9ACA94]" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: isMobile ? 24 : 34, margin: 0, fontWeight: 400, color: "#fff" }}>
                {t("আমাদের সাথে যোগাযোগ করুন", "Contact Us & Support")}
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontFamily: "'Inter', sans-serif" }}>
                {t("আপনার যেকোনো প্রশ্ন, পরামর্শ বা পাইকারি অর্ডারের জন্য আমরা সবসময় পাশে আছি", "We are available 7 days a week for support, feedback & corporate inquiries")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: `${isMobile ? 28 : 48}px ${px}` }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.3fr", gap: 32 }}>

          {/* Left Column: Contact Details & Info Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <h3 style={{ margin: "0 0 16px", fontFamily: "'Noto Serif', serif", fontSize: 20, color: "#1F2937" }}>
                {t("অফিস ও কাস্টমার কেয়ার", "Office & Customer Support")}
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "#EAF4E8", color: P, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#9CA3AF", fontFamily: "'Inter', sans-serif" }}>
                      {t("হটলাইন ও ফোন", "HOTLINE & PHONE")}
                    </span>
                    <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, color: "#1F2937", fontFamily: "'Inter', sans-serif" }}>
                      {info.phone}
                    </p>
                    <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "'Inter', sans-serif", display: "block", marginTop: 2 }}>
                      <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
                      {info.hotlineHours}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "#EAF4E8", color: P, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#9CA3AF", fontFamily: "'Inter', sans-serif" }}>
                      {t("ইমেইল সাপোর্ট", "EMAIL SUPPORT")}
                    </span>
                    <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "#1F2937", fontFamily: "'Inter', sans-serif" }}>
                      {info.email}
                    </p>
                    <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "'Inter', sans-serif" }}>
                      {t("পাইকারি / করপোরেট:", "Corporate / Wholesale:")} {info.corpEmail}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "#EAF4E8", color: P, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#9CA3AF", fontFamily: "'Inter', sans-serif" }}>
                      {t("হেড অফিস ঠিকানা", "HEADQUARTERS ADDRESS")}
                    </span>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "#374151", lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
                      {info.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Box */}
            <div style={{ backgroundColor: "#25D366", color: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 4px 14px rgba(37,211,102,0.25)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>
                  {t("হোয়াটসঅ্যাপে দ্রুত সাপোর্ট", "Instant WhatsApp Chat")}
                </h4>
                <p style={{ margin: 0, fontSize: 12, opacity: 0.9, fontFamily: "'Inter', sans-serif" }}>
                  {t("সরাসরি মেসেজ দিন ও দ্রুত অর্ডারের আপডেট নিন", "Send a direct message for instant response & live order query")}
                </p>
              </div>
              <a
                href={info.whatsapp.startsWith("http") ? info.whatsapp : `https://wa.me/${info.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: "#fff",
                  color: "#128C7E",
                  textDecoration: "none",
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: "'Inter', sans-serif",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <MessageSquare size={16} />
                <span>{t("মেসেজ পাঠান", "Chat Now")}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: isMobile ? 20 : 32, boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
            <h3 style={{ margin: "0 0 6px", fontFamily: "'Noto Serif', serif", fontSize: 22, color: "#1F2937" }}>
              {t("সরাসরি বার্তা পাঠান", "Send Us a Message")}
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6B7280", fontFamily: "'Inter', sans-serif" }}>
              {t("নিচের ফর্মটি পূরণ করুন, আমাদের প্রতিনিধি খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন।", "Fill out the form below and our team will get back to you shortly.")}
            </p>

            {submitted ? (
              <div style={{ backgroundColor: "#EAF4E8", borderRadius: 14, border: "1px solid #C5E1C1", padding: 24, textAlign: "center" }}>
                <CheckCircle2 size={44} className="text-[#2D5A27]" style={{ margin: "0 auto 12px" }} />
                <h4 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: P, fontFamily: "'Inter', sans-serif" }}>
                  {t("আপনার বার্তা জমা নেওয়া হয়েছে!", "Thank You! Message Received.")}
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: "#374151", fontFamily: "'Inter', sans-serif" }}>
                  {t("ধন্যবাদ। আমাদের কাস্টমার সাপোর্ট টিম অতি দ্রুত আপনার সাথে যোগাযোগ করবে।", "We have received your message and will contact you via phone or email very soon.")}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{ marginTop: 16, backgroundColor: P, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
                >
                  {t("আরেকটি বার্তা পাঠান", "Send Another Message")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {errorMsg && (
                  <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", color: "#DC2626", fontSize: 13, display: "flex", alignItems: "center", gap: 8, fontFamily: "'Inter', sans-serif" }}>
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                    {t("আপনার নাম", "Your Full Name")} <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("যেমন: তামিম ইকবাল", "e.g. Tamim Iqbal")}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                      {t("মোবাইল নম্বর", "Mobile Phone")} <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="01700000000"
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                      {t("ইমেইল ঠিকানা (ঐচ্ছিক)", "Email Address (Optional)")}
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@example.com"
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                    {t("বিষয়", "Subject")}
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", backgroundColor: "#fff" }}
                  >
                    <option value="General Query">{t("সাধারণ প্রশ্ন", "General Query")}</option>
                    <option value="Order Status">{t("অর্ডার সংক্রান্ত তথ্য", "Order Status Inquiry")}</option>
                    <option value="Product Purity">{t("পণ্যের গুণগত মান", "Product Quality & Lab Test")}</option>
                    <option value="Wholesale">{t("পাইকারি / করপোরেট অর্ডার", "Wholesale & Corporate Order")}</option>
                    <option value="Feedback">{t("মতামত ও অভিযোগ", "Feedback & Complaints")}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                    {t("আপনার বার্তা", "Message / Query")} <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={t("আপনার প্রশ্ন বা বিস্তারিত মতামত লিখুন...", "Type your message or details here...")}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: P,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "14px 28px",
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 4px 14px rgba(45,90,39,0.25)"
                  }}
                >
                  <Send size={16} />
                  <span>{submitting ? t("পাঠানো হচ্ছে...", "Sending...") : t("বার্তা পাঠান", "Submit Message")}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
