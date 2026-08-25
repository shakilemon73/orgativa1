import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import ImageUploader from "@/components/ImageUploader";
import { supabase, DbSiteSetting } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useProducts, useCategories } from "@/lib/supabase-hooks";
import { Link } from "wouter";
import {
  Globe,
  Truck,
  FileText,
  Megaphone,
  CheckCircle2,
  AlertCircle as AlertCircleIcon,
  Flame,
  Home,
  Share2,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ShoppingBag,
  ExternalLink,
  Plus,
  Trash2,
  ArrowRight,
  FolderTree,
  Sliders,
  DollarSign
} from "lucide-react";

const P = "#2D5A27";
const P_DARK = "#1a4016";

type TabKey = "branding" | "hero" | "categories" | "promos" | "trending" | "delivery" | "footer" | "invoice";

export default function AdminSettings() {
  const { t } = useLanguage();
  const { refreshSettings } = useSiteSettings();
  const { data: allProducts, loading: productsLoading } = useProducts();
  const { data: allCategories } = useCategories();

  const [activeTab, setActiveTab] = useState<TabKey>("branding");
  const [settings, setSettings] = useState<DbSiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [savingSection, setSavingSection] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeHeroSlot, setActiveHeroSlot] = useState<number | null>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  const DEFAULT_SETTINGS: Array<{ key: string; value: string; label: string; group_name: string }> = [
    // Branding & Identity
    { key: "site_name", value: "Orgativa", label: "Brand / Site Name", group_name: "branding" },
    { key: "logo_subtext", value: "Pure Organic", label: "Logo Subtext / Tagline", group_name: "branding" },
    { key: "site_logo_url", value: "/assets/orgativa_logo.png", label: "Site Logo Image URL", group_name: "branding" },
    { key: "site_tagline", value: "100% Pure Organic Harvest", label: "Global Store Tagline", group_name: "branding" },

    // Hero Section
    { key: "hero_product_slugs", value: JSON.stringify(["wild-forest-honey", "premium-pistachios", "cold-pressed-oil", "hand-churned-ghee"]), label: "Hero Top 4 Product Slugs (JSON)", group_name: "hero" },
    { key: "hero_title_en", value: "100% Pure, Unadulterated Organic Nutrition for Your Family", label: "Hero Title (English)", group_name: "hero" },
    { key: "hero_title_bn", value: "প্রাকৃতিক, বিশুদ্ধ ও প্রিমিয়াম অর্গানিক খাদ্য উপাদান", label: "Hero Title (Bangla)", group_name: "hero" },
    { key: "hero_subtitle_en", value: "Directly sourced from organic certified farms. Pure honey, raw ghee, premium nuts & herbal wellness delivered right to your home.", label: "Hero Subtitle (English)", group_name: "hero" },
    { key: "hero_subtitle_bn", value: "সরাসরি খামার থেকে ল্যাব-পরীক্ষিত শতভাগ প্রাকৃতিক মধু, ঘি, ড্রাই ফ্রুটস ও হার্বাল পণ্য পৌঁছে দিচ্ছি আপনার দুয়ারে।", label: "Hero Subtitle (Bangla)", group_name: "hero" },
    { key: "hero_badge_en", value: "🌿 100% CERTIFIED PURE & ORGANIC HARVEST", label: "Hero Badge Tag (English)", group_name: "hero" },
    { key: "hero_badge_bn", value: "🌿 ১০০% খাঁটি অর্গানিক অ্যান্ড ল্যাব সার্টিফাইড", label: "Hero Badge Tag (Bangla)", group_name: "hero" },

    // Shop By Category Section
    { key: "category_section_tag_en", value: "NATURE'S BEST", label: "Category Section Tag (English)", group_name: "categories" },
    { key: "category_section_tag_bn", value: "প্রকৃতির সেরা", label: "Category Section Tag (Bangla)", group_name: "categories" },
    { key: "category_section_title_en", value: "Shop By Category", label: "Category Section Title (English)", group_name: "categories" },
    { key: "category_section_title_bn", value: "বিভাগ অনুযায়ী কেনাকাটা", label: "Category Section Title (Bangla)", group_name: "categories" },

    // Deals & Promo Cards (Flash Deal, New Arrival, Best Seller)
    { key: "promo_card1_label_en", value: "FLASH DEAL", label: "Promo Card 1 Label (English)", group_name: "promos" },
    { key: "promo_card1_label_bn", value: "ফ্ল্যাশ ডিল", label: "Promo Card 1 Label (Bangla)", group_name: "promos" },
    { key: "promo_card1_tag_en", value: "30% OFF", label: "Promo Card 1 Tag (English)", group_name: "promos" },
    { key: "promo_card1_tag_bn", value: "৩০% ছাড়", label: "Promo Card 1 Tag (Bangla)", group_name: "promos" },
    { key: "promo_card1_title_en", value: "Sundarbans Wild Honey", label: "Promo Card 1 Title (English)", group_name: "promos" },
    { key: "promo_card1_title_bn", value: "সুন্দরবনের মধু", label: "Promo Card 1 Title (Bangla)", group_name: "promos" },
    { key: "promo_card1_sub_en", value: "Limited stock · Ends tonight", label: "Promo Card 1 Subtitle (English)", group_name: "promos" },
    { key: "promo_card1_sub_bn", value: "সীমিত স্টক · আজ রাতেই শেষ", label: "Promo Card 1 Subtitle (Bangla)", group_name: "promos" },
    { key: "promo_card1_icon", value: "hive", label: "Promo Card 1 Icon", group_name: "promos" },
    { key: "promo_card1_color", value: "#D64545", label: "Promo Card 1 Color", group_name: "promos" },
    { key: "promo_card1_slug", value: "honey", label: "Promo Card 1 Category Slug", group_name: "promos" },

    { key: "promo_card2_label_en", value: "NEW ARRIVAL", label: "Promo Card 2 Label (English)", group_name: "promos" },
    { key: "promo_card2_label_bn", value: "নতুন পণ্য", label: "Promo Card 2 Label (Bangla)", group_name: "promos" },
    { key: "promo_card2_tag_en", value: "FRESH", label: "Promo Card 2 Tag (English)", group_name: "promos" },
    { key: "promo_card2_tag_bn", value: "তাজা", label: "Promo Card 2 Tag (Bangla)", group_name: "promos" },
    { key: "promo_card2_title_en", value: "Sylhet Green Tea", label: "Promo Card 2 Title (English)", group_name: "promos" },
    { key: "promo_card2_title_bn", value: "সিলেটের সবুজ চা", label: "Promo Card 2 Title (Bangla)", group_name: "promos" },
    { key: "promo_card2_sub_en", value: "First flush spring harvest", label: "Promo Card 2 Subtitle (English)", group_name: "promos" },
    { key: "promo_card2_sub_bn", value: "প্রথম বসন্তের ফসল", label: "Promo Card 2 Subtitle (Bangla)", group_name: "promos" },
    { key: "promo_card2_icon", value: "local_cafe", label: "Promo Card 2 Icon", group_name: "promos" },
    { key: "promo_card2_color", value: "#2D5A27", label: "Promo Card 2 Color", group_name: "promos" },
    { key: "promo_card2_slug", value: "tea-coffee", label: "Promo Card 2 Category Slug", group_name: "promos" },

    { key: "promo_card3_label_en", value: "BEST SELLER", label: "Promo Card 3 Label (English)", group_name: "promos" },
    { key: "promo_card3_label_bn", value: "সেরা বিক্রয়", label: "Promo Card 3 Label (Bangla)", group_name: "promos" },
    { key: "promo_card3_tag_en", value: "#1", label: "Promo Card 3 Tag (English)", group_name: "promos" },
    { key: "promo_card3_tag_bn", value: "#১", label: "Promo Card 3 Tag (Bangla)", group_name: "promos" },
    { key: "promo_card3_title_en", value: "Rajshahi Mustard Oil", label: "Promo Card 3 Title (English)", group_name: "promos" },
    { key: "promo_card3_title_bn", value: "রাজশাহীর সরিষার তেল", label: "Promo Card 3 Title (Bangla)", group_name: "promos" },
    { key: "promo_card3_sub_en", value: "Cold-pressed stone mill", label: "Promo Card 3 Subtitle (English)", group_name: "promos" },
    { key: "promo_card3_sub_bn", value: "ঠান্ডা চাপা, পাথর ভাঙা", label: "Promo Card 3 Subtitle (Bangla)", group_name: "promos" },
    { key: "promo_card3_icon", value: "oil_barrel", label: "Promo Card 3 Icon", group_name: "promos" },
    { key: "promo_card3_color", value: "#7C3AED", label: "Promo Card 3 Color", group_name: "promos" },
    { key: "promo_card3_slug", value: "grocery", label: "Promo Card 3 Category Slug", group_name: "promos" },

    // Trending Section (Customer Favorites)
    { key: "trending_mode", value: "auto", label: "Trending Selection Mode ('auto' or 'manual')", group_name: "trending" },
    { key: "trending_top_sellers_slugs", value: JSON.stringify(["wild-forest-honey", "hand-churned-ghee", "premium-pistachios", "cold-pressed-oil", "chia-seeds-organic", "organic-moringa-powder"]), label: "Top Sellers Tab Product Slugs", group_name: "trending" },
    { key: "trending_featured_slugs", value: JSON.stringify(["wild-forest-honey", "hand-churned-ghee", "cold-pressed-mustard-oil", "kashmiri-saffron", "premium-medjool-dates", "organic-turmeric-powder"]), label: "Featured Tab Product Slugs", group_name: "trending" },
    { key: "trending_deals_slugs", value: JSON.stringify(["wild-forest-honey", "premium-pistachios", "hand-churned-ghee", "cold-pressed-oil", "chia-seeds-organic", "organic-moringa-powder"]), label: "Deals Tab Product Slugs", group_name: "trending" },

    // Footer Information
    { key: "footer_about_text", value: "Orgativa is Bangladesh's premier organic food brand dedicated to reviving pure, unadulterated nature. Sourced directly from certified eco-farms across Bangladesh and laboratory tested for utmost purity.", label: "Footer About / Company Bio", group_name: "footer" },
    { key: "footer_hotline_number", value: "+880 1700-000000", label: "Customer Hotline Phone", group_name: "footer" },
    { key: "footer_hotline_hours", value: "9:00 AM – 10:00 PM (Everyday)", label: "Hotline Operating Hours", group_name: "footer" },
    { key: "footer_support_email", value: "support@orgativa.com.bd", label: "Customer Support Email", group_name: "footer" },
    { key: "footer_corp_email", value: "corporate@orgativa.com.bd", label: "Corporate & Wholesale Email", group_name: "footer" },
    { key: "footer_hq_address", value: "House 12, Road 5, Block D, Bashundhara R/A, Dhaka-1229, Bangladesh", label: "Headquarters Physical Address", group_name: "footer" },
    { key: "footer_social_facebook", value: "https://facebook.com", label: "Facebook Page URL", group_name: "footer" },
    { key: "footer_social_instagram", value: "https://instagram.com", label: "Instagram Profile URL", group_name: "footer" },
    { key: "footer_social_youtube", value: "https://youtube.com", label: "YouTube Channel URL", group_name: "footer" },
    { key: "footer_social_linkedin", value: "https://linkedin.com", label: "LinkedIn Page URL", group_name: "footer" },
    { key: "footer_social_tiktok", value: "https://tiktok.com", label: "TikTok Profile URL", group_name: "footer" },
    { key: "footer_appstore_url", value: "https://apple.com/app-store", label: "Apple App Store URL", group_name: "footer" },
    { key: "footer_playstore_url", value: "https://play.google.com/store", label: "Google Play Store URL", group_name: "footer" },
    { key: "footer_copyright_text", value: "© 2026 Orgativa Bangladesh Ltd. All Rights Reserved. Pure Organic Lifestyle.", label: "Copyright Notice Text", group_name: "footer" },
    { key: "footer_delivery_note", value: "Delivering nationwide across all 64 districts in Bangladesh with 100% damage protection guarantee.", label: "Footer Delivery Network Note", group_name: "footer" },

    // Contact Aliases
    { key: "contact_phone", value: "+880 1700-000000", label: "Contact Phone", group_name: "footer" },
    { key: "contact_email", value: "support@orgativa.com.bd", label: "Contact Email", group_name: "footer" },
    { key: "contact_address", value: "House 12, Road 5, Bashundhara R/A, Dhaka-1229", label: "Contact Address", group_name: "footer" },
    { key: "contact_whatsapp", value: "+8801700000000", label: "WhatsApp Number", group_name: "footer" },
    { key: "facebook_page_url", value: "https://facebook.com", label: "Facebook URL", group_name: "footer" },

    // Delivery & Shipping
    { key: "delivery_inside_dhaka", value: "60", label: "Delivery Charge Inside Dhaka (৳)", group_name: "delivery" },
    { key: "delivery_outside_dhaka", value: "120", label: "Delivery Charge Outside Dhaka (৳)", group_name: "delivery" },
    { key: "delivery_free_threshold", value: "1500", label: "Free Shipping Minimum Order Amount (৳)", group_name: "delivery" },
    { key: "delivery_estimated_dhaka", value: "24-48 Hours", label: "Estimated Delivery Time (Inside Dhaka)", group_name: "delivery" },
    { key: "delivery_estimated_outside", value: "2-4 Days", label: "Estimated Delivery Time (Outside Dhaka)", group_name: "delivery" },
    { key: "delivery_policy_note", value: "Cash on delivery available nationwide with open box verification on arrival.", label: "Delivery Policy Note", group_name: "delivery" },

    // Invoice Customization
    { key: "invoice_title", value: "Orgativa", label: "Invoice Title / Brand Name", group_name: "invoice" },
    { key: "invoice_subtitle", value: "Pure Organic Harvest", label: "Invoice Subtitle / Slogan", group_name: "invoice" },
    { key: "invoice_accent_color", value: "#2D5A27", label: "Invoice Accent Color Hex", group_name: "invoice" },
    { key: "invoice_logo_url", value: "/assets/orgativa_logo.png", label: "Invoice Logo Image URL", group_name: "invoice" },
    { key: "invoice_address", value: "Bashundhara R/A, Dhaka-1229 | Hotline: +880 1700-000000 | support@orgativa.com.bd", label: "Invoice Header Address / Info", group_name: "invoice" },
    { key: "invoice_terms", value: "Thank you for choosing Orgativa! Our products are 100% natural, lab-tested, and chemical-free. If you have any questions or return queries, please contact our hotline within 7 days.", label: "Invoice Terms & Footer Note", group_name: "invoice" },

    // Promo Announcement Bar
    { key: "promo_topbar_text_en", value: "🌿 Free shipping across Bangladesh on orders over ৳1,500! Use coupon: ORGATIVA10", label: "Announcement Bar Text (English)", group_name: "promos" },
    { key: "promo_topbar_text_bn", value: "🌿 ১৫০০ টাকার কেনাকাটায় সারা বাংলাদেশে ফ্রি হোম ডেলিভারি! প্রোমো কোড: ORGATIVA10", label: "Announcement Bar Text (Bangla)", group_name: "promos" },
  ];

  async function loadSettings() {
    if (!supabase) { setLoading(false); return; }
    try {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      const dbSettings = data ?? [];

      const mergedSettings = [...dbSettings];
      DEFAULT_SETTINGS.forEach((field) => {
        if (!mergedSettings.some((s) => s.key === field.key)) {
          mergedSettings.push(field);
        }
      });

      setSettings(mergedSettings);
      const v: Record<string, string> = {};
      mergedSettings.forEach((s) => { v[s.key] = s.value; });
      setValues(v);
    } catch (err) {
      console.error("Error loading settings:", err);
      showToast("Failed to load settings from database.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function saveSingleSetting(key: string) {
    if (!supabase) return;
    setSaving((prev) => ({ ...prev, [key]: true }));
    const item = settings.find((s) => s.key === key) || DEFAULT_SETTINGS.find((s) => s.key === key);
    const val = values[key] ?? "";

    try {
      const { error } = await supabase.from("site_settings").upsert({
        key,
        value: val,
        label: item?.label || key,
        group_name: item?.group_name || "general",
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      // Sync aliases
      if (key === "footer_hotline_number" || key === "contact_phone") {
        await supabase.from("site_settings").upsert({ key: "contact_phone", value: val, label: "Contact Phone", group_name: "footer" });
        await supabase.from("site_settings").upsert({ key: "site_phone", value: val, label: "Site Phone", group_name: "footer" });
        await supabase.from("site_settings").upsert({ key: "footer_hotline_number", value: val, label: "Customer Hotline Phone", group_name: "footer" });
      } else if (key === "footer_support_email" || key === "contact_email") {
        await supabase.from("site_settings").upsert({ key: "contact_email", value: val, label: "Contact Support Email", group_name: "footer" });
        await supabase.from("site_settings").upsert({ key: "site_email", value: val, label: "Site Email", group_name: "footer" });
        await supabase.from("site_settings").upsert({ key: "footer_support_email", value: val, label: "Customer Support Email", group_name: "footer" });
      } else if (key === "footer_hq_address" || key === "contact_address") {
        await supabase.from("site_settings").upsert({ key: "contact_address", value: val, label: "Contact Address", group_name: "footer" });
        await supabase.from("site_settings").upsert({ key: "footer_hq_address", value: val, label: "Headquarters Physical Address", group_name: "footer" });
      } else if (key === "footer_social_facebook" || key === "facebook_page_url") {
        await supabase.from("site_settings").upsert({ key: "facebook_page_url", value: val, label: "Facebook URL", group_name: "footer" });
        await supabase.from("site_settings").upsert({ key: "footer_social_facebook", value: val, label: "Facebook Page URL", group_name: "footer" });
      } else if (key === "delivery_inside_dhaka") {
        await supabase.from("site_settings").upsert({ key: "delivery_fee", value: val, label: "Delivery Fee", group_name: "delivery" });
      } else if (key === "delivery_free_threshold") {
        await supabase.from("site_settings").upsert({ key: "free_delivery_above", value: val, label: "Free Shipping Threshold", group_name: "delivery" });
      }

      showToast(`Saved "${item?.label || key}" successfully.`);
      await refreshSettings();
    } catch (err: any) {
      console.error("Save error:", err);
      showToast(`Error saving setting: ${err.message || "Unknown error"}`, "error");
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function saveSectionSettings(keys: string[]) {
    if (!supabase) return;
    setSavingSection(true);
    try {
      for (const key of keys) {
        const item = settings.find((s) => s.key === key) || DEFAULT_SETTINGS.find((s) => s.key === key);
        const val = values[key] ?? "";
        await supabase.from("site_settings").upsert({
          key,
          value: val,
          label: item?.label || key,
          group_name: item?.group_name || "general",
          updated_at: new Date().toISOString()
        });

        // Sync aliases
        if (key === "delivery_inside_dhaka") {
          await supabase.from("site_settings").upsert({ key: "delivery_fee", value: val, label: "Delivery Fee", group_name: "delivery" });
        } else if (key === "delivery_free_threshold") {
          await supabase.from("site_settings").upsert({ key: "free_delivery_above", value: val, label: "Free Shipping Threshold", group_name: "delivery" });
        }
      }
      showToast("All settings saved successfully!");
      await refreshSettings();
    } catch (err: any) {
      console.error("Section save error:", err);
      showToast("Failed to save some settings.", "error");
    } finally {
      setSavingSection(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1.5px solid #E2EDE0",
    borderRadius: 12,
    padding: "11px 15px",
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    color: "#1F2937",
    outline: "none",
    backgroundColor: "#FAFDF9",
    transition: "border-color 0.2s, background-color 0.2s",
    fontWeight: 500,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#52634F",
    fontFamily: "'Inter', sans-serif",
    marginBottom: 6,
  };

  // Helper for Hero 4 Products Selection
  const heroSlugs: string[] = (() => {
    try {
      const raw = values["hero_product_slugs"] || "";
      if (!raw) return ["wild-forest-honey", "premium-pistachios", "cold-pressed-oil", "hand-churned-ghee"];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return ["wild-forest-honey", "premium-pistachios", "cold-pressed-oil", "hand-churned-ghee"];
    }
  })();

  function setHeroSlugs(slugs: string[]) {
    const jsonStr = JSON.stringify(slugs);
    setValues((prev) => ({ ...prev, hero_product_slugs: jsonStr }));
  }

  function handleProductClick(slug: string) {
    // If clicking a product already selected
    if (heroSlugs.includes(slug)) {
      // Remove it from its slot
      const next = heroSlugs.filter((s) => s !== slug);
      setHeroSlugs(next);
      showToast(`Removed product from hero slot.`);
      return;
    }

    // If user clicked a specific slot before choosing a product
    if (activeHeroSlot !== null && activeHeroSlot >= 0 && activeHeroSlot < 4) {
      const next = [...heroSlugs];
      // Pad array if needed
      while (next.length < 4) {
        next.push("");
      }
      next[activeHeroSlot] = slug;
      const cleaned = next.filter(Boolean);
      setHeroSlugs(cleaned);
      showToast(`Assigned product to Slot ${activeHeroSlot + 1}.`);
      setActiveHeroSlot(null);
      return;
    }

    // Otherwise, normal append or replace behavior
    if (heroSlugs.length < 4) {
      const next = [...heroSlugs, slug];
      setHeroSlugs(next);
      showToast(`Added to Slot ${next.length} (${next.length}/4 selected).`);
    } else {
      // If 4 already filled, replace the last slot gracefully instead of throwing a blocking error
      const next = [...heroSlugs.slice(0, 3), slug];
      setHeroSlugs(next);
      showToast(`Replaced Slot 4 with selected product. Click any slot above to replace a specific position.`);
    }
  }

  function removeHeroSlugAt(index: number) {
    const next = heroSlugs.filter((_, i) => i !== index);
    setHeroSlugs(next);
    showToast(`Cleared Slot ${index + 1}.`);
  }

  function clearAllHeroSlots() {
    setHeroSlugs([]);
    showToast("Cleared all 4 hero slots. Pick any 4 products below.");
  }

  function resetHeroToDefaults() {
    setHeroSlugs(["wild-forest-honey", "premium-pistachios", "cold-pressed-oil", "hand-churned-ghee"]);
    showToast("Reset Hero 4 products to default organic bestsellers.");
  }

  // Helper for Trending Tabs Slugs
  function getTabSlugs(key: string): string[] {
    try {
      const raw = values[key] || "";
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function toggleTabSlug(key: string, slug: string) {
    const current = getTabSlugs(key);
    let next: string[];
    if (current.includes(slug)) {
      next = current.filter((s) => s !== slug);
    } else {
      if (current.length >= 8) {
        showToast("Maximum 8 items per trending tab allowed.", "error");
        return;
      }
      next = [...current, slug];
    }
    setValues((prev) => ({ ...prev, [key]: JSON.stringify(next) }));
  }

  const TABS_CONFIG: Array<{ key: TabKey; label: string; icon: any; count: number }> = [
    { key: "branding", label: "Logo & Brand Identity", icon: Globe, count: 4 },
    { key: "hero", label: "Hero Top 4 Products", icon: Home, count: 5 },
    { key: "categories", label: "Shop By Category", icon: FolderTree, count: 4 },
    { key: "promos", label: "Deals & Promo Cards", icon: Megaphone, count: 12 },
    { key: "delivery", label: "Delivery & Shipping", icon: Truck, count: 6 },
    { key: "trending", label: "Customer Favorites Tabs", icon: Flame, count: 4 },
    { key: "footer", label: "Footer Info & Links", icon: Share2, count: 14 },
    { key: "invoice", label: "Invoice & Receipts", icon: FileText, count: 6 },
  ];

  return (
    <AdminLayout title="Store & Site Settings">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          backgroundColor: toast.type === "success" ? "#0D1F0B" : "#7F1D1D",
          color: "#fff",
          borderRadius: 14,
          padding: "14px 22px",
          fontSize: 13,
          fontFamily: "'Inter',sans-serif",
          fontWeight: 600,
          zIndex: 9999,
          boxShadow: "0 14px 36px rgba(0,0,0,0.22)",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          {toast.type === "success" ? <CheckCircle2 size={16} style={{ color: "#34D399" }} /> : <AlertCircleIcon size={16} style={{ color: "#F87171" }} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div style={{ maxWidth: 1120, margin: "0 auto", paddingBottom: 60 }}>
        {/* Navigation Tabs Bar */}
        <div style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 16,
          marginBottom: 24,
          borderBottom: "1px solid #E8EDE7",
        }}>
          {TABS_CONFIG.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  borderRadius: 12,
                  backgroundColor: active ? "#E8F5E3" : "#fff",
                  border: `1.5px solid ${active ? P : "#E5EFE2"}`,
                  color: active ? P_DARK : "#52634F",
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  fontFamily: "'Inter',sans-serif",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  boxShadow: active ? "0 2px 8px rgba(45,90,39,0.12)" : "none"
                }}
              >
                <Icon size={16} style={{ color: active ? P : "#8FA888" }} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <div className="animate-spin" style={{ width: 32, height: 32, border: `3px solid ${P}`, borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 16px" }} />
            <p style={{ color: "#6B726A", fontSize: 13, fontFamily: "'Inter',sans-serif" }}>Loading store settings...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* 1. BRANDING TAB */}
            {activeTab === "branding" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <SectionCard
                  title="Logo & Brand Identity"
                  subtitle="Configure your brand name, store logo, and global tagline seen on header and search engines."
                  icon={Globe}
                  onSaveAll={() => saveSectionSettings(["site_name", "logo_subtext", "site_tagline", "site_logo_url"])}
                  savingAll={savingSection}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Brand / Store Name</label>
                      <input
                        value={values["site_name"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, site_name: e.target.value }))}
                        placeholder="Orgativa"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Logo Subtext / Slogan</label>
                      <input
                        value={values["logo_subtext"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, logo_subtext: e.target.value }))}
                        placeholder="Pure Organic"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>Global Tagline / Slogan</label>
                    <input
                      value={values["site_tagline"] ?? ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, site_tagline: e.target.value }))}
                      placeholder="100% Pure Organic Harvest"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <label style={labelStyle}>Store Logo Image</label>
                    <ImageUploader
                      value={values["site_logo_url"] ?? ""}
                      onChange={(url) => setValues((prev) => ({ ...prev, site_logo_url: url }))}
                      folder="settings"
                    />
                  </div>
                </SectionCard>
              </div>
            )}

            {/* 2. HERO TAB */}
            {activeTab === "hero" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <SectionCard
                  title="Hero Top 4 Featured Products"
                  subtitle="Select exactly 4 products to display in the floating 2x2 grid on the homepage hero banner. Customers can click them directly."
                  icon={Home}
                  onSaveAll={() => saveSectionSettings(["hero_product_slugs", "hero_title_en", "hero_title_bn", "hero_subtitle_en", "hero_subtitle_bn", "hero_badge_en", "hero_badge_bn"])}
                  savingAll={savingSection}
                >
                  {/* Visual 4-Slot Control Grid */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0D1F0B", fontFamily: "'Inter',sans-serif" }}>
                          Active 4 Hero Slots ({heroSlugs.length}/4)
                        </span>
                        <p style={{ fontSize: 11, color: "#6B726A", margin: "2px 0 0" }}>
                          Click a slot to focus/replace it, or click any product from the catalog below.
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={clearAllHeroSlots}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: "1px solid #E5E7EB",
                            backgroundColor: "#fff",
                            color: "#4B5563",
                            cursor: "pointer"
                          }}
                        >
                          <Trash2 size={12} /> Clear All
                        </button>
                        <button
                          type="button"
                          onClick={resetHeroToDefaults}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: `1px solid ${P}`,
                            backgroundColor: "#E8F5E3",
                            color: P_DARK,
                            cursor: "pointer"
                          }}
                        >
                          <RotateCcw size={12} /> Reset 4 Defaults
                        </button>
                      </div>
                    </div>

                    {/* 4 Dedicated Slots Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 20 }}>
                      {[0, 1, 2, 3].map((slotIdx) => {
                        const slug = heroSlugs[slotIdx];
                        const product = slug ? allProducts.find((p) => p.slug === slug) : null;
                        const isFocused = activeHeroSlot === slotIdx;

                        return (
                          <div
                            key={slotIdx}
                            onClick={() => setActiveHeroSlot(isFocused ? null : slotIdx)}
                            style={{
                              border: isFocused ? `2px solid ${P}` : "1.5px solid #D7E8D3",
                              borderRadius: 14,
                              backgroundColor: isFocused ? "#F0FAF0" : "#fff",
                              padding: 12,
                              position: "relative",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              boxShadow: isFocused ? "0 4px 14px rgba(45,90,39,0.18)" : "0 1px 4px rgba(0,0,0,0.03)"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: P, backgroundColor: "#E8F5E3", padding: "2px 6px", borderRadius: 6 }}>
                                Slot {slotIdx + 1} {isFocused ? "• (Picking)" : ""}
                              </span>
                              {slug && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeHeroSlugAt(slotIdx);
                                  }}
                                  style={{
                                    border: "none",
                                    backgroundColor: "#FEE2E2",
                                    color: "#DC2626",
                                    borderRadius: "50%",
                                    width: 20,
                                    height: 20,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontSize: 10,
                                    fontWeight: 700
                                  }}
                                  title="Remove from slot"
                                >
                                  ✕
                                </button>
                              )}
                            </div>

                            {product ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8, backgroundColor: "#F7FAF6", padding: 2 }}
                                />
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <p style={{ fontSize: 12, fontWeight: 700, color: "#1F2937", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {product.nameEn || product.name}
                                  </p>
                                  <p style={{ fontSize: 11, color: P, fontWeight: 700, margin: "2px 0 0" }}>
                                    ৳{product.price}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px dashed #CBD5E1", borderRadius: 8, color: "#64748B", fontSize: 11, fontWeight: 600 }}>
                                <Plus size={14} style={{ marginRight: 4 }} /> Click product below to set Slot {slotIdx + 1}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Catalog Picker */}
                    <div style={{
                      backgroundColor: "#F7FAF6",
                      borderRadius: 14,
                      border: "1.5px solid #E2EDE0",
                      padding: 14
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                          Choose from Store Catalog ({allProducts.length} items):
                        </span>
                        <span style={{ fontSize: 11, color: "#6B726A" }}>
                          {activeHeroSlot !== null ? `👉 Click a product to place into Slot ${activeHeroSlot + 1}` : "Click any product to add / swap into Hero"}
                        </span>
                      </div>

                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                        gap: 10,
                        maxHeight: 340,
                        overflowY: "auto",
                        paddingRight: 4
                      }}>
                        {allProducts.map((p) => {
                          const slotIndex = heroSlugs.indexOf(p.slug);
                          const isSelected = slotIndex !== -1;
                          return (
                            <div
                              key={p.slug}
                              onClick={() => handleProductClick(p.slug)}
                              style={{
                                backgroundColor: isSelected ? "#E8F5E3" : "#fff",
                                border: `1.5px solid ${isSelected ? P : "#E2EDE0"}`,
                                borderRadius: 10,
                                padding: 8,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                transition: "all 0.15s",
                                boxShadow: isSelected ? "0 2px 6px rgba(45,90,39,0.12)" : "none"
                              }}
                            >
                              <img
                                src={p.image}
                                alt={p.name}
                                style={{ width: 38, height: 38, objectFit: "contain", borderRadius: 6, backgroundColor: "#fff", padding: 2 }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: "#1F2937", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {p.nameEn || p.name}
                                </p>
                                <p style={{ fontSize: 11, color: P, fontWeight: 700, margin: "1px 0 0" }}>
                                  ৳{p.price}
                                </p>
                              </div>
                              {isSelected ? (
                                <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", backgroundColor: P, borderRadius: 999, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  S{slotIndex + 1}
                                </span>
                              ) : (
                                <Plus size={14} style={{ color: "#9CA3AF" }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Hero Text Customization */}
                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #EEF2ED" }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0D1F0B", marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>
                      Hero Banner Typography & Copy
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div>
                        <label style={labelStyle}>Hero Title (English)</label>
                        <input
                          value={values["hero_title_en"] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, hero_title_en: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Hero Title (Bangla)</label>
                        <input
                          value={values["hero_title_bn"] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, hero_title_bn: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div>
                        <label style={labelStyle}>Hero Subtitle (English)</label>
                        <textarea
                          rows={3}
                          value={values["hero_subtitle_en"] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, hero_subtitle_en: e.target.value }))}
                          style={{ ...inputStyle, resize: "vertical" }}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Hero Subtitle (Bangla)</label>
                        <textarea
                          rows={3}
                          value={values["hero_subtitle_bn"] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, hero_subtitle_bn: e.target.value }))}
                          style={{ ...inputStyle, resize: "vertical" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Hero Badge Tag (English)</label>
                        <input
                          value={values["hero_badge_en"] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, hero_badge_en: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Hero Badge Tag (Bangla)</label>
                        <input
                          value={values["hero_badge_bn"] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, hero_badge_bn: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* 3. CATEGORIES TAB */}
            {activeTab === "categories" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <SectionCard
                  title="Shop By Category Section"
                  subtitle="Customize the titles for the Shop By Category section and easily manage custom categories."
                  icon={FolderTree}
                  onSaveAll={() => saveSectionSettings([
                    "category_section_title_en",
                    "category_section_title_bn",
                    "category_section_tag_en",
                    "category_section_tag_bn"
                  ])}
                  savingAll={savingSection}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Section Heading Title (English)</label>
                      <input
                        value={values["category_section_title_en"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, category_section_title_en: e.target.value }))}
                        placeholder="Shop By Category"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Section Heading Title (Bangla)</label>
                      <input
                        value={values["category_section_title_bn"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, category_section_title_bn: e.target.value }))}
                        placeholder="বিভাগ অনুযায়ী কেনাকাটা"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                    <div>
                      <label style={labelStyle}>Section Nature Tag (English)</label>
                      <input
                        value={values["category_section_tag_en"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, category_section_tag_en: e.target.value }))}
                        placeholder="NATURE'S BEST"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Section Nature Tag (Bangla)</label>
                      <input
                        value={values["category_section_tag_bn"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, category_section_tag_bn: e.target.value }))}
                        placeholder="প্রকৃতির সেরা"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Direct Category Manager Shortcut */}
                  <div style={{
                    backgroundColor: "#F4F8F3",
                    border: "1.5px solid #D2E4CE",
                    borderRadius: 14,
                    padding: "18px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16
                  }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1E3A1A", fontFamily: "'Inter',sans-serif" }}>
                        Custom Categories & Shelves Management
                      </h4>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#4A6B46" }}>
                        Add new custom categories, upload cover artwork, reorder categories, and edit Bangla/English labels.
                      </p>
                    </div>
                    <Link href="/admin/categories"
                      style={{
                        backgroundColor: P,
                        color: "#fff",
                        padding: "10px 20px",
                        borderRadius: 10,
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        whiteSpace: "nowrap",
                        boxShadow: "0 2px 8px rgba(45,90,39,0.25)"
                      }}
                    >
                      <FolderTree size={16} /> Open Category Manager <ArrowRight size={14} />
                    </Link>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* 4. PROMOS & DEALS TAB */}
            {activeTab === "promos" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <SectionCard
                  title="Homepage Promo Cards & Top Deals"
                  subtitle="Customize the 3 interactive deal cards displayed on the homepage (Flash Deal, New Arrival, Best Seller) with custom icons, badges, colors, and titles."
                  icon={Megaphone}
                  onSaveAll={() => saveSectionSettings([
                    "promo_card1_label_en", "promo_card1_label_bn", "promo_card1_tag_en", "promo_card1_tag_bn", "promo_card1_title_en", "promo_card1_title_bn", "promo_card1_sub_en", "promo_card1_sub_bn", "promo_card1_icon", "promo_card1_color", "promo_card1_slug",
                    "promo_card2_label_en", "promo_card2_label_bn", "promo_card2_tag_en", "promo_card2_tag_bn", "promo_card2_title_en", "promo_card2_title_bn", "promo_card2_sub_en", "promo_card2_sub_bn", "promo_card2_icon", "promo_card2_color", "promo_card2_slug",
                    "promo_card3_label_en", "promo_card3_label_bn", "promo_card3_tag_en", "promo_card3_tag_bn", "promo_card3_title_en", "promo_card3_title_bn", "promo_card3_sub_en", "promo_card3_sub_bn", "promo_card3_icon", "promo_card3_color", "promo_card3_slug",
                    "promo_topbar_text_en", "promo_topbar_text_bn"
                  ])}
                  savingAll={savingSection}
                >
                  {/* Top Bar Announcement */}
                  <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #EEF2ED" }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
                      Global Top Announcement Bar
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Announcement Text (English)</label>
                        <input
                          value={values["promo_topbar_text_en"] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, promo_topbar_text_en: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Announcement Text (Bangla)</label>
                        <input
                          value={values["promo_topbar_text_bn"] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, promo_topbar_text_bn: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 1: Flash Deal */}
                  <div style={{ backgroundColor: "#FFFBF5", border: "1.5px solid #FEE2A0", borderRadius: 14, padding: 18, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 24, color: values["promo_card1_color"] || "#D64545" }}>
                        {values["promo_card1_icon"] || "hive"}
                      </span>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#78350F" }}>
                        Card 1: Flash Deal (Hive / Honey Highlight)
                      </h4>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={labelStyle}>Label (EN)</label>
                        <input value={values["promo_card1_label_en"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card1_label_en: e.target.value }))} style={inputStyle} placeholder="FLASH DEAL" />
                      </div>
                      <div>
                        <label style={labelStyle}>Label (BN)</label>
                        <input value={values["promo_card1_label_bn"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card1_label_bn: e.target.value }))} style={inputStyle} placeholder="ফ্ল্যাশ ডিল" />
                      </div>
                      <div>
                        <label style={labelStyle}>Tag (EN)</label>
                        <input value={values["promo_card1_tag_en"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card1_tag_en: e.target.value }))} style={inputStyle} placeholder="30% OFF" />
                      </div>
                      <div>
                        <label style={labelStyle}>Tag (BN)</label>
                        <input value={values["promo_card1_tag_bn"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card1_tag_bn: e.target.value }))} style={inputStyle} placeholder="৩০% ছাড়" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={labelStyle}>Title (EN)</label>
                        <input value={values["promo_card1_title_en"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card1_title_en: e.target.value }))} style={inputStyle} placeholder="Sundarbans Wild Honey" />
                      </div>
                      <div>
                        <label style={labelStyle}>Title (BN)</label>
                        <input value={values["promo_card1_title_bn"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card1_title_bn: e.target.value }))} style={inputStyle} placeholder="সুন্দরবনের মধু" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={labelStyle}>Subtitle (EN)</label>
                        <input value={values["promo_card1_sub_en"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card1_sub_en: e.target.value }))} style={inputStyle} placeholder="Limited stock · Ends tonight" />
                      </div>
                      <div>
                        <label style={labelStyle}>Subtitle (BN)</label>
                        <input value={values["promo_card1_sub_bn"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card1_sub_bn: e.target.value }))} style={inputStyle} placeholder="সীমিত স্টক · আজ রাতেই শেষ" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Icon (Material Symbol)</label>
                        <input value={values["promo_card1_icon"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card1_icon: e.target.value }))} style={inputStyle} placeholder="hive" />
                      </div>
                      <div>
                        <label style={labelStyle}>Accent Color Hex</label>
                        <input value={values["promo_card1_color"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card1_color: e.target.value }))} style={inputStyle} placeholder="#D64545" />
                      </div>
                      <div>
                        <label style={labelStyle}>Target Category Slug</label>
                        <input value={values["promo_card1_slug"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card1_slug: e.target.value }))} style={inputStyle} placeholder="honey" />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: New Arrival */}
                  <div style={{ backgroundColor: "#F7FEFA", border: "1.5px solid #D1FAE5", borderRadius: 14, padding: 18, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 24, color: values["promo_card2_color"] || P }}>
                        {values["promo_card2_icon"] || "local_cafe"}
                      </span>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#065F46" }}>
                        Card 2: New Arrival (Local Cafe / Green Tea Highlight)
                      </h4>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={labelStyle}>Label (EN)</label>
                        <input value={values["promo_card2_label_en"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card2_label_en: e.target.value }))} style={inputStyle} placeholder="NEW ARRIVAL" />
                      </div>
                      <div>
                        <label style={labelStyle}>Label (BN)</label>
                        <input value={values["promo_card2_label_bn"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card2_label_bn: e.target.value }))} style={inputStyle} placeholder="নতুন পণ্য" />
                      </div>
                      <div>
                        <label style={labelStyle}>Tag (EN)</label>
                        <input value={values["promo_card2_tag_en"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card2_tag_en: e.target.value }))} style={inputStyle} placeholder="FRESH" />
                      </div>
                      <div>
                        <label style={labelStyle}>Tag (BN)</label>
                        <input value={values["promo_card2_tag_bn"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card2_tag_bn: e.target.value }))} style={inputStyle} placeholder="তাজা" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={labelStyle}>Title (EN)</label>
                        <input value={values["promo_card2_title_en"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card2_title_en: e.target.value }))} style={inputStyle} placeholder="Sylhet Green Tea" />
                      </div>
                      <div>
                        <label style={labelStyle}>Title (BN)</label>
                        <input value={values["promo_card2_title_bn"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card2_title_bn: e.target.value }))} style={inputStyle} placeholder="সিলেটের সবুজ চা" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={labelStyle}>Subtitle (EN)</label>
                        <input value={values["promo_card2_sub_en"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card2_sub_en: e.target.value }))} style={inputStyle} placeholder="First flush spring harvest" />
                      </div>
                      <div>
                        <label style={labelStyle}>Subtitle (BN)</label>
                        <input value={values["promo_card2_sub_bn"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card2_sub_bn: e.target.value }))} style={inputStyle} placeholder="প্রথম বসন্তের ফসল" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Icon (Material Symbol)</label>
                        <input value={values["promo_card2_icon"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card2_icon: e.target.value }))} style={inputStyle} placeholder="local_cafe" />
                      </div>
                      <div>
                        <label style={labelStyle}>Accent Color Hex</label>
                        <input value={values["promo_card2_color"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card2_color: e.target.value }))} style={inputStyle} placeholder="#2D5A27" />
                      </div>
                      <div>
                        <label style={labelStyle}>Target Category Slug</label>
                        <input value={values["promo_card2_slug"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card2_slug: e.target.value }))} style={inputStyle} placeholder="tea-coffee" />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Best Seller */}
                  <div style={{ backgroundColor: "#FAF5FF", border: "1.5px solid #EDE9FE", borderRadius: 14, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 24, color: values["promo_card3_color"] || "#7C3AED" }}>
                        {values["promo_card3_icon"] || "oil_barrel"}
                      </span>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#5B21B6" }}>
                        Card 3: Best Seller (Oil Barrel / Mustard Oil Highlight)
                      </h4>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={labelStyle}>Label (EN)</label>
                        <input value={values["promo_card3_label_en"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card3_label_en: e.target.value }))} style={inputStyle} placeholder="BEST SELLER" />
                      </div>
                      <div>
                        <label style={labelStyle}>Label (BN)</label>
                        <input value={values["promo_card3_label_bn"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card3_label_bn: e.target.value }))} style={inputStyle} placeholder="সেরা বিক্রয়" />
                      </div>
                      <div>
                        <label style={labelStyle}>Tag (EN)</label>
                        <input value={values["promo_card3_tag_en"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card3_tag_en: e.target.value }))} style={inputStyle} placeholder="#1" />
                      </div>
                      <div>
                        <label style={labelStyle}>Tag (BN)</label>
                        <input value={values["promo_card3_tag_bn"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card3_tag_bn: e.target.value }))} style={inputStyle} placeholder="#১" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={labelStyle}>Title (EN)</label>
                        <input value={values["promo_card3_title_en"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card3_title_en: e.target.value }))} style={inputStyle} placeholder="Rajshahi Mustard Oil" />
                      </div>
                      <div>
                        <label style={labelStyle}>Title (BN)</label>
                        <input value={values["promo_card3_title_bn"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card3_title_bn: e.target.value }))} style={inputStyle} placeholder="রাজশাহীর সরিষার তেল" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={labelStyle}>Subtitle (EN)</label>
                        <input value={values["promo_card3_sub_en"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card3_sub_en: e.target.value }))} style={inputStyle} placeholder="Cold-pressed stone mill" />
                      </div>
                      <div>
                        <label style={labelStyle}>Subtitle (BN)</label>
                        <input value={values["promo_card3_sub_bn"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card3_sub_bn: e.target.value }))} style={inputStyle} placeholder="ঠান্ডা চাপা, পাথর ভাঙা" />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Icon (Material Symbol)</label>
                        <input value={values["promo_card3_icon"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card3_icon: e.target.value }))} style={inputStyle} placeholder="oil_barrel" />
                      </div>
                      <div>
                        <label style={labelStyle}>Accent Color Hex</label>
                        <input value={values["promo_card3_color"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card3_color: e.target.value }))} style={inputStyle} placeholder="#7C3AED" />
                      </div>
                      <div>
                        <label style={labelStyle}>Target Category Slug</label>
                        <input value={values["promo_card3_slug"] ?? ""} onChange={(e) => setValues((p) => ({ ...p, promo_card3_slug: e.target.value }))} style={inputStyle} placeholder="grocery" />
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* 5. DELIVERY TAB */}
            {activeTab === "delivery" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <SectionCard
                  title="Delivery Charges & Logistics Control"
                  subtitle="Set shipping fees for Inside and Outside Dhaka, configure free shipping threshold, and adjust delivery timelines."
                  icon={Truck}
                  onSaveAll={() => saveSectionSettings([
                    "delivery_inside_dhaka",
                    "delivery_outside_dhaka",
                    "delivery_free_threshold",
                    "delivery_estimated_dhaka",
                    "delivery_estimated_outside",
                    "delivery_policy_note"
                  ])}
                  savingAll={savingSection}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                    <div style={{ backgroundColor: "#F7FAF6", border: "1.5px solid #DCEAD8", borderRadius: 12, padding: 14 }}>
                      <label style={labelStyle}>Inside Dhaka Charge (৳)</label>
                      <input
                        type="number"
                        value={values["delivery_inside_dhaka"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, delivery_inside_dhaka: e.target.value }))}
                        placeholder="60"
                        style={inputStyle}
                      />
                      <p style={{ fontSize: 11, color: "#6B726A", margin: "6px 0 0" }}>
                        Default: ৳60 (Dhaka City area)
                      </p>
                    </div>

                    <div style={{ backgroundColor: "#F7FAF6", border: "1.5px solid #DCEAD8", borderRadius: 12, padding: 14 }}>
                      <label style={labelStyle}>Outside Dhaka Charge (৳)</label>
                      <input
                        type="number"
                        value={values["delivery_outside_dhaka"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, delivery_outside_dhaka: e.target.value }))}
                        placeholder="120"
                        style={inputStyle}
                      />
                      <p style={{ fontSize: 11, color: "#6B726A", margin: "6px 0 0" }}>
                        Default: ৳120 (All other districts)
                      </p>
                    </div>

                    <div style={{ backgroundColor: "#F7FAF6", border: "1.5px solid #DCEAD8", borderRadius: 12, padding: 14 }}>
                      <label style={labelStyle}>Free Shipping Threshold (৳)</label>
                      <input
                        type="number"
                        value={values["delivery_free_threshold"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, delivery_free_threshold: e.target.value }))}
                        placeholder="1500"
                        style={inputStyle}
                      />
                      <p style={{ fontSize: 11, color: "#6B726A", margin: "6px 0 0" }}>
                        Orders equal or above this get ৳0 delivery fee
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Estimated Time (Inside Dhaka)</label>
                      <input
                        value={values["delivery_estimated_dhaka"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, delivery_estimated_dhaka: e.target.value }))}
                        placeholder="24-48 Hours"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Estimated Time (Outside Dhaka)</label>
                      <input
                        value={values["delivery_estimated_outside"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, delivery_estimated_outside: e.target.value }))}
                        placeholder="2-4 Days"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Customer Delivery Note / Guarantee</label>
                    <textarea
                      rows={2}
                      value={values["delivery_policy_note"] ?? ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, delivery_policy_note: e.target.value }))}
                      placeholder="Cash on delivery available nationwide with open box verification on arrival."
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>

                  {/* Real-time Shipping Calculator Preview */}
                  <div style={{
                    marginTop: 20,
                    padding: "16px 20px",
                    backgroundColor: "#EEF8EC",
                    border: "1.5px solid #C5E2BE",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#1A4016" }}>
                        Live Shipping Policy Summary
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: 11, color: "#3B5E36" }}>
                        Inside Dhaka: <b>৳{values["delivery_inside_dhaka"] || "60"}</b> ({values["delivery_estimated_dhaka"] || "24-48h"}) • Outside Dhaka: <b>৳{values["delivery_outside_dhaka"] || "120"}</b> ({values["delivery_estimated_outside"] || "2-4d"}) • Free Delivery over <b>৳{values["delivery_free_threshold"] || "1,500"}</b>
                      </p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: P, backgroundColor: "#fff", padding: "4px 10px", borderRadius: 8, border: "1px solid #C5E2BE" }}>
                      Active
                    </span>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* 6. TRENDING TAB */}
            {activeTab === "trending" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <SectionCard
                  title="Customer Favorites / Trending Tabs"
                  subtitle="Configure which products appear in the 3 homepage tab views (Top Sellers, Featured, Deals)."
                  icon={Flame}
                  onSaveAll={() => saveSectionSettings([
                    "trending_mode",
                    "trending_top_sellers_slugs",
                    "trending_featured_slugs",
                    "trending_deals_slugs"
                  ])}
                  savingAll={savingSection}
                >
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Product Selection Mode</label>
                    <div style={{ display: "flex", gap: 12 }}>
                      {[
                        { val: "auto", label: "Automatic (By Highest Rated & Sales Count)" },
                        { val: "manual", label: "Manual Custom List (Configured Below)" },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setValues((prev) => ({ ...prev, trending_mode: opt.val }))}
                          style={{
                            flex: 1,
                            padding: "12px 16px",
                            borderRadius: 12,
                            backgroundColor: values["trending_mode"] === opt.val ? "#E8F5E3" : "#fff",
                            border: `1.5px solid ${values["trending_mode"] === opt.val ? P : "#E2EDE0"}`,
                            color: values["trending_mode"] === opt.val ? P_DARK : "#4B5563",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            textAlign: "left"
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab 1: Top Sellers */}
                  <div style={{ marginBottom: 20, backgroundColor: "#F7FAF6", border: "1px solid #E2EDE0", borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1F2937" }}>
                        Tab 1: Top Sellers (সেরা বিক্রীত) — {getTabSlugs("trending_top_sellers_slugs").length} selected
                      </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 180, overflowY: "auto" }}>
                      {allProducts.map((p) => {
                        const sel = getTabSlugs("trending_top_sellers_slugs").includes(p.slug);
                        return (
                          <button
                            key={p.slug}
                            type="button"
                            onClick={() => toggleTabSlug("trending_top_sellers_slugs", p.slug)}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "6px 12px",
                              borderRadius: 8,
                              backgroundColor: sel ? P : "#fff",
                              color: sel ? "#fff" : "#374151",
                              border: `1px solid ${sel ? P : "#D1D5DB"}`,
                              cursor: "pointer"
                            }}
                          >
                            {sel ? "✓ " : "+ "}{p.nameEn || p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tab 2: Featured */}
                  <div style={{ marginBottom: 20, backgroundColor: "#F7FAF6", border: "1px solid #E2EDE0", borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1F2937" }}>
                        Tab 2: Featured (জনপ্রিয়) — {getTabSlugs("trending_featured_slugs").length} selected
                      </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 180, overflowY: "auto" }}>
                      {allProducts.map((p) => {
                        const sel = getTabSlugs("trending_featured_slugs").includes(p.slug);
                        return (
                          <button
                            key={p.slug}
                            type="button"
                            onClick={() => toggleTabSlug("trending_featured_slugs", p.slug)}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "6px 12px",
                              borderRadius: 8,
                              backgroundColor: sel ? P : "#fff",
                              color: sel ? "#fff" : "#374151",
                              border: `1px solid ${sel ? P : "#D1D5DB"}`,
                              cursor: "pointer"
                            }}
                          >
                            {sel ? "✓ " : "+ "}{p.nameEn || p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tab 3: Deals */}
                  <div style={{ backgroundColor: "#F7FAF6", border: "1px solid #E2EDE0", borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1F2937" }}>
                        Tab 3: Deals (অফারসমূহ) — {getTabSlugs("trending_deals_slugs").length} selected
                      </span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 180, overflowY: "auto" }}>
                      {allProducts.map((p) => {
                        const sel = getTabSlugs("trending_deals_slugs").includes(p.slug);
                        return (
                          <button
                            key={p.slug}
                            type="button"
                            onClick={() => toggleTabSlug("trending_deals_slugs", p.slug)}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "6px 12px",
                              borderRadius: 8,
                              backgroundColor: sel ? P : "#fff",
                              color: sel ? "#fff" : "#374151",
                              border: `1px solid ${sel ? P : "#D1D5DB"}`,
                              cursor: "pointer"
                            }}
                          >
                            {sel ? "✓ " : "+ "}{p.nameEn || p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* 7. FOOTER TAB */}
            {activeTab === "footer" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <SectionCard
                  title="Footer Information & Support Channels"
                  subtitle="Configure hotline, corporate email, headquarters address, and social links."
                  icon={Share2}
                  onSaveAll={() => saveSectionSettings([
                    "footer_about_text",
                    "footer_hotline_number",
                    "footer_hotline_hours",
                    "footer_support_email",
                    "footer_corp_email",
                    "footer_hq_address",
                    "footer_social_facebook",
                    "footer_social_instagram",
                    "footer_social_youtube",
                    "footer_social_linkedin",
                    "footer_social_tiktok",
                    "footer_appstore_url",
                    "footer_playstore_url",
                    "footer_copyright_text",
                    "footer_delivery_note"
                  ])}
                  savingAll={savingSection}
                >
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Company Overview / About Bio</label>
                    <textarea
                      rows={3}
                      value={values["footer_about_text"] ?? ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, footer_about_text: e.target.value }))}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Customer Hotline Phone</label>
                      <input
                        value={values["footer_hotline_number"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, footer_hotline_number: e.target.value }))}
                        placeholder="+880 1700-000000"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Operating Hours</label>
                      <input
                        value={values["footer_hotline_hours"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, footer_hotline_hours: e.target.value }))}
                        placeholder="9:00 AM – 10:00 PM (Everyday)"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Customer Support Email</label>
                      <input
                        value={values["footer_support_email"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, footer_support_email: e.target.value }))}
                        placeholder="support@orgativa.com.bd"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Corporate Email</label>
                      <input
                        value={values["footer_corp_email"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, footer_corp_email: e.target.value }))}
                        placeholder="corporate@orgativa.com.bd"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Headquarters Physical Address</label>
                    <input
                      value={values["footer_hq_address"] ?? ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, footer_hq_address: e.target.value }))}
                      placeholder="House 12, Road 5, Block D, Bashundhara R/A, Dhaka-1229, Bangladesh"
                      style={inputStyle}
                    />
                  </div>

                  {/* Social Links */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Social Media Links</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#6B726A" }}>Facebook URL</span>
                        <input
                          value={values["footer_social_facebook"] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, footer_social_facebook: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#6B726A" }}>Instagram URL</span>
                        <input
                          value={values["footer_social_instagram"] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, footer_social_instagram: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#6B726A" }}>YouTube URL</span>
                        <input
                          value={values["footer_social_youtube"] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, footer_social_youtube: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#6B726A" }}>LinkedIn URL</span>
                        <input
                          value={values["footer_social_linkedin"] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, footer_social_linkedin: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Copyright Notice Text</label>
                      <input
                        value={values["footer_copyright_text"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, footer_copyright_text: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Footer Delivery Note</label>
                      <input
                        value={values["footer_delivery_note"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, footer_delivery_note: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* 8. INVOICE TAB */}
            {activeTab === "invoice" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <SectionCard
                  title="Invoice & Receipt Customization"
                  subtitle="Customize the printable invoice generated when customers make an order."
                  icon={FileText}
                  onSaveAll={() => saveSectionSettings([
                    "invoice_title",
                    "invoice_subtitle",
                    "invoice_accent_color",
                    "invoice_logo_url",
                    "invoice_address",
                    "invoice_terms"
                  ])}
                  savingAll={savingSection}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Invoice Title / Business Name</label>
                      <input
                        value={values["invoice_title"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, invoice_title: e.target.value }))}
                        placeholder="Orgativa"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Invoice Subtitle / Slogan</label>
                      <input
                        value={values["invoice_subtitle"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, invoice_subtitle: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Invoice Accent Color</label>
                      <div style={{ display: "flex", gap: 10 }}>
                        <input
                          type="color"
                          value={values["invoice_accent_color"]?.startsWith("#") ? values["invoice_accent_color"] : "#2D5A27"}
                          onChange={(e) => setValues((prev) => ({ ...prev, invoice_accent_color: e.target.value }))}
                          style={{ width: 46, height: 44, borderRadius: 10, border: "1.5px solid #E2EDE0", cursor: "pointer", padding: 0 }}
                        />
                        <input
                          value={values["invoice_accent_color"] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, invoice_accent_color: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Invoice Logo URL</label>
                      <input
                        value={values["invoice_logo_url"] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, invoice_logo_url: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Invoice Contact Header</label>
                    <input
                      value={values["invoice_address"] ?? ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, invoice_address: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Invoice Terms & Return Policy Footer</label>
                    <textarea
                      rows={3}
                      value={values["invoice_terms"] ?? ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, invoice_terms: e.target.value }))}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>
                </SectionCard>
              </div>
            )}

          </div>
        )}
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

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
  onSaveAll,
  savingAll
}: {
  title: string;
  subtitle: string;
  icon: any;
  children: React.ReactNode;
  onSaveAll?: () => void;
  savingAll?: boolean;
}) {
  return (
    <div style={{
      backgroundColor: "#fff",
      border: "1.5px solid #E5EFE2",
      borderRadius: 20,
      padding: 28,
      boxShadow: "0 4px 16px rgba(0,0,0,0.02)"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, paddingBottom: 18, borderBottom: "1px solid #EEF2ED", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: "#E8F5E3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: P
          }}>
            <Icon size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0D1F0B", fontFamily: "'Inter',sans-serif" }}>
              {title}
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6B726A", fontFamily: "'Inter',sans-serif" }}>
              {subtitle}
            </p>
          </div>
        </div>

        {onSaveAll && (
          <button
            type="button"
            disabled={savingAll}
            onClick={onSaveAll}
            style={{
              backgroundColor: savingAll ? "#9CA3AF" : P,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 22px",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Inter',sans-serif",
              cursor: savingAll ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(45,90,39,0.25)",
              transition: "all 0.2s"
            }}
          >
            {savingAll ? (
              <>
                <div className="animate-spin" style={{ width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%" }} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        )}
      </div>

      <div>
        {children}
      </div>
    </div>
  );
}
