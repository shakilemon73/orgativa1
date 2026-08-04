import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { supabase, DbOrder, OrderStatus } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Search, 
  ShoppingBag, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  FileText, 
  ArrowUpRight, 
  Filter,
  RefreshCw,
  Phone,
  CreditCard,
  Calendar
} from "lucide-react";

const P = "#2D5A27";
const P_DARK = "#1a4016";

const demoOrdersList: DbOrder[] = [
  { id: "101", order_number: "ORD-9821", customer_name: "রাফাত হোসেন", phone: "01712345678", email: "rafat@example.com", division: "ঢাকা", district: "ঢাকা", thana: "ধানমন্ডি", address: "রোড ৪, বাসা ১২", postcode: "1205", payment_method: "bkash", payment_number: "01712345678", transaction_id: "TRX9821BK", subtotal: 4150, delivery_fee: 100, total: 4250, status: "pending", notes: "জরুরি ডেলিভারি প্রয়োজন", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "102", order_number: "ORD-9820", customer_name: "সুমাইয়া বেগম", phone: "01812345679", email: "sumaiya@example.com", division: "চট্টগ্রাম", district: "চট্টগ্রাম", thana: "পাঁচলাইশ", address: "জিইসি মোড়", postcode: "4000", payment_method: "cod", payment_number: null, transaction_id: null, subtotal: 3000, delivery_fee: 100, total: 3100, status: "processing", notes: null, created_at: new Date(Date.now() - 3600000 * 2).toISOString(), updated_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "103", order_number: "ORD-9819", customer_name: "তানভীর আহমেদ", phone: "01912345680", email: null, division: "রাজশাহী", district: "রাজশাহী", thana: "বোয়ালিয়া", address: "সাহেব বাজার", postcode: "6000", payment_method: "nagad", payment_number: "01912345680", transaction_id: "NGD5512", subtotal: 5700, delivery_fee: 100, total: 5800, status: "shipped", notes: null, created_at: new Date(Date.now() - 3600000 * 5).toISOString(), updated_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: "104", order_number: "ORD-9818", customer_name: "নাসরিন সুলতানা", phone: "01612345681", email: null, division: "সিলেট", district: "সিলেট", thana: "জিন্দাবাজার", address: "জেল রোড", postcode: "3100", payment_method: "bkash", payment_number: "01612345681", transaction_id: "BKS8819", subtotal: 2300, delivery_fee: 100, total: 2400, status: "delivered", notes: null, created_at: new Date(Date.now() - 3600000 * 24).toISOString(), updated_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "105", order_number: "ORD-9817", customer_name: "মাহমুদুল হাসান", phone: "01512345682", email: null, division: "খুলনা", district: "খুলনা", thana: "সোনাডাঙ্গা", address: "বাসস্ট্যান্ড রোড", postcode: "9100", payment_method: "cod", payment_number: null, transaction_id: null, subtotal: 1750, delivery_fee: 100, total: 1850, status: "delivered", notes: null, created_at: new Date(Date.now() - 3600000 * 48).toISOString(), updated_at: new Date(Date.now() - 3600000 * 48).toISOString() },
];

export default function AdminOrders() {
  const [, navigate] = useLocation();
  const { lang, t, formatPrice, formatNum } = useLanguage();
  const [rawOrders, setRawOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "weekly" | "monthly" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [search, setSearch] = useState("");

  const STATUS_LABELS: Record<OrderStatus, { label: string; bg: string; color: string; icon: any }> = {
    pending:    { label: t("অপেক্ষমাণ", "Pending"),     bg: "#FFFBEB", color: "#B45309", icon: Clock },
    processing: { label: t("প্রক্রিয়াকরণ", "Processing"),  bg: "#EFF6FF", color: "#1D4ED8", icon: RefreshCw },
    shipped:    { label: t("শিপ করা হয়েছে", "Shipped"), bg: "#F5F3FF", color: "#6D28D9", icon: Truck },
    delivered:  { label: t("ডেলিভারি হয়েছে", "Delivered"), bg: "#ECFDF5", color: "#047857", icon: CheckCircle2 },
    cancelled:  { label: t("বাতিল", "Cancelled"),           bg: "#FEF2F2", color: "#B91C1C", icon: XCircle },
  };

  const PAYMENT_LABELS: Record<string, string> = {
    bkash: "bKash", 
    nagad: "Nagad", 
    rocket: "Rocket", 
    cod: t("ক্যাশ অন ডেলিভারি", "Cash on Delivery"), 
    bank: t("ব্যাংক ট্রান্সফার", "Bank Transfer"),
  };

  function filterOrdersByDate(orders: DbOrder[], filterType: string, customStart?: string, customEnd?: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;

    return orders.filter(order => {
      const orderTime = new Date(order.created_at).getTime();
      if (filterType === "today") {
        return orderTime >= todayStart && orderTime <= todayEnd;
      } else if (filterType === "weekly") {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return orderTime >= sevenDaysAgo;
      } else if (filterType === "monthly") {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return orderTime >= thirtyDaysAgo;
      } else if (filterType === "custom") {
        let start = customStart ? new Date(customStart + "T00:00:00").getTime() : 0;
        let end = customEnd ? new Date(customEnd + "T23:59:59").getTime() : Infinity;
        return orderTime >= start && orderTime <= end;
      }
      return true; // "all"
    });
  }

  async function load() {
    setLoading(true);
    if (!supabase) {
      setRawOrders(demoOrdersList);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) {
        setRawOrders(demoOrdersList);
      } else {
        setRawOrders(data ?? []);
      }
    } catch {
      setRawOrders(demoOrdersList);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Compute filters on client-side
  const dateFilteredOrders = filterOrdersByDate(rawOrders, dateFilter, customStartDate, customEndDate);

  const counts = dateFilteredOrders.reduce((acc, o) => { 
    acc[o.status] = (acc[o.status] ?? 0) + 1; 
    return acc; 
  }, {} as Record<string, number>);

  const statusFiltered = statusFilter === "all"
    ? dateFilteredOrders
    : dateFilteredOrders.filter(o => o.status === statusFilter);

  const filtered = search
    ? statusFiltered.filter((o) => 
        o.order_number.toLowerCase().includes(search.toLowerCase()) || 
        o.customer_name.toLowerCase().includes(search.toLowerCase()) || 
        o.phone.includes(search)
      )
    : statusFiltered;

  return (
    <AdminLayout title={t("গ্রাহকের অর্ডার ও লেনদেন সমূহ", "Client Order Management Registry")}>
      <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 24 }}>
        
        {/* TOP STATUS CARDS GRID */}
        <div className="admin-grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: t("মোট সক্রিয় অর্ডার", "Aggregated Orders"), value: formatNum(dateFilteredOrders.length), icon: ShoppingBag, color: P, bg: "#F4F7F3", desc: t("চলতি বা সমাপ্ত অর্ডার সমূহ", "Incoming order records") },
            { label: t("মুলতুবি (অপেক্ষমাণ)", "Awaiting Action"), value: formatNum(dateFilteredOrders.filter(o => o.status === "pending").length), icon: Clock, color: "#D97706", bg: "#FFFBEB", desc: t("পেন্ডিং পেমেন্ট / কনফার্মেশন", "Requires priority verification") },
            { label: t("চলতি প্রক্রিয়াকরণ", "In Transit/Process"), value: formatNum(dateFilteredOrders.filter(o => o.status === "processing" || o.status === "shipped").length), icon: Truck, color: "#1E40AF", bg: "#EFF6FF", desc: t("শিপমেন্ট বা প্যাকেজিং হচ্ছে", "Packages being dispatched") },
            { label: t("সফল ডেলিভারি", "Completed Orders"), value: formatNum(dateFilteredOrders.filter(o => o.status === "delivered").length), icon: CheckCircle2, color: "#059669", bg: "#ECFDF5", desc: t("সফলভাবে হস্তান্তরিত", "Fully closed transactions") },
          ].map((card, idx) => (
            <div key={idx} style={{
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

        {/* CONTROLS BAR (Pills & Search) */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          backgroundColor: "#fff",
          padding: "24px 28px",
          borderRadius: 20,
          border: "1px solid #EEF2ED",
          marginBottom: 28,
          boxShadow: "0 4px 12px rgba(0,0,0,0.005)"
        }}>
          
          {/* Date Range Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, borderBottom: "1px solid #F4F7F3", paddingBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4B5563", letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={12} /> {t("তারিখ অনুযায়ী ফিল্টার করুন", "FILTER BY DATE RANGE")}
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {([
                ["all", t("সব সময়", "All Time")],
                ["today", t("আজকে (দৈনিক)", "Daily / Today")],
                ["weekly", t("এই সপ্তাহে (সাপ্তাহিক)", "Weekly")],
                ["monthly", t("এই মাসে (মাসিক)", "Monthly")],
                ["custom", t("কাস্টম তারিখ", "Custom Range")],
              ] as const).map(([val, label]) => {
                const active = dateFilter === val;
                return (
                  <button key={val} onClick={() => setDateFilter(val)}
                    style={{ 
                      padding: "8px 16px", 
                      borderRadius: 12, 
                      border: "none", 
                      backgroundColor: active ? P : "#F4F7F3", 
                      color: active ? "#fff" : "#4B5563", 
                      fontSize: 12, 
                      fontWeight: 600, 
                      fontFamily: "'Inter',sans-serif", 
                      cursor: "pointer", 
                      transition: "all 0.2s",
                      boxShadow: active ? "0 4px 12px rgba(45,90,39,0.2)" : "none"
                    }}
                    onMouseEnter={(e) => { if(!active) e.currentTarget.style.backgroundColor = "#E5EFE2"; }}
                    onMouseLeave={(e) => { if(!active) e.currentTarget.style.backgroundColor = "#F4F7F3"; }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Custom Date Inputs */}
            {dateFilter === "custom" && (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 12, 
                backgroundColor: "#FAFBF9", 
                padding: "10px 14px", 
                borderRadius: 12, 
                border: "1px solid #EAF0E9",
                alignSelf: "flex-start",
                marginTop: 8,
                flexWrap: "wrap"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#6B726A" }}>{t("শুরু:", "Start:")}</span>
                  <input 
                    type="date" 
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    style={{
                      border: "1px solid #E5EFE2",
                      borderRadius: 8,
                      padding: "4px 8px",
                      fontSize: 11,
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      outline: "none",
                      color: "#374151"
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#6B726A" }}>{t("শেষ:", "End:")}</span>
                  <input 
                    type="date" 
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    style={{
                      border: "1px solid #E5EFE2",
                      borderRadius: 8,
                      padding: "4px 8px",
                      fontSize: 11,
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      outline: "none",
                      color: "#374151"
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Status Filter Tab Segments */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4B5563", letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
              <Filter size={12} /> {t("অবস্থা অনুযায়ী ফিল্টার করুন", "FILTER BY TRANSACTION STATUS")}
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {([["all", t("সব অর্ডার", "All Orders")] as const, ...Object.entries(STATUS_LABELS).map(([k, v]) => [k as OrderStatus, v.label] as const)]).map(([val, label]) => {
                const active = statusFilter === val;
                const count = val === "all" ? dateFilteredOrders.length : (counts[val] ?? 0);
                return (
                  <button key={val} onClick={() => setStatusFilter(val)}
                    style={{ 
                      padding: "8px 18px", 
                      borderRadius: 12, 
                      border: "none", 
                      backgroundColor: active ? P : "#F4F7F3", 
                      color: active ? "#fff" : "#4B5563", 
                      fontSize: 12, 
                      fontWeight: 600, 
                      fontFamily: "'Inter',sans-serif", 
                      cursor: "pointer", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 8, 
                      whiteSpace: "nowrap",
                      transition: "all 0.2s",
                      boxShadow: active ? "0 4px 12px rgba(45,90,39,0.2)" : "none"
                    }}
                    onMouseEnter={(e) => { if(!active) e.currentTarget.style.backgroundColor = "#E5EFE2"; }}
                    onMouseLeave={(e) => { if(!active) e.currentTarget.style.backgroundColor = "#F4F7F3"; }}
                  >
                    {label}
                    {count > 0 && (
                      <span style={{ 
                        fontSize: 10, 
                        fontWeight: 700,
                        backgroundColor: active ? "rgba(255,255,255,0.2)" : "#E5EFE2", 
                        color: active ? "#fff" : "#2D5A27", 
                        borderRadius: 8, 
                        padding: "2px 8px", 
                        lineHeight: "14px" 
                      }}>
                        {formatNum(count)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Elegant Search Input with icons */}
          <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#FAFBF9",
              border: "1.5px solid #E5EFE2",
              borderRadius: 14,
              padding: "0 16px",
              height: 46,
              width: "100%",
              transition: "all 0.2s"
            }}>
              <Search size={18} style={{ color: "#8BA088", marginRight: 10, flexShrink: 0 }} />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("অর্ডার নম্বর (#ORD-XXXX), কাস্টমারের নাম অথবা যোগাযোগের ফোন নম্বর দিয়ে খুঁজুন...", "Search transactions by order reference id, buyer name or phone number...")}
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
            </div>
          </div>

        </div>

        {/* MAIN ORDER REGISTRY LISTING */}
        <div style={{ 
          backgroundColor: "#fff", 
          borderRadius: 20, 
          border: "1px solid #EEF2ED", 
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.01)" 
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#FAFBF9", borderBottom: "1px solid #EEF2ED" }}>
                  {[
                    t("অর্ডার রেফারেন্স", "Reference ID"), 
                    t("গ্রাহক তথ্য", "Buyer Details"), 
                    t("পেমেন্ট পদ্ধতি", "Payment"), 
                    t("সর্বমোট মূল্য", "Grand Total"), 
                    t("অবস্থা", "Process Status"), 
                    t("অর্ডার তারিখ", "Placement Date"), 
                    ""
                  ].map((h, idx) => (
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
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} style={{ padding: "20px 24px" }}>
                          <div style={{ height: 14, backgroundColor: "#FAFBF9", borderRadius: 6, width: j === 0 ? 80 : "70%", animation: "pulse 1.5s infinite" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 48, textAlign: "center", color: "#6B726A", fontFamily: "'Inter',sans-serif" }}>
                      {t("কোনো অর্ডার রেকর্ড খুঁজে পাওয়া যায়নি।", "No order entries matched your current search filters.")}
                    </td>
                  </tr>
                ) : filtered.map((order) => {
                  const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
                  return (
                    <tr key={order.id} 
                      style={{ 
                        borderBottom: "1px solid #EEF2ED", 
                        cursor: "pointer",
                        transition: "all 0.15s" 
                      }}
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FAFBF9")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "")}
                    >
                      {/* Reference No */}
                      <td style={{ padding: "18px 24px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: P, fontFamily: "'Inter',sans-serif" }}>#{order.order_number}</span>
                      </td>

                      {/* Customer Details */}
                      <td style={{ padding: "18px 24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "'Inter',sans-serif" }}>
                            {order.customer_name}
                          </span>
                          <span style={{ fontSize: 11, color: "#6B726A", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                            <Phone size={10} /> {order.phone}
                          </span>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td style={{ padding: "18px 24px" }}>
                        <span style={{ 
                          fontSize: 12, 
                          color: "#4B5563", 
                          fontFamily: "'Inter',sans-serif", 
                          fontWeight: 600,
                          backgroundColor: "#F3F4F6",
                          padding: "4px 10px",
                          borderRadius: 8
                        }}>
                          {PAYMENT_LABELS[order.payment_method] ?? order.payment_method}
                        </span>
                      </td>

                      {/* Grand Total */}
                      <td style={{ padding: "18px 24px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "'Inter',sans-serif" }}>
                          {formatPrice(order.total)}
                        </span>
                      </td>

                      {/* Status Badges with custom icons */}
                      <td style={{ padding: "18px 24px" }}>
                        <span style={{ 
                          fontSize: 10, 
                          fontWeight: 700, 
                          color: st.color, 
                          backgroundColor: st.bg, 
                          borderRadius: 6, 
                          padding: "4px 8px", 
                          fontFamily: "'Inter',sans-serif", 
                          whiteSpace: "nowrap",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}>
                          <st.icon size={11} />
                          {st.label}
                        </span>
                      </td>

                      {/* Order Date */}
                      <td style={{ padding: "18px 24px" }}>
                        <span style={{ fontSize: 12, color: "#6B726A", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                          {new Date(order.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Double Chevron Action */}
                      <td style={{ padding: "18px 24px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => navigate(`/admin/orders/${order.id}`)}
                          style={{ 
                            background: "none", 
                            border: "none", 
                            cursor: "pointer", 
                            color: P, 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: 4, 
                            fontSize: 12, 
                            fontFamily: "'Inter',sans-serif", 
                            fontWeight: 700 
                          }}
                        >
                          {t("বিস্তারিত", "Details")} 
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && (
            <div style={{ 
              padding: "16px 28px", 
              borderTop: "1px solid #EEF2ED", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              backgroundColor: "#FAFBF9"
            }}>
              <span style={{ fontSize: 12, color: "#6B726A", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>
                {t("বর্তমান ফিল্টারে সর্বমোট অর্ডার:", "Orders matching filters:")} <strong style={{ color: P, fontSize: 13 }}>{formatNum(filtered.length)}</strong>
              </span>
              <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'Inter',sans-serif" }}>
                {t("অরগ্যাটিভা অর্ডার প্রসেসিং হাব", "Orgativa Orders Dispatch Registry")}
              </span>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
