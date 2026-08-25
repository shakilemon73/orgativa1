import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface SiteSettings {
  // Delivery
  delivery_inside_dhaka: string;
  delivery_outside_dhaka: string;
  delivery_free_threshold: string;
  delivery_estimated_dhaka: string;
  delivery_estimated_outside: string;
  
  // Contact & Footer
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  contact_whatsapp: string;
  facebook_page_url: string;
  instagram_page_url: string;
  youtube_page_url: string;
  footer_description: string;
  app_store_url: string;
  play_store_url: string;
  copyright_text: string;
  
  // Brand & Logo
  site_name: string;
  logo_subtext: string;
  site_logo_url: string;

  // Hero
  hero_title_bn: string;
  hero_title_en: string;
  hero_subtitle_bn: string;
  hero_subtitle_en: string;
  hero_badge_bn: string;
  hero_badge_en: string;
  hero_bg_image: string;
  hero_product_slugs: string; // JSON array of 4 product slugs
  
  // Customer Favorites / Trending Curation
  trending_mode: string; // 'auto' | 'manual'
  trending_top_sellers_slugs: string; // JSON array of slugs
  trending_featured_slugs: string; // JSON array of slugs
  trending_deals_slugs: string; // JSON array of slugs
  
  // Promos
  promo_topbar_enabled: string;
  promo_topbar_text_bn: string;
  promo_topbar_text_en: string;
  promo_code: string;
  
  // Invoice
  invoice_title: string;
  invoice_subtitle: string;
  invoice_accent_color: string;
  invoice_logo_url: string;
  invoice_address: string;
  invoice_terms: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  delivery_inside_dhaka: "60",
  delivery_outside_dhaka: "120",
  delivery_free_threshold: "1500",
  delivery_estimated_dhaka: "24-48 Hours",
  delivery_estimated_outside: "2-4 Days",

  contact_phone: "+880 1700-000000",
  contact_email: "hello@orgativa.com.bd",
  contact_address: "House 12, Road 5, Bashundhara R/A, Dhaka-1229",
  contact_whatsapp: "+8801700000000",
  facebook_page_url: "https://facebook.com/orgativa",
  instagram_page_url: "https://instagram.com/orgativa",
  youtube_page_url: "https://youtube.com/@orgativa",
  footer_description: "Bangladesh's trusted source for organic groceries & wellness products — direct from farms to your doorstep.",
  app_store_url: "https://apple.com/app-store",
  play_store_url: "https://play.google.com/store",
  copyright_text: "© 2024 Orgativa. All rights reserved.",

  site_name: "Orgativa",
  logo_subtext: "Pure Organic",
  site_logo_url: "/assets/orgativa_logo.png",

  hero_title_bn: "প্রাকৃতিক, বিশুদ্ধ ও প্রিমিয়াম অর্গানিক খাদ্য উপাদান",
  hero_title_en: "100% Pure, Unadulterated Organic Nutrition for Your Family",
  hero_subtitle_bn: "সরাসরি খামার থেকে ল্যাব-পরীক্ষিত শতভাগ প্রাকৃতিক মধু, ঘি, ড্রাই ফ্রুটস ও হার্বাল পণ্য পৌঁছে দিচ্ছি আপনার দুয়ারে।",
  hero_subtitle_en: "Directly sourced from organic certified farms. Pure honey, raw ghee, premium nuts & herbal wellness delivered right to your home.",
  hero_badge_bn: "🌿 ১০০% খাঁটি অর্গানিক অ্যান্ড ল্যাব সার্টিফাইড",
  hero_badge_en: "🌿 100% CERTIFIED PURE & ORGANIC HARVEST",
  hero_bg_image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
  hero_product_slugs: JSON.stringify(["wild-forest-honey", "premium-pistachios", "cold-pressed-oil", "hand-churned-ghee"]),

  trending_mode: "auto",
  trending_top_sellers_slugs: JSON.stringify(["wild-forest-honey", "sundarbans-khalisha-honey", "mustard-flower-honey", "premium-pistachios", "cold-pressed-oil", "hand-churned-ghee"]),
  trending_featured_slugs: JSON.stringify(["wild-forest-honey", "premium-pistachios", "hand-churned-ghee", "cold-pressed-oil", "organic-chia-seeds", "medjool-dates-premium"]),
  trending_deals_slugs: JSON.stringify(["wild-forest-honey", "premium-pistachios", "cold-pressed-oil", "hand-churned-ghee", "kalijira-raw-honey", "tulsi-ginger-green-tea"]),

  promo_topbar_enabled: "true",
  promo_topbar_text_bn: "🌿 ১৫০০ টাকার কেনাকাটায় সারা বাংলাদেশে ফ্রি হোম ডেলিভারি! প্রোমো কোড: ORGATIVA10",
  promo_topbar_text_en: "🌿 Free shipping across Bangladesh on orders over ৳1500! Use code: ORGATIVA10",
  promo_code: "ORGATIVA10",

  invoice_title: "Orgativa",
  invoice_subtitle: "Premium Organic Foods",
  invoice_accent_color: "#2D5A27",
  invoice_logo_url: "/assets/orgativa_logo.png",
  invoice_address: "Banani, Dhaka-1213 | Hotline: +880 1700-000000 | info@orgativa.com",
  invoice_terms: "Thank you for choosing Orgativa! Our products are 100% natural and organic. If you wish to request a refund or exchange, please contact us within 7 days with your original invoice.",
};

const STORAGE_KEY = "orgativa_site_settings";

function getStoredSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn("Could not read site settings from localStorage:", e);
  }
  return DEFAULT_SETTINGS;
}

function saveStoredSettings(settings: SiteSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn("Could not save site settings to localStorage:", e);
  }
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  getSetting: (key: keyof SiteSettings | string, fallback?: string) => string;
  updateSetting: (key: string, value: string, groupName?: string, label?: string) => Promise<void>;
  updateSettings: (newValues: Record<string, string>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  getSetting: (key, fallback) => fallback ?? (DEFAULT_SETTINGS as any)[key] ?? "",
  updateSetting: async () => {},
  updateSettings: async () => {},
  refreshSettings: async () => {},
  loading: false,
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(() => getStoredSettings());
  const [loading, setLoading] = useState(true);

  async function fetchSettings() {
    // Start with local storage
    const currentLocal = getStoredSettings();
    setSettings(currentLocal);

    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) {
        console.warn("Could not fetch site_settings from Supabase:", error.message);
        setLoading(false);
        return;
      }
      if (data && data.length > 0) {
        const merged: Record<string, string> = { ...DEFAULT_SETTINGS, ...currentLocal };
        data.forEach((row: { key: string; value: string }) => {
          if (row.value !== undefined && row.value !== null) {
            merged[row.key] = row.value;
          }
        });
        const finalSettings = merged as unknown as SiteSettings;
        setSettings(finalSettings);
        saveStoredSettings(finalSettings);
      }
    } catch (err) {
      console.warn("Error fetching site_settings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();

    // Listen for storage events (e.g. across tabs)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(e.newValue) });
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    // Subscribe to realtime changes on site_settings if Supabase is active
    if (supabase) {
      const channel = supabase
        .channel("site_settings_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "site_settings" },
          () => {
            fetchSettings();
          }
        )
        .subscribe();

      return () => {
        window.removeEventListener("storage", handleStorage);
        if (supabase) supabase.removeChannel(channel);
      };
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updateSetting = async (key: string, value: string, groupName = "general", label?: string) => {
    // 1. Immediately update in-memory state and localStorage
    const updated = { ...settings, [key]: value };
    
    // Also handle key aliases for delivery / phone / email
    if (key === "contact_phone") (updated as any)["site_phone"] = value;
    if (key === "contact_email") (updated as any)["site_email"] = value;
    if (key === "delivery_inside_dhaka") (updated as any)["delivery_fee"] = value;
    if (key === "delivery_free_threshold") (updated as any)["free_delivery_above"] = value;

    setSettings(updated);
    saveStoredSettings(updated);

    // 2. Persist to Supabase if configured
    if (supabase) {
      try {
        await supabase.from("site_settings").upsert({
          key,
          value,
          label: label || key,
          group_name: groupName,
          updated_at: new Date().toISOString(),
        });

        if (key === "contact_phone") {
          await supabase.from("site_settings").upsert({ key: "site_phone", value, label: "Site Phone", group_name: "contact" });
        } else if (key === "contact_email") {
          await supabase.from("site_settings").upsert({ key: "site_email", value, label: "Site Email", group_name: "contact" });
        } else if (key === "delivery_inside_dhaka") {
          await supabase.from("site_settings").upsert({ key: "delivery_fee", value, label: "Delivery Fee", group_name: "delivery" });
        } else if (key === "delivery_free_threshold") {
          await supabase.from("site_settings").upsert({ key: "free_delivery_above", value, label: "Free Shipping Threshold", group_name: "delivery" });
        }
      } catch (err) {
        console.warn("Could not sync setting to Supabase:", err);
      }
    }
  };

  const updateSettings = async (newValues: Record<string, string>) => {
    const updated = { ...settings, ...newValues };
    setSettings(updated);
    saveStoredSettings(updated);

    if (supabase) {
      try {
        const rows = Object.entries(newValues).map(([key, value]) => ({
          key,
          value,
          label: key,
          group_name: "general",
          updated_at: new Date().toISOString(),
        }));
        await supabase.from("site_settings").upsert(rows);
      } catch (err) {
        console.warn("Could not batch sync settings to Supabase:", err);
      }
    }
  };

  const getSetting = (key: keyof SiteSettings | string, fallback?: string): string => {
    const k = key as string;
    const settingsObj = (settings as unknown) as Record<string, string>;

    // Direct match if available and non-empty
    if (settingsObj[k] !== undefined && settingsObj[k] !== "") {
      return settingsObj[k];
    }

    // Key Aliases & Fallback Resolution
    if (k === "contact_phone" || k === "site_phone" || k === "phone") {
      return settingsObj["contact_phone"] || settingsObj["site_phone"] || fallback || DEFAULT_SETTINGS.contact_phone;
    }
    if (k === "contact_email" || k === "site_email" || k === "email") {
      return settingsObj["contact_email"] || settingsObj["site_email"] || fallback || DEFAULT_SETTINGS.contact_email;
    }
    if (k === "contact_whatsapp") {
      return settingsObj["contact_whatsapp"] || settingsObj["contact_phone"] || fallback || DEFAULT_SETTINGS.contact_whatsapp;
    }
    if (k === "contact_address") {
      return settingsObj["contact_address"] || fallback || DEFAULT_SETTINGS.contact_address;
    }
    if (k === "footer_description" || k === "site_description") {
      return settingsObj["footer_description"] || settingsObj["site_description"] || fallback || DEFAULT_SETTINGS.footer_description;
    }
    if (k === "site_name") {
      return settingsObj["site_name"] || fallback || DEFAULT_SETTINGS.site_name;
    }
    if (k === "logo_subtext" || k === "site_tagline") {
      return settingsObj["logo_subtext"] || settingsObj["site_tagline"] || fallback || DEFAULT_SETTINGS.logo_subtext;
    }
    if (k === "delivery_inside_dhaka" || k === "delivery_fee") {
      return settingsObj["delivery_inside_dhaka"] || settingsObj["delivery_fee"] || fallback || DEFAULT_SETTINGS.delivery_inside_dhaka;
    }
    if (k === "delivery_free_threshold" || k === "free_delivery_above") {
      return settingsObj["delivery_free_threshold"] || settingsObj["free_delivery_above"] || fallback || DEFAULT_SETTINGS.delivery_free_threshold;
    }
    if (k === "hero_title_bn" || k === "hero_headline") {
      return settingsObj["hero_title_bn"] || settingsObj["hero_headline"] || fallback || DEFAULT_SETTINGS.hero_title_bn;
    }
    if (k === "hero_subtitle_bn" || k === "hero_subline" || k === "hero_description") {
      return settingsObj["hero_subtitle_bn"] || settingsObj["hero_subline"] || settingsObj["hero_description"] || fallback || DEFAULT_SETTINGS.hero_subtitle_bn;
    }

    return fallback || settingsObj[k] || (DEFAULT_SETTINGS as any)[k] || "";
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        getSetting,
        updateSetting,
        updateSettings,
        refreshSettings: fetchSettings,
        loading,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
