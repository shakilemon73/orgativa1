import { useState } from "react";
import { useLocation } from "wouter";
import { products, getProductName, getProductWeight, type Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useResponsive } from "@/hooks/use-responsive";

const P = "#2D5A27";

const RANK_STYLES: Record<number, { bg: string; color: string; border: string; label: string }> = {
  1: { bg: "#FEF08A", color: "#92400E", border: "#FCD34D", label: "🥇" },
  2: { bg: "#E2E8F0", color: "#334155", border: "#CBD5E1", label: "🥈" },
  3: { bg: "#FED7AA", color: "#9A3412", border: "#FDBA74", label: "🥉" },
};

export default function TrendingSection() {
  const [activeTab, setActiveTab] = useState<string>("top-sellers");
  const { isMobile, isTablet } = useResponsive();
  const { t, lang, formatPrice, formatNum } = useLanguage();

  const TABS = [
    { id: "top-sellers", icon: "local_fire_department", label: t("সেরা বিক্রয়", "Top Sellers"), accent: "#E63946", accentBg: "#FEF2F2", badge: t("হট", "HOT"), description: t("এই সপ্তাহে সবচেয়ে বেশি কেনা", "Most purchased this week"), sort: () => [...products].sort((a, b) => b.reviews - a.reviews) },
    { id: "featured", icon: "workspace_premium", label: t("বিশেষ পছন্দ", "Featured"), accent: "#D97706", accentBg: "#FFFBEB", badge: t("পিক", "PICK"), description: t("বিশেষভাবে বাছাই করা পণ্য", "Hand-picked organic essentials"), sort: () => [...products].sort((a, b) => { const order = ["সেরা বিক্রয়", "প্রিমিয়াম", "ঐতিহ্যবাহী", "অর্গানিক", "স্বাস্থ্যকর", "পুরাতন"]; return (order.indexOf(a.badge ?? "") - order.indexOf(b.badge ?? "")) || b.rating - a.rating; }) },
    { id: "promotions", icon: "sell", label: t("অফার", "Deals"), accent: "#7C3AED", accentBg: "#F5F3FF", badge: t("সেল", "SALE"), description: t("এখনকার সেরা অফার", "Best discounts & special offers"), sort: () => [...products].filter((p) => p.originalPrice).sort((a, b) => (b.originalPrice! - b.price) - (a.originalPrice! - a.price)).concat(products.filter((p) => !p.originalPrice)) },
  ];

  const tab = TABS.find((t) => t.id === activeTab)!;
  const ranked = tab.sort().slice(0, 6);
  const top = ranked[0];
  const rest = ranked.slice(1, isMobile ? 4 : 6);

  return (
    <section style={{ marginTop: isMobile ? 40 : 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-end", marginBottom: isMobile ? 16 : 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: tab.accent }}>trending_up</span>
            <span style={{ fontSize: 11, color: tab.accent, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.15em", fontFamily: "'Inter',sans-serif" }}>
              {t("এখন ট্রেন্ডিং", "TRENDING NOW")}
            </span>
          </div>
          <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: isMobile ? 24 : 32, color: "#0D1F0B", fontWeight: 400, margin: 0, lineHeight: 1.2 }}>
            {t("সবাই যা কিনছেন", "Customer Favorites")}
          </h2>
        </div>

        {/* Tab switcher */}
        <div className="scroll-x" style={{ display: "flex", gap: 6, backgroundColor: "#F4F7F3", padding: 5, borderRadius: 14, border: "1px solid #E2EDE0", flexShrink: 0 }}>
          {TABS.map((t) => {
            const active = t.id === activeTab;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 7, padding: isMobile ? "7px 10px" : "9px 18px", borderRadius: 10, backgroundColor: active ? "#fff" : "transparent", border: "none", boxShadow: active ? "0 1px 6px rgba(0,0,0,0.1)" : "none", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: active ? t.accent : "#8FA888" }}>{t.icon}</span>
                {!isMobile && <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#0D1F0B" : "#6B7B6A" }}>{t.label}</span>}
                {active && <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", backgroundColor: t.accent, borderRadius: 4, padding: "1px 5px", letterSpacing: "0.08em" }}>{t.badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#8FA888", fontFamily: "'Inter',sans-serif", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 5 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>info</span>
        {tab.description}
      </p>

      {isMobile ? (
        /* Mobile: vertical stack — spotlight card + rows */
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SpotlightCard product={top} rank={1} tab={tab} compact lang={lang} t={t} formatPrice={formatPrice} formatNum={formatNum} />
          {rest.map((p, i) => (
            <RankedRow key={p.id} product={p} rank={i + 2} tab={tab} lang={lang} formatPrice={formatPrice} formatNum={formatNum} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr 1.4fr" : "1fr 1.6fr", gap: 20 }}>
          <SpotlightCard product={top} rank={1} tab={tab} lang={lang} t={t} formatPrice={formatPrice} formatNum={formatNum} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rest.map((p, i) => (
              <RankedRow key={p.id} product={p} rank={i + 2} tab={tab} lang={lang} formatPrice={formatPrice} formatNum={formatNum} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SpotlightCard({ product: p, rank, tab, compact, lang, t, formatPrice, formatNum }: { product: Product; rank: number; tab: any; compact?: boolean; lang: "bn" | "en"; t: (bn: string, en: string) => string; formatPrice: (p: number) => string; formatNum: (n: number | string) => string }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const rs = RANK_STYLES[rank];
  const name = getProductName(p, lang);
  const weight = getProductWeight(p, lang);
  const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : null;

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    addItem(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div onClick={() => navigate(`/products/${p.slug}`)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", border: `1.5px solid ${hovered ? tab.accent + "40" : "#E8EDE7"}`, cursor: "pointer", transition: "all 0.25s", boxShadow: hovered ? `0 16px 48px ${tab.accent}18` : "0 2px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: compact ? "row" : "column" }}>

      <div style={{ position: "relative", backgroundColor: "#F4F9F2", padding: compact ? "20px" : "40px 32px 32px", flexShrink: 0, width: compact ? 130 : "auto" }}>
        {!compact && (
          <div style={{ position: "absolute", top: 16, left: 16, backgroundColor: rs?.bg ?? tab.accentBg, border: `1.5px solid ${rs?.border ?? tab.accent + "40"}`, color: rs?.color ?? tab.accent, borderRadius: 10, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>{rs?.label ?? "🏅"}</span>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif" }}>
              {t("র‍্যাংক #", "Rank #")}{formatNum(rank)}
            </span>
          </div>
        )}
        {discount && !compact && (
          <div style={{ position: "absolute", top: 16, right: 16, backgroundColor: tab.accent, color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 800, fontFamily: "'Inter',sans-serif" }}>
            -{formatNum(discount)}% {t("ছাড়", "OFF")}
          </div>
        )}
        <img src={p.image} alt={name} style={{ width: "100%", height: compact ? 90 : 200, objectFit: "contain", transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.5s ease" }} />
      </div>

      <div style={{ padding: compact ? "16px 16px 16px 0" : "20px 24px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 0, justifyContent: "center" }}>
        {compact && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>{rs?.label ?? "🏅"}</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: rs?.color ?? tab.accent, fontFamily: "'Inter',sans-serif" }}>
              {t("র‍্যাংক #", "Rank #")}{formatNum(rank)}
            </span>
          </div>
        )}
        {!compact && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <StarRow rating={p.rating} />
            <span style={{ fontSize: 11, color: "#A5B3A3", fontFamily: "'Inter',sans-serif" }}>({formatNum(p.reviews)})</span>
          </div>
        )}
        <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: compact ? 16 : 20, color: hovered ? P : "#0D1F0B", fontWeight: 400, margin: "0 0 4px", transition: "color 0.2s" }}>{name}</h3>
        <p style={{ fontSize: 11, color: "#8FA888", fontFamily: "'Inter',sans-serif", margin: compact ? "0 0 10px" : "0 0 16px" }}>{weight}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div>
            <span style={{ fontSize: compact ? 18 : 22, fontWeight: 800, color: "#0D1F0B", fontFamily: "'Inter',sans-serif" }}>{formatPrice(p.price)}</span>
            {p.originalPrice && !compact && (
              <span style={{ fontSize: 12, color: "#C3C8C1", textDecoration: "line-through", marginLeft: 6, fontFamily: "'Inter',sans-serif" }}>{formatPrice(p.originalPrice)}</span>
            )}
          </div>
          <button onClick={handleAdd}
            style={{ backgroundColor: added ? "#1a4016" : tab.accent, color: "#fff", border: "none", borderRadius: 10, padding: compact ? "8px 12px" : "10px 20px", fontSize: 12, fontWeight: 700, fontFamily: "'Inter',sans-serif", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s", flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{added ? "check" : "add_shopping_cart"}</span>
            {!compact && (added ? t("যোগ হয়েছে!", "Added!") : t("ঝুড়িতে যোগ করুন", "Add to Cart"))}
          </button>
        </div>
      </div>
    </div>
  );
}

function RankedRow({ product: p, rank, tab, lang, formatPrice, formatNum }: { product: Product; rank: number; tab: any; lang: "bn" | "en"; formatPrice: (price: number) => string; formatNum: (num: number | string) => string }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const { isMobile } = useResponsive();
  const rs = RANK_STYLES[rank];
  const name = getProductName(p, lang);
  const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : null;

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    addItem(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div onClick={() => navigate(`/products/${p.slug}`)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: "#fff", borderRadius: 14, border: `1.5px solid ${hovered ? tab.accent + "35" : "#E8EDE7"}`, padding: isMobile ? "12px 14px" : "14px 18px", display: "flex", alignItems: "center", gap: isMobile ? 12 : 16, cursor: "pointer", transition: "all 0.2s" }}>

      <div style={{ width: isMobile ? 30 : 36, height: isMobile ? 30 : 36, borderRadius: 10, flexShrink: 0, backgroundColor: rs?.bg ?? "#F4F7F3", border: `1.5px solid ${rs?.border ?? "#E2EDE0"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {rs ? <span style={{ fontSize: isMobile ? 15 : 18, lineHeight: 1 }}>{rs.label}</span> : <span style={{ fontSize: 11, fontWeight: 800, color: "#8FA888", fontFamily: "'Inter',sans-serif" }}>#{formatNum(rank)}</span>}
      </div>

      <div style={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56, borderRadius: 10, backgroundColor: "#F4F9F2", flexShrink: 0, overflow: "hidden", padding: 6 }}>
        <img src={p.image} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: hovered ? P : "#0D1F0B", fontFamily: "'Inter',sans-serif", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "color 0.2s" }}>{name}</p>
        {!isMobile && <StarRow rating={p.rating} size={11} />}
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
          {discount && <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", backgroundColor: tab.accent, borderRadius: 4, padding: "1px 5px", fontFamily: "'Inter',sans-serif" }}>-{formatNum(discount)}%</span>}
          <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: "#0D1F0B", fontFamily: "'Inter',sans-serif" }}>{formatPrice(p.price)}</span>
        </div>
        {p.originalPrice && !isMobile && <span style={{ fontSize: 11, color: "#C3C8C1", textDecoration: "line-through", fontFamily: "'Inter',sans-serif" }}>{formatPrice(p.originalPrice)}</span>}
      </div>

      <button onClick={handleAdd}
        style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: 8, border: "none", backgroundColor: added ? "#1a4016" : hovered ? tab.accent : "#F4F7F3", color: hovered || added ? "#fff" : "#8FA888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{added ? "check" : "add"}</span>
      </button>
    </div>
  );
}

function StarRow({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`material-symbols-outlined${s <= rating ? " fill" : ""}`}
          style={{ fontSize: size, color: s <= rating ? "#F59E0B" : "#E2E8E2" }}>star</span>
      ))}
    </div>
  );
}
