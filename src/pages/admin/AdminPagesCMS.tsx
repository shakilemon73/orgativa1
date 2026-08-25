import { useState, useEffect } from "react";
import AdminLayout from "@/pages/admin/AdminLayout";
import { getCMSData, saveCMSData, CMSData, FAQItem, BlogPost, PageContent } from "@/lib/cms-store";
import { FileText, Save, Plus, Trash2, Edit3, HelpCircle, BookOpen, Phone, CheckCircle2, RefreshCw } from "lucide-react";

const P = "#2D5A27";

type ActivePageTab = "shipping" | "returns" | "faqs" | "contact" | "privacy" | "terms" | "story" | "blog";

export default function AdminPagesCMS() {
  const [data, setData] = useState<CMSData>(() => getCMSData());
  const [activeTab, setActiveTab] = useState<ActivePageTab>("shipping");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modals / Editors state
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  useEffect(() => {
    setData(getCMSData());
  }, []);

  async function handleSaveAll() {
    setSaving(true);
    const ok = await saveCMSData(data);
    setSaving(false);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  }

  function updatePageContent(key: "shipping_policy" | "returns_refund" | "privacy_policy" | "terms_service" | "our_story", field: keyof PageContent, val: string) {
    setData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val
      }
    }));
  }

  function updateContactInfo(field: keyof CMSData["contact_info"], val: string) {
    setData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: val
      }
    }));
  }

  function handleSaveFaq(faq: FAQItem) {
    setData(prev => {
      const exists = prev.faqs.some(f => f.id === faq.id);
      const updated = exists 
        ? prev.faqs.map(f => f.id === faq.id ? faq : f)
        : [...prev.faqs, faq];
      return { ...prev, faqs: updated };
    });
    setEditingFaq(null);
  }

  function handleDeleteFaq(id: string) {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      setData(prev => ({ ...prev, faqs: prev.faqs.filter(f => f.id !== id) }));
    }
  }

  function handleSaveBlog(post: BlogPost) {
    setData(prev => {
      const exists = prev.blog_posts.some(b => b.id === post.id);
      const updated = exists
        ? prev.blog_posts.map(b => b.id === post.id ? post : b)
        : [...prev.blog_posts, post];
      return { ...prev, blog_posts: updated };
    });
    setEditingBlog(null);
  }

  function handleDeleteBlog(id: string) {
    if (confirm("Are you sure you want to delete this blog post?")) {
      setData(prev => ({ ...prev, blog_posts: prev.blog_posts.filter(b => b.id !== id) }));
    }
  }

  const tabs: { id: ActivePageTab; label: string; icon: any }[] = [
    { id: "shipping", label: "Shipping Policy", icon: FileText },
    { id: "returns", label: "Returns & Refund", icon: FileText },
    { id: "faqs", label: "FAQs Management", icon: HelpCircle },
    { id: "contact", label: "Contact Us & Hotline", icon: Phone },
    { id: "privacy", label: "Privacy Policy", icon: FileText },
    { id: "terms", label: "Terms of Service", icon: FileText },
    { id: "story", label: "Our Story", icon: FileText },
    { id: "blog", label: "Blog & Recipes", icon: BookOpen },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: "24px 32px" }}>
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: 28, margin: 0, fontWeight: 700, color: "#1F2937" }}>
              Pages & Content Management (CMS)
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280", fontFamily: "'Inter', sans-serif" }}>
              Edit title, content, FAQs, blog articles, contact hotline & policies. All changes reflect live instantly.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            style={{
              backgroundColor: savedSuccess ? "#16A34A" : P,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(45,90,39,0.2)"
            }}
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : savedSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
            <span>{saving ? "Saving Changes..." : savedSuccess ? "Saved Successfully!" : "Save All Page Changes"}</span>
          </button>
        </div>

        {/* Page Tab Selector */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", borderBottom: "1px solid #E5E7EB", paddingBottom: 12, marginBottom: 28 }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  backgroundColor: active ? P : "#fff",
                  color: active ? "#fff" : "#374151",
                  border: `1px solid ${active ? P : "#E5E7EB"}`,
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap"
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          
          {/* 1. SHIPPING / RETURNS / PRIVACY / TERMS / OUR STORY (Page Content Editors) */}
          {["shipping", "returns", "privacy", "terms", "story"].includes(activeTab) && (() => {
            const keyMap: Record<string, "shipping_policy" | "returns_refund" | "privacy_policy" | "terms_service" | "our_story"> = {
              shipping: "shipping_policy",
              returns: "returns_refund",
              privacy: "privacy_policy",
              terms: "terms_service",
              story: "our_story"
            };
            const key = keyMap[activeTab];
            const content = data[key];

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#1F2937", fontFamily: "'Inter', sans-serif" }}>
                  Edit {tabs.find(t => t.id === activeTab)?.label}
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                      Title (Bangla)
                    </label>
                    <input
                      type="text"
                      value={content.titleBn}
                      onChange={(e) => updatePageContent(key, "titleBn", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                      Title (English)
                    </label>
                    <input
                      type="text"
                      value={content.titleEn}
                      onChange={(e) => updatePageContent(key, "titleEn", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                      Subtitle (Bangla)
                    </label>
                    <input
                      type="text"
                      value={content.subtitleBn}
                      onChange={(e) => updatePageContent(key, "subtitleBn", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                      Subtitle (English)
                    </label>
                    <input
                      type="text"
                      value={content.subtitleEn}
                      onChange={(e) => updatePageContent(key, "subtitleEn", e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                    Full Document Content Body (Bangla)
                  </label>
                  <textarea
                    rows={8}
                    value={content.contentBn}
                    onChange={(e) => updatePageContent(key, "contentBn", e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                    Full Document Content Body (English)
                  </label>
                  <textarea
                    rows={8}
                    value={content.contentEn}
                    onChange={(e) => updatePageContent(key, "contentEn", e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}
                  />
                </div>
              </div>
            );
          })()}

          {/* 2. FAQS EDITOR */}
          {activeTab === "faqs" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1F2937", fontFamily: "'Inter', sans-serif" }}>
                  Manage FAQs ({data.faqs.length} Questions)
                </h3>
                <button
                  onClick={() => setEditingFaq({
                    id: "faq-" + Date.now(),
                    category: "general",
                    questionBn: "",
                    questionEn: "",
                    answerBn: "",
                    answerEn: ""
                  })}
                  style={{ backgroundColor: P, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Plus size={16} />
                  <span>Add New FAQ</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.faqs.map((faq) => (
                  <div key={faq.id} style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", backgroundColor: "#EAF4E8", color: P, padding: "2px 8px", borderRadius: 4 }}>
                        {faq.category}
                      </span>
                      <h4 style={{ margin: "6px 0 2px", fontSize: 15, fontWeight: 700, color: "#1F2937" }}>
                        {faq.questionBn} / {faq.questionEn}
                      </h4>
                      <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
                        {faq.answerBn.slice(0, 100)}...
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setEditingFaq(faq)} style={{ backgroundColor: "#F3F4F6", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDeleteFaq(faq.id)} style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CONTACT INFO EDITOR */}
          {activeTab === "contact" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#1F2937" }}>
                Contact & Support Details
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Hotline Phone</label>
                  <input type="text" value={data.contact_info.phone} onChange={(e) => updateContactInfo("phone", e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Hotline Hours</label>
                  <input type="text" value={data.contact_info.hotlineHours} onChange={(e) => updateContactInfo("hotlineHours", e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Customer Support Email</label>
                  <input type="email" value={data.contact_info.email} onChange={(e) => updateContactInfo("email", e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Corporate Email</label>
                  <input type="email" value={data.contact_info.corpEmail} onChange={(e) => updateContactInfo("corpEmail", e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Headquarters Address</label>
                <input type="text" value={data.contact_info.address} onChange={(e) => updateContactInfo("address", e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>WhatsApp Number / Link</label>
                <input type="text" value={data.contact_info.whatsapp} onChange={(e) => updateContactInfo("whatsapp", e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB" }} />
              </div>
            </div>
          )}

          {/* 4. BLOG & RECIPES EDITOR */}
          {activeTab === "blog" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1F2937" }}>
                  Manage Blog & Recipes ({data.blog_posts.length} Posts)
                </h3>
                <button
                  onClick={() => setEditingBlog({
                    id: "post-" + Date.now(),
                    slug: "post-" + Date.now(),
                    titleBn: "",
                    titleEn: "",
                    summaryBn: "",
                    summaryEn: "",
                    contentBn: "",
                    contentEn: "",
                    categoryBn: "স্বাস্থ্য টিপস",
                    categoryEn: "Health & Nutrition",
                    author: "Orgativa Team",
                    date: "August 2026",
                    readTime: "4 min read",
                    image: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80"
                  })}
                  style={{ backgroundColor: P, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Plus size={16} />
                  <span>Create New Blog Post</span>
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {data.blog_posts.map((post) => (
                  <div key={post.id} style={{ border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden", display: "flex" }}>
                    <img src={post.image} alt={post.titleEn} style={{ width: 120, height: "100%", objectFit: "cover" }} />
                    <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: "#EAF4E8", color: P, padding: "2px 6px", borderRadius: 4 }}>
                          {post.categoryEn}
                        </span>
                        <h4 style={{ margin: "4px 0 2px", fontSize: 14, fontWeight: 700, color: "#1F2937" }}>
                          {post.titleBn || post.titleEn}
                        </h4>
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button onClick={() => setEditingBlog(post)} style={{ backgroundColor: "#F3F4F6", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteBlog(post.id)} style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* FAQ EDIT MODAL */}
      {editingFaq && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 28, maxWidth: 600, width: "100%" }}>
            <h3 style={{ margin: "0 0 16px" }}>Edit FAQ Item</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Category</label>
                <select value={editingFaq.category} onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value as any })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }}>
                  <option value="authenticity">Purity & Authenticity</option>
                  <option value="shipping">Shipping & Delivery</option>
                  <option value="payment">Payment & Refunds</option>
                  <option value="products">Products & Quality</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Question (Bangla)</label>
                <input type="text" value={editingFaq.questionBn} onChange={(e) => setEditingFaq({ ...editingFaq, questionBn: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Question (English)</label>
                <input type="text" value={editingFaq.questionEn} onChange={(e) => setEditingFaq({ ...editingFaq, questionEn: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Answer (Bangla)</label>
                <textarea rows={3} value={editingFaq.answerBn} onChange={(e) => setEditingFaq({ ...editingFaq, answerBn: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Answer (English)</label>
                <textarea rows={3} value={editingFaq.answerEn} onChange={(e) => setEditingFaq({ ...editingFaq, answerEn: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>
              <div style={{ display: "flex", justifySelf: "flex-end", gap: 10, marginTop: 10 }}>
                <button onClick={() => setEditingFaq(null)} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #CCC" }}>Cancel</button>
                <button onClick={() => handleSaveFaq(editingFaq)} style={{ padding: "8px 16px", borderRadius: 6, backgroundColor: P, color: "#fff", border: "none" }}>Save FAQ</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BLOG EDIT MODAL */}
      {editingBlog && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 16, padding: 28, maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 16px" }}>Edit Blog Post / Recipe</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Title (Bangla)</label>
                  <input type="text" value={editingBlog.titleBn} onChange={(e) => setEditingBlog({ ...editingBlog, titleBn: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Title (English)</label>
                  <input type="text" value={editingBlog.titleEn} onChange={(e) => setEditingBlog({ ...editingBlog, titleEn: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Image URL</label>
                <input type="text" value={editingBlog.image} onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Author</label>
                  <input type="text" value={editingBlog.author} onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Reading Time</label>
                  <input type="text" value={editingBlog.readTime} onChange={(e) => setEditingBlog({ ...editingBlog, readTime: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Summary (Bangla)</label>
                <textarea rows={2} value={editingBlog.summaryBn} onChange={(e) => setEditingBlog({ ...editingBlog, summaryBn: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Summary (English)</label>
                <textarea rows={2} value={editingBlog.summaryEn} onChange={(e) => setEditingBlog({ ...editingBlog, summaryEn: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Full Article Content (Bangla)</label>
                <textarea rows={5} value={editingBlog.contentBn} onChange={(e) => setEditingBlog({ ...editingBlog, contentBn: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Full Article Content (English)</label>
                <textarea rows={5} value={editingBlog.contentEn} onChange={(e) => setEditingBlog({ ...editingBlog, contentEn: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #CCC" }} />
              </div>

              <div style={{ display: "flex", justifySelf: "flex-end", gap: 10, marginTop: 10 }}>
                <button onClick={() => setEditingBlog(null)} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #CCC" }}>Cancel</button>
                <button onClick={() => handleSaveBlog(editingBlog)} style={{ padding: "8px 16px", borderRadius: 6, backgroundColor: P, color: "#fff", border: "none" }}>Save Post</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
