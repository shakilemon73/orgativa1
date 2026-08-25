import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import ImageUploader from "@/components/ImageUploader";
import { supabase, DbCategory } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { getCategoryLabel } from "@/data/products";
import { 
  FolderTree, 
  Plus, 
  Edit, 
  Trash2, 
  Grid, 
  Layers, 
  Package, 
  Tag, 
  X, 
  Check, 
  Info,
  ChevronRight,
  Sparkles
} from "lucide-react";

const P = "#2D5A27";
const P_DARK = "#1a4016";

const inStyle: React.CSSProperties = {
  width: "100%", 
  border: "1.5px solid #E5EFE2", 
  borderRadius: 12,
  padding: "12px 16px", 
  fontSize: 13, 
  fontFamily: "'Inter',sans-serif",
  color: "#111827", 
  outline: "none", 
  boxSizing: "border-box", 
  backgroundColor: "#fff", 
  transition: "all 0.2s",
  fontWeight: 500
};

const EMPTY = { slug: "", label: "", icon: "FolderTree", image_url: "", product_count: "0", display_order: "0" };

import { categories as staticCategories, products as staticProducts } from "@/data/products";

function categoryToDbCategory(c: typeof staticCategories[0], index: number = 0): DbCategory {
  return {
    id: (index + 1).toString(),
    slug: c.slug,
    label: c.label,
    icon: c.icon || "FolderTree",
    image_url: c.image || "",
    product_count: c.count,
    display_order: index + 1,
    created_at: new Date().toISOString(),
  };
}

export default function AdminCategories() {
  const { lang, t, formatNum } = useLanguage();
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function load() {
    const staticDbCategories = staticCategories.map(c => ({
      ...categoryToDbCategory(c),
      product_count: staticProducts.filter(p => p.categorySlug === c.slug || p.category === c.label).length
    }));
    if (!supabase) {
      setCategories(staticDbCategories);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("*").order("display_order"),
        supabase.from("products").select("category_slug, category_label")
      ]);
      const data = catRes.data;
      const prods = prodRes.data || [];

      if (!data || data.length === 0) {
        setCategories(staticDbCategories);
      } else {
        const computed = data.map(c => {
          const actualCount = prods.filter(p => p.category_slug === c.slug || p.category_label === c.label).length;
          return {
            ...c,
            product_count: actualCount > 0 || c.product_count === 0 || c.product_count === null ? actualCount : c.product_count
          };
        });
        setCategories(computed);
      }
    } catch {
      setCategories(staticDbCategories);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(c: DbCategory) {
    setEditId(c.id);
    setForm({ 
      slug: c.slug, 
      label: c.label, 
      icon: c.icon || "FolderTree", 
      image_url: c.image_url ?? "", 
      product_count: String(c.product_count), 
      display_order: String(c.display_order) 
    });
    setShowForm(true);
  }

  function startNew() {
    setEditId(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      slug: form.slug.trim(),
      label: form.label.trim(),
      icon: form.icon.trim(),
      image_url: form.image_url.trim() || null,
      product_count: parseInt(form.product_count) || 0,
      display_order: parseInt(form.display_order) || 0,
    };

    if (!supabase) {
      if (editId) {
        setCategories((prev) => prev.map((c) => c.id === editId ? { ...c, ...payload } : c));
        showToast("Category successfully updated.");
      } else {
        const newCat: DbCategory = {
          id: Date.now().toString(),
          ...payload,
          created_at: new Date().toISOString()
        };
        setCategories((prev) => [...prev, newCat]);
        showToast("New category added successfully.");
      }
      setShowForm(false);
      setSaving(false);
      return;
    }
    try {
      if (editId) {
        await supabase.from("categories").update(payload).eq("id", editId);
        showToast("Category successfully updated.");
      } else {
        await supabase.from("categories").insert(payload);
        showToast("New category added successfully.");
      }
      setShowForm(false);
      load();
    } catch {
      showToast("Failed to save category.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: string, label: string) {
    if (!supabase) return;
    if (!confirm(`Are you sure you want to delete "${label}"? Products linked to this category may lose their classification.`)) return;
    try {
      await supabase.from("categories").delete().eq("id", id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast("Category successfully deleted.");
    } catch {
      showToast("Failed to delete category.");
    }
  }

  function set(key: string, val: string) { setForm((prev) => ({ ...prev, [key]: val })); }

  // Total products cataloged through all categories
  const totalCategoryProducts = categories.reduce((sum, c) => sum + (Number(c.product_count) || 0), 0);

  return (
    <AdminLayout title="Product Classification & Categories">
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
          <Check size={16} style={{ color: "#34D399" }} />
          <span>{toast}</span>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 24 }}>
        
        {/* TOP METRIC BANNER */}
        <div style={{
          marginBottom: 28
        }} className="admin-grid-2">
          
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            border: "1px solid #EEF2ED",
            padding: "22px 26px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.005)"
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: "#F4F7F3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #E5EFE2"
            }}>
              <FolderTree size={20} style={{ color: P }} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#6B726A", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>
                Active Shelves
              </p>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0, fontFamily: "'Inter', sans-serif" }}>
                {formatNum(categories.length)} Active Shelves
              </p>
            </div>
          </div>

          <div style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            border: "1px solid #EEF2ED",
            padding: "22px 26px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.005)"
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #DBEAFE"
            }}>
              <Layers size={20} style={{ color: "#1E40AF" }} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#6B726A", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>
                Aggregated Products Linked
              </p>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0, fontFamily: "'Inter', sans-serif" }}>
                {formatNum(totalCategoryProducts)} Linked Catalog Items
              </p>
            </div>
          </div>

        </div>

        {/* CONTROLS HEADER */}
        <div style={{ display: "flex", gap: 16, justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              📋 CATALOG SECTIONS
            </h3>
            <p style={{ fontSize: 12, color: "#6B726A", margin: "2px 0 0", fontFamily: "'Inter', sans-serif" }}>
              Classify your organic line into premium subcategories on the main storefront
            </p>
          </div>

          <button onClick={startNew}
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
              boxShadow: "0 4px 14px rgba(45,90,39,0.2)",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P_DARK; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = P; e.currentTarget.style.transform = "none"; }}
          >
            <Plus size={16} />
            Add Classification
          </button>
        </div>

        {/* STYLISH MODAL OVERLAY FORM */}
        {showForm && (
          <div style={{ 
            position: "fixed", 
            inset: 0, 
            backgroundColor: "rgba(12,30,10,0.4)", 
            backdropFilter: "blur(4px)",
            zIndex: 9999, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            padding: 24 
          }}>
            <div style={{ 
              backgroundColor: "#fff", 
              borderRadius: 20, 
              padding: 36, 
              width: "100%", 
              maxWidth: 520, 
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 64px rgba(12,30,10,0.15)",
              border: "1px solid #EEF2ED"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div>
                  <span style={{ 
                    backgroundColor: "#F4F7F3", 
                    color: P, 
                    fontSize: 9, 
                    fontWeight: 700, 
                    letterSpacing: "0.1em", 
                    padding: "4px 8px", 
                    borderRadius: 20,
                    textTransform: "uppercase",
                    display: "inline-block",
                    marginBottom: 6
                  }}>
                    SHELF REGISTRY
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111827", fontFamily: "'Inter',sans-serif", margin: 0 }}>
                    {editId ? "Edit Category Registry" : "Create New Catalog Category"}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowForm(false)}
                  style={{ border: "1px solid #E5EFE2", backgroundColor: "#FAFBF9", cursor: "pointer", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B726A" }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div className="admin-grid-2" style={{ gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4B5563", fontFamily: "'Inter',sans-serif", marginBottom: 6 }}>
                      Category Name *
                    </label>
                    <input 
                      style={inStyle} 
                      value={form.label} 
                      required 
                      onChange={(e) => set("label", e.target.value)} 
                      onFocus={(e) => (e.target.style.borderColor = P)} 
                      onBlur={(e) => (e.target.style.borderColor = "#E5EFE2")} 
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4B5563", fontFamily: "'Inter',sans-serif", marginBottom: 6 }}>
                      Slug / URL Identifier *
                    </label>
                    <input 
                      style={inStyle} 
                      value={form.slug} 
                      required 
                      placeholder="e.g., honey"
                      onChange={(e) => set("slug", e.target.value)} 
                      onFocus={(e) => (e.target.style.borderColor = P)} 
                      onBlur={(e) => (e.target.style.borderColor = "#E5EFE2")} 
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4B5563", fontFamily: "'Inter',sans-serif", marginBottom: 6 }}>
                      Material/Lucide Icon
                    </label>
                    <input 
                      style={inStyle} 
                      value={form.icon} 
                      onChange={(e) => set("icon", e.target.value)} 
                      placeholder="e.g. FolderTree, Sparkles" 
                      onFocus={(e) => (e.target.style.borderColor = P)} 
                      onBlur={(e) => (e.target.style.borderColor = "#E5EFE2")} 
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4B5563", fontFamily: "'Inter',sans-serif", marginBottom: 6 }}>
                      Product Count Override
                    </label>
                    <input 
                      style={inStyle} 
                      type="number" 
                      min={0} 
                      value={form.product_count} 
                      onChange={(e) => set("product_count", e.target.value)} 
                      onFocus={(e) => (e.target.style.borderColor = P)} 
                      onBlur={(e) => (e.target.style.borderColor = "#E5EFE2")} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4B5563", fontFamily: "'Inter',sans-serif", marginBottom: 6 }}>
                    Sorting Priority Display Order
                  </label>
                  <input 
                    style={inStyle} 
                    type="number" 
                    min={0} 
                    value={form.display_order} 
                    onChange={(e) => set("display_order", e.target.value)} 
                    onFocus={(e) => (e.target.style.borderColor = P)} 
                    onBlur={(e) => (e.target.style.borderColor = "#E5EFE2")} 
                  />
                </div>

                <div>
                  <ImageUploader 
                    label="Cover Image Illustration" 
                    value={form.image_url} 
                    onChange={(url) => set("image_url", url)} 
                    folder="categories"
                  />
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ 
                      padding: "12px 24px", 
                      borderRadius: 12, 
                      border: "1.5px solid #E5EFE2", 
                      backgroundColor: "#fff", 
                      cursor: "pointer", 
                      fontSize: 13, 
                      fontWeight: 600,
                      fontFamily: "'Inter',sans-serif",
                      color: "#4B5563"
                    }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ 
                      backgroundColor: saving ? "#C2D9BC" : P, 
                      color: "#fff", 
                      border: "none", 
                      borderRadius: 12, 
                      padding: "12px 28px", 
                      fontSize: 13, 
                      fontWeight: 700, 
                      fontFamily: "'Inter',sans-serif", 
                      cursor: saving ? "not-allowed" : "pointer" 
                    }}>
                    {saving ? "Saving Registry..." : "Confirm Registry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CATEGORIES GRID / TABLE */}
        <div style={{ 
          backgroundColor: "#fff", 
          borderRadius: 20, 
          border: "1px solid #EEF2ED", 
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.01)" 
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ backgroundColor: "#FAFBF9", borderBottom: "1px solid #EEF2ED" }}>
                  {["", "Category Name & Label", "Route Identifier Slug", "Product Distribution", "Display Weight Order", "Actions"].map((h, idx) => (
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
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #EEF2ED" }}>
                      {[36, "60%", 80, 50, 40, 80].map((w, j) => (
                        <td key={j} style={{ padding: "16px 24px" }}>
                          {j === 0 ? <div style={{ width: 40, height: 40, backgroundColor: "#FAFBF9", borderRadius: 10, animation: "pulse 1.5s infinite" }} /> : <div style={{ height: 14, backgroundColor: "#FAFBF9", borderRadius: 6, width: w, animation: "pulse 1.5s infinite" }} />}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#6B726A", fontFamily: "'Inter',sans-serif" }}>
                      No categories configured in your inventory database.
                    </td>
                  </tr>
                ) : categories.map((c) => (
                  <tr key={c.id} 
                    style={{ 
                      borderBottom: "1px solid #EEF2ED",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FAFBF9")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "")}
                  >
                    {/* Visual Icon */}
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ 
                        width: 44, 
                        height: 44, 
                        backgroundColor: "#F4F7F3", 
                        borderRadius: 12, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        border: "1px solid #E5EFE2"
                      }}>
                        <FolderTree size={18} style={{ color: P }} />
                      </div>
                    </td>

                    {/* Category Label */}
                    <td style={{ padding: "14px 24px" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1F2937", fontFamily: "'Inter',sans-serif" }}>
                        {getCategoryLabel({ slug: c.slug, label: c.label }, lang)}
                      </span>
                    </td>

                    {/* Slug */}
                    <td style={{ padding: "14px 24px" }}>
                      <code style={{ 
                        fontSize: 11, 
                        backgroundColor: "#F3F4F6", 
                        padding: "4px 10px", 
                        borderRadius: 8, 
                        fontFamily: "monospace", 
                        color: "#4B5563",
                        fontWeight: 600
                      }}>{c.slug}</code>
                    </td>

                    {/* Product Count */}
                    <td style={{ padding: "14px 24px" }}>
                      <span style={{ fontSize: 13, color: "#111827", fontFamily: "'Inter',sans-serif", fontWeight: 700 }}>
                        {formatNum(c.product_count)} {c.product_count === 1 ? "product" : "products"}
                      </span>
                    </td>

                    {/* Sorting Display order */}
                    <td style={{ padding: "14px 24px" }}>
                      <span style={{ fontSize: 12, color: "#6B726A", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>
                        Priority #{formatNum(c.display_order)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => startEdit(c)}
                          aria-label="Edit category"
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
                            color: "#4B5563",
                            transition: "all 0.15s"
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = P; e.currentTarget.style.backgroundColor = "#F4F7F3"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#4B5563"; e.currentTarget.style.backgroundColor = "#fff"; }}
                        >
                          <Edit size={14} />
                        </button>
                        <button onClick={() => deleteCategory(c.id, c.label)}
                          aria-label="Delete category"
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
                            color: "#DC2626",
                            transition: "all 0.15s"
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FEE2E2"; e.currentTarget.style.borderColor = "#F87171"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FEF2F2"; e.currentTarget.style.borderColor = "#FEE2E2"; }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </AdminLayout>
  );
}
