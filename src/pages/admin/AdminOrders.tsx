import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { supabase, DbOrder, OrderStatus } from "@/lib/supabase";
import { seedSupabaseData } from "@/lib/supabase-seed";
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
  Filter,
  RefreshCw,
  Phone,
  CreditCard,
  Calendar,
  Eye,
  X,
  ExternalLink,
  DollarSign,
  MapPin,
  Check
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
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "weekly" | "monthly" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const STATUS_LABELS: Record<OrderStatus, { label: string; bg: string; color: string; icon: any }> = {
    pending:    { label: "Pending",     bg: "#FFFBEB", color: "#B45309", icon: Clock },
    processing: { label: "Processing",  bg: "#EFF6FF", color: "#1D4ED8", icon: RefreshCw },
    shipped:    { label: "Shipped",     bg: "#F5F3FF", color: "#6D28D9", icon: Truck },
    delivered:  { label: "Delivered",   bg: "#ECFDF5", color: "#047857", icon: CheckCircle2 },
    cancelled:  { label: "Cancelled",   bg: "#FEF2F2", color: "#B91C1C", icon: XCircle },
  };

  const PAYMENT_LABELS: Record<string, { label: string; bg: string; color: string }> = {
    bkash:  { label: "bKash", bg: "#FDF2F8", color: "#BE185D" }, 
    nagad:  { label: "Nagad", bg: "#FFF7ED", color: "#C2410C" }, 
    rocket: { label: "Rocket", bg: "#FAF5FF", color: "#7E22CE" }, 
    cod:    { label: "Cash on Delivery", bg: "#F4F7F3", color: "#2D5A27" }, 
    bank:   { label: "Bank Transfer", bg: "#F0F9FF", color: "#0369A1" },
  };

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

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
      return true;
    });
  }

  async function load(isManualRefresh = false) {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    if (!supabase) {
      setRawOrders(demoOrdersList);
      setRealtimeActive(false);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // 1. First check count, auto-seed if empty
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
      if (count === 0 || count === null) {
        await seedSupabaseData(false);
      }

      // 2. Fetch real Supabase orders
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        console.warn("Supabase orders query returned no rows or error:", error);
        setRawOrders(demoOrdersList);
      } else {
        setRawOrders(data);
        setRealtimeActive(true);
      }
    } catch (err) {
      console.error("Error loading orders from Supabase:", err);
      setRawOrders(demoOrdersList);
    } finally {
      setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Quick inline status update from admin orders list
  async function quickUpdateStatus(orderId: string, orderNumber: string, newStatus: OrderStatus) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    if (supabase && isUuid) {
      const { error } = await supabase!
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) {
        showToast(`Failed to update #${orderNumber}: ${error.message}`);
        return;
      }
    }
    setRawOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Order #${orderNumber} updated to ${STATUS_LABELS[newStatus].label}`);
  }

  useEffect(() => { 
    load(); 

    // Subscribe to real-time changes on Supabase 'orders' table
    if (supabase) {
      const channel = supabase
        .channel("admin-orders-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          () => {
            load(true);
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setRealtimeActive(true);
          }
        });

      return () => {
        supabase!.removeChannel(channel);
      };
    }
  }, []);

  // Filter orders
  const dateFilteredOrders = filterOrdersByDate(rawOrders, dateFilter, customStartDate, customEndDate);

  const counts = dateFilteredOrders.reduce((acc, o) => { 
    acc[o.status] = (acc[o.status] ?? 0) + 1; 
    return acc; 
  }, {} as Record<string, number>);

  const totalFilteredRevenue = dateFilteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const statusFiltered = statusFilter === "all"
    ? dateFilteredOrders
    : dateFilteredOrders.filter(o => o.status === statusFilter);

  const filtered = search
    ? statusFiltered.filter((o) => 
        o.order_number.toLowerCase().includes(search.toLowerCase()) || 
        o.customer_name.toLowerCase().includes(search.toLowerCase()) || 
        o.phone.includes(search) ||
        (o.district && o.district.toLowerCase().includes(search.toLowerCase()))
      )
    : statusFiltered;

  return (
    <AdminLayout title="Client Orders Registry">
      {/* Toast Notification */}
      {toast && (
        <div style={{ 
          position: "fixed", 
          bottom: 32, 
          right: 32, 
          backgroundColor: "#111827", 
          color: "#fff", 
          borderRadius: 14, 
          padding: "14px 22px", 
          fontSize: 13, 
          fontFamily: "'Inter',sans-serif", 
          fontWeight: 600, 
          zIndex: 9999, 
          boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <CheckCircle2 size={16} style={{ color: "#10B981" }} />
          <span>{toast}</span>
        </div>
      )}

      <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 32 }}>
        
        {/* SYNC STATUS BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          borderRadius: 14,
          padding: "12px 20px",
          border: "1px solid #E6E8EC",
          boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ 
                width: 8, 
                height: 8, 
                borderRadius: "50%", 
                backgroundColor: realtimeActive ? "#10B981" : "#3B82F6", 
                display: "inline-block",
                boxShadow: realtimeActive ? "0 0 8px rgba(16,185,129,0.6)" : "none" 
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>
                {realtimeActive ? "Realtime Live Sync" : "Database Connected"}
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#6B7280" }}>
              • {filtered.length} order{filtered.length === 1 ? '' : 's'} displayed 
              • Total: <strong style={{ color: P }}>{formatPrice(totalFilteredRevenue)}</strong>
              {lastSyncedAt ? ` • Last synced at ${lastSyncedAt}` : ""}
            </span>
          </div>

          <button 
            onClick={() => load(true)}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#F4F7F3",
              color: P,
              border: "1px solid #E2E8F0",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: refreshing ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Syncing..." : "Sync Orders"}</span>
          </button>
        </div>

        {/* TOP STATUS CARDS GRID */}
        <div className="admin-grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: "Total Orders", value: formatNum(dateFilteredOrders.length), sub: `Volume: ${formatPrice(totalFilteredRevenue)}`, icon: ShoppingBag, color: P, bg: "#F4F7F3" },
            { label: "Awaiting Verification", value: formatNum(dateFilteredOrders.filter(o => o.status === "pending").length), sub: "Needs action", icon: Clock, color: "#D97706", bg: "#FFFBEB" },
            { label: "Processing & Shipping", value: formatNum(dateFilteredOrders.filter(o => o.status === "processing" || o.status === "shipped").length), sub: "In-flight dispatch", icon: Truck, color: "#1E40AF", bg: "#EFF6FF" },
            { label: "Delivered Orders", value: formatNum(dateFilteredOrders.filter(o => o.status === "delivered").length), sub: "Completed transactions", icon: CheckCircle2, color: "#059669", bg: "#ECFDF5" },
          ].map((card, idx) => (
            <div key={idx} className="admin-card-padding" style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              border: "1px solid #E6E8EC",
              padding: "20px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
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
                <card.icon size={22} style={{ color: card.color }} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>
                  {card.label}
                </p>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
                  {card.value}
                </h3>
                <p style={{ fontSize: 11, color: "#6B7280", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {card.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CONTROLS BAR (Filters & Search) */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          backgroundColor: "#fff",
          padding: "20px 24px",
          borderRadius: 18,
          border: "1px solid #E6E8EC",
          marginBottom: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
        }}>
          
          {/* Row 1: Search Bar & Clear */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", flexWrap: "wrap" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#FAFBF9",
              border: "1.5px solid #E5EFE2",
              borderRadius: 12,
              padding: "0 16px",
              height: 44,
              flex: 1,
              minWidth: 260,
              transition: "all 0.2s"
            }}>
              <Search size={18} style={{ color: "#8BA088", marginRight: 10, flexShrink: 0 }} />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID (#ORD-...), buyer name, phone or district..."
                style={{ 
                  width: "100%", 
                  border: "none", 
                  fontSize: 13, 
                  fontFamily: "'Inter',sans-serif", 
                  outline: "none", 
                  backgroundColor: "transparent",
                  color: "#1F2937",
                  fontWeight: 500
                }} 
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "#9CA3AF" }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Date Range Selector Pills */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {([
                ["all", "All Time"],
                ["today", "Today"],
                ["weekly", "This Week"],
                ["monthly", "This Month"],
                ["custom", "Custom"],
              ] as const).map(([val, label]) => {
                const active = dateFilter === val;
                return (
                  <button key={val} onClick={() => setDateFilter(val)}
                    style={{ 
                      padding: "8px 14px", 
                      borderRadius: 10, 
                      border: "none", 
                      backgroundColor: active ? P : "#F4F7F3", 
                      color: active ? "#fff" : "#4B5563", 
                      fontSize: 12, 
                      fontWeight: 600, 
                      fontFamily: "'Inter',sans-serif", 
                      cursor: "pointer", 
                      transition: "all 0.15s",
                      boxShadow: active ? "0 2px 8px rgba(45,90,39,0.2)" : "none"
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
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
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6B726A" }}>Start Date:</span>
                <input 
                  type="date" 
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{
                    border: "1px solid #E5EFE2",
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: 12,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    outline: "none",
                    color: "#374151"
                  }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6B726A" }}>End Date:</span>
                <input 
                  type="date" 
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{
                    border: "1px solid #E5EFE2",
                    borderRadius: 8,
                    padding: "4px 8px",
                    fontSize: 12,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    outline: "none",
                    color: "#374151"
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Status Filter Tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", paddingTop: 4, borderTop: "1px dashed #E6E8EC" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase", marginRight: 4 }}>
              Status:
            </span>
            {([["all", "All Orders"] as const, ...Object.entries(STATUS_LABELS).map(([k, v]) => [k as OrderStatus, v.label] as const)]).map(([val, label]) => {
              const active = statusFilter === val;
              const count = val === "all" ? dateFilteredOrders.length : (counts[val] ?? 0);
              return (
                <button key={val} onClick={() => setStatusFilter(val)}
                  style={{ 
                    padding: "6px 14px", 
                    borderRadius: 10, 
                    border: "none", 
                    backgroundColor: active ? P : "#F4F7F3", 
                    color: active ? "#fff" : "#4B5563", 
                    fontSize: 12, 
                    fontWeight: 600, 
                    fontFamily: "'Inter',sans-serif", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 6, 
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                    boxShadow: active ? "0 2px 8px rgba(45,90,39,0.2)" : "none"
                  }}
                >
                  {label}
                  <span style={{ 
                    fontSize: 10, 
                    fontWeight: 700,
                    backgroundColor: active ? "rgba(255,255,255,0.25)" : "#E5EFE2", 
                    color: active ? "#fff" : "#2D5A27", 
                    borderRadius: 12, 
                    padding: "2px 7px", 
                    lineHeight: "13px" 
                  }}>
                    {formatNum(count)}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* MAIN ORDERS LISTING (DESKTOP TABLE + MOBILE CARDS) */}
        <div style={{ 
          backgroundColor: "#fff", 
          borderRadius: 18, 
          border: "1px solid #E6E8EC", 
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.01)" 
        }}>
          
          {/* DESKTOP TABLE VIEW */}
          <div className="admin-desktop-table" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr style={{ backgroundColor: "#FAFBF9", borderBottom: "1px solid #E6E8EC" }}>
                  {[
                    "Order Ref", 
                    "Customer Details", 
                    "Location",
                    "Payment Method", 
                    "Total Amount", 
                    "Status", 
                    "Date & Time", 
                    "Action"
                  ].map((h, idx) => (
                    <th key={idx} style={{ 
                      padding: "14px 20px", 
                      textAlign: h === "Action" ? "right" : "left", 
                      fontSize: 11, 
                      fontWeight: 700, 
                      textTransform: "uppercase", 
                      letterSpacing: "0.06em", 
                      color: "#6B7280", 
                      fontFamily: "'Inter',sans-serif", 
                      whiteSpace: "nowrap" 
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} style={{ padding: "16px 20px" }}>
                          <div style={{ height: 14, backgroundColor: "#F3F4F6", borderRadius: 6, width: j === 0 ? 80 : "80%", animation: "pulse 1.5s infinite" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 48, textAlign: "center", color: "#6B7280", fontFamily: "'Inter',sans-serif" }}>
                      No orders matched your current search filters.
                    </td>
                  </tr>
                ) : filtered.map((order) => {
                  const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
                  const payMeta = PAYMENT_LABELS[order.payment_method] ?? { label: order.payment_method, bg: "#F3F4F6", color: "#4B5563" };

                  return (
                    <tr key={order.id} 
                      style={{ 
                        borderBottom: "1px solid #F3F4F6", 
                        transition: "all 0.15s" 
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FAFBF9")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "")}
                    >
                      {/* Reference No */}
                      <td style={{ padding: "16px 20px" }}>
                        <button 
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontSize: 13, 
                            fontWeight: 800, 
                            color: P, 
                            fontFamily: "'Inter',sans-serif",
                            textDecoration: "underline",
                            textUnderlineOffset: 2
                          }}
                        >
                          #{order.order_number}
                        </button>
                      </td>

                      {/* Customer Details */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "'Inter',sans-serif", wordBreak: "break-word" }}>
                            {order.customer_name}
                          </span>
                          <a href={`tel:${order.phone}`} onClick={(e) => e.stopPropagation()} style={{ fontSize: 11, color: "#6B7280", fontFamily: "'Inter',sans-serif", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                            <Phone size={10} /> {order.phone}
                          </a>
                        </div>
                      </td>

                      {/* Location */}
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ fontSize: 12, color: "#374151", fontFamily: "'Inter',sans-serif", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={11} style={{ color: P }} />
                          {order.district || order.division || "BD"}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ 
                          fontSize: 11, 
                          color: payMeta.color, 
                          fontFamily: "'Inter',sans-serif", 
                          fontWeight: 700,
                          backgroundColor: payMeta.bg,
                          padding: "3px 8px",
                          borderRadius: 6,
                          whiteSpace: "nowrap"
                        }}>
                          {payMeta.label}
                        </span>
                      </td>

                      {/* Grand Total */}
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#111827", fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap" }}>
                          {formatPrice(order.total)}
                        </span>
                      </td>

                      {/* Status Badges with dropdown inline quick switch */}
                      <td style={{ padding: "16px 20px" }}>
                        <select
                          value={order.status}
                          onChange={(e) => quickUpdateStatus(order.id, order.order_number, e.target.value as OrderStatus)}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: st.color,
                            backgroundColor: st.bg,
                            border: `1px solid ${st.color}30`,
                            borderRadius: 8,
                            padding: "4px 8px",
                            fontFamily: "'Inter',sans-serif",
                            cursor: "pointer",
                            outline: "none"
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Order Date */}
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ fontSize: 11, color: "#6B7280", fontFamily: "'Inter',sans-serif", fontWeight: 500, whiteSpace: "nowrap" }}>
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px 20px", textAlign: "right" }}>
                        <button onClick={() => navigate(`/admin/orders/${order.id}`)}
                          style={{ 
                            backgroundColor: P, 
                            color: "#fff",
                            border: "none", 
                            borderRadius: 8,
                            padding: "6px 12px",
                            cursor: "pointer", 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: 4, 
                            fontSize: 12, 
                            fontFamily: "'Inter',sans-serif", 
                            fontWeight: 700,
                            transition: "all 0.15s" 
                          }}
                        >
                          <span>View</span>
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW (< 768px) */}
          <div className="admin-mobile-cards" style={{ display: "none", padding: "12px" }}>
            {loading ? (
              <p style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>Loading orders...</p>
            ) : filtered.length === 0 ? (
              <p style={{ padding: 24, textAlign: "center", color: "#6B7280" }}>No orders found.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filtered.map((order) => {
                  const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
                  const payMeta = PAYMENT_LABELS[order.payment_method] ?? { label: order.payment_method, bg: "#F3F4F6", color: "#4B5563" };

                  return (
                    <div key={order.id} style={{
                      backgroundColor: "#fff",
                      borderRadius: 14,
                      border: "1px solid #E6E8EC",
                      padding: 16,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.01)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: P }}>
                          #{order.order_number}
                        </span>
                        <select
                          value={order.status}
                          onChange={(e) => quickUpdateStatus(order.id, order.order_number, e.target.value as OrderStatus)}
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: st.color,
                            backgroundColor: st.bg,
                            border: `1px solid ${st.color}30`,
                            borderRadius: 6,
                            padding: "4px 6px",
                            outline: "none"
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>
                          {order.customer_name}
                        </p>
                        <p style={{ fontSize: 12, color: "#6B7280", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                          <Phone size={11} /> <a href={`tel:${order.phone}`} style={{ color: "#4B5563", textDecoration: "none" }}>{order.phone}</a>
                          {order.district && <span>• {order.district}</span>}
                        </p>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px dashed #F3F4F6" }}>
                        <div>
                          <span style={{ fontSize: 10, color: payMeta.color, backgroundColor: payMeta.bg, fontWeight: 700, padding: "2px 6px", borderRadius: 4, marginRight: 6 }}>
                            {payMeta.label}
                          </span>
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                            {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
                          {formatPrice(order.total)}
                        </span>
                      </div>

                      <button 
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        style={{
                          marginTop: 12,
                          width: "100%",
                          backgroundColor: "#F4F7F3",
                          color: P,
                          border: "1px solid #E2E8F0",
                          borderRadius: 8,
                          padding: "8px 0",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6
                        }}
                      >
                        <Eye size={13} /> View Full Order Details
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table Footer */}
          {!loading && (
            <div style={{ 
              padding: "14px 20px", 
              borderTop: "1px solid #E6E8EC", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              backgroundColor: "#FAFBF9",
              flexWrap: "wrap",
              gap: 8
            }}>
              <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>
                Showing <strong style={{ color: P }}>{filtered.length}</strong> of <strong style={{ color: "#111827" }}>{dateFilteredOrders.length}</strong> orders
              </span>
              <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'Inter',sans-serif" }}>
                Auto-syncs with customer checkout & status changes
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-desktop-table { display: none !important; }
          .admin-mobile-cards { display: block !important; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </AdminLayout>
  );
}
