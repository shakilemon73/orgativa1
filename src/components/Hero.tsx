import { useLocation } from "wouter";
import { useResponsive } from "@/hooks/use-responsive";
import { useLanguage } from "@/context/LanguageContext";

const P = "#2D5A27";

const heroProducts = [
  { nameBn: "বন্য বনের মধু", nameEn: "Wild Forest Honey", priceBn: "৳২,৪০০", priceEn: "৳2,400", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBq58vEH7gYivPXEcLtToX4pCgGkviWmugMHiaigVEtrhNKVWTb4fTxR1hT32LDpNdlSJzxRskyCEBJLI9quHz9O_6QJVWrn2OIY0kpmCMFk7aQwMx5LqiF6lunsosrCjrayF1NNm2DDGr068cYTrgWBexlw0yOmDhPOzDAp1MypmTUW6y9JGsEHMxMHefsdhAn4UsSDMBRDY5ICzk37jUhLrIrO4ZkFiI3ZE-r9CNn86Gtqi1oO6X-niuYbLh0cNTrJ99yBDhQFyb7", badgeBn: "সেরা বিক্রয়", badgeEn: "Best Seller" },
  { nameBn: "প্রিমিয়াম পেস্তা", nameEn: "Premium Pistachios", priceBn: "৳৩,২০০", priceEn: "৳3,200", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAV_9aStLOUy3wxdgtym2iJwX-mmsl6jPJD6ecTZT3ziz2Tj-7pVXrqDCQtEOQ1kzc5XZ9Y9EX1rThCwppLb5Ba6F1-DP_5Gj-P6rlShkJGl9-jVC03jtFGxY5OQAGu5T5uN8a7exjnEslKqzIgo2XojJ3Sut175FRnz4WnEjtZRYIDTFSiYFVbuvsJ9GqCw4_PbgqjDXCx8QA7F61_Axk_Oki0NTEjqUGDoqK2smHnSmqtEy_xZKZrNfTpDdaKzmjBG3-bkpQClACP", badgeBn: "প্রিমিয়াম", badgeEn: "Premium" },
  { nameBn: "ঠান্ডা চাপা তেল", nameEn: "Cold-Pressed Oil", priceBn: "৳১,৮৫০", priceEn: "৳1,850", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5GzOFWh1pgalQi48-L6jXrnrBdcvDxK-Gb2S8CCtBZFhvlX6tSY2Kz_j7uleHESVRHEh2qnBrg-_pdX-Ks_uVdKF5QPfZpif5WE-0yV3F0MmXlPDL9MqfTONTNjX7iazXEden3BKL14y5eckX2gd8w4dug-rDpGiPJIq0JpnVgtv8zQNZ2mKOn1kg3Iisw4JEuaZNxS0M2pjAGoHHG_zXdz9MCZGlp3pmHyrpaZ0fMr2frPb0LRDYEWVdycoyfZpBlnXXx4gm11UX", badgeBn: "অর্গানিক", badgeEn: "Organic" },
  { nameBn: "হাতে তৈরি ঘি", nameEn: "Hand-Churned Ghee", priceBn: "৳২,৮০০", priceEn: "৳2,800", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuANdJPuajyHXCp7iaCYfSFlXnopP1beP-KgAbmdmX1lt5SMH_C3_9CLD2By3zJ9krkw5PF9Lml-mSOEcTLSfbSkb3Qf5-BiRlT8A_QYfY28tect19CUj5EWHG5_LMQXowf87L424S9yL1awzpv4dLpT9PrXFkcJypZtLB0Zp5E3ovtK7vzAHW5AcmfLKILDwZsvVPYSXiuRO1Yn4MUTCCmm7gzOYg-sd9yHviieYhyrn2p93b--_W8qcR-J1-6HWrVbTZqUfedVRsuE", badgeBn: "ঐতিহ্যবাহী", badgeEn: "Artisanal" },
];

export default function Hero() {
  const [, navigate] = useLocation();
  const { isMobile, isTablet, width } = useResponsive();
  const { lang, t } = useLanguage();

  if (isMobile) {
    const statGap = width < 365 ? 10 : 20;
    return (
      <section style={{ backgroundColor: "#FAFDF7", borderBottom: "1px solid #E8F0E5", position: "relative", overflow: "hidden" }}>
        <BotanicalBackground />
        <div style={{ position: "relative", zIndex: 2, padding: "32px 20px 0" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "#E8F5E3", border: "1.5px solid #C2E0BB", borderRadius: 999, padding: "5px 12px 5px 8px", marginBottom: 20 }}>
            <span style={{ fontSize: 13 }}>🌿</span>
            <span style={{ fontSize: 10, color: P, fontFamily: "'Inter',sans-serif", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {t("প্রতিষ্ঠিত ২০২৪ · বিশুদ্ধ উৎস", "EST. 2024 · PURE ORIGIN")}
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: "clamp(30px,8vw,40px)", color: "#0D1F0B", lineHeight: 1.1, letterSpacing: "-0.02em", fontWeight: 400, margin: "0 0 6px" }}>
            {t("বিশুদ্ধ উৎস।", "Pure Source.")}<br />{t("সুস্থ জীবন।", "Healthy Life.")}
          </h1>
          <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: "clamp(30px,8vw,40px)", color: P, lineHeight: 1.1, letterSpacing: "-0.02em", fontWeight: 600, fontStyle: "italic", margin: "0 0 16px" }}>
            {t("১০০% অর্গানিক।", "100% Organic.")}
          </h1>

          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#4A5548", lineHeight: 1.65, margin: "0 0 20px" }}>
            {t("বাংলাদেশের সেরা খামার থেকে হাতে বাছাই করা — কীটনাশকমুক্ত, ল্যাব-প্রত্যয়িত পণ্য।", "Hand-harvested from Bangladesh's finest organic farms — pesticide-free & lab-tested.")}
          </p>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { icon: "✔", text: t("কীটনাশকমুক্ত", "Pesticide Free") },
              { icon: "🏅", text: t("ল্যাব প্রত্যয়িত", "Lab Certified") },
              { icon: "🚚", text: t("বিনামূল্যে ডেলিভারি", "Free Delivery") },
            ].map(({ icon, text }) => (
              <span key={text} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#3A5237", fontFamily: "'Inter',sans-serif", backgroundColor: "#fff", border: "1px solid #D7EDCF", borderRadius: 8, padding: "4px 10px" }}>
                <span style={{ fontSize: 12 }}>{icon}</span>{text}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 0, marginBottom: 24, borderLeft: `3px solid ${P}`, paddingLeft: 16 }}>
            {[
              [t("৫০০+", "500+"), t("পণ্য", "Products")],
              [t("৫০,০০০+", "50,000+"), t("গ্রাহক", "Customers")],
              [t("১০০%", "100%"), t("প্রত্যয়িত", "Certified")],
            ].map(([num, label], i) => (
              <div key={label} style={{ paddingRight: statGap, borderRight: i < 2 ? "1px solid #D7EDCF" : "none", marginRight: i < 2 ? statGap : 0 }}>
                <p style={{ fontFamily: "'Noto Serif',serif", fontSize: 20, color: P, fontWeight: 700, margin: 0, lineHeight: 1 }}>{num}</p>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "#8FA888", textTransform: "uppercase", letterSpacing: "0.1em", margin: "3px 0 0" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            <button onClick={() => navigate("/category/all")}
              style={{ flex: 1, backgroundColor: P, color: "#fff", border: "none", borderRadius: 10, padding: "14px 0", fontSize: 14, fontWeight: 700, fontFamily: "'Inter',sans-serif", cursor: "pointer", letterSpacing: "0.03em", boxShadow: "0 4px 14px rgba(45,90,39,0.3)" }}>
              {t("এখনই কিনুন", "Shop Now")}
            </button>
            <button onClick={() => navigate("/category/all")}
              style={{ flex: 1, backgroundColor: "transparent", color: P, border: `1.5px solid ${P}`, borderRadius: 10, padding: "14px 0", fontSize: 14, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: "pointer" }}>
              {t("বিভাগ দেখুন", "Categories")}
            </button>
          </div>
        </div>

        {/* Product tiles 2×2 on mobile */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 20px 24px", position: "relative", zIndex: 2 }}>
          {heroProducts.map((p, i) => (
            <ProductTile key={i} product={p} onClick={() => navigate("/category/all")} compact lang={lang} />
          ))}
        </div>

        {/* Star rating badge */}
        <div style={{ margin: "0 20px 28px", backgroundColor: "#fff", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 16px rgba(45,90,39,0.1)", border: "1px solid #E8F0E5", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", gap: 1 }}>
            {[1,2,3,4,5].map((s) => <span key={s} className="material-symbols-outlined fill" style={{ fontSize: 14, color: "#F59E0B" }}>star</span>)}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#1A1C1C", fontFamily: "'Inter',sans-serif", margin: 0 }}>
              {t("৪.৯ / ৫.০ রেটিং", "4.9 / 5.0 Rating")}
            </p>
            <p style={{ fontSize: 10, color: "#8FA888", fontFamily: "'Inter',sans-serif", margin: 0 }}>
              {t("৫০,০০০+ যাচাইকৃত রিভিউ", "50,000+ Verified Reviews")}
            </p>
          </div>
        </div>

        {/* Green strip */}
        <div style={{ backgroundColor: P, padding: "11px 20px", position: "relative", zIndex: 2 }}>
          <div className="scroll-x" style={{ display: "flex", gap: 28 }}>
            {[
              { icon: "eco", text: t("১০০% জৈব", "100% Organic") },
              { icon: "science", text: t("ল্যাব-পরীক্ষিত", "Lab Tested") },
              { icon: "local_shipping", text: t("বিনামূল্যে ডেলিভারি", "Free Delivery") },
              { icon: "handshake", text: t("কৃষকদের সাথে সরাসরি", "Direct From Farmers") },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#9ACA94" }}>{icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ backgroundColor: "#FAFDF7", position: "relative", overflow: "hidden", borderBottom: "1px solid #E8F0E5" }}>
      <BotanicalBackground />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isTablet ? "0 24px" : "0 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: isTablet ? 32 : 48, alignItems: "center", minHeight: isTablet ? 420 : 520, position: "relative", zIndex: 2 }}>
        <div style={{ paddingTop: isTablet ? 40 : 56, paddingBottom: isTablet ? 40 : 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "#E8F5E3", border: "1.5px solid #C2E0BB", borderRadius: 999, padding: "6px 14px 6px 10px", marginBottom: 28 }}>
            <span style={{ display: "inline-block", width: 20, height: 20, lineHeight: "20px", textAlign: "center", fontSize: 14 }}>🌿</span>
            <span style={{ fontSize: 11, color: P, fontFamily: "'Inter',sans-serif", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {t("প্রতিষ্ঠিত ২০২৪ · বিশুদ্ধ উৎস", "EST. 2024 · PURE ORIGIN")}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: isTablet ? "clamp(28px,3.5vw,40px)" : "clamp(38px,4.2vw,58px)", color: "#0D1F0B", lineHeight: 1.08, letterSpacing: "-0.025em", fontWeight: 400, margin: "0 0 8px" }}>
            {t("বিশুদ্ধ উৎস।", "Pure Source.")}<br />{t("সুস্থ জীবন।", "Healthy Life.")}
          </h1>
          <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: isTablet ? "clamp(28px,3.5vw,40px)" : "clamp(38px,4.2vw,58px)", color: P, lineHeight: 1.08, letterSpacing: "-0.025em", fontWeight: 600, fontStyle: "italic", margin: "0 0 24px" }}>
            {t("১০০% অর্গানিক।", "100% Organic.")}
          </h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: isTablet ? 14 : 16, color: "#4A5548", maxWidth: 420, lineHeight: 1.75, margin: "0 0 28px" }}>
            {t("বাংলাদেশের সেরা খামার থেকে হাতে বাছাই করা — কীটনাশকমুক্ত, ল্যাব-প্রত্যয়িত, তাজা পণ্য।", "Hand-harvested from Bangladesh's finest organic farms — pesticide-free, lab-certified, fresh organic goods.")}
          </p>
          {!isTablet && (
            <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
              {[
                { icon: "✔", text: t("কীটনাশকমুক্ত", "Pesticide Free") },
                { icon: "🏅", text: t("ল্যাব প্রত্যয়িত", "Lab Certified") },
                { icon: "🚚", text: t("বিনামূল্যে ডেলিভারি", "Free Delivery") },
              ].map(({ icon, text }) => (
                <span key={text} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#3A5237", fontFamily: "'Inter',sans-serif", backgroundColor: "#fff", border: "1px solid #D7EDCF", borderRadius: 8, padding: "5px 12px" }}>
                  <span style={{ fontSize: 13 }}>{icon}</span>{text}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 0, marginBottom: 36, borderLeft: `3px solid ${P}`, paddingLeft: 20 }}>
            {[
              [t("৫০০+", "500+"), t("পণ্য", "Products")],
              [t("৫০,০০০+", "50,000+"), t("গ্রাহক", "Customers")],
              [t("১০০%", "100%"), t("প্রত্যয়িত", "Certified")],
            ].map(([num, label], i) => (
              <div key={label} style={{ paddingRight: isTablet ? 20 : 28, borderRight: i < 2 ? "1px solid #D7EDCF" : "none", marginRight: i < 2 ? (isTablet ? 20 : 28) : 0 }}>
                <p style={{ fontFamily: "'Noto Serif',serif", fontSize: isTablet ? 20 : 26, color: P, fontWeight: 700, margin: 0, lineHeight: 1 }}>{num}</p>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#8FA888", textTransform: "uppercase", letterSpacing: "0.1em", margin: "4px 0 0" }}>{label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => navigate("/category/all")}
              style={{ backgroundColor: P, color: "#fff", border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 14, fontWeight: 700, fontFamily: "'Inter',sans-serif", cursor: "pointer", letterSpacing: "0.04em", boxShadow: "0 4px 18px rgba(45,90,39,0.35)", transition: "all 0.2s" }}>
              {t("এখনই কিনুন", "Shop Now")}
            </button>
            <button onClick={() => navigate("/category/all")}
              style={{ backgroundColor: "transparent", color: P, border: `1.5px solid ${P}`, borderRadius: 10, padding: "14px 28px", fontSize: 14, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: "pointer", letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: 7 }}>
              {t("বিভাগ দেখুন", "Explore Categories")}
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>arrow_forward</span>
            </button>
          </div>
        </div>

        <div style={{ paddingTop: 32, paddingBottom: 32, position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, #E8F5E3 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 28 }}>
              {heroProducts.slice(0, 2).map((p, i) => <ProductTile key={i} product={p} onClick={() => navigate("/category/all")} lang={lang} />)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 28 }}>
              {heroProducts.slice(2, 4).map((p, i) => <ProductTile key={i} product={p} onClick={() => navigate("/category/all")} lang={lang} />)}
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 44, left: "50%", transform: "translateX(-50%)", backgroundColor: "#fff", borderRadius: 14, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(45,90,39,0.15)", border: "1px solid #E8F0E5", whiteSpace: "nowrap", zIndex: 10 }}>
            <div style={{ display: "flex", gap: 1 }}>
              {[1,2,3,4,5].map((s) => <span key={s} className="material-symbols-outlined fill" style={{ fontSize: 14, color: "#F59E0B" }}>star</span>)}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#1A1C1C", fontFamily: "'Inter',sans-serif", margin: 0 }}>
                {t("৪.৯ / ৫.০ রেটিং", "4.9 / 5.0 Rating")}
              </p>
              <p style={{ fontSize: 10, color: "#8FA888", fontFamily: "'Inter',sans-serif", margin: 0 }}>
                {t("৫০,০০০+ যাচাইকৃত রিভিউ", "50,000+ Verified Reviews")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: P, padding: isTablet ? "10px 24px" : "11px 48px", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="scroll-x" style={{ display: "flex", justifyContent: isTablet ? "flex-start" : "center", gap: isTablet ? 32 : 48 }}>
            {[
              { icon: "eco", text: t("১০০% জৈব চাষ", "100% Organic Farming") },
              { icon: "science", text: t("ল্যাব-পরীক্ষিত ও প্রত্যয়িত", "Lab Tested & Certified") },
              { icon: "local_shipping", text: t("৳১,০০০+ অর্ডারে বিনামূল্যে ডেলিভারি", "Free Delivery over ৳1,000") },
              { icon: "handshake", text: t("সরাসরি কৃষকদের কাছ থেকে", "Direct From Farmers") },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: "#9ACA94" }}>{icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductTile({ product, onClick, compact, lang }: { product: typeof heroProducts[0]; onClick: () => void; compact?: boolean; lang: "bn" | "en" }) {
  const name = lang === "en" ? product.nameEn : product.nameBn;
  const price = lang === "en" ? product.priceEn : product.priceBn;
  const badge = lang === "en" ? product.badgeEn : product.badgeBn;

  return (
    <div onClick={onClick}
      style={{ backgroundColor: "#fff", border: "1px solid #E8F0E5", borderRadius: compact ? 12 : 16, padding: compact ? "10px" : "16px", cursor: "pointer", boxShadow: "0 2px 12px rgba(45,90,39,0.07)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(45,90,39,0.14)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(45,90,39,0.07)"; }}>
      <div style={{ backgroundColor: "#F3F9F1", borderRadius: 8, aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: compact ? 8 : 12, padding: compact ? "8px" : "12px" }}>
        <img src={product.image} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <span style={{ display: "inline-block", fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: P, backgroundColor: "#E8F5E3", borderRadius: 4, padding: "2px 6px", marginBottom: 4, fontFamily: "'Inter',sans-serif" }}>{badge}</span>
      <p style={{ fontSize: compact ? 11 : 13, fontWeight: 600, color: "#1A1C1C", fontFamily: "'Inter',sans-serif", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
      <p style={{ fontSize: compact ? 12 : 14, fontWeight: 700, color: P, fontFamily: "'Inter',sans-serif", margin: 0 }}>{price}</p>
    </div>
  );
}

function BotanicalBackground() {
  return (
    <svg viewBox="0 0 1280 560" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} aria-hidden="true">
      <defs>
        <linearGradient id="lf1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4a8c3e" stopOpacity="0.28" /><stop offset="100%" stopColor="#2D5A27" stopOpacity="0.18" /></linearGradient>
        <linearGradient id="lf2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6aaf5a" stopOpacity="0.22" /><stop offset="100%" stopColor="#3a7033" stopOpacity="0.14" /></linearGradient>
        <linearGradient id="lf3" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#2D5A27" stopOpacity="0.32" /><stop offset="100%" stopColor="#5aa04e" stopOpacity="0.20" /></linearGradient>
      </defs>
      <path fill="none" stroke="#2D5A27" strokeWidth="3" strokeLinecap="round" opacity="0.25" d="M -30 -20 C 40 30 80 70 120 110 C 160 150 200 160 240 150" />
      <TropicalLeaf tx={128} ty={-22} rot={40} sc={1.3} grad="lf1" />
      <TropicalLeaf tx={42} ty={30} rot={-15} sc={1.1} grad="lf2" />
      <TropicalLeaf tx={1282} ty={-15} rot={-145} sc={1.2} grad="lf1" />
      <TropicalLeaf tx={1240} ty={20} rot={-120} sc={1.1} grad="lf3" />
      <SimpleLeaf tx={-10} ty={55} rot={-30} sc={0.7} />
      <SimpleLeaf tx={1175} ty={150} rot={-55} sc={0.7} />
    </svg>
  );
}

function TropicalLeaf({ tx, ty, rot, sc, grad }: { tx: number; ty: number; rot: number; sc: number; grad: string }) {
  return (
    <g transform={`translate(${tx},${ty}) rotate(${rot}) scale(${sc})`}>
      <path d="M 0 0 C -8 -8 -28 -28 -32 -55 C -34 -78 -22 -105 0 -120 C 22 -105 34 -78 32 -55 C 28 -28 8 -8 0 0 Z" fill={`url(#${grad})`} />
      <path d="M 0 0 C -8 -8 -28 -28 -32 -55 C -34 -78 -22 -105 0 -120 C 22 -105 34 -78 32 -55 C 28 -28 8 -8 0 0 Z" fill="none" stroke="#2D5A27" strokeWidth="0.8" opacity="0.35" />
      <path d="M 0 0 L 0 -120" fill="none" stroke="#2D5A27" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
    </g>
  );
}

function SimpleLeaf({ tx, ty, rot, sc }: { tx: number; ty: number; rot: number; sc: number }) {
  return (
    <g transform={`translate(${tx},${ty}) rotate(${rot}) scale(${sc})`}>
      <path d="M 0 0 C -10 -8 -18 -22 -16 -38 C -14 -52 -6 -60 0 -62 C 6 -60 14 -52 16 -38 C 18 -22 10 -8 0 0 Z" fill="#3a7033" opacity="0.18" />
    </g>
  );
}
