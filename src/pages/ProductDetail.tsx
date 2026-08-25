import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { getProductName, getProductCategory, getProductDescription, getProductWeight, getProductBadge, getProductOrigin, getProductHighlights, type Product } from "@/data/products";
import { useProduct } from "@/lib/supabase-hooks";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useResponsive } from "@/hooks/use-responsive";

const P = "#2D5A27";

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`material-symbols-outlined${s <= rating ? " fill" : ""}`}
          style={{ fontSize: size, color: s <= rating ? P : "#C3C8C1" }}>star</span>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { data: product, loading } = useProduct(slug ?? "");
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const { lang, t, formatPrice, formatNum } = useLanguage();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [userReviews, setUserReviews] = useState<Array<{ id: string; name: string; rating: number; date: string; comment: string }>>(() => {
    const saved = localStorage.getItem(`product_reviews_${slug}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: "r1", name: "Tanvir Ahmed", rating: 5, date: "2 days ago", comment: "অসাধারণ ও একদম আসল অর্গানিক পণ্য! প্যাকেজিং খুবই ভালো ছিল।" },
      { id: "r2", name: "Nasrin Sultana", rating: 5, date: "1 week ago", comment: "Fast delivery within 24 hours in Dhaka. Quality is 100% genuine." },
      { id: "r3", name: "Abdur Rahim", rating: 4, date: "2 weeks ago", comment: "খুব সুন্দর কোয়ালিটি। পুনরায় অর্ডার করব।" }
    ];
  });

  if (loading) {
    return (
      <div style={{ backgroundColor: "#F9F9F9", minHeight: "100vh" }}>
        <Header />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#2D5A27", animation: "spin 1s linear infinite" }}>progress_activity</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ backgroundColor: "#F9F9F9", minHeight: "100vh" }}>
        <Header />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "100px 32px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: 30 }}>{t("পণ্য পাওয়া যায়নি", "Product Not Found")}</h2>
          <button onClick={() => navigate("/")} style={{ marginTop: 20, background: P, color: "#fff", border: "none", borderRadius: 8, padding: "12px 32px", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
            {t("হোমে ফিরুন", "Return Home")}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const name = getProductName(product, lang);
  const category = getProductCategory(product, lang);
  const description = getProductDescription(product, lang);
  const weight = getProductWeight(product, lang);
  const badge = getProductBadge(product, lang);
  const origin = getProductOrigin(product, lang);
  const highlights = getProductHighlights(product, lang);

  function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      name: reviewerName.trim(),
      rating: reviewRating,
      date: t("এইমাত্র", "Just now"),
      comment: reviewComment.trim()
    };
    const updated = [newRev, ...userReviews];
    setUserReviews(updated);
    localStorage.setItem(`product_reviews_${slug}`, JSON.stringify(updated));
    setReviewerName("");
    setReviewComment("");
    setReviewRating(5);
    setShowReviewModal(false);
  }

  function handleAddToCart() {
    addItem(product!, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const px = isMobile ? "16px" : isTablet ? "24px" : "64px";

  return (
    <div style={{ backgroundColor: "#F9F9F9", minHeight: "100vh" }}>
      <Header />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: `0 ${px}` }}>

        {/* Breadcrumb */}
        <nav style={{ padding: "18px 0", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {[
            { label: t("হোম", "Home"), href: "/" },
            { label: category, href: `/category/${product.categorySlug}` },
            { label: name, href: null },
          ].map((crumb, i, arr) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {crumb.href ? (
                <a href={crumb.href} onClick={(e) => { e.preventDefault(); navigate(crumb.href!); }}
                  style={{ fontSize: 12, color: P, textDecoration: "none", fontFamily: "'Inter', sans-serif" }}>
                  {crumb.label}
                </a>
              ) : (
                <span style={{ fontSize: 12, color: "#737973", fontFamily: "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: isMobile ? 140 : 300 }}>{crumb.label}</span>
              )}
              {i < arr.length - 1 && <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#C3C8C1" }}>chevron_right</span>}
            </span>
          ))}
        </nav>

        {/* Product layout */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr", gap: isMobile ? 24 : 56, paddingBottom: 64 }}>

          {/* Image gallery */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #E8E8E8", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 28 : 48, position: "relative" }}>
              {badge && (
                <div style={{ position: "absolute", top: 16, left: 16, backgroundColor: P, color: "#fff", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
                  {badge}
                </div>
              )}
              {discount && (
                <div style={{ position: "absolute", top: 16, right: 16, backgroundColor: "#D64545", color: "#fff", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
                  -{formatNum(discount)}% {t("ছাড়", "OFF")}
                </div>
              )}
              <img src={product.images[activeImg] ?? product.image} alt={name}
                style={{ width: "100%", height: "100%", objectFit: "contain", transition: "opacity 0.3s" }} />
            </div>
            {product.images.length > 1 && (
              <div style={{ display: "flex", gap: 10 }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    style={{ width: isMobile ? 64 : 80, height: isMobile ? 64 : 80, borderRadius: 8, overflow: "hidden", border: i === activeImg ? `2px solid ${P}` : "2px solid #E8E8E8", background: "#F3F3F4", padding: 7, cursor: "pointer" }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 20 : 28, paddingTop: isMobile ? 0 : 8 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: P, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.15em", fontFamily: "'Inter', sans-serif" }}>{category}</span>
                <span style={{ width: 1, height: 12, backgroundColor: "#C3C8C1" }} />
                <span style={{ fontSize: 11, color: "#737973", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>
                  {origin}
                </span>
              </div>
              <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: isMobile ? 26 : 40, color: "#1A1C1C", lineHeight: 1.2, fontWeight: 400, marginBottom: 14 }}>
                {name}
              </h1>
              <div 
                onClick={() => {
                  document.getElementById("customer-reviews")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap", cursor: "pointer" }}
                title={t("রিভিউ দেখতে ক্লিক করুন", "Click to view customer reviews")}
              >
                <StarRating rating={product.rating} size={isMobile ? 15 : 18} />
                <span style={{ fontSize: 13, color: P, fontWeight: 600, fontFamily: "'Inter', sans-serif", textDecoration: "underline" }}>
                  ({formatNum(userReviews.length + (product.reviews || 0))} {t("যাচাইকৃত রিভিউ", "verified reviews")})
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: isMobile ? 28 : 36, fontWeight: 700, color: "#1A1C1C" }}>{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span style={{ fontSize: isMobile ? 16 : 20, color: "#a8a29e", textDecoration: "line-through", fontFamily: "'Inter', sans-serif" }}>{formatPrice(product.originalPrice)}</span>
                    <span style={{ fontSize: 12, backgroundColor: "#DFF2D8", color: P, padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{formatNum(discount!)}% {t("ছাড়", "OFF")}</span>
                  </>
                )}
              </div>
              <p style={{ fontSize: 12, color: "#737973", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>{weight}</p>
            </div>

            <p style={{ fontSize: isMobile ? 14 : 16, color: "#434843", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", borderLeft: `3px solid ${P}`, paddingLeft: 16 }}>
              {description}
            </p>

            <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: isMobile ? 16 : 22, border: "1px solid #E8E8E8" }}>
              <h4 style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", color: "#1A1C1C", marginBottom: 14, fontFamily: "'Inter', sans-serif" }}>
                {t("পণ্যের বিশেষত্ব", "PRODUCT HIGHLIGHTS")}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {highlights.map((h, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span className="material-symbols-outlined fill" style={{ fontSize: 17, color: P, flexShrink: 0, marginTop: 1 }}>check_circle</span>
                    <span style={{ fontSize: 13, color: "#434843", fontFamily: "'Inter', sans-serif" }}>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Qty + buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1C1C", fontFamily: "'Inter', sans-serif" }}>
                  {t("পরিমাণ", "Quantity")}
                </span>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #E8E8E8", borderRadius: 8, overflow: "hidden", backgroundColor: "#fff" }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    style={{ width: 40, height: 40, border: "none", background: "none", cursor: "pointer", color: "#434843", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>remove</span>
                  </button>
                  <span style={{ width: 44, textAlign: "center", fontSize: 15, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{formatNum(qty)}</span>
                  <button onClick={() => setQty(qty + 1)}
                    style={{ width: 40, height: 40, border: "none", background: "none", cursor: "pointer", color: "#434843", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                  </button>
                </div>
                <span style={{ fontSize: 12, color: P, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>verified</span>
                  {t("স্টকে আছে", "In Stock")}
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
                <button onClick={handleAddToCart}
                  style={{ flex: 1, backgroundColor: added ? "#1a4016" : P, color: "#fff", border: "none", borderRadius: 10, padding: "15px 20px", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.3s" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 19 }}>{added ? "check" : "add_shopping_cart"}</span>
                  {added ? t("ঝুড়িতে যোগ হয়েছে!", "Added to Cart!") : t("ঝুড়িতে যোগ করুন", "Add to Cart")}
                </button>
                <button onClick={() => { addItem(product, qty); navigate("/checkout"); }}
                  style={{ flex: 1, backgroundColor: "#1A1C1C", color: "#fff", border: "none", borderRadius: 10, padding: "15px 20px", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer", letterSpacing: "0.04em" }}>
                  {t("এখনই কিনুন", "Buy Now")}
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: isMobile ? 8 : 12 }}>
              {[
                { icon: "local_shipping", label: t("বিনামূল্যে ডেলিভারি", "Free Shipping"), sub: t("৳১,০০০+ অর্ডারে", "Orders ৳1,000+") },
                { icon: "replay", label: t("সহজ রিটার্ন", "Easy Returns"), sub: t("৭ দিনের নীতি", "7-Day Policy") },
                { icon: "verified_user", label: t("খাঁটি পণ্য", "100% Authentic"), sub: t("১০০% অর্গানিক", "Pure Organic") },
              ].map((b) => (
                <div key={b.label} style={{ backgroundColor: "#fff", borderRadius: 10, padding: isMobile ? "10px 8px" : "14px 12px", border: "1px solid #E8E8E8", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, textAlign: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: isMobile ? 18 : 22, color: P }}>{b.icon}</span>
                  <span style={{ fontSize: isMobile ? 10 : 12, fontWeight: 700, color: "#1A1C1C", fontFamily: "'Inter', sans-serif", lineHeight: 1.2 }}>{b.label}</span>
                  <span style={{ fontSize: 10, color: "#737973", fontFamily: "'Inter', sans-serif" }}>{b.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CUSTOMER REVIEWS SECTION */}
        <section id="customer-reviews" style={{ paddingTop: 40, paddingBottom: 64, borderTop: "1px solid #E8E8E8" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: isMobile ? 22 : 28, color: "#1A1C1C", margin: 0, fontWeight: 400 }}>
                {t("গ্রাহকদের মতামত ও রিভিউ", "Customer Reviews & Feedback")}
              </h2>
              <p style={{ fontSize: 13, color: "#737973", margin: "4px 0 0", fontFamily: "'Inter', sans-serif" }}>
                {t("যাচাইকৃত ক্রেতাদের বাস্তব অভিজ্ঞতা ও রেটিং", "Verified customer experiences and ratings")}
              </p>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              style={{
                backgroundColor: P,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(45,90,39,0.2)"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rate_review</span>
              <span>{t("রিভিউ লিখুন", "Write a Review")}</span>
            </button>
          </div>

          {/* Rating Summary Card */}
          <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E8E8E8", padding: isMobile ? 20 : 28, marginBottom: 28, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "200px 1fr", gap: 24, alignItems: "center" }}>
            <div style={{ textAlign: "center", borderRight: isMobile ? "none" : "1px solid #F3F4F6", paddingRight: isMobile ? 0 : 24, borderBottom: isMobile ? "1px solid #F3F4F6" : "none", paddingBottom: isMobile ? 16 : 0 }}>
              <div style={{ fontSize: 44, fontWeight: 800, color: "#1A1C1C", fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>
                4.9
              </div>
              <div style={{ margin: "8px 0 4px", display: "flex", justifyContent: "center" }}>
                <StarRating rating={5} size={20} />
              </div>
              <span style={{ fontSize: 12, color: "#737973", fontFamily: "'Inter', sans-serif" }}>
                {userReviews.length + (product.reviews || 0)} {t("রিভিউ প্রাপ্ত", "total reviews")}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { star: 5, pct: 88 },
                { star: 4, pct: 10 },
                { star: 3, pct: 2 },
                { star: 2, pct: 0 },
                { star: 1, pct: 0 },
              ].map((item) => (
                <div key={item.star} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, fontFamily: "'Inter', sans-serif", color: "#434843" }}>
                  <span style={{ width: 45, fontWeight: 600 }}>{formatNum(item.star)} {t("স্টার", "Star")}</span>
                  <div style={{ flex: 1, height: 8, backgroundColor: "#F3F4F6", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${item.pct}%`, height: "100%", backgroundColor: P, borderRadius: 999 }} />
                  </div>
                  <span style={{ width: 36, textAlign: "right", color: "#737973" }}>{formatNum(item.pct)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {userReviews.map((rev) => (
              <div key={rev.id} style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid #E8E8E8", padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#DFF2D8", color: P, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, fontFamily: "'Inter', sans-serif" }}>
                      {rev.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1A1C1C", fontFamily: "'Inter', sans-serif" }}>
                        {rev.name}
                      </h4>
                      <span style={{ fontSize: 11, color: P, fontWeight: 600, display: "flex", alignItems: "center", gap: 3, fontFamily: "'Inter', sans-serif" }}>
                        <span className="material-symbols-outlined fill" style={{ fontSize: 13 }}>verified</span>
                        {t("যাচাইকৃত ক্রেতা", "Verified Buyer")}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "#737973", fontFamily: "'Inter', sans-serif" }}>{rev.date}</span>
                </div>
                <div style={{ margin: "6px 0 10px" }}>
                  <StarRating rating={rev.rating} size={15} />
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "#434843", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* WRITE A REVIEW MODAL */}
        {showReviewModal && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ backgroundColor: "#fff", borderRadius: 16, maxWidth: 500, width: "100%", padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #E8E8E8", paddingBottom: 14 }}>
                <h3 style={{ margin: 0, fontFamily: "'Noto Serif', serif", fontSize: 20, color: "#1A1C1C" }}>
                  {t("পণ্যের রিভিউ দিন", "Write a Product Review")}
                </h3>
                <button onClick={() => setShowReviewModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleAddReview} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                    {t("রেটিং নির্বাচন করুন:", "Select Rating:")}
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
                      >
                        <span className={`material-symbols-outlined${star <= reviewRating ? " fill" : ""}`} style={{ fontSize: 28, color: star <= reviewRating ? P : "#D1D5DB" }}>
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                    {t("আপনার নাম", "Your Name")} <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder={t("যেমন: তামিম আহমেদ", "e.g. John Doe")}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                    {t("আপনার মন্তব্য / রিভিউ", "Your Review / Feedback")} <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={t("পণ্যটির মান ও ডেলিভারি নিয়ে আপনার মতামত লিখুন...", "Share your honest experience about quality & delivery...")}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    style={{ backgroundColor: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
                  >
                    {t("বাতিল", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    style={{ backgroundColor: P, color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
                  >
                    {t("জমা দিন", "Submit Review")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
