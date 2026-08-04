import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { getProductName, getProductWeight, getProductBadge, getCategoryLabel, type Product } from "@/data/products";
import { useProducts, useCategories } from "@/lib/supabase-hooks";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useResponsive } from "@/hooks/use-responsive";

const P = "#2D5A27";

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`material-symbols-outlined${s <= rating ? " fill" : ""}`}
          style={{ fontSize: 13, color: s <= rating ? P : "#C3C8C1" }}>star</span>
      ))}
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { isMobile, isTablet } = useResponsive();
  const { data: allProducts } = useProducts();
  const { data: categories } = useCategories();
  const { lang, t, formatPrice, formatNum } = useLanguage();

  const category = categories.find((c) => c.slug === slug);
  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sortOptions = [
    { value: "featured", label: t("বিশেষ পছন্দ", "Featured") },
    { value: "price-asc", label: t("দাম: কম থেকে বেশি", "Price: Low to High") },
    { value: "price-desc", label: t("দাম: বেশি থেকে কম", "Price: High to Low") },
    { value: "rating", label: t("সেরা রেটিং", "Highest Rated") },
  ];

  const filtered = useMemo(() => {
    let list = slug === "all" ? allProducts : allProducts.filter((p) => p.categorySlug === slug);
    list = list.filter((p) => p.price <= maxPrice && p.rating >= minRating);
    if (sortBy === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [slug, sortBy, maxPrice, minRating, allProducts]);

  const displayName = category ? getCategoryLabel(category, lang) : (slug === "all" ? t("সব পণ্য", "All Products") : slug);
  const px = isMobile ? "16px" : isTablet ? "24px" : "64px";

  return (
    <div style={{ backgroundColor: "#F9F9F9", minHeight: "100vh" }}>
      <Header />

      {/* Hero banner */}
      <div style={{ backgroundColor: "#0B2013", color: "#fff", padding: isMobile ? "28px 20px" : "48px 64px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}
              style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontFamily: "'Inter',sans-serif" }}>
              {t("হোম", "Home")}
            </a>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>chevron_right</span>
            <span style={{ fontSize: 12, color: "#fff", fontFamily: "'Inter',sans-serif" }}>{displayName}</span>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {category && (
              <div style={{ width: isMobile ? 44 : 56, height: isMobile ? 44 : 56, backgroundColor: "rgba(45,90,39,0.3)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: isMobile ? 24 : 30, color: "#6daf67" }}>{category.icon}</span>
              </div>
            )}
            <div>
              <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: isMobile ? 26 : 40, fontWeight: 400, color: "#fff", lineHeight: 1.2 }}>{displayName}</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "'Inter',sans-serif", marginTop: 4 }}>
                {formatNum(filtered.length)} {t("টি পণ্য · হাতে বাছাই জৈব পণ্য", "products · Hand-picked organic items")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: `${isMobile ? 20 : 40}px ${px} 80px` }}>

        {/* Mobile: filter toggle + sort bar */}
        {isMobile && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${filtersOpen ? P : "#E8E8E8"}`, backgroundColor: filtersOpen ? "#DFF2D8" : "#fff", color: filtersOpen ? P : "#434843", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: "pointer" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>filter_list</span>
              {t("ফিল্টার", "Filters")}
            </button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              style={{ flex: 1, border: "1px solid #E8E8E8", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "'Inter',sans-serif", backgroundColor: "#fff", color: "#1A1C1C", cursor: "pointer", outline: "none" }}>
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        {/* Mobile filters panel */}
        {isMobile && filtersOpen && (
          <div style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid #E8E8E8", padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#737973", marginBottom: 10, fontFamily: "'Inter',sans-serif" }}>
                {t("সর্বোচ্চ দাম", "MAX PRICE")}
              </h4>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontFamily: "'Inter',sans-serif", color: "#434843" }}>৳০</span>
                <span style={{ fontSize: 12, fontFamily: "'Inter',sans-serif", color: P, fontWeight: 600 }}>{formatPrice(maxPrice)}</span>
              </div>
              <input type="range" min={500} max={5000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: "100%", accentColor: P }} />
            </div>
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#737973", marginBottom: 10, fontFamily: "'Inter',sans-serif" }}>
                {t("বিভাগ", "CATEGORIES")}
              </h4>
              <div className="scroll-x" style={{ display: "flex", gap: 8 }}>
                <FilterChip label={t("সব পণ্য", "All Products")} active={slug === "all"} onClick={() => navigate("/category/all")} />
                {categories.map((c) => (
                  <FilterChip key={c.slug} label={getCategoryLabel(c, lang)} active={c.slug === slug} onClick={() => navigate(`/category/${c.slug}`)} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "260px 1fr", gap: 32, alignItems: "start" }}>

          {/* Desktop sidebar */}
          {!isMobile && (
            <aside style={{ position: "sticky", top: 100 }}>
              <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E8E8E8", overflow: "hidden" }}>
                <div style={{ padding: "18px 22px", borderBottom: "1px solid #E8E8E8" }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#1A1C1C", fontFamily: "'Inter',sans-serif" }}>
                    {t("ফিল্টার", "FILTERS")}
                  </h3>
                </div>
                <div style={{ padding: "18px 22px", borderBottom: "1px solid #E8E8E8" }}>
                  <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#737973", marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>
                    {t("বিভাগ", "CATEGORIES")}
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <FilterCatItem label={t("সব পণ্য", "All Products")} slug="all" active={slug === "all"} />
                    {categories.map((c) => <FilterCatItem key={c.slug} label={getCategoryLabel(c, lang)} slug={c.slug} active={c.slug === slug} count={c.count} formatNum={formatNum} />)}
                  </div>
                </div>
                <div style={{ padding: "18px 22px", borderBottom: "1px solid #E8E8E8" }}>
                  <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#737973", marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>
                    {t("সর্বোচ্চ দাম", "MAX PRICE")}
                  </h4>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontFamily: "'Inter',sans-serif", color: "#434843" }}>৳০</span>
                    <span style={{ fontSize: 12, fontFamily: "'Inter',sans-serif", color: P, fontWeight: 600 }}>{formatPrice(maxPrice)}</span>
                  </div>
                  <input type="range" min={500} max={5000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: "100%", accentColor: P }} />
                </div>
                <div style={{ padding: "18px 22px" }}>
                  <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#737973", marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>
                    {t("সর্বনিম্ন রেটিং", "MIN RATING")}
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[0, 3, 4, 5].map((r) => (
                      <button key={r} onClick={() => setMinRating(r)}
                        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "3px 0", textAlign: "left" }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${minRating === r ? P : "#C3C8C1"}`, backgroundColor: minRating === r ? P : "transparent", flexShrink: 0 }} />
                        {r === 0
                          ? <span style={{ fontSize: 13, fontFamily: "'Inter',sans-serif", color: "#434843" }}>{t("সব রেটিং", "All Ratings")}</span>
                          : <div style={{ display: "flex", gap: 2 }}>{[1,2,3,4,5].map((s) => <span key={s} className={`material-symbols-outlined${s<=r?" fill":""}`} style={{ fontSize: 13, color: s<=r?P:"#C3C8C1" }}>star</span>)}<span style={{ fontSize: 12, color: "#737973", marginLeft: 4, fontFamily: "'Inter',sans-serif" }}>{t("ও বেশি", "& Up")}</span></div>
                        }
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Product grid */}
          <div>
            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <span style={{ fontSize: 14, color: "#737973", fontFamily: "'Inter',sans-serif" }}>
                  <strong style={{ color: "#1A1C1C" }}>{formatNum(filtered.length)}</strong> {t("টি ফলাফল", "results")}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, color: "#737973", fontFamily: "'Inter',sans-serif" }}>
                    {t("সাজান:", "Sort by:")}
                  </span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    style={{ border: "1px solid #E8E8E8", borderRadius: 8, padding: "7px 12px", fontSize: 13, fontFamily: "'Inter',sans-serif", backgroundColor: "#fff", color: "#1A1C1C", cursor: "pointer", outline: "none" }}>
                    {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0", color: "#737973", fontFamily: "'Inter',sans-serif" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 44, display: "block", marginBottom: 14, color: "#C3C8C1" }}>search_off</span>
                <p style={{ fontSize: 15 }}>{t("কোনো পণ্য পাওয়া যায়নি", "No products found")}</p>
                <button onClick={() => { setMaxPrice(5000); setMinRating(0); }}
                  style={{ marginTop: 14, background: P, color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontSize: 13, fontFamily: "'Inter',sans-serif" }}>
                  {t("ফিল্টার রিসেট করুন", "Reset Filters")}
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: isMobile ? 12 : 20 }}>
                {filtered.map((p) => <CategoryProductCard key={p.id} product={p} compact={isMobile} lang={lang} formatPrice={formatPrice} formatNum={formatNum} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ padding: "6px 14px", borderRadius: 999, border: active ? `1.5px solid ${P}` : "1.5px solid #E8E8E8", backgroundColor: active ? P : "#fff", color: active ? "#fff" : "#434843", fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
      {label}
    </button>
  );
}

function FilterCatItem({ label, slug, active, count, formatNum }: { label: string; slug: string; active: boolean; count?: number; formatNum?: (n: number) => string }) {
  const [, navigate] = useLocation();
  return (
    <button onClick={() => navigate(slug === "all" ? "/category/all" : `/category/${slug}`)}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 8, border: "none", cursor: "pointer", backgroundColor: active ? "#DFF2D8" : "transparent", textAlign: "left" }}>
      <span style={{ fontSize: 13, color: active ? P : "#434843", fontWeight: active ? 600 : 400, fontFamily: "'Inter',sans-serif" }}>{label}</span>
      {count !== undefined && <span style={{ fontSize: 11, color: active ? P : "#737973", fontFamily: "'Inter',sans-serif" }}>{formatNum ? formatNum(count) : count}</span>}
    </button>
  );
}

function CategoryProductCard({ product, compact, lang, formatPrice, formatNum }: { product: Product; compact?: boolean; lang: "bn" | "en"; formatPrice: (p: number) => string; formatNum: (n: number | string) => string }) {
  const [hovered, setHovered] = useState(false);
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const name = getProductName(product, lang);
  const weight = getProductWeight(product, lang);
  const badge = getProductBadge(product, lang);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  return (
    <div className="hover-lift" style={{ backgroundColor: "#fff", borderRadius: compact ? 12 : 14, overflow: "hidden", border: "1px solid #E8E8E8", cursor: "pointer" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/products/${product.slug}`)}>
      <div style={{ aspectRatio: "1/1", backgroundColor: "#F3F3F4", padding: compact ? 16 : 24, position: "relative", overflow: "hidden" }}>
        <img src={product.image} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain", transform: hovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.5s" }} />
        {discount && <div style={{ position: "absolute", top: 8, right: 8, backgroundColor: "#D64545", color: "#fff", padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>-{formatNum(discount)}%</div>}
        {badge && <div style={{ position: "absolute", top: 8, left: 8, backgroundColor: P, color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif" }}>{badge}</div>}
      </div>
      <div style={{ padding: compact ? "10px 12px 12px" : "16px 18px" }}>
        <div style={{ display: "flex", gap: 2, marginBottom: 5 }}>
          <StarRating rating={product.rating} />
          <span style={{ fontSize: 10, color: "#a8a29e", marginLeft: 3, fontFamily: "'Inter',sans-serif" }}>({formatNum(product.reviews)})</span>
        </div>
        <h4 style={{ fontFamily: "'Noto Serif',serif", fontSize: compact ? 14 : 17, color: hovered ? P : "#1A1C1C", fontWeight: 400, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</h4>
        <p style={{ fontSize: 11, color: "#a8a29e", marginBottom: 10, fontFamily: "'Inter',sans-serif" }}>{weight}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: compact ? 15 : 17, fontFamily: "'Inter',sans-serif", color: "#1A1C1C" }}>{formatPrice(product.price)}</span>
            {product.originalPrice && !compact && <span style={{ fontSize: 12, color: "#a8a29e", textDecoration: "line-through", marginLeft: 5, fontFamily: "'Inter',sans-serif" }}>{formatPrice(product.originalPrice)}</span>}
          </div>
          <button onClick={(e) => { e.stopPropagation(); addItem(product); }}
            style={{ backgroundColor: P, color: "#fff", width: compact ? 32 : 36, height: compact ? 32 : 36, borderRadius: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(45,90,39,0.25)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add_shopping_cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
