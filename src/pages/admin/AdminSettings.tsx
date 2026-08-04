import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import ImageUploader from "@/components/ImageUploader";
import { supabase, DbSiteSetting } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { 
  Truck, 
  Phone, 
  Home, 
  Megaphone, 
  FileText, 
  Settings, 
  Save, 
  Loader2, 
  Info, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

const P = "#2D5A27";
const P_DARK = "#1a4016";

export default function AdminSettings() {
  const { t } = useLanguage();
  const { refreshSettings } = useSiteSettings();
  const [settings, setSettings] = useState<DbSiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const GROUPS: Record<string, string> = {
    delivery: "Delivery Settings",
    contact:  "Contact & Support",
    hero:     "Home Hero Visuals",
    promos:   "Promo Banner Announcement",
    invoice:  "Invoice & Receipt Customization",
    general:  "General Preferences",
  };

  const GROUP_ICONS: Record<string, any> = {
    delivery: Truck,
    contact: Phone,
    hero: Home,
    promos: Megaphone,
    invoice: FileText,
    general: Settings,
  };

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 4000); }

  async function loadSettings() {
    if (!supabase) { setLoading(false); return; }
    const { data } = await supabase.from("site_settings").select("*").order("group_name");
    const dbSettings = data ?? [];

    const defaultFields = [
      // Contact
      { key: "contact_phone", value: "+880 1700-000000", label: "Contact Phone Number / Hotline", group_name: "contact" },
      { key: "contact_email", value: "info@orgativa.com.bd", label: "Contact Support Email Address", group_name: "contact" },
      { key: "contact_address", value: "House 12, Road 5, Bashundhara R/A, Dhaka-1229", label: "Store Physical Address", group_name: "contact" },
      { key: "contact_whatsapp", value: "+8801700000000", label: "WhatsApp Order Number", group_name: "contact" },
      { key: "facebook_page_url", value: "https://facebook.com", label: "Facebook Page URL", group_name: "contact" },

      // Delivery
      { key: "delivery_inside_dhaka", value: "60", label: "Delivery Charge Inside Dhaka (৳)", group_name: "delivery" },
      { key: "delivery_outside_dhaka", value: "120", label: "Delivery Charge Outside Dhaka (৳)", group_name: "delivery" },
      { key: "delivery_free_threshold", value: "1500", label: "Free Shipping Minimum Order Amount (৳)", group_name: "delivery" },
      { key: "delivery_estimated_dhaka", value: "24-48 Hours", label: "Estimated Delivery Time (Inside Dhaka)", group_name: "delivery" },
      { key: "delivery_estimated_outside", value: "2-4 Days", label: "Estimated Delivery Time (Outside Dhaka)", group_name: "delivery" },

      // Hero
      { key: "hero_title_bn", value: "প্রাকৃতিক, বিশুদ্ধ ও প্রিমিয়াম অর্গানিক খাদ্য উপাদান", label: "Hero Title (Bangla)", group_name: "hero" },
      { key: "hero_title_en", value: "100% Pure, Unadulterated Organic Nutrition for Your Family", label: "Hero Title (English)", group_name: "hero" },
      { key: "hero_subtitle_bn", value: "সরাসরি খামার থেকে ল্যাব-পরীক্ষিত শতভাগ প্রাকৃতিক মধু, ঘি, ড্রাই ফ্রুটস ও হার্বাল পণ্য পৌঁছে দিচ্ছি আপনার দুয়ারে।", label: "Hero Subtitle (Bangla)", group_name: "hero" },
      { key: "hero_subtitle_en", value: "Directly sourced from organic certified farms. Pure honey, raw ghee, premium nuts & herbal wellness delivered right to your home.", label: "Hero Subtitle (English)", group_name: "hero" },
      { key: "hero_badge_bn", value: "🌿 ১০০% খাঁটি অর্গানিক অ্যান্ড ল্যাব সার্টিফাইড", label: "Hero Badge Tag (Bangla)", group_name: "hero" },
      { key: "hero_badge_en", value: "🌿 100% CERTIFIED PURE & ORGANIC HARVEST", label: "Hero Badge Tag (English)", group_name: "hero" },

      // Promos
      { key: "promo_topbar_text_bn", value: "🌿 ১৫০০ টাকার কেনাকাটায় সারা বাংলাদেশে ফ্রি হোম ডেলিভারি! প্রোমো কোড: ORGATIVA10", label: "Top Announcement Bar Text (Bangla)", group_name: "promos" },
      { key: "promo_topbar_text_en", value: "🌿 Free shipping across Bangladesh on orders over ৳1500! Use code: ORGATIVA10", label: "Top Announcement Bar Text (English)", group_name: "promos" },

      // Invoice
      { key: "invoice_title", value: "Orgativa", label: "Invoice Title / Brand", group_name: "invoice" },
      { key: "invoice_subtitle", value: "Premium Organic Foods", label: "Invoice Slogan / Subtitle", group_name: "invoice" },
      { key: "invoice_accent_color", value: "#2D5A27", label: "Invoice Accent Color Hex", group_name: "invoice" },
      { key: "invoice_logo_url", value: "/assets/orgativa_logo.png", label: "Logo Image URL", group_name: "invoice" },
      { key: "invoice_address", value: "Banani, Dhaka-1213 | Hotline: +880 1700-000000 | info@orgativa.com", label: "Address & Contact Info", group_name: "invoice" },
      { key: "invoice_terms", value: "Thank you for choosing Orgativa! Our products are 100% natural and organic. If you wish to request a refund or exchange, please contact us within 7 days with your original invoice.", label: "Terms & Footer Message", group_name: "invoice" },
    ];

    const mergedSettings = [...dbSettings];
    defaultFields.forEach((field) => {
      if (!mergedSettings.some((s) => s.key === field.key)) {
        mergedSettings.push(field);
      }
    });

    setSettings(mergedSettings);
    const v: Record<string, string> = {};
    mergedSettings.forEach((s) => { v[s.key] = s.value; });
    setValues(v);
    setLoading(false);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function saveSetting(key: string) {
    if (!supabase) return;
    setSaving((prev) => ({ ...prev, [key]: true }));
    const item = settings.find((s) => s.key === key);
    const val = values[key] ?? "";

    const { error } = await supabase.from("site_settings").upsert({
      key,
      value: val,
      label: item?.label || key,
      group_name: item?.group_name || "general",
      updated_at: new Date().toISOString()
    });

    // Also sync alias keys to guarantee database consistency for older/seed keys
    if (key === "contact_phone" || key === "site_phone") {
      await supabase.from("site_settings").upsert({ key: "contact_phone", value: val, label: "Contact Phone Number / Hotline", group_name: "contact" });
      await supabase.from("site_settings").upsert({ key: "site_phone", value: val, label: "Site Phone", group_name: "contact" });
    } else if (key === "contact_email" || key === "site_email") {
      await supabase.from("site_settings").upsert({ key: "contact_email", value: val, label: "Contact Support Email Address", group_name: "contact" });
      await supabase.from("site_settings").upsert({ key: "site_email", value: val, label: "Site Email", group_name: "contact" });
    } else if (key === "delivery_inside_dhaka") {
      await supabase.from("site_settings").upsert({ key: "delivery_fee", value: val, label: "Delivery Fee", group_name: "delivery" });
    } else if (key === "delivery_free_threshold") {
      await supabase.from("site_settings").upsert({ key: "free_delivery_above", value: val, label: "Free Shipping Threshold", group_name: "delivery" });
    }

    setSaving((prev) => ({ ...prev, [key]: false }));
    if (error) {
      console.error("Error saving setting:", error);
      showToast("Could not save setting.");
    } else {
      showToast("Setting saved successfully.");
      await refreshSettings();
    }
  }

  const grouped = settings.reduce((acc, s) => {
    const g = s.group_name || "general";
    if (!acc[g]) acc[g] = [];
    acc[g].push(s);
    return acc;
  }, {} as Record<string, DbSiteSetting[]>);

  const inStyle: React.CSSProperties = {
    flex: 1, 
    border: "1.5px solid #E5EFE2", 
    borderRadius: 12, 
    padding: "12px 16px",
    fontSize: 13, 
    fontFamily: "'Inter',sans-serif", 
    color: "#1F2937", 
    outline: "none",
    backgroundColor: "#FAFBF9", 
    transition: "all 0.2s",
    fontWeight: 500,
  };

  return (
    <AdminLayout title="System Configuration Panels">
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

      <div style={{ maxWidth: 1080, margin: "0 auto", paddingBottom: 48 }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: "#fff", borderRadius: 20, border: "1px solid #EEF2ED", padding: 28, marginBottom: 28 }}>
              <div style={{ height: 20, backgroundColor: "#FAFBF9", borderRadius: 6, width: 140, marginBottom: 24, animation: "pulse 1.5s infinite" }} />
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} style={{ height: 48, backgroundColor: "#FAFBF9", borderRadius: 12, marginBottom: 16, animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ))
        ) : (
          Object.entries(grouped).map(([group, items]) => {
            const GroupIcon = GROUP_ICONS[group] ?? Settings;
            return (
              <div key={group} style={{ 
                backgroundColor: "#fff", 
                borderRadius: 20, 
                border: "1px solid #EEF2ED", 
                overflow: "hidden", 
                marginBottom: 28,
                boxShadow: "0 4px 16px rgba(0,0,0,0.005)" 
              }}>
                <div style={{ 
                  padding: "20px 28px", 
                  borderBottom: "1px solid #EEF2ED", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12,
                  backgroundColor: "#FAFBF9"
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "#F4F7F3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <GroupIcon size={18} style={{ color: P }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
                    {GROUPS[group] ?? group}
                  </h3>
                </div>
                
                <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
                  {items.map((s) => (
                    <div key={s.key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B726A", fontFamily: "'Inter',sans-serif" }}>
                        {s.label ?? s.key}
                      </label>
                      
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                        {s.key.includes("logo") || s.key.includes("image") || s.key.includes("url") ? (
                          <div style={{ flex: 1 }}>
                            <ImageUploader
                              value={values[s.key] ?? ""}
                              onChange={(url) => {
                                setValues((prev) => ({ ...prev, [s.key]: url }));
                              }}
                              folder="settings"
                            />
                          </div>
                        ) : s.key === "invoice_accent_color" ? (
                          <div style={{ display: "flex", gap: 10, flex: 1 }}>
                            <input
                              type="color"
                              value={values[s.key]?.startsWith("#") ? values[s.key] : "#2D5A27"}
                              onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                              style={{ 
                                width: 48, 
                                height: 46, 
                                padding: 0, 
                                border: "1.5px solid #E5EFE2", 
                                borderRadius: 12, 
                                cursor: "pointer", 
                                backgroundColor: "#fff",
                                flexShrink: 0
                              }}
                            />
                            <input
                              value={values[s.key] ?? ""}
                              onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                              style={inStyle}
                              onFocus={(e) => {
                                e.target.style.borderColor = P;
                                e.target.style.backgroundColor = "#fff";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#E5EFE2";
                                e.target.style.backgroundColor = "#FAFBF9";
                              }}
                            />
                          </div>
                        ) : (s.value?.length ?? 0) > 60 || s.key === "invoice_terms" || s.key === "invoice_address" ? (
                          <textarea
                            value={values[s.key] ?? ""}
                            onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                            style={{ ...inStyle, resize: "vertical", minHeight: 96 }}
                            onFocus={(e) => {
                              e.target.style.borderColor = P;
                              e.target.style.backgroundColor = "#fff";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "#E5EFE2";
                              e.target.style.backgroundColor = "#FAFBF9";
                            }}
                          />
                        ) : (
                          <input
                            value={values[s.key] ?? ""}
                            onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                            style={inStyle}
                            onFocus={(e) => {
                              e.target.style.borderColor = P;
                              e.target.style.backgroundColor = "#fff";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "#E5EFE2";
                              e.target.style.backgroundColor = "#FAFBF9";
                            }}
                          />
                        )}
                        
                        <button
                          onClick={() => saveSetting(s.key)}
                          disabled={saving[s.key]}
                          style={{ 
                            backgroundColor: saving[s.key] ? "#EAF0E9" : P, 
                            color: saving[s.key] ? "#8BA088" : "#fff", 
                            border: "none", 
                            borderRadius: 12, 
                            height: 46,
                            padding: "0 20px", 
                            cursor: saving[s.key] ? "not-allowed" : "pointer", 
                            fontSize: 13, 
                            fontFamily: "'Inter',sans-serif", 
                            fontWeight: 700, 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 8, 
                            whiteSpace: "nowrap", 
                            flexShrink: 0,
                            transition: "all 0.2s",
                            boxShadow: saving[s.key] ? "none" : "0 4px 12px rgba(45,90,39,0.15)"
                          }}
                          onMouseEnter={(e) => { if(!saving[s.key]) e.currentTarget.style.backgroundColor = P_DARK; }}
                          onMouseLeave={(e) => { if(!saving[s.key]) e.currentTarget.style.backgroundColor = P; }}
                        >
                          {saving[s.key] ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Save size={15} />
                          )}
                          <span>{saving[s.key] ? "Saving..." : "Save"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* Database & Security Credentials Meta Message */}
        <div style={{ 
          backgroundColor: "#EFF6FF", 
          borderRadius: 20, 
          border: "1px solid #BFDBFE", 
          padding: "24px 28px",
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          boxShadow: "0 4px 12px rgba(30,64,175,0.02)"
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "#DBEAFE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "#1E40AF"
          }}>
            <Info size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1E40AF", fontFamily: "'Inter',sans-serif", margin: "0 0 6px" }}>
              System Admin Identity Registry
            </h4>
            <p style={{ fontSize: 13, color: "#1E40AF", fontFamily: "'Inter',sans-serif", lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
              To invite new administrators, configure role permissions, or revoke access tokens, navigate directly to your secure Cloud Admin Identity & Access console.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
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
