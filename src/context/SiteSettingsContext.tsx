import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface SiteSettings {
  // Delivery
  delivery_inside_dhaka: string;
  delivery_outside_dhaka: string;
  delivery_free_threshold: string;
  delivery_estimated_dhaka: string;
  delivery_estimated_outside: string;
  
  // Contact
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  contact_whatsapp: string;
  facebook_page_url: string;
  
  // Hero
  hero_title_bn: string;
  hero_title_en: string;
  hero_subtitle_bn: string;
  hero_subtitle_en: string;
  hero_badge_bn: string;
  hero_badge_en: string;
  hero_bg_image: string;
  
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
  
  // General
  site_name: string;
  site_logo_url: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  delivery_inside_dhaka: "60",
  delivery_outside_dhaka: "120",
  delivery_free_threshold: "1500",
  delivery_estimated_dhaka: "24-48 Hours",
  delivery_estimated_outside: "2-4 Days",

  contact_phone: "+880 1700-000000",
  contact_email: "info@orgativa.com.bd",
  contact_address: "House 12, Road 5, Bashundhara R/A, Dhaka-1229",
  contact_whatsapp: "+8801700000000",
  facebook_page_url: "https://facebook.com",

  hero_title_bn: "প্রাকৃতিক, বিশুদ্ধ ও প্রিমিয়াম অর্গানিক খাদ্য উপাদান",
  hero_title_en: "100% Pure, Unadulterated Organic Nutrition for Your Family",
  hero_subtitle_bn: "সরাসরি খামার থেকে ল্যাব-পরীক্ষিত শতভাগ প্রাকৃতিক মধু, ঘি, ড্রাই ফ্রুটস ও হার্বাল পণ্য পৌঁছে দিচ্ছি আপনার দুয়ারে।",
  hero_subtitle_en: "Directly sourced from organic certified farms. Pure honey, raw ghee, premium nuts & herbal wellness delivered right to your home.",
  hero_badge_bn: "🌿 ১০০% খাঁটি অর্গানিক অ্যান্ড ল্যাব সার্টিফাইড",
  hero_badge_en: "🌿 100% CERTIFIED PURE & ORGANIC HARVEST",
  hero_bg_image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",

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

  site_name: "Orgativa Organic",
  site_logo_url: "",
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  getSetting: (key: keyof SiteSettings, fallback?: string) => string;
  refreshSettings: () => Promise<void>;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  getSetting: (key, fallback) => fallback ?? DEFAULT_SETTINGS[key] ?? "",
  refreshSettings: async () => {},
  loading: false,
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  async function fetchSettings() {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) {
        console.warn("Could not fetch site_settings:", error.message);
        setLoading(false);
        return;
      }
      if (data && data.length > 0) {
        const merged: Record<string, string> = { ...DEFAULT_SETTINGS };
        data.forEach((row: { key: string; value: string }) => {
          if (row.value !== undefined && row.value !== null) {
            merged[row.key] = row.value;
          }
        });
        setSettings(merged as any);
      }
    } catch (err) {
      console.warn("Error fetching site_settings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();

    // Subscribe to realtime changes on site_settings
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
        if (supabase) supabase.removeChannel(channel);
      };
    }
  }, []);

  const getSetting = (key: keyof SiteSettings | string, fallback?: string): string => {
    const k = key as string;
    const settingsObj = (settings as unknown) as Record<string, string>;

    // Direct match if available and non-empty
    if (settingsObj[k] !== undefined && settingsObj[k] !== "") {
      return settingsObj[k];
    }

    // Key Aliases & Fallback Resolution
    if (k === "contact_phone" || k === "site_phone") {
      return settingsObj["contact_phone"] || settingsObj["site_phone"] || settingsObj["phone"] || fallback || DEFAULT_SETTINGS.contact_phone;
    }
    if (k === "contact_email" || k === "site_email") {
      return settingsObj["contact_email"] || settingsObj["site_email"] || settingsObj["email"] || fallback || DEFAULT_SETTINGS.contact_email;
    }
    if (k === "contact_whatsapp") {
      return settingsObj["contact_whatsapp"] || settingsObj["contact_phone"] || settingsObj["site_phone"] || fallback || DEFAULT_SETTINGS.contact_whatsapp;
    }
    if (k === "contact_address") {
      return settingsObj["contact_address"] || fallback || DEFAULT_SETTINGS.contact_address;
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
