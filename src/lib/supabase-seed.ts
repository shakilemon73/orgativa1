import { supabase } from "./supabase";
import { categories as staticCategories, products as staticProducts } from "@/data/products";

export interface SeedResult {
  categoriesSeeded: number;
  productsSeeded: number;
  settingsSeeded: number;
  ordersSeeded: number;
  errors: string[];
}

export async function seedSupabaseData(force: boolean = false): Promise<SeedResult> {
  const result: SeedResult = {
    categoriesSeeded: 0,
    productsSeeded: 0,
    settingsSeeded: 0,
    ordersSeeded: 0,
    errors: [],
  };

  if (!supabase) {
    result.errors.push("Supabase is not configured in environment variables.");
    return result;
  }

  try {
    // 1. Seed Categories
    const { count: catCount, error: catCheckErr } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });

    if (catCheckErr) {
      result.errors.push(`Category check error: ${catCheckErr.message}`);
    }

    if (force || catCount === 0 || catCount === null) {
      const dbCategories = staticCategories.map((c, i) => ({
        slug: c.slug,
        label: c.label,
        icon: c.icon,
        image_url: c.image,
        product_count: c.count,
        display_order: i + 1,
      }));

      const { data, error } = await supabase
        .from("categories")
        .upsert(dbCategories, { onConflict: "slug" })
        .select();

      if (error) {
        result.errors.push(`Categories seed error: ${error.message}`);
      } else {
        result.categoriesSeeded = data?.length || dbCategories.length;
      }
    }

    // 2. Seed Products
    const { count: prodCount, error: prodCheckErr } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (prodCheckErr) {
      result.errors.push(`Product check error: ${prodCheckErr.message}`);
    }

    if (force || prodCount === 0 || prodCount === null) {
      const dbProducts = staticProducts.map((p, i) => ({
        slug: p.slug,
        name: p.name,
        category_label: p.category,
        category_slug: p.categorySlug,
        weight: p.weight,
        price: p.price,
        original_price: p.originalPrice || null,
        rating: p.rating,
        reviews: p.reviews,
        image: p.image,
        images: p.images,
        badge: p.badge || null,
        description: p.description,
        highlights: p.highlights,
        origin: p.origin,
        in_stock: p.inStock,
        featured: p.badge === "সেরা বিক্রয়" || p.badge === "প্রিমিয়াম",
        trending: p.badge === "সেরা বিক্রয়",
        display_order: i + 1,
      }));

      const { data, error } = await supabase
        .from("products")
        .upsert(dbProducts, { onConflict: "slug" })
        .select();

      if (error) {
        result.errors.push(`Products seed error: ${error.message}`);
      } else {
        result.productsSeeded = data?.length || dbProducts.length;
      }
    }

    // 3. Seed Site Settings
    const { count: setSettingCount } = await supabase
      .from("site_settings")
      .select("*", { count: "exact", head: true });

    if (force || setSettingCount === 0 || setSettingCount === null) {
      const defaultSettings = [
        { key: "delivery_fee", value: "60", label: "ডেলিভারি চার্জ (টাকা)", group_name: "delivery" },
        { key: "free_delivery_above", value: "1000", label: "বিনামূল্যে ডেলিভারি ন্যূনতম", group_name: "delivery" },
        { key: "site_phone", value: "01700000000", label: "সাইট ফোন নম্বর", group_name: "contact" },
        { key: "site_email", value: "hello@orgativa.com.bd", label: "সাইট ইমেইল", group_name: "contact" },
        { key: "hero_headline", value: "বিশুদ্ধ উৎস। সুস্থ জীবন।", label: "হিরো শিরোনাম", group_name: "hero" },
        { key: "hero_subline", value: "১০০% অর্গানিক।", label: "হিরো সাবলাইন", group_name: "hero" },
        { key: "hero_description", value: "বাংলাদেশের সেরা খামার থেকে হাতে বাছাই করা — কীটনাশকমুক্ত, ল্যাব-প্রত্যয়িত পণ্য।", label: "হিরো বিবরণ", group_name: "hero" },
        { key: "promo_1_title", value: "🔥 ফ্ল্যাশ সেল", label: "প্রমো ১ শিরোনাম", group_name: "promos" },
        { key: "promo_1_desc", value: "নির্বাচিত পণ্যে ২০% ছাড়", label: "প্রমো ১ বিবরণ", group_name: "promos" },
        { key: "promo_2_title", value: "🌿 নতুন পণ্য", label: "প্রমো ২ শিরোনাম", group_name: "promos" },
        { key: "promo_2_desc", value: "তাজা মৌসুমি ফসল", label: "প্রমো ২ বিবরণ", group_name: "promos" },
        { key: "promo_3_title", value: "🚚 বিনামূল্যে ডেলিভারি", label: "প্রমো ৩ শিরোনাম", group_name: "promos" },
        { key: "promo_3_desc", value: "৳১,০০০+ অর্ডারে", label: "প্রমো ৩ বিবরণ", group_name: "promos" },
      ];

      const { data, error } = await supabase
        .from("site_settings")
        .upsert(defaultSettings, { onConflict: "key" })
        .select();

      if (error) {
        result.errors.push(`Site Settings seed error: ${error.message}`);
      } else {
        result.settingsSeeded = data?.length || defaultSettings.length;
      }
    }

    // 4. Seed Demo Orders
    const { count: orderCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (force || orderCount === 0 || orderCount === null) {
      const demoOrders = [
        { order_number: "ORD-9821", customer_name: "রাফাত হোসেন", phone: "01712345678", email: "rafat@example.com", division: "ঢাকা", district: "ঢাকা", thana: "ধানমন্ডি", address: "রোড ৪, বাসা ১২", postcode: "1205", payment_method: "bkash", payment_number: "01712345678", transaction_id: "TRX9821BK", subtotal: 4150, delivery_fee: 100, total: 4250, status: "pending", notes: "জরুরি ডেলিভারি প্রয়োজন" },
        { order_number: "ORD-9820", customer_name: "সুমাইয়া বেগম", phone: "01812345679", email: "sumaiya@example.com", division: "চট্টগ্রাম", district: "চট্টগ্রাম", thana: "পাঁচলাইশ", address: "জিইসি মোড়", postcode: "4000", payment_method: "cod", payment_number: null, transaction_id: null, subtotal: 3000, delivery_fee: 100, total: 3100, status: "processing", notes: null },
        { order_number: "ORD-9819", customer_name: "তানভীর আহমেদ", phone: "01912345680", email: null, division: "রাজশাহী", district: "রাজশাহী", thana: "বোয়ালিয়া", address: "সাহেব বাজার", postcode: "6000", payment_method: "nagad", payment_number: "01912345680", transaction_id: "NGD5512", subtotal: 5700, delivery_fee: 100, total: 5800, status: "shipped", notes: null },
        { order_number: "ORD-9818", customer_name: "নাসরিন সুলতানা", phone: "01612345681", email: null, division: "সিলেট", district: "সিলেট", thana: "জিন্দাবাজার", address: "জেল রোড", postcode: "3100", payment_method: "bkash", payment_number: "01612345681", transaction_id: "BKS8819", subtotal: 2300, delivery_fee: 100, total: 2400, status: "delivered", notes: null },
        { order_number: "ORD-9817", customer_name: "মাহমুদুল হাসান", phone: "01512345682", email: null, division: "খুলনা", district: "খুলনা", thana: "সোনাডাঙ্গা", address: "বাসস্ট্যান্ড রোড", postcode: "9100", payment_method: "cod", payment_number: null, transaction_id: null, subtotal: 1750, delivery_fee: 100, total: 1850, status: "delivered", notes: null },
      ];

      const { data, error } = await supabase
        .from("orders")
        .upsert(demoOrders, { onConflict: "order_number" })
        .select();

      if (error) {
        result.errors.push(`Orders seed error: ${error.message}`);
      } else {
        result.ordersSeeded = data?.length || demoOrders.length;
      }
    }
  } catch (err: any) {
    result.errors.push(err.message || String(err));
  }

  return result;
}
