import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import AdminLayout from "./AdminLayout";
import ImageUploader from "@/components/ImageUploader";
import { supabase, DbProduct, DbCategory } from "@/lib/supabase";
import { categories as staticCategories, getCategoryLabel } from "@/data/products";
import { useLanguage } from "@/context/LanguageContext";
import { 
  ArrowLeft, 
  Sparkles, 
  DollarSign, 
  Award, 
  BookOpen, 
  Image as ImageIcon, 
  Settings, 
  Check, 
  Loader2, 
  Save, 
  AlertTriangle, 
  Tag, 
  Globe, 
  Inbox,
  Star,
  Activity,
  ArrowUpRight
} from "lucide-react";

const P = "#2D5A27";
const P_DARK = "#1a4016";

function categoryToDbCategory(c: typeof staticCategories[0], index: number): DbCategory {
  return {
    id: (index + 1).toString(),
    slug: c.slug,
    label: c.label,
    icon: c.icon,
    image_url: c.image,
    product_count: c.count,
    display_order: index + 1,
    created_at: new Date().toISOString(),
  };
}

type FormData = {
  slug: string;
  name: string;
  category_label: string;
  category_slug: string;
  weight: string;
  price: string;
  original_price: string;
  rating: string;
  reviews: string;
  image: string;
  images_raw: string;
  badge: string;
  description: string;
  highlights_raw: string;
  origin: string;
  in_stock: boolean;
  featured: boolean;
  trending: boolean;
  display_order: string;
};

const EMPTY: FormData = {
  slug: "", name: "", category_label: "", category_slug: "", weight: "",
  price: "", original_price: "", rating: "5", reviews: "0",
  image: "", images_raw: "", badge: "", description: "", highlights_raw: "",
  origin: "", in_stock: true, featured: false, trending: false, display_order: "0",
};

const inStyle: React.CSSProperties = {
  width: "100%", 
  border: "1.5px solid #E5EFE2", 
  borderRadius: 12,
  padding: "12px 16px", 
  fontSize: 13, 
  fontFamily: "'Inter',sans-serif",
  color: "#1F2937", 
  outline: "none", 
  boxSizing: "border-box", 
  backgroundColor: "#FAFBF9", 
  transition: "all 0.2s",
  fontWeight: 500,
};

function F({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B726A", fontFamily: "'Inter',sans-serif" }}>
        {label}{required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

export default function AdminProductForm() {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { lang, t } = useLanguage();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const staticDbCategories = staticCategories.map(categoryToDbCategory);
    if (!supabase) {
      setCategories(staticDbCategories);
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const { data } = await supabase!.from("categories").select("*").order("display_order");
        if (!data || data.length === 0) {
          setCategories(staticDbCategories);
        } else {
          setCategories(data);
        }
      } catch {
        setCategories(staticDbCategories);
      }

      if (isEdit && id) {
        const { data: p } = await supabase!.from("products").select("*").eq("id", id).single();
        if (p) {
          setForm({
            slug: p.slug, name: p.name, category_label: p.category_label, category_slug: p.category_slug,
            weight: p.weight, price: String(p.price), original_price: p.original_price ? String(p.original_price) : "",
            rating: String(p.rating), reviews: String(p.reviews), image: p.image,
            images_raw: p.images.join("\n"), badge: p.badge ?? "", description: p.description,
            highlights_raw: p.highlights.join("\n"), origin: p.origin, in_stock: p.in_stock,
            featured: p.featured, trending: p.trending, display_order: String(p.display_order),
          });
        }
        setLoading(false);
      }
    }

    loadData();
  }, [id, isEdit]);

  function set(key: keyof FormData, val: any) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const catSlug = form.category_slug.trim();
    if (!catSlug) {
      setError("Please select a category.");
      setSaving(false);
      return;
    }

    const catObj = categories.find((c) => c.slug === catSlug);
    const catLabel = form.category_label.trim() || catObj?.label || catSlug;

    if (!supabase) {
      // Local development fallback
      navigate("/admin/products");
      return;
    }

    try {
      // Ensure category exists in categories table to satisfy FOREIGN KEY constraint products_category_slug_fkey
      const { error: catErr } = await supabase.from("categories").upsert({
        slug: catSlug,
        label: catLabel,
        icon: catObj?.icon || "category",
        image_url: catObj?.image_url || null,
        display_order: catObj?.display_order || 1,
      }, { onConflict: "slug" });

      if (catErr) {
        console.warn("Category upsert notice:", catErr.message);
      }

      const payload: Record<string, unknown> = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        category_label: catLabel,
        category_slug: catSlug,
        weight: form.weight.trim(),
        price: parseInt(form.price) || 0,
        original_price: form.original_price ? parseInt(form.original_price) : null,
        rating: parseInt(form.rating) || 5,
        reviews: parseInt(form.reviews) || 0,
        image: form.image.trim(),
        images: form.images_raw.split("\n").map(s => s.trim()).filter(Boolean),
        badge: form.badge.trim() || null,
        description: form.description.trim(),
        highlights: form.highlights_raw.split("\n").map(s => s.trim()).filter(Boolean),
        origin: form.origin.trim(),
        in_stock: form.in_stock,
        featured: form.featured,
        trending: form.trending,
        display_order: parseInt(form.display_order) || 0,
      };

      if (isEdit) {
        const { error: err } = await supabase.from("products").update(payload).eq("id", id);
        if (err) { setError(err.message); setSaving(false); return; }
      } else {
        const { error: err } = await supabase.from("products").insert(payload);
        if (err) { setError(err.message); setSaving(false); return; }
      }

      navigate("/admin/products");
    } catch (e: any) {
      setError(e.message || "Failed to save product.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout title={isEdit ? "Edit Product" : "New Product"}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, gap: 12 }}>
          <Loader2 size={32} className="animate-spin" style={{ color: P }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6B726A" }}>
            Retreiving item payload records...
          </span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? "Modify Product File" : "Append New Catalog Item"}>
      <div style={{ maxWidth: 1080, margin: "0 auto", paddingBottom: 48 }}>
        
        {/* Navigation back button */}
        <button onClick={() => navigate("/admin/products")}
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 8, 
            background: "none", 
            border: "none", 
            cursor: "pointer", 
            color: P, 
            fontSize: 13, 
            fontFamily: "'Inter',sans-serif", 
            marginBottom: 24, 
            fontWeight: 700,
            transition: "all 0.2s" 
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = P_DARK; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = P; }}
        >
          <ArrowLeft size={16} />
          Back to Inventory Catalog
        </button>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* SECTION 1: BASIC INFO */}
          <div style={{ 
            backgroundColor: "#fff", 
            borderRadius: 20, 
            border: "1px solid #EEF2ED", 
            padding: "28px 32px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.005)"
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 24px", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 8 }}>
              <Tag size={16} style={{ color: P }} /> IDENTIFICATION & CLASSIFICATION
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="admin-grid-2">
                <F label="Product Name" required>
                  <input style={inStyle} value={form.name} required 
                    onChange={(e) => { 
                      set("name", e.target.value); 
                      set("slug", e.target.value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]/g, "")); 
                    }}
                    onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                    onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }} 
                  />
                </F>
                
                <F label="Slug URL (Auto-Generated)" required>
                  <input style={inStyle} value={form.slug} required 
                    onChange={(e) => set("slug", e.target.value)}
                    onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                    onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }} 
                  />
                </F>
              </div>

              <div className="admin-grid-2">
                <F label="Main Category Assignment" required>
                  <select style={{ ...inStyle, cursor: "pointer" }} value={form.category_slug}
                    onChange={(e) => { 
                      const c = categories.find(x => x.slug === e.target.value); 
                      set("category_slug", e.target.value); 
                      set("category_label", c?.label ?? ""); 
                    }}
                    onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                    onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }}
                  >
                    <option value="">Choose Catalog Category...</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {getCategoryLabel({ slug: c.slug, label: c.label }, lang)}
                      </option>
                    ))}
                  </select>
                </F>
                
                <F label="Standard Pack Weight/Qty" required>
                  <input style={inStyle} value={form.weight} required placeholder="e.g. 500g Net Jar"
                    onChange={(e) => set("weight", e.target.value)}
                    onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                    onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }} 
                  />
                </F>
              </div>

              <div className="admin-grid-2">
                <F label="Current Price (৳)" required>
                  <input style={inStyle} type="number" value={form.price} required min={0} 
                    onChange={(e) => set("price", e.target.value)}
                    onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                    onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }} 
                  />
                </F>
                
                <F label="Original/Strike price (৳)">
                  <input style={inStyle} type="number" value={form.original_price} min={0} placeholder="Slash price (leave empty for no discount badge)"
                    onChange={(e) => set("original_price", e.target.value)}
                    onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                    onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }} 
                  />
                </F>
              </div>

              <div className="admin-grid-2">
                <F label="Default Rating (1-5)">
                  <input style={inStyle} type="number" value={form.rating} min={1} max={5} step="0.1"
                    onChange={(e) => set("rating", e.target.value)}
                    onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                    onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }} 
                  />
                </F>
                
                <F label="Simulated Reviews Count">
                  <input style={inStyle} type="number" value={form.reviews} min={0} 
                    onChange={(e) => set("reviews", e.target.value)}
                    onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                    onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }} 
                  />
                </F>
              </div>

              <div className="admin-grid-2">
                <F label="Visual Promo Badge">
                  <input style={inStyle} value={form.badge} placeholder="e.g. Best Seller, Organic, Popular" 
                    onChange={(e) => set("badge", e.target.value)}
                    onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                    onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }} 
                  />
                </F>
                
                <F label="Geographic Origin">
                  <input style={inStyle} value={form.origin} placeholder="e.g. Sundarbans, Bangladesh" 
                    onChange={(e) => set("origin", e.target.value)}
                    onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                    onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }} 
                  />
                </F>
              </div>

              <F label="Detailed Product Narrative Description" required>
                <textarea style={{ ...inStyle, resize: "vertical", minHeight: 120 }} value={form.description} required 
                  onChange={(e) => set("description", e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                  onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }} 
                />
              </F>

              <F label="Nutritional Highlights / Features (One per line)">
                <textarea style={{ ...inStyle, resize: "vertical", minHeight: 120 }} value={form.highlights_raw} 
                  placeholder={"Natural components only\nNo added synthetic preservatives\nStrict laboratory tested"} 
                  onChange={(e) => set("highlights_raw", e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                  onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }} 
                />
              </F>
            </div>
          </div>

          {/* SECTION 2: IMAGES VISUAL ASSETS */}
          <div style={{ 
            backgroundColor: "#fff", 
            borderRadius: 20, 
            border: "1px solid #EEF2ED", 
            padding: "28px 32px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.005)"
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 24px", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 8 }}>
              <ImageIcon size={16} style={{ color: P }} /> VISUAL MEDIA ASSETS
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <ImageUploader 
                label="Primary Display Image" 
                required 
                value={form.image} 
                onChange={(url) => set("image", url)} 
                folder="products"
              />

              <div style={{ borderTop: "1px solid #EEF2ED", paddingTop: 16 }}>
                <F label="Secondary Slider Images (One URL per line, or upload additional file below)">
                  <textarea style={{ ...inStyle, resize: "vertical", minHeight: 80 }} value={form.images_raw} 
                    placeholder={"https://img.link/1.png\nhttps://img.link/2.png"} 
                    onChange={(e) => set("images_raw", e.target.value)}
                    onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                    onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }} 
                  />
                  <div style={{ marginTop: 8 }}>
                    <ImageUploader 
                      label="Add Gallery Image File (Appends to list)" 
                      value="" 
                      onChange={(url) => {
                        if (url) {
                          set("images_raw", form.images_raw ? `${form.images_raw}\n${url}` : url);
                        }
                      }} 
                      folder="products/gallery"
                    />
                  </div>
                </F>
              </div>
            </div>
          </div>

          {/* SECTION 3: SYSTEM OPTIONS FLAGS */}
          <div style={{ 
            backgroundColor: "#fff", 
            borderRadius: 20, 
            border: "1px solid #EEF2ED", 
            padding: "28px 32px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.005)"
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 24px", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 8 }}>
              <Settings size={16} style={{ color: P }} /> INVENTORY DISPATCH STRATEGY
            </h3>
            
            <div className="admin-grid-4">
              {([
                ["in_stock",  "In Stock",     Inbox, "#10B981"],
                ["featured",  "Featured",  Star, "#D97706"],
                ["trending",  "Trending", Activity, "#3B82F6"],
              ] as const).map(([key, label, IconComponent]) => {
                const checked = form[key];
                return (
                  <label key={key} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 12, 
                    cursor: "pointer", 
                    padding: "12px 18px", 
                    border: checked ? `2px solid ${P}` : "1.5px solid #E5EFE2", 
                    borderRadius: 14, 
                    backgroundColor: checked ? "#F4F7F3" : "#fff", 
                    transition: "all 0.15s",
                    position: "relative"
                  }}>
                    <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} style={{ display: "none" }} />
                    <IconComponent size={18} style={{ color: checked ? P : "#9CA3AF" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: checked ? P : "#4B5563", fontFamily: "'Inter',sans-serif" }}>
                      {label}
                    </span>
                    {checked && (
                      <div style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        backgroundColor: P,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        boxShadow: "0 2px 6px rgba(45,90,39,0.3)"
                      }}>
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </label>
                );
              })}
              
              <F label="Display Sort Rank">
                <input style={inStyle} type="number" value={form.display_order} min={0} 
                  onChange={(e) => set("display_order", e.target.value)}
                  onFocus={(e) => { e.target.style.borderColor = P; e.target.style.backgroundColor = "#fff"; }} 
                  onBlur={(e) => { e.target.style.borderColor = "#E5EFE2"; e.target.style.backgroundColor = "#FAFBF9"; }} 
                />
              </F>
            </div>
          </div>

          {/* Validation Errors banner */}
          {error && (
            <div style={{ 
              backgroundColor: "#FEF2F2", 
              border: "1px solid #FCA5A5", 
              borderRadius: 16, 
              padding: "16px 20px", 
              display: "flex", 
              gap: 12,
              alignItems: "center"
            }}>
              <AlertTriangle size={18} style={{ color: "#EF4444" }} />
              <span style={{ fontSize: 13, color: "#991B1B", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>
                {error}
              </span>
            </div>
          )}

          {/* SUBMIT BUTTON ACTIONS */}
          <div style={{ display: "flex", gap: 16, justifyContent: "flex-end", borderTop: "1px solid #EEF2ED", paddingTop: 24, flexWrap: "wrap" }}>
            <button type="button" onClick={() => navigate("/admin/products")}
              style={{ 
                padding: "12px 28px", 
                borderRadius: 12, 
                border: "1.5px solid #E5EFE2", 
                backgroundColor: "#fff", 
                cursor: "pointer", 
                fontSize: 13, 
                fontWeight: 700,
                fontFamily: "'Inter',sans-serif", 
                color: "#4B5563",
                transition: "all 0.2s" 
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FAFBF9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
            >
              Cancel
            </button>
            
            <button type="submit" disabled={saving}
              style={{ 
                backgroundColor: saving ? "#EAF0E9" : P, 
                color: saving ? "#8BA088" : "#fff", 
                border: "none", 
                borderRadius: 12, 
                padding: "12px 32px", 
                fontSize: 13, 
                fontWeight: 700, 
                fontFamily: "'Inter',sans-serif", 
                cursor: saving ? "not-allowed" : "pointer", 
                display: "inline-flex", 
                alignItems: "center", 
                gap: 8,
                transition: "all 0.2s",
                boxShadow: saving ? "none" : "0 4px 16px rgba(45,90,39,0.2)"
              }}
              onMouseEnter={(e) => { if(!saving) e.currentTarget.style.backgroundColor = P_DARK; }}
              onMouseLeave={(e) => { if(!saving) e.currentTarget.style.backgroundColor = P; }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>
                {saving ? "Saving Record..." : isEdit ? "Update Product File" : "Publish Catalog Product"}
              </span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
}
