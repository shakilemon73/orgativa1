import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { supabase, DbProduct } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { products as staticProducts, getCategoryLabel, getProductName, getProductWeight } from "@/data/products";
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Package, 
  Store,
  Grid,
  TrendingUp,
  X
} from "lucide-react";

const P = "#2D5A27";
const P_DARK = "#1a4016";

function productToDbProduct(p: typeof staticProducts[0]): DbProduct {
  return {
    id: p.id.toString(),
    slug: p.slug,
    name: p.name,
    category_label: p.category,
    category_slug: p.categorySlug,
    weight: p.weight,
    price: p.price,
    original_price: p.originalPrice ?? null,
    rating: p.rating,
    reviews: p.reviews,
    image: p.image,
    images: p.images,
    badge: p.badge ?? null,
    description: p.description,
    highlights: p.highlights,
    origin: p.origin,
    in_stock: p.inStock,
    featured: p.badge === "সেরা বিক্রয়" || p.badge === "প্রিমিয়াম",
    trending: p.badge === "সেরা বিক্রয়",
    display_order: typeof p.id === "number" ? p.id : (parseInt(p.id) || 1),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export default function AdminProducts() {
  const [, navigate] = useLocation();
  const { lang, t, formatPrice, formatNum } = useLanguage();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function loadProducts() {
    const staticDbProducts = staticProducts.map(productToDbProduct);
    if (!supabase) {
      setProducts(staticDbProducts);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.from("products").select("*").order("display_order");
      if (!data || data.length === 0) {
        setProducts(staticDbProducts);
      } else {
        setProducts(data);
      }
    } catch {
      setProducts(staticDbProducts);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  async function toggleStock(id: string, current: boolean) {
    if (!supabase) return;
    await supabase.from("products").update({ in_stock: !current }).eq("id", id);
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, in_stock: !current } : p));
    showToast(!current ? "Product marked as In Stock" : "Product marked as Out of Stock");
  }

  async function deleteProduct(id: string, name: string) {
    if (!supabase) return;
    if (!confirm(`Are you sure you want to delete "${name}"? This action is permanent.`)) return;
    setDeleting(id);
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
    showToast("Product successfully deleted.");
  }

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category_label.toLowerCase().includes(search.toLowerCase()))
    : products;

  // Compute metric summaries
  const totalInStock = products.filter(p => p.in_stock).length;
  const totalFeatured = products.filter(p => p.featured).length;

  return (
    <AdminLayout title="Product Inventory Catalog">
      {/* Premium Elegant Toast Notification */}
      {toast && (
        <div style={{ 
          position: "fixed", 
          bottom: 32, 
          right: 32, 
          backgroundColor: "#1F2937", 
          color: "#fff", 
          borderRadius: 14, 
          padding: "16px 24px", 
          fontSize: 13, 
          fontFamily: "'Inter',sans-serif", 
          fontWeight: 600, 
          zIndex: 9999, 
          boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <CheckCircle2 size={16} style={{ color: "#34D399" }} />
          <span>{toast}</span>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 24 }}>
        
        {/* KPI OVERVIEW BANNERS */}
        <div className="admin-grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: "Total Products", value: formatNum(products.length), icon: Package, color: P, bg: "#F4F7F3", desc: "Active items in store" },
            { label: "Available In Stock", value: formatNum(totalInStock), icon: CheckCircle2, color: "#059669", bg: "#ECFDF5", desc: "Ready for shipments" },
            { label: "Out of Stock", value: formatNum(products.length - totalInStock), icon: XCircle, color: "#DC2626", bg: "#FEF2F2", desc: "Disabled currently" },
            { label: "Premium & Featured", value: formatNum(totalFeatured), icon: Star, color: "#D97706", bg: "#FFFBEB", desc: "Promoted on homepage" },
          ].map((card, i) => (
            <div key={i} style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              border: "1px solid #EEF2ED",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.005)"
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: card.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <card.icon size={20} style={{ color: card.color }} />
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#6B726A", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>
                  {card.label}
                </p>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0, fontFamily: "'Inter', sans-serif" }}>
                  {card.value}
                </p>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0" }}>
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CONTROLS AREA (Search and Add Product) */}
        <div style={{ 
          display: "flex", 
          gap: 16, 
          marginBottom: 24, 
          flexWrap: "wrap", 
          alignItems: "center",
          justifyContent: "space-between" 
        }}>
          {/* Elegant Search Input */}
          <div style={{ flex: "1 1 280px", maxWidth: "100%", position: "relative" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#fff",
              border: "1.5px solid #E5EFE2",
              borderRadius: 14,
              padding: "0 16px",
              height: 46,
              transition: "all 0.2s"
            }} className="search-box-focus">
              <Search size={18} style={{ color: "#8BA088", marginRight: 10, flexShrink: 0 }} />
              <input
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search premium products by name or catalog labels..."
                style={{ 
                  width: "100%", 
                  border: "none", 
                  fontSize: 13, 
                  fontFamily: "'Inter',sans-serif", 
                  outline: "none", 
                  boxSizing: "border-box", 
                  backgroundColor: "transparent",
                  color: "#1F2937",
                  fontWeight: 500
                }}
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, color: "#99a896" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Premium Add Product Button */}
          <button onClick={() => navigate("/admin/products/new")}
            style={{ 
              backgroundColor: P, 
              color: "#fff", 
              border: "none", 
              borderRadius: 14, 
              padding: "12px 24px", 
              fontSize: 13, 
              fontWeight: 700, 
              fontFamily: "'Inter',sans-serif", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              whiteSpace: "nowrap",
              transition: "all 0.2s",
              boxShadow: "0 4px 14px rgba(45,90,39,0.2)"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P_DARK; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = P; e.currentTarget.style.transform = "none"; }}
          >
            <Plus size={16} />
            Add Premium Product
          </button>
        </div>

        {/* COMPREHENSIVE PRODUCTS TABLE CONTAINER */}
        <div style={{ 
          backgroundColor: "#fff", 
          borderRadius: 20, 
          border: "1px solid #EEF2ED", 
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.01)" 
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ backgroundColor: "#FAFBF9", borderBottom: "1px solid #EEF2ED" }}>
                  {["", "Product Details", "Category", "Price Grid", "Inventory Status", "Featured status", "Actions"].map((h, idx) => (
                    <th key={idx} style={{ 
                      padding: "16px 24px", 
                      textAlign: "left", 
                      fontSize: 10, 
                      fontWeight: 700, 
                      textTransform: "uppercase", 
                      letterSpacing: "0.08em", 
                      color: "#6B726A", 
                      fontFamily: "'Inter',sans-serif", 
                      whiteSpace: "nowrap" 
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #EEF2ED" }}>
                      {[44, "70%", 80, 60, 50, 50, 80].map((w, j) => (
                        <td key={j} style={{ padding: "16px 24px" }}>
                          {j === 0 ? (
                            <div style={{ width: 44, height: 44, backgroundColor: "#FAFBF9", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
                          ) : (
                            <div style={{ height: 14, backgroundColor: "#FAFBF9", borderRadius: 6, width: w, animation: "pulse 1.5s infinite" }} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 48, textAlign: "center", color: "#6B726A", fontFamily: "'Inter',sans-serif" }}>
                      {search ? "No products matched your search. Try another phrase." : "No premium products cataloged yet."}
                    </td>
                  </tr>
                ) : filtered.map((p) => {
                  const match = staticProducts.find((sp) => sp.slug === p.slug || sp.id.toString() === p.id);
                  const displayName = match ? getProductName(match, lang) : p.name;
                  const displayWeight = match ? getProductWeight(match, lang) : p.weight;
                  const displayCat = getCategoryLabel({ slug: p.category_slug, label: p.category_label }, lang);

                  return (
                    <tr key={p.id} 
                      style={{ 
                        borderBottom: "1px solid #EEF2ED",
                        transition: "background 0.15s"
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FAFBF9")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "")}
                    >
                      {/* Product Thumbnail */}
                      <td style={{ padding: "14px 24px" }}>
                        <div style={{ 
                          width: 52, 
                          height: 52, 
                          backgroundColor: "#FAFBF9", 
                          borderRadius: 12, 
                          overflow: "hidden", 
                          padding: 4,
                          border: "1px solid #EBF1EA",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <img src={p.image} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "contain" }} referrerPolicy="no-referrer" />
                        </div>
                      </td>

                      {/* Name & Weight */}
                      <td style={{ padding: "14px 24px" }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1F2937", fontFamily: "'Inter',sans-serif", margin: "0 0 2px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
                        <p style={{ fontSize: 11, color: "#6B726A", fontFamily: "'Inter',sans-serif", margin: 0, fontWeight: 500 }}>{displayWeight}</p>
                      </td>

                      {/* Category */}
                      <td style={{ padding: "14px 24px" }}>
                        <span style={{ 
                          fontSize: 12, 
                          color: "#4B5563", 
                          fontFamily: "'Inter',sans-serif",
                          fontWeight: 600,
                          backgroundColor: "#F3F4F6",
                          padding: "4px 10px",
                          borderRadius: 8
                        }}>{displayCat}</span>
                      </td>

                      {/* Price Grid */}
                      <td style={{ padding: "14px 24px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: P, fontFamily: "'Inter',sans-serif" }}>{formatPrice(p.price)}</span>
                        {p.original_price && (
                          <p style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "line-through", fontFamily: "'Inter',sans-serif", margin: "2px 0 0", fontWeight: 500 }}>
                            {formatPrice(p.original_price)}
                          </p>
                        )}
                      </td>

                      {/* Stock Status Selector Toggle */}
                      <td style={{ padding: "14px 24px" }}>
                        <button onClick={() => toggleStock(p.id, p.in_stock)}
                          style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: 6, 
                            fontSize: 11, 
                            fontWeight: 700, 
                            fontFamily: "'Inter',sans-serif", 
                            padding: "6px 12px", 
                            borderRadius: 10, 
                            border: "none", 
                            cursor: "pointer", 
                            backgroundColor: p.in_stock ? "#ECFDF5" : "#FEF2F2", 
                            color: p.in_stock ? "#047857" : "#B91C1C",
                            transition: "all 0.15s"
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                        >
                          <span style={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: "50%", 
                            backgroundColor: p.in_stock ? "#10B981" : "#EF4444" 
                          }} />
                          {p.in_stock ? "In Stock" : "Out of Stock"}
                        </button>
                      </td>

                      {/* Featured Promotion Toggle */}
                      <td style={{ padding: "14px 24px" }}>
                        <button onClick={async () => {
                          if (!supabase) return;
                          await supabase.from("products").update({ featured: !p.featured }).eq("id", p.id);
                          setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, featured: !p.featured } : x));
                          showToast(!p.featured ? "Product featured on homepage" : "Product removed from featured lists");
                        }}
                          style={{ 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: 6, 
                            fontSize: 11, 
                            fontFamily: "'Inter',sans-serif", 
                            fontWeight: 600,
                            padding: "6px 12px", 
                            borderRadius: 10, 
                            border: "1px solid #E5E7EB", 
                            cursor: "pointer", 
                            backgroundColor: p.featured ? "#FFFBEB" : "#fff", 
                            color: p.featured ? "#B45309" : "#6B726A",
                            transition: "all 0.15s"
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9CA3AF"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
                        >
                          <Star size={12} fill={p.featured ? "#D97706" : "none"} stroke={p.featured ? "#D97706" : "currentColor"} />
                          {p.featured ? "Featured" : "Standard"}
                        </button>
                      </td>

                      {/* Action Menu Buttons */}
                      <td style={{ padding: "14px 24px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          {/* Edit Item */}
                          <button onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                            aria-label="Edit product details"
                            style={{ 
                              width: 34, 
                              height: 34, 
                              borderRadius: 10, 
                              border: "1px solid #E5E7EB", 
                              backgroundColor: "#fff", 
                              cursor: "pointer", 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center",
                              transition: "all 0.15s",
                              color: "#4B5563"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = P; e.currentTarget.style.backgroundColor = "#F4F7F3"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#4B5563"; e.currentTarget.style.backgroundColor = "#fff"; }}
                          >
                            <Edit size={14} />
                          </button>

                          {/* Delete Item */}
                          <button onClick={() => deleteProduct(p.id, p.name)}
                            disabled={deleting === p.id}
                            aria-label="Delete product"
                            style={{ 
                              width: 34, 
                              height: 34, 
                              borderRadius: 10, 
                              border: "1px solid #FEE2E2", 
                              backgroundColor: "#FEF2F2", 
                              cursor: "pointer", 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center",
                              transition: "all 0.15s",
                              color: "#DC2626"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FEE2E2"; e.currentTarget.style.borderColor = "#F87171"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FEF2F2"; e.currentTarget.style.borderColor = "#FEE2E2"; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Stats */}
          {!loading && (
            <div style={{ 
              padding: "16px 24px", 
              borderTop: "1px solid #EEF2ED", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              backgroundColor: "#FAFBF9"
            }}>
              <span style={{ fontSize: 12, color: "#6B726A", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>
                Total items cataloged: <strong style={{ color: P, fontSize: 13 }}>{formatNum(filtered.length)}</strong>
              </span>
              <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'Inter',sans-serif" }}>
                Orgativa Inventory Database System V2
              </span>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
