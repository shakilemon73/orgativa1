import { useState } from "react";
import { useLocation } from "wouter";
import { useResponsive } from "@/hooks/use-responsive";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import Logo from "@/components/Logo";
import { 
  ShieldCheck, 
  Leaf, 
  FlaskConical, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  MessageSquare, 
  Smartphone, 
  Play, 
  CheckCircle2, 
  ChevronRight 
} from "lucide-react";

// Real high-fidelity brand SVGs for payments and app stores
const BkashIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="32" height="32" rx="6" fill="#E2136E" />
    <path d="M16 6L24 14L16 22L8 14L16 6Z" fill="white" />
    <path d="M16 11L20 15L16 19L12 15L16 11Z" fill="#E2136E" />
    <circle cx="16" cy="15" r="1.5" fill="white" />
  </svg>
);

const NagadIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="32" height="32" rx="6" fill="#F47920" />
    <path d="M10 21V11H13L17.5 17.5V11H20.5V21H17.5L13 14.5V21H10Z" fill="white" />
    <path d="M15 8C16 8 17 9 17 10C17 11 16 12 15 12C14 12 13 11 13 10C13 9 14 8 15 8Z" fill="#FFF" />
  </svg>
);

const RocketIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="32" height="32" rx="6" fill="#8B1A8B" />
    <path d="M16 7C16 7 13 11 13 15C13 17.5 14.5 19 16 22C17.5 19 19 17.5 19 15C19 11 16 7 16 7Z" fill="white" />
    <path d="M13 17.5C12.5 17.5 12 18 12 18.5C12 19 13 20.5 14.5 21C14 20 13.5 18.5 13 17.5Z" fill="white" opacity="0.8" />
    <path d="M19 17.5C19.5 17.5 20 18 20 18.5C20 19 19 20.5 17.5 21C18 20 18.5 18.5 19 17.5Z" fill="white" opacity="0.8" />
    <circle cx="16" cy="13" r="1.5" fill="#8B1A8B" />
  </svg>
);

const CodIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="32" height="32" rx="6" fill="#2D5A27" />
    <rect x="8" y="11" width="16" height="10" rx="1.5" stroke="white" strokeWidth="1.5" fill="none" />
    <circle cx="16" cy="16" r="2" stroke="white" strokeWidth="1.5" fill="none" />
    <path d="M11 16H12M20 16H21" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BankIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="32" height="32" rx="6" fill="#1A56DB" />
    <path d="M8 22H24M10 13V19M14 13V19M18 13V19M22 13V19M16 8L8 12V13H24V12L16 8Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const AppleStoreIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }} className="text-white">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-.53-.25-1.07-.34-1.61-.34-.54 0-1.05.1-1.58.35-1.02.48-1.95.42-2.88-.41-4.04-3.95-3.37-10.45.98-10.53 1.22.02 2 .54 2.65.54s1.3-.49 2.5-.42c1.55.08 2.7.67 3.37 1.62-3.15 1.87-2.65 6.02.47 7.28-.62 1.55-1.42 3.1-2.22 4.15zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.2 2.5-2.12 4.45-3.74 4.25z" />
  </svg>
);

const PlayStoreIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M3.25 2.15C3.08 2.33 3 2.62 3 3V21C3 21.38 3.08 21.67 3.25 21.85L3.35 21.95L13.15 12.15V11.85L3.35 2.05L3.25 2.15Z" fill="#00F0FF" />
    <path d="M13.15 11.85L3.35 2.05C3.68 1.96 4.12 2.03 4.6 2.31L16.35 8.95L13.15 11.85Z" fill="#FFC700" />
    <path d="M13.15 12.15L16.35 8.95L20.45 11.25C21.1 11.62 21.1 12.38 20.45 12.75L16.35 15.05L13.15 12.15Z" fill="#FF007A" />
    <path d="M13.15 12.15L3.35 21.95C3.68 22.04 4.12 21.97 4.6 21.69L16.35 15.05L13.15 12.15Z" fill="#00E676" />
  </svg>
);

const P = "#2D5A27";
const BG = "#0D1F0B";

const payments = [
  { name: "bKash", color: "#E2136E", icon: BkashIcon },
  { name: "Nagad", color: "#F47920", icon: NagadIcon },
  { name: "Rocket", color: "#8B1A8B", icon: RocketIcon },
  { name: "COD", color: "#2D5A27", icon: CodIcon },
  { name: "Bank", color: "#1A56DB", icon: BankIcon },
];

export default function Footer() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const { lang, t } = useLanguage();
  const { getSetting } = useSiteSettings();
  const px = isMobile ? "16px" : isTablet ? "24px" : "48px";

  const footerDesc = getSetting("footer_about_text", getSetting("footer_description", "Orgativa is Bangladesh's premier organic food brand dedicated to reviving pure, unadulterated nature. Sourced directly from certified eco-farms across Bangladesh and laboratory tested for utmost purity."));
  const contactAddress = getSetting("footer_hq_address", getSetting("contact_address", "House 12, Road 5, Block D, Bashundhara R/A, Dhaka-1229, Bangladesh"));
  const contactPhone = getSetting("footer_hotline_number", getSetting("contact_phone", "+880 1700-000000"));
  const contactHours = getSetting("footer_hotline_hours", "9:00 AM – 10:00 PM (Everyday)");
  const supportEmail = getSetting("footer_support_email", getSetting("contact_email", "support@orgativa.com.bd"));
  const corpEmail = getSetting("footer_corp_email", "corporate@orgativa.com.bd");
  const contactWhatsapp = getSetting("contact_whatsapp", "+8801700000000");

  const facebookUrl = getSetting("footer_social_facebook", getSetting("facebook_page_url", "https://facebook.com"));
  const instagramUrl = getSetting("footer_social_instagram", getSetting("instagram_page_url", "https://instagram.com"));
  const youtubeUrl = getSetting("footer_social_youtube", "https://youtube.com");
  const linkedinUrl = getSetting("footer_social_linkedin", "https://linkedin.com");
  const tiktokUrl = getSetting("footer_social_tiktok", "https://tiktok.com");

  const appStoreUrl = getSetting("footer_appstore_url", getSetting("app_store_url", "https://apple.com/app-store"));
  const playStoreUrl = getSetting("footer_playstore_url", getSetting("play_store_url", "https://play.google.com/store"));
  const copyrightText = getSetting("footer_copyright_text", getSetting("copyright_text", "© 2026 Orgativa Bangladesh Ltd. All rights reserved."));
  const deliveryNote = getSetting("footer_delivery_note", "Delivering nationwide across all 64 districts in Bangladesh with 100% damage protection guarantee.");

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
    { labelBn: "অর্গানিক\nপ্রত্যয়িত", labelEn: "Certified\nOrganic", icon: ShieldCheck },
    { labelBn: "কীটনাশক\nমুক্ত", labelEn: "Pesticide\nFree", icon: Leaf },
    { labelBn: "ল্যাব\nপরীক্ষিত", labelEn: "Lab\nTested", icon: FlaskConical },
    { labelBn: "খামার\nথেকে সরাসরি", labelEn: "Direct From\nFarmers", icon: Award },
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
            const Icon = b.icon;
            return (
              <div key={b.labelEn} style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 14, paddingTop: isMobile ? 16 : 22, paddingBottom: isMobile ? 16 : 22, borderRight: (!isMobile && i < 3) ? "1px solid rgba(255,255,255,0.07)" : "none", borderBottom: (isMobile && i < 2) ? "1px solid rgba(255,255,255,0.07)" : "none", paddingLeft: (!isMobile && i > 0) ? 28 : 0, paddingRight: (!isMobile && i < 3) ? 28 : 0 }}>
                <div style={{ width: isMobile ? 36 : 42, height: isMobile ? 36 : 42, borderRadius: 12, backgroundColor: "rgba(45,90,39,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={isMobile ? 18 : 22} className="text-[#9ACA94]" />
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
              <CheckCircle2 size={24} className="text-[#9ACA94]" />
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
              {footerDesc}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                { icon: MapPin, text: contactAddress },
                { icon: Phone, text: `${contactPhone} (${contactHours})` },
                { icon: Mail, text: `${supportEmail} / ${corpEmail}` },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Icon size={14} className="text-[#6daf67]" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'Inter',sans-serif", lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { icon: Globe, label: t("ওয়েবসাইট", "Website"), href: "/" },
                { icon: Mail, label: t("ইমেইল", "Email"), href: `mailto:${supportEmail}` },
                { icon: Phone, label: t("ফোন", "Phone"), href: `tel:${contactPhone.replace(/\s+/g, '')}` },
                { icon: MessageSquare, label: t("হোয়াটসঅ্যাপ", "WhatsApp"), href: contactWhatsapp.startsWith("http") ? contactWhatsapp : `https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}` },
              ].map(({ icon: Icon, label, href }) => (
                <SocialBtn key={label} icon={Icon} label={label} href={href} />
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
                {[
                  { label: t("অ্যাপ স্টোর", "App Store"), subtitle: t("ডাউনলোড করুন", "Download on"), icon: AppleStoreIcon, href: appStoreUrl },
                  { label: t("গুগল প্লে", "Google Play"), subtitle: t("গেট ইট অন", "GET IT ON"), icon: PlayStoreIcon, href: playStoreUrl }
                ].map(({ label, subtitle, icon: Icon, href }) => (
                  <a key={label} href={href || "#"} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", width: "100%", textAlign: "left", textDecoration: "none" }}>
                    <Icon size={20} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontFamily: "'Inter',sans-serif", letterSpacing: "0.05em", lineHeight: 1 }}>{subtitle}</span>
                      <span style={{ fontSize: 13, color: "#fff", fontFamily: "'Inter',sans-serif", fontWeight: 700, lineHeight: 1.2 }}>{label}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 2 }}>
        {deliveryNote && (
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: `12px ${px} 0`, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <p style={{ fontSize: 11, color: "#8FA888", fontFamily: "'Inter',sans-serif", margin: 0, paddingBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <span>🚚</span>
              <span>{deliveryNote}</span>
            </p>
          </div>
        )}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: `18px ${px}`, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 14 : 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 20, flexWrap: "wrap" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter',sans-serif", margin: 0 }}>
              {copyrightText}
            </p>
            {[t("গোপনীয়তা নীতি", "Privacy Policy"), t("সেবার শর্তাবলী", "Terms of Service")].map((itemText) => (
              <a key={itemText} href="#" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "'Inter',sans-serif", textDecoration: "none" }}>{itemText}</a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'Inter',sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginRight: 4 }}>
              {t("আমরা গ্রহণ করি", "WE ACCEPT")}
            </span>
            {payments.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 8px", userSelect: "none" }}>
                  <Icon size={14} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", fontFamily: "'Inter',sans-serif" }}>{p.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialBtn({ icon: Icon, label, href }: { icon: React.ComponentType<{ size: number; className?: string }>; label: string; href?: string }) {
  return (
    <a href={href || "#"} aria-label={label}
      style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
      <Icon size={15} className="text-white/40 hover:text-[#9ACA94] transition-colors duration-200" />
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
      <ChevronRight size={12} className="text-white/25 flex-shrink-0" />
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
