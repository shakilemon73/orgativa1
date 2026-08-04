import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { useResponsive } from "@/hooks/use-responsive";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const P = "#2D5A27";
const P_LIGHT = "#F4F7F3";
const P_DARK = "#1a4016";

// Static demo orders with items for preview sandbox fidelity
const staticOrderItems: Record<string, any[]> = {
  "ORD-9821": [
    { product_name: "প্রিমিয়াম ক্যাশেও নাট (Premium Cashew Nuts)", product_image: "/assets/products/cashews.jpg", quantity: 2, unit_price: 1200, total_price: 2400 },
    { product_name: "খাঁটি সুন্দরবনের মধু (Pure Sundarban Honey)", product_image: "/assets/products/honey.jpg", quantity: 1, unit_price: 1750, total_price: 1750 }
  ],
  "ORD-9820": [
    { product_name: "অর্গানিক বাসমতি চাল (Organic Basmati Rice)", product_image: "/assets/products/rice.jpg", quantity: 3, unit_price: 1000, total_price: 3000 }
  ],
  "ORD-9819": [
    { product_name: "ঘি - প্রিমিয়াম গ্রেড (Premium Ghee)", product_image: "/assets/products/ghee.jpg", quantity: 2, unit_price: 2850, total_price: 5700 }
  ],
  "ORD-9818": [
    { product_name: "অর্গানিক হলুদ গুঁড়ো (Organic Turmeric)", product_image: "/assets/products/turmeric.jpg", quantity: 5, unit_price: 460, total_price: 2300 }
  ],
  "ORD-9817": [
    { product_name: "কালোজিরা তেল (Black Seed Oil)", product_image: "/assets/products/blackseed.jpg", quantity: 1, unit_price: 1750, total_price: 1750 }
  ]
};

const demoOrdersList: any[] = [
  { id: "101", order_number: "ORD-9821", customer_name: "রাফাত হোসেন", phone: "01712345678", email: "rafat@example.com", division: "Dhaka", district: "Dhaka", thana: "Dhanmondi", address: "রোড ৪, বাসা ১২", postcode: "1205", payment_method: "bkash", payment_number: "01712345678", transaction_id: "TRX9821BK", subtotal: 4150, delivery_fee: 100, total: 4250, status: "pending", notes: "জরুরি ডেলিভারি প্রয়োজন", created_at: new Date().toISOString() },
  { id: "102", order_number: "ORD-9820", customer_name: "সুমাইয়া বেগম", phone: "01812345679", email: "sumaiya@example.com", division: "Chattogram", district: "Chattogram", thana: "Panchlaish", address: "জিইসি মোড়", postcode: "4000", payment_method: "cod", payment_number: null, transaction_id: null, subtotal: 3000, delivery_fee: 100, total: 3100, status: "processing", notes: null, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "103", order_number: "ORD-9819", customer_name: "তানভীর আহমেদ", phone: "01912345680", email: null, division: "Rajshahi", district: "Rajshahi", thana: "Boalia", address: "সাহেব বাজার", postcode: "6000", payment_method: "nagad", payment_number: "01912345680", transaction_id: "NGD5512", subtotal: 5700, delivery_fee: 100, total: 5800, status: "shipped", notes: null, created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: "104", order_number: "ORD-9818", customer_name: "নাসরিন সুলতানা", phone: "01612345681", email: null, division: "Sylhet", district: "Sylhet", thana: "Zindabazar", address: "জেল রোড", postcode: "3100", payment_method: "bkash", payment_number: "01612345681", transaction_id: "BKS8819", subtotal: 2300, delivery_fee: 100, total: 2400, status: "delivered", notes: null, created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "105", order_number: "ORD-9817", customer_name: "মাহমুদুল হাসান", phone: "01512345682", email: null, division: "Khulna", district: "Khulna", thana: "Sonadanga", address: "বাসস্ট্যান্ড রোড", postcode: "9100", payment_method: "cod", payment_number: null, transaction_id: null, subtotal: 1750, delivery_fee: 100, total: 1850, status: "delivered", notes: null, created_at: new Date(Date.now() - 3600000 * 48).toISOString() },
];

export default function OrderTracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  
  // Results
  const [foundOrders, setFoundOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const { lang, t, formatPrice, formatNum } = useLanguage();
  const { isMobile, isTablet, width } = useResponsive();
  const [, navigate] = useLocation();

  // Parse URL search params if orderId is passed in query e.g. /track?id=ORD-9821
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryId = params.get("id") || params.get("orderId");
    if (queryId) {
      setSearchQuery(queryId);
      handleSearch(queryId);
    }
  }, []);

  const handleSearch = async (targetQuery?: string) => {
    const query = (targetQuery || searchQuery).trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setFoundOrders([]);
    setSelectedOrder(null);

    // Normalization helper for phone numbers
    const cleanPhone = query.replace(/[^\d]/g, ""); // "01712345678"
    const alternatePhone = cleanPhone.startsWith("88") ? cleanPhone.substring(2) : "88" + cleanPhone;

    try {
      if (supabase) {
        // Search in real Supabase db
        // Query by order_number or exact phone match
        let queryBuilder = supabase
          .from("orders")
          .select(`
            *,
            order_items (*)
          `);

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);

        if (isUuid) {
          queryBuilder = queryBuilder.eq("id", query);
        } else if (cleanPhone.length >= 8) {
          // It's likely a phone number
          const searchPhones = [cleanPhone, query, alternatePhone].filter(Boolean);
          const orConditions = searchPhones.map(p => `phone.eq.${p}`).join(",");
          queryBuilder = queryBuilder.or(`${orConditions},phone.ilike.%${cleanPhone}%`);
        } else {
          // It's likely an order number
          queryBuilder = queryBuilder.or(`order_number.eq.${query},order_number.ilike.%${query}%`);
        }

        const { data, error: dbErr } = await queryBuilder.order("created_at", { ascending: false });

        if (dbErr) throw dbErr;

        if (data && data.length > 0) {
          setFoundOrders(data);
          setSelectedOrder(data[0]);
        } else {
          // Fallback to local demo mock search for high quality sandbox preview experience
          performMockSearch(query, cleanPhone);
        }
      } else {
        // Supabase is not configured, perform mock lookup
        performMockSearch(query, cleanPhone);
      }
    } catch (err: any) {
      console.error("Order tracking search error:", err);
      setError(t("অর্ডার তথ্য খুঁজতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।", "Failed to retrieve order tracking. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const performMockSearch = (query: string, cleanPhone: string) => {
    // Find matching demo orders
    const matched = demoOrdersList.filter(o => {
      const orderNumMatch = o.order_number.toLowerCase().includes(query.toLowerCase()) || o.id === query;
      const phoneMatch = cleanPhone && (o.phone.includes(cleanPhone) || cleanPhone.includes(o.phone));
      return orderNumMatch || phoneMatch;
    });

    if (matched.length > 0) {
      // Map mock items to match schema of order_items table
      const enriched = matched.map(order => {
        const items = staticOrderItems[order.order_number] || [
          { product_name: "প্রিমিয়াম অর্গানিক পণ্য (Premium Organic Product)", product_image: "/assets/placeholder.jpg", quantity: 1, unit_price: order.subtotal, total_price: order.subtotal }
        ];
        return {
          ...order,
          order_items: items
        };
      });
      setFoundOrders(enriched);
      setSelectedOrder(enriched[0]);
    } else {
      setFoundOrders([]);
      setSelectedOrder(null);
    }
  };

  // Status mapping to visualize progression beautifully
  const stepsList = [
    { key: "pending", label: t("অপেক্ষমাণ", "Pending"), icon: "schedule", desc: t("অর্ডার পর্যালোচনা করা হচ্ছে", "We received your order") },
    { key: "processing", label: t("প্রক্রিয়াকরণ", "Processing"), icon: "package_2", desc: t("পণ্য প্রস্তুত করা হচ্ছে", "Preparing premium items") },
    { key: "shipped", label: t("শিপ করা হয়েছে", "Shipped"), icon: "local_shipping", desc: t("ডেলিভারি পথে রয়েছে", "On the way to your door") },
    { key: "delivered", label: t("ডেলিভারি সম্পন্ন", "Delivered"), icon: "task_alt", desc: t("সফলভাবে গ্রাহকের হাতে পৌঁছেছে", "Successfully hand delivered") }
  ];

  // Helper to get active step index
  const getStepIndex = (status: string) => {
    if (status === "cancelled") return -1;
    const idx = stepsList.findIndex(s => s.key === status);
    return idx !== -1 ? idx : 0;
  };

  const activeStepIdx = selectedOrder ? getStepIndex(selectedOrder.status) : 0;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return { bg: "#FEF9C3", color: "#92400E", label: t("অপেক্ষমাণ", "Pending") };
      case "processing": return { bg: "#DBEAFE", color: "#1E40AF", label: t("প্রক্রিয়াকরণ", "Processing") };
      case "shipped": return { bg: "#DDD6FE", color: "#5B21B6", label: t("শিপ করা হয়েছে", "Shipped") };
      case "delivered": return { bg: "#DCFCE7", color: "#166534", label: t("ডেলিভারি হয়েছে", "Delivered") };
      case "cancelled": return { bg: "#FEE2E2", color: "#991B1B", label: t("বাতিল", "Cancelled") };
      default: return { bg: "#F3F4F6", color: "#4B5563", label: status };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // WhatsApp helpers
  const getWhatsAppLink = (order: any) => {
    const message = encodeURIComponent(
      lang === "bn" 
        ? `হ্যালো Orgativa! আমি আমার অর্ডার #${order.order_number} সম্পর্কে জানতে চাচ্ছি।` 
        : `Hello Orgativa! I'd like to ask about my order #${order.order_number}.`
    );
    return `https://wa.me/8801700000000?text=${message}`;
  };

  return (
    <div style={{ backgroundColor: "#FAFDF7", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      
      <main style={{ flex: 1, maxWidth: 1000, width: "100%", margin: "0 auto", padding: isMobile ? "24px 16px 60px" : "48px 24px 80px" }}>
        
        {/* Page title with elegant header styling */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 11, color: P, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, fontFamily: "'Inter', sans-serif", display: "block", marginBottom: 8 }}>
            {t("রিয়েল-টাইম ট্র্যাকিং", "REAL-TIME TRACKING")}
          </span>
          <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: isMobile ? 28 : 38, fontWeight: 500, color: "#0D1F0B", margin: 0 }}>
            {t("আপনার অর্ডার ট্র্যাক করুন", "Track Your Order")}
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", fontFamily: "'Inter', sans-serif", marginTop: 8, maxWidth: 500, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
            {t("অর্ডার করার সময় প্রাপ্ত আইডি (যেমন: ORD-9821) বা আপনার মোবাইল নম্বর দিয়ে তাৎক্ষণিক আপডেট জানুন।", "Enter your Order ID (e.g., ORD-9821) or phone number to check current fulfillment status instantly.")}
          </p>
        </div>

        {/* Dynamic tracking search field */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: isMobile ? "18px" : "28px",
          border: "1px solid #E5EBF0",
          boxShadow: "0 4px 20px rgba(13, 31, 11, 0.03)",
          maxWidth: 640,
          margin: "0 auto 32px",
        }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span className="material-symbols-outlined" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: P, fontSize: 20 }}>
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("অর্ডার আইডি বা মোবাইল নম্বর লিখুন...", "Enter Order ID or Mobile Number...")}
                style={{
                  width: "100%",
                  paddingLeft: 44,
                  paddingRight: 14,
                  minHeight: 48,
                  fontSize: 15,
                  borderRadius: 10,
                  border: "1px solid #D1D5DB",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: P,
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                padding: "0 28px",
                minHeight: 48,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P_DARK; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = P; }}
            >
              {loading ? (
                <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite" }}>sync</span>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>gps_fixed</span>
                  {t("ট্র্যাক করুন", "Track")}
                </>
              )}
            </button>
          </form>

          {/* Quick link suggestion pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            <span style={{ fontSize: 12, color: "#8FA888", fontWeight: 500 }}>{t("উদাহরণ:", "Try:")}</span>
            {["ORD-9821", "01712345678", "ORD-9819"].map(demoVal => (
              <button
                key={demoVal}
                type="button"
                onClick={() => {
                  setSearchQuery(demoVal);
                  handleSearch(demoVal);
                }}
                style={{
                  background: "transparent",
                  border: "1px dashed #D1E3CF",
                  color: P,
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 20,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#EAF3E9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {demoVal}
              </button>
            ))}
          </div>
        </div>

        {/* Main interactive tracking output panel */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 0" }}>
            <div style={{ width: 44, height: 44, border: `3px solid ${P_LIGHT}`, borderTop: `3px solid ${P}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: 14, color: "#737973", fontWeight: 500 }}>{t("অর্ডারের সর্বশেষ অবস্থা অনুসন্ধান করা হচ্ছে...", "Retrieving the latest updates of your order...")}</p>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div style={{ backgroundColor: "#FDF2F2", border: "1px solid #FDE8E8", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 12, alignItems: "center", maxWidth: 640, margin: "0 auto" }}>
            <span className="material-symbols-outlined" style={{ color: "#F05252", fontSize: 22 }}>error_outline</span>
            <p style={{ fontSize: 13, color: "#9B1C1C", margin: 0, fontWeight: 500 }}>{error}</p>
          </div>
        )}

        {/* No order found */}
        {searched && !loading && !error && foundOrders.length === 0 && (
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: "48px 24px",
            textAlign: "center",
            border: "1px solid #E5EBF0",
            maxWidth: 640,
            margin: "0 auto",
            boxShadow: "0 4px 20px rgba(13, 31, 11, 0.02)"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#E5E7EB", marginBottom: 16 }}>search_off</span>
            <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: 20, fontWeight: 400, color: "#111827", margin: "0 0 8px" }}>
              {t("কোনো অর্ডার পাওয়া যায়নি", "No Order Found")}
            </h3>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 20px", lineHeight: 1.5 }}>
              {t("অনুগ্রহ করে নিশ্চিত হয়ে সঠিক অর্ডার আইডি বা মোবাইল নম্বর দিন। কোনো সহায়তার জন্য কাস্টমার কেয়ারে যোগাযোগ করুন।", "Please verify the details and try again. For immediate help, contact our customer hotline.")}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => handleSearch("ORD-9821")}
                style={{ backgroundColor: P_LIGHT, color: P, border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                {t("ডেমো অর্ডার দেখুন", "View Demo Tracking")}
              </button>
              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noreferrer"
                style={{ backgroundColor: "#25D366", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat</span>
                {t("সরাসরি সহায়তা", "Get Support")}
              </a>
            </div>
          </div>
        )}

        {/* Success - multiple matches selector */}
        {searched && !loading && foundOrders.length > 1 && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 13, color: "#6B7280", fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: P }}>list</span>
              {t(`আপনার ফোন নম্বরে ${foundOrders.length}টি অর্ডার পাওয়া গেছে। যেকোনো একটি নির্বাচন করুন:`, `Found ${foundOrders.length} orders associated with your phone. Select one to track:`)}
            </p>
            <div className="scroll-x" style={{ display: "flex", gap: 10, paddingBottom: 10 }}>
              {foundOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                const statusInfo = getStatusStyle(order.status);
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      flexShrink: 0,
                      backgroundColor: isSelected ? P : "#ffffff",
                      border: isSelected ? `1.5px solid ${P}` : "1.5px solid #E5EBF0",
                      borderRadius: 12,
                      padding: "12px 18px",
                      textAlign: "left",
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 4px 12px rgba(45, 90, 39, 0.15)" : "none",
                      transition: "all 0.2s"
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "#ffffff" : "#111827", margin: "0 0 4px" }}>
                      #{order.order_number}
                    </p>
                    <p style={{ fontSize: 11, color: isSelected ? "rgba(255,255,255,0.75)" : "#6B7280", margin: "0 0 8px" }}>
                      {new Date(order.created_at).toLocaleDateString(lang === "en" ? "en-US" : "bn-BD", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? "#ffffff" : "#111827" }}>
                        {formatPrice(order.total)}
                      </span>
                      <span style={{
                        fontSize: 9,
                        fontWeight: 700,
                        backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : statusInfo.bg,
                        color: isSelected ? "#ffffff" : statusInfo.color,
                        padding: "2px 6px",
                        borderRadius: 4,
                        textTransform: "uppercase"
                      }}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Order Detail Dashboard */}
        {searched && !loading && selectedOrder && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Elegant Header Block */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              border: "1px solid #E5EBF0",
              padding: isMobile ? "20px" : "28px",
              boxShadow: "0 4px 20px rgba(13, 31, 11, 0.02)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              flexDirection: isMobile ? "column" : "row",
              gap: 16
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: 22, fontWeight: 400, color: "#111827", margin: 0 }}>
                    {t("অর্ডার নম্বর:", "Order ID:")} #{selectedOrder.order_number}
                  </h2>
                  <span style={{
                    backgroundColor: getStatusStyle(selectedOrder.status).bg,
                    color: getStatusStyle(selectedOrder.status).color,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 6,
                    textTransform: "uppercase"
                  }}>
                    {getStatusStyle(selectedOrder.status).label}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                  {t("অর্ডারের তারিখ:", "Placed on:")} {new Date(selectedOrder.created_at).toLocaleDateString(lang === "en" ? "en-US" : "bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>

              {/* Action utilities */}
              <div style={{ display: "flex", gap: 8, width: isMobile ? "100%" : "auto" }}>
                <button
                  onClick={() => window.open(`/invoice/${selectedOrder.order_number}`, "_blank")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    backgroundColor: "#ffffff",
                    border: "1px solid #D1D5DB",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: "#4B5563",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
                  {t("ইনভয়েস প্রিন্ট", "Print Invoice")}
                </button>
                <a
                  href={getWhatsAppLink(selectedOrder)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    backgroundColor: P_LIGHT,
                    border: `1px solid ${P}20`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    color: P,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "none"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#EAF3E9"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = P_LIGHT; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat</span>
                  {t("জিজ্ঞাসা করুন", "Inquire Order")}
                </a>
              </div>
            </div>

            {/* Cancelled Alert Banner if applicable */}
            {selectedOrder.status === "cancelled" && (
              <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FDE8E8", borderRadius: 12, padding: "16px", display: "flex", gap: 12, alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ color: "#EF4444", fontSize: 24 }}>cancel</span>
                <div>
                  <h4 style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#991B1B" }}>
                    {t("অর্ডারটি বাতিল করা হয়েছে", "This Order has been Cancelled")}
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: "#B91C1C" }}>
                    {t("কোনো সহায়তার জন্য দয়া করে আমাদের গ্রাহক সেবা নম্বরে যোগাযোগ করুন।", "For further clarification or to replace this order, please contact our support desk.")}
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP PROGRESS GRAPHIC (Visual Timeline) ── */}
            {selectedOrder.status !== "cancelled" && (
              <div style={{
                backgroundColor: "#ffffff",
                borderRadius: 16,
                border: "1px solid #E5EBF0",
                padding: isMobile ? "24px 16px" : "36px 32px",
                boxShadow: "0 4px 20px rgba(13, 31, 11, 0.02)",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  position: "relative",
                  flexDirection: isMobile ? "column" : "row",
                  gap: isMobile ? 24 : 12,
                  paddingLeft: isMobile ? 12 : 0
                }}>
                  
                  {/* Connector lines for desktop */}
                  {!isMobile && (
                    <div style={{
                      position: "absolute",
                      top: 18,
                      left: "6%",
                      right: "6%",
                      height: 3,
                      backgroundColor: "#E5E7EB",
                      zIndex: 1
                    }}>
                      <div style={{
                        width: `${(activeStepIdx / (stepsList.length - 1)) * 100}%`,
                        height: "100%",
                        backgroundColor: P,
                        transition: "width 0.4s ease"
                      }} />
                    </div>
                  )}

                  {/* Vertical connector line for mobile */}
                  {isMobile && (
                    <div style={{
                      position: "absolute",
                      top: 10,
                      bottom: 10,
                      left: 17,
                      width: 3,
                      backgroundColor: "#E5E7EB",
                      zIndex: 1
                    }}>
                      <div style={{
                        height: `${(activeStepIdx / (stepsList.length - 1)) * 100}%`,
                        width: "100%",
                        backgroundColor: P,
                        transition: "height 0.4s ease"
                      }} />
                    </div>
                  )}

                  {stepsList.map((step, idx) => {
                    const isCompleted = idx <= activeStepIdx;
                    const isCurrent = idx === activeStepIdx;
                    
                    return (
                      <div key={step.key} style={{
                        display: "flex",
                        flexDirection: isMobile ? "row" : "column",
                        alignItems: isMobile ? "flex-start" : "center",
                        gap: isMobile ? 16 : 10,
                        flex: 1,
                        position: "relative",
                        zIndex: 2,
                        textAlign: isMobile ? "left" : "center"
                      }}>
                        
                        {/* Circle Indicator with Elegant Icons */}
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          backgroundColor: isCompleted ? P : "#ffffff",
                          border: isCompleted ? `2.5px solid ${P}` : "2.5px solid #D1D5DB",
                          color: isCompleted ? "#ffffff" : "#6B7280",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: isCurrent ? `0 0 0 4px ${P}20` : "none",
                          transition: "all 0.3s ease",
                          flexShrink: 0
                        }}>
                          {isCompleted && !isCurrent && idx < activeStepIdx ? (
                            <span className="material-symbols-outlined" style={{ fontSize: 18, fontWeight: "bold" }}>check</span>
                          ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{step.icon}</span>
                          )}
                        </div>

                        <div>
                          {/* Title */}
                          <p style={{
                            fontSize: 14,
                            fontWeight: isCurrent ? 700 : 500,
                            color: isCompleted ? "#0D1F0B" : "#9CA3AF",
                            margin: 0,
                            lineHeight: 1.2
                          }}>
                            {step.label}
                          </p>
                          {/* Description */}
                          <p style={{
                            fontSize: 11,
                            color: isCurrent ? P : "#6B7280",
                            margin: "4px 0 0",
                            fontWeight: isCurrent ? 600 : 400,
                            maxWidth: isMobile ? "100%" : 160,
                            lineHeight: 1.4
                          }}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Split Grid for Products list and Delivery Summary */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr", gap: 24, alignItems: "start" }}>
              
              {/* Ordered Products Card */}
              <div style={{
                backgroundColor: "#ffffff",
                borderRadius: 16,
                border: "1px solid #E5EBF0",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(13, 31, 11, 0.01)"
              }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", backgroundColor: "#FAFDF7" }}>
                  <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: 16, fontWeight: 500, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ color: P, fontSize: 18 }}>shopping_bag</span>
                    {t("পণ্যসমূহ", "Items in Order")}
                  </h3>
                </div>
                <div style={{ padding: "12px 20px" }}>
                  {(selectedOrder.order_items || []).map((item: any, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < selectedOrder.order_items.length - 1 ? "1px solid #F3F4F6" : "none", alignItems: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "#FAFDF7", border: "1px solid #E5EBF0", padding: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <img src={item.product_image} alt={item.product_name} style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 4 }} onError={(e) => { e.currentTarget.src = "/assets/placeholder.jpg"; }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.product_name}
                        </h4>
                        <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>
                          {formatPrice(item.unit_price)} × {formatNum(item.quantity)}
                        </p>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", flexShrink: 0 }}>
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal / totals block */}
                <div style={{ padding: "18px 20px", backgroundColor: "#FAFDF7", borderTop: "1px solid #F3F4F6", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4B5563" }}>
                    <span>{t("উপমোট", "Subtotal")}</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4B5563" }}>
                    <span>{t("ডেলিভারি চার্জ", "Delivery Fee")}</span>
                    <span>{selectedOrder.delivery_fee === 0 ? t("বিনামূল্যে", "Free") : formatPrice(selectedOrder.delivery_fee)}</span>
                  </div>
                  <div style={{ height: 1, backgroundColor: "#E5E7EB", margin: "4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: "#111827" }}>
                    <span style={{ fontFamily: "'Noto Serif', serif" }}>{t("সর্বমোট", "Grand Total")}</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping and Delivery details Card */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                
                {/* Shipping info */}
                <div style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 16,
                  border: "1px solid #E5EBF0",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(13, 31, 11, 0.01)"
                }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", backgroundColor: "#FAFDF7" }}>
                    <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: 16, fontWeight: 500, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ color: P, fontSize: 18 }}>location_on</span>
                      {t("ডেলিভারি বিবরণ", "Delivery Address")}
                    </h3>
                  </div>
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#9CA3AF" }}>
                        {t("গ্রাহকের নাম", "Recipient")}
                      </span>
                      <p style={{ fontSize: 14, color: "#111827", fontWeight: 600, margin: "2px 0 0" }}>{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#9CA3AF" }}>
                        {t("মোবাইল নম্বর", "Mobile")}
                      </span>
                      <p style={{ fontSize: 14, color: "#111827", fontWeight: 600, margin: "2px 0 0" }}>{selectedOrder.phone}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#9CA3AF" }}>
                        {t("পূর্ণ ঠিকানা", "Shipping Destination")}
                      </span>
                      <p style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.5, margin: "2px 0 0" }}>
                        {selectedOrder.address}, {selectedOrder.thana}, {selectedOrder.district}, {selectedOrder.division} {selectedOrder.postcode ? ` - ${selectedOrder.postcode}` : ""}
                      </p>
                    </div>
                    {selectedOrder.notes && (
                      <div style={{ backgroundColor: "#F3F4F6", borderRadius: 8, padding: 12, borderLeft: `3px solid ${P}` }}>
                        <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 3 }}>
                          {t("বিশেষ নির্দেশনা", "Special Instructions")}
                        </span>
                        <p style={{ fontSize: 12, color: "#374151", margin: 0, fontStyle: "italic" }}>{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment info */}
                <div style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 16,
                  border: "1px solid #E5EBF0",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(13, 31, 11, 0.01)"
                }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", backgroundColor: "#FAFDF7" }}>
                    <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: 16, fontWeight: 500, color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ color: P, fontSize: 18 }}>credit_card</span>
                      {t("পেমেন্ট বিবরণ", "Payment Details")}
                    </h3>
                  </div>
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#9CA3AF" }}>
                        {t("পেমেন্ট পদ্ধতি", "Payment Method")}
                      </span>
                      <p style={{ fontSize: 14, color: "#111827", fontWeight: 600, margin: "2px 0 0", textTransform: "uppercase" }}>
                        {selectedOrder.payment_method === "cod" ? t("ক্যাশ অন ডেলিভারি", "Cash on Delivery") : selectedOrder.payment_method}
                      </p>
                    </div>
                    {selectedOrder.payment_number && (
                      <div>
                        <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#9CA3AF" }}>
                          {t("পেমেন্ট নম্বর", "Sender Number")}
                        </span>
                        <p style={{ fontSize: 14, color: "#111827", fontWeight: 600, margin: "2px 0 0" }}>{selectedOrder.payment_number}</p>
                      </div>
                    )}
                    {selectedOrder.transaction_id && (
                      <div>
                        <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#9CA3AF" }}>
                          {t("ট্রানজেকশন আইডি", "Transaction ID")}
                        </span>
                        <p style={{ fontSize: 14, color: P, fontWeight: 700, margin: "2px 0 0", fontFamily: "monospace" }}>{selectedOrder.transaction_id}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
