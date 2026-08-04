import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { getProductName, getProductCategory, getProductWeight } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useResponsive } from "@/hooks/use-responsive";

const P = "#2D5A27";

export default function Cart() {
  const [, navigate] = useLocation();
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const { isMobile } = useResponsive();
  const { lang, t, formatPrice, formatNum } = useLanguage();
  const { getSetting } = useSiteSettings();

  const deliveryThreshold = Number(getSetting("delivery_free_threshold", "1500")) || 1500;
  const defaultCharge = Number(getSetting("delivery_inside_dhaka", "60")) || 60;

  const deliveryFree = subtotal >= deliveryThreshold;
  const deliveryCharge = deliveryFree ? 0 : defaultCharge;
  const total = subtotal + deliveryCharge;
  const savings = items.reduce((sum, i) =>
    i.product.originalPrice ? sum + (i.product.originalPrice - i.product.price) * i.quantity : sum, 0);

  const px = isMobile ? "16px" : "64px";

  return (
    <div style={{ backgroundColor: "#F9F9F9", minHeight: "100vh" }}>
      <Header />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: `${isMobile ? 24 : 40}px ${px} 80px` }}>
        <div style={{ marginBottom: 28 }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: P, fontSize: 13, fontFamily: "'Inter',sans-serif", marginBottom: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            {t("কেনাকাটা চালিয়ে যান", "Continue Shopping")}
          </button>
          <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: isMobile ? 28 : 40, fontWeight: 400, color: "#1A1C1C" }}>
            {t("কেনার ঝুড়ি", "Shopping Cart")} {totalItems > 0 && <span style={{ fontFamily: "'Inter',sans-serif", fontSize: isMobile ? 16 : 20, color: "#737973", fontWeight: 400 }}>({formatNum(totalItems)} {t("টি", "items")})</span>}
          </h1>
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 380px", gap: 24, alignItems: "start" }}>
            {/* Items column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {!deliveryFree && (
                <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: "14px 18px", border: "1px solid #E8E8E8", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontFamily: "'Inter',sans-serif", color: "#434843" }}>
                      {t("বিনামূল্যে ডেলিভারির জন্য আরও ", "Add ")}
                      <strong style={{ color: P }}>{formatPrice(deliveryThreshold - subtotal)}</strong>
                      {t(" যোগ করুন", " more for free shipping")}
                    </span>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: P }}>local_shipping</span>
                  </div>
                  <div style={{ height: 5, backgroundColor: "#E8E8E8", borderRadius: 999 }}>
                    <div style={{ height: "100%", width: `${Math.min(100, (subtotal / deliveryThreshold) * 100)}%`, backgroundColor: P, borderRadius: 999, transition: "width 0.4s" }} />
                  </div>
                </div>
              )}
              {deliveryFree && (
                <div style={{ backgroundColor: "#DFF2D8", borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="material-symbols-outlined fill" style={{ fontSize: 18, color: P }}>check_circle</span>
                  <span style={{ fontSize: 13, color: P, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
                    {t("বিনামূল্যে ডেলিভারি পেয়েছেন!", "You unlocked Free Shipping!")}
                  </span>
                </div>
              )}
              {items.map((item) => <CartItemRow key={item.product.id} item={item} onRemove={removeItem} onQty={updateQuantity} compact={isMobile} lang={lang} t={t} formatPrice={formatPrice} formatNum={formatNum} />)}
            </div>

            {/* Summary */}
            <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E8E8E8", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #E8E8E8" }}>
                <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: 20, fontWeight: 400, color: "#1A1C1C" }}>
                  {t("অর্ডারের সারসংক্ষেপ", "Order Summary")}
                </h2>
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                <SummaryRow label={t("উপমোট", "Subtotal")} value={formatPrice(subtotal)} />
                <SummaryRow label={t("ডেলিভারি", "Delivery Charge")} value={deliveryFree ? t("বিনামূল্যে", "FREE") : formatPrice(deliveryCharge)} valueColor={deliveryFree ? P : "#1A1C1C"} />
                {savings > 0 && <SummaryRow label={t("সাশ্রয়", "Savings")} value={`-${formatPrice(savings)}`} valueColor="#D64545" />}
                <div style={{ height: 1, backgroundColor: "#E8E8E8", margin: "2px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Noto Serif',serif", fontSize: 18, fontWeight: 400, color: "#1A1C1C" }}>
                    {t("মোট", "Total")}
                  </span>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 700, color: "#1A1C1C" }}>{formatPrice(total)}</span>
                </div>
                <p style={{ fontSize: 11, color: "#737973", fontFamily: "'Inter',sans-serif" }}>
                  {t("সকল প্রযোজ্য কর (ভ্যাট) সহ", "Includes all applicable VAT/Taxes")}
                </p>
              </div>
              <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => navigate("/checkout")}
                  style={{ width: "100%", backgroundColor: P, color: "#fff", border: "none", borderRadius: 10, padding: "15px", fontSize: 15, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {t("চেকআউটে যান", "Proceed to Checkout")}
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
                </button>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {["bKash", "Nagad", "Rocket", "COD"].map((m) => (
                    <span key={m} style={{ fontSize: 11, color: "#737973", fontFamily: "'Inter',sans-serif", backgroundColor: "#F3F3F4", padding: "2px 8px", borderRadius: 4 }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function CartItemRow({ item, onRemove, onQty, compact, lang, t, formatPrice, formatNum }: {
  item: { product: any; quantity: number };
  onRemove: (id: number) => void;
  onQty: (id: number, qty: number) => void;
  compact?: boolean;
  lang: "bn" | "en";
  t: (bn: string, en: string) => string;
  formatPrice: (p: number) => string;
  formatNum: (n: number | string) => string;
}) {
  const [, navigate] = useLocation();
  const name = getProductName(item.product, lang);
  const category = getProductCategory(item.product, lang);
  const weight = getProductWeight(item.product, lang);

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid #E8E8E8", padding: compact ? 14 : 20, display: "flex", gap: compact ? 12 : 20, alignItems: "flex-start" }}>
      <div onClick={() => navigate(`/products/${item.product.slug}`)}
        style={{ width: compact ? 72 : 100, height: compact ? 72 : 100, backgroundColor: "#F3F3F4", borderRadius: 10, overflow: "hidden", flexShrink: 0, cursor: "pointer", padding: compact ? 8 : 12 }}>
        <img src={item.product.image} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 11, color: P, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif", marginBottom: 3 }}>{category}</p>
            <h4 onClick={() => navigate(`/products/${item.product.slug}`)}
              style={{ fontFamily: "'Noto Serif',serif", fontSize: compact ? 15 : 18, fontWeight: 400, color: "#1A1C1C", cursor: "pointer", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</h4>
            <p style={{ fontSize: 12, color: "#737973", fontFamily: "'Inter',sans-serif" }}>{weight}</p>
          </div>
          <button onClick={() => onRemove(item.product.id)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#a8a29e", padding: 2, flexShrink: 0, display: "flex", alignItems: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #E8E8E8", borderRadius: 8, overflow: "hidden" }}>
            <button onClick={() => onQty(item.product.id, item.quantity - 1)}
              style={{ width: compact ? 32 : 36, height: compact ? 32 : 36, border: "none", background: "none", cursor: "pointer", color: "#434843", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>remove</span>
            </button>
            <span style={{ width: compact ? 32 : 40, textAlign: "center", fontSize: 14, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>{formatNum(item.quantity)}</span>
            <button onClick={() => onQty(item.product.id, item.quantity + 1)}
              style={{ width: compact ? 32 : 36, height: compact ? 32 : 36, border: "none", background: "none", cursor: "pointer", color: "#434843", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            </button>
          </div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: compact ? 16 : 18, fontWeight: 700, color: "#1A1C1C" }}>{formatPrice(item.product.price * item.quantity)}</p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, valueColor = "#1A1C1C" }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 14, color: "#434843", fontFamily: "'Inter',sans-serif" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: valueColor, fontFamily: "'Inter',sans-serif" }}>{value}</span>
    </div>
  );
}

function EmptyCart() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  return (
    <div style={{ textAlign: "center", padding: "64px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ width: 88, height: 88, backgroundColor: "#DFF2D8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 44, color: P }}>shopping_basket</span>
      </div>
      <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: 26, fontWeight: 400, color: "#1A1C1C" }}>
        {t("আপনার ঝুড়ি খালি", "Your Cart is Empty")}
      </h2>
      <p style={{ fontSize: 15, color: "#737973", fontFamily: "'Inter',sans-serif", maxWidth: 340, lineHeight: 1.6 }}>
        {t("আমাদের বিশুদ্ধ অর্গানিক পণ্য আবিষ্কার করুন এবং ঝুড়িতে যোগ করুন।", "Discover our pure organic products and add them to your cart.")}
      </p>
      <button onClick={() => navigate("/")}
        style={{ backgroundColor: P, color: "#fff", border: "none", borderRadius: 10, padding: "13px 32px", fontSize: 14, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: "pointer" }}>
        {t("পণ্য দেখুন", "Browse Products")}
      </button>
    </div>
  );
}
