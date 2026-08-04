import { useState } from "react";
import { useLocation } from "wouter";
import { useResponsive } from "@/hooks/use-responsive";
import { useLanguage } from "@/context/LanguageContext";
import Logo from "@/components/Logo";

const P = "#2D5A27";
const BG = "#0D1F0B";

const payments = [
  { name: "bKash", color: "#E2136E" },
  { name: "Nagad", color: "#F47920" },
  { name: "Rocket", color: "#8B1A8B" },
  { name: "COD", color: "#2D5A27" },
  { name: "Bank", color: "#1A56DB" },
];

export default function Footer() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const { lang, t } = useLanguage();
  const px = isMobile ? "16px" : isTablet ? "24px" : "48px";

  const shopLinks = [
    { labelBn: "মুদিখানা", labelEn: "Grocery", slug: "grocery" },
    { labelBn: "স্বাস্থ্য", labelEn: "Wellness", slug: "wellness" },
    { labelBn: "শুকনো ফল", labelEn: "Dry Fruits", slug: "dry-fruits" },
    { labelBn: "মধু", labelEn: "Honey", slug: "honey" },
    { labelBn: "মশলা", labelEn: "Spices", slug: "spices" },
    { labelBn: "চা ও কফি", labelEn: "Tea & Coffee", slug: "tea-coffee" },
    { labelBn: "শস্য", labelEn: "Grains", slug: "grains" },
  ];

  const companyLinks = [
    { labelBn: "আমাদের গল্প", labelEn: "Our Story" },
    { labelBn: "সোর্সিং প্রতিশ্রুতি", labelEn: "Sourcing Promise" },
    { labelBn: "টেকসই উন্নয়ন", labelEn: "Sustainability" },
    { labelBn: "কারিগর কৃষক", labelEn: "Artisanal Farmers" },
    { labelBn: "ব্লগ ও রেসিপি", labelEn: "Blog & Recipes" },
  ];

  const helpLinks = [
    { labelBn: "শিপিং নীতি", labelEn: "Shipping Policy" },
    { labelBn: "রিটার্ন ও রিফান্ড", labelEn: "Returns & Refund" },
    { labelBn: "অর্ডার ট্র্যাক করুন", labelEn: "Track Order" },
    { labelBn: "প্রশ্নোত্তর", labelEn: "FAQs" },
    { labelBn: "যোগাযোগ করুন", labelEn: "Contact Us" },
  ];

  const certBadges = [
    { labelBn: "অর্গানিক\nপ্রত্যয়িত", labelEn: "Certified\nOrganic", icon: "verified" },
    { labelBn: "কীটনাশক\nমুক্ত", labelEn: "Pesticide\nFree", icon: "eco" },
    { labelBn: "ল্যাব\nপরীক্ষিত", labelEn: "Lab\nTested", icon: "science" },
    { labelBn: "খামার\nথেকে সরাসরি", labelEn: "Direct From\nFarmers", icon: "agriculture" },
  ];

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  }

  return (
    <footer style={{ backgroundColor: BG, color: "#fff", position: "relative", overflow: "hidden" }}>
      <FooterBotanical />

      {/* Cert strip */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 2, overflowX: "auto" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: `0 ${px}`, display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 0 }}>
          {certBadges.map((b, i) => {
            const badgeLabel = lang === "en" ? b.labelEn : b.labelBn;
            return (
              <div key={b.labelEn} style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 14, paddingTop: isMobile ? 16 : 22, paddingBottom: isMobile ? 16 : 22, borderRight: (!isMobile && i < 3) ? "1px solid rgba(255,255,255,0.07)" : "none", borderBottom: (isMobile && i < 2) ? "1px solid rgba(255,255,255,0.07)" : "none", paddingLeft: (!isMobile && i > 0) ? 28 : 0, paddingRight: (!isMobile && i < 3) ? 28 : 0 }}>
                <div style={{ width: isMobile ? 36 : 42, height: isMobile ? 36 : 42, borderRadius: 12, backgroundColor: "rgba(45,90,39,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: isMobile ? 18 : 22, color: "#9ACA94" }}>{b.icon}</span>
                </div>
                <p style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: "#fff", fontFamily: "'Inter',sans-serif", margin: 0, lineHeight: 1.3 }}>
                  {badgeLabel.split("\n").map((line, j) => <span key={j}>{line}{j === 0 && <br />}</span>)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Newsletter */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: `${isMobile ? 28 : 44}px ${px}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <div style={{ maxWidth: isMobile ? "100%" : 420 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>🌿</span>
              <span style={{ fontSize: 11, color: "#6daf67", textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>
                {t("সুস্থ থাকুন", "STAY HEALTHY")}
              </span>
            </div>
            <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: isMobile ? 20 : 26, fontWeight: 400, color: "#fff", margin: "0 0 8px", lineHeight: 1.2 }}>
              {t("মৌসুমী পণ্য ও এক্সক্লুসিভ অফার পান", "Get Seasonal Harvest Updates & Exclusive Offers")}
            </h3>
            {!isMobile && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "'Inter',sans-serif", margin: 0, lineHeight: 1.6 }}>
              {t("২০,০০০+ সচেতন ক্রেতাদের সাথে যোগ দিন। কোনো স্প্যাম নেই।", "Join 20,000+ conscious organic shoppers in Bangladesh. Zero spam.")}
            </p>}
          </div>

          {subscribed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: "rgba(45,90,39,0.25)", border: "1px solid rgba(45,90,39,0.4)", borderRadius: 14, padding: "16px 24px" }}>
              <span className="material-symbols-outlined" style={{ color: "#9ACA94", fontSize: 24 }}>check_circle</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#9ACA94", fontFamily: "'Inter',sans-serif", margin: 0 }}>
                  {t("সাবস্ক্রাইব হয়েছে!", "Subscribed!")}
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter',sans-serif", margin: "2px 0 0" }}>
                  {t("Orgativa পরিবারে স্বাগতম 🌿", "Welcome to the Orgativa Family 🌿")}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 0, width: isMobile ? "100%" : "auto", flex: isMobile ? "none" : 1, maxWidth: 440 }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t("আপনার ইমেইল ঠিকানা লিখুন", "Enter your email address")} required
                style={{ flex: 1, padding: "13px 16px", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRight: "none", borderRadius: "10px 0 0 10px", color: "#fff", fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none", minWidth: 0 }} />
              <button type="submit"
                style={{ backgroundColor: P, color: "#fff", border: "none", borderRadius: "0 10px 10px 0", padding: "13px 18px", fontSize: 13, fontWeight: 700, fontFamily: "'Inter',sans-serif", cursor: "pointer", whiteSpace: "nowrap" }}>
                {t("সাবস্ক্রাইব", "Subscribe")}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main columns */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: `${isMobile ? 36 : 60}px ${px} ${isMobile ? 32 : 48}px`, display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "1.5fr 1fr 1fr" : "2.2fr 1fr 1fr 1.1fr", gap: isMobile ? 28 : 56 }}>

          {/* Brand col — spans full width on mobile */}
          <div style={{ gridColumn: isMobile ? "1 / -1" : "auto", display: "flex", flexDirection: "column", gap: 0 }}>
            <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}
              style={{ textDecoration: "none", marginBottom: 16, width: "fit-content" }}>
              <Logo size={40} variant="dark" />
            </a>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", fontFamily: "'Inter',sans-serif", lineHeight: 1.7, margin: "0 0 20px", maxWidth: isMobile ? "100%" : 280 }}>
              {t("বাংলাদেশের বিশ্বস্ত অর্গানিক মুদিখানা ও স্বাস্থ্য পণ্যের উৎস — খামার থেকে আপনার দোরগোড়ায়।", "Bangladesh's trusted source for organic groceries & wellness products — direct from farms to your doorstep.")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                { icon: "location_on", text: t("বাড়ি ১২, রোড ৫, বসুন্ধরা আ/এ, ঢাকা-১২২৯", "House 12, Road 5, Bashundhara R/A, Dhaka-1229") },
                { icon: "phone", text: "+880 1700-000000" },
                { icon: "mail", text: "hello@orgativa.com.bd" },
              ].map(({ icon, text }) => (
                <div key={icon} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#6daf67", marginTop: 1, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { icon: "language", label: t("ওয়েবসাইট", "Website") },
                { icon: "mail_outline", label: t("ইমেইল", "Email") },
                { icon: "phone_android", label: t("ফোন", "Phone") },
                { icon: "chat_bubble_outline", label: t("হোয়াটসঅ্যাপ", "WhatsApp") },
              ].map(({ icon, label }) => (
                <SocialBtn key={icon} icon={icon} label={label} />
              ))}
            </div>
          </div>

          {/* Shop col */}
          <FooterCol title={t("কেনাকাটা", "Shop")} links={shopLinks.map((s) => lang === "en" ? s.labelEn : s.labelBn)}
            onLink={(label) => { const item = shopLinks.find((s) => s.labelBn === label || s.labelEn === label); navigate(`/category/${item?.slug ?? "all"}`); }} />

          {/* Company col */}
          <FooterCol title={t("কোম্পানি", "Company")} links={companyLinks.map((c) => lang === "en" ? c.labelEn : c.labelBn)} />

          {/* Help col — hide on mobile (2-col grid doesn't have room) */}
          {!isMobile && (
            <div>
              <FooterColTitle>{t("সহায়তা", "Help & Support")}</FooterColTitle>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                {helpLinks.map((link) => (
                  <li key={link.labelEn}>
                    <FooterLink
                      label={lang === "en" ? link.labelEn : link.labelBn}
                      onClick={link.labelEn === "Track Order" ? () => navigate("/track") : undefined}
                    />
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, fontFamily: "'Inter',sans-serif", margin: "0 0 4px" }}>
                  {t("অ্যাপ ডাউনলোড", "DOWNLOAD APP")}
                </p>
                {[{ label: t("অ্যাপ স্টোর", "App Store"), icon: "phone_iphone" }, { label: t("গুগল প্লে", "Google Play"), icon: "android" }].map(({ label, icon }) => (
                  <button key={label} style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", width: "100%" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: "rgba(255,255,255,0.5)" }}>{icon}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: `18px ${px}`, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 14 : 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 20, flexWrap: "wrap" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: "'Inter',sans-serif", margin: 0 }}>
              {t("© ২০২৪ Orgativa। সর্বস্বত্ব সংরক্ষিত।", "© 2024 Orgativa. All rights reserved.")}
            </p>
            {[t("গোপনীয়তা নীতি", "Privacy Policy"), t("সেবার শর্তাবলী", "Terms of Service")].map((itemText) => (
              <a key={itemText} href="#" style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", fontFamily: "'Inter',sans-serif", textDecoration: "none" }}>{itemText}</a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'Inter',sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginRight: 2 }}>
              {t("আমরা গ্রহণ করি", "WE ACCEPT")}
            </span>
            {payments.map((p) => (
              <span key={p.name} style={{ fontSize: 10, fontWeight: 800, color: p.color, backgroundColor: "rgba(255,255,255,0.06)", border: `1px solid ${p.color}40`, borderRadius: 5, padding: "3px 8px", fontFamily: "'Inter',sans-serif" }}>{p.name}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialBtn({ icon, label }: { icon: string; label: string }) {
  return (
    <a href="#" aria-label={label}
      style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
      <span className="material-symbols-outlined" style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}>{icon}</span>
    </a>
  );
}

function FooterColTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <div style={{ width: 14, height: 2, backgroundColor: "#6daf67", borderRadius: 1 }} />
      <h5 style={{ fontSize: 10, color: "#9ACA94", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, fontFamily: "'Inter',sans-serif", margin: 0 }}>{children}</h5>
    </div>
  );
}

function FooterCol({ title, links, onLink }: { title: string; links: string[]; onLink?: (l: string) => void }) {
  return (
    <div>
      <FooterColTitle>{title}</FooterColTitle>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map((link) => <li key={link}><FooterLink label={link} onClick={onLink ? () => onLink(link) : undefined} /></li>)}
      </ul>
    </div>
  );
}

function FooterLink({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick?.(); }}
      style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.42)", fontFamily: "'Inter',sans-serif", textDecoration: "none" }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
      {label}
    </a>
  );
}

function FooterBotanical() {
  return (
    <svg viewBox="0 0 1280 600" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} aria-hidden="true">
      <path fill="none" stroke="#3a7033" strokeWidth="1" opacity="0.15" strokeLinecap="round" d="M -20 80 Q 80 60 160 120 Q 220 155 280 140" />
      <path fill="none" stroke="#3a7033" strokeWidth="1" opacity="0.12" strokeLinecap="round" d="M 1300 520 Q 1220 480 1185 430 Q 1158 390 1120 375" />
      {([[0.18, 125, 34, -35], [0.18, 185, 56, 18], [0.15, 60, 75, -65]] as [number, number, number, number][]).map(([op, x, y, r], i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${r}) scale(0.85)`}>
          <path fill="#3a7033" opacity={op} d="M 0 0 C -6 -18 -4 -32 0 -38 C 4 -32 6 -18 0 0 Z" />
        </g>
      ))}
    </svg>
  );
}
