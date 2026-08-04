import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { products as staticProducts } from "@/data/products";
import { seedSupabaseData } from "@/lib/supabase-seed";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Package, 
  Plus, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  FolderTree,
  Settings,
  AlertCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

const P = "#2D5A27";
const P_DARK = "#1a4016";
const ACCENT = "#6daf67";

const demoOrders = [
  { id: "101", order_number: "ORD-9821", customer_name: "রাফাত হোসেন", total: 4250, status: "pending", created_at: new Date().toISOString(), phone: "01712345678", payment_method: "bkash" },
  { id: "102", order_number: "ORD-9820", customer_name: "সুমাইয়া বেগম", total: 3100, status: "processing", created_at: new Date(Date.now() - 3600000 * 2).toISOString(), phone: "01812345679", payment_method: "cod" },
  { id: "103", order_number: "ORD-9819", customer_name: "তানভীর আহমেদ", total: 5800, status: "shipped", created_at: new Date(Date.now() - 3600000 * 5).toISOString(), phone: "01912345680", payment_method: "nagad" },
  { id: "104", order_number: "ORD-9818", customer_name: "নাসরিন সুলতানা", total: 2400, status: "delivered", created_at: new Date(Date.now() - 3600000 * 24).toISOString(), phone: "01612345681", payment_method: "bkash" },
  { id: "105", order_number: "ORD-9817", customer_name: "মাহমুদুল হাসান", total: 1850, status: "delivered", created_at: new Date(Date.now() - 3600000 * 48).toISOString(), phone: "01512345682", payment_method: "cod" },
];

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { lang, t, formatPrice, formatNum } = useLanguage();
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, pendingOrders: 0, totalProducts: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "weekly" | "monthly" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
    pending:    { label: t("অপেক্ষমাণ", "Pending"),    bg: "#FFFBEB", color: "#B45309" },
    processing: { label: t("প্রক্রিয়াকরণ", "Processing"), bg: "#EFF6FF", color: "#1D4ED8" },
    shipped:    { label: t("শিপ করা হয়েছে", "Shipped"), bg: "#F5F3FF", color: "#6D28D9" },
    delivered:  { label: t("ডেলিভারি হয়েছে", "Delivered"), bg: "#ECFDF5", color: "#047857" },
    cancelled:  { label: t("বাতিল", "Cancelled"),          bg: "#FEF2F2", color: "#B91C1C" },
  };

  function filterOrdersByDate(orders: any[], filterType: string, customStart?: string, customEnd?: string) {
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

  async function loadDashboardData() {
    setLoading(true);
    const applyStatic = () => {
      setRawOrders(demoOrders);
      setStats(prev => ({
        ...prev,
        totalProducts: staticProducts.length,
      }));
      setLoading(false);
    };

    if (!supabase) {
      applyStatic();
      return;
    }

    try {
      await seedSupabaseData(false);

      const [productsRes, allOrdersRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total, status, created_at, customer_name, order_number").order("created_at", { ascending: false }),
      ]);

      if (allOrdersRes.error) {
        applyStatic();
        return;
      }
      const allOrders = allOrdersRes.data ?? [];
      setRawOrders(allOrders);
      setStats(prev => ({
        ...prev,
        totalProducts: productsRes.count ?? staticProducts.length,
      }));
    } catch {
      applyStatic();
    } finally {
      setLoading(false);
    }
  }

  function generateChartData(orders: any[]) {
    // Group sales by day of the week or dates
    const days = [
      t("রবিবার", "Sun"),
      t("সোমবার", "Mon"),
      t("মঙ্গলবার", "Tue"),
      t("বুধবার", "Wed"),
      t("বৃহস্পতিবার", "Thu"),
      t("শুক্রবার", "Fri"),
      t("শনিবার", "Sat")
    ];
    
    const chartMap: Record<string, { name: string; sales: number; count: number }> = {};
    
    // Fill the last 7 days with 0s
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      chartMap[dayName] = { name: dayName, sales: 0, count: 0 };
    }

    orders.forEach(order => {
      const d = new Date(order.created_at);
      const dayName = days[d.getDay()];
      if (chartMap[dayName]) {
        if (order.status !== "cancelled") {
          chartMap[dayName].sales += order.total;
        }
        chartMap[dayName].count += 1;
      }
    });

    setSalesData(Object.values(chartMap));
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const filtered = filterOrdersByDate(rawOrders, dateFilter, customStartDate, customEndDate);
    const revenue = filtered.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
    const pending = filtered.filter(o => o.status === "pending").length;

    setStats(prev => ({
      ...prev,
      totalOrders: filtered.length,
      revenue,
      pendingOrders: pending,
    }));
    setRecentOrders(filtered.slice(0, 6));
    generateChartData(filtered);
  }, [rawOrders, dateFilter, customStartDate, customEndDate]);

  const statCards = [
    { 
      icon: ShoppingBag, 
      label: t("মোট অর্ডার", "Total Orders"), 
      value: formatNum(stats.totalOrders), 
      trend: "+12%", 
      isUp: true, 
      color: "#2D5A27", 
      bg: "#F4F7F3",
      border: "1px solid #E5EFE2" 
    },
    { 
      icon: DollarSign, 
      label: t("মোট রাজস্ব", "Total Revenue"), 
      value: formatPrice(stats.revenue), 
      trend: "+8.5%", 
      isUp: true, 
      color: "#1E40AF", 
      bg: "#EFF6FF",
      border: "1px solid #DBEAFE" 
    },
    { 
      icon: Clock, 
      label: t("মুলতুবি অর্ডার", "Pending Orders"), 
      value: formatNum(stats.pendingOrders), 
      trend: t("তাৎক্ষণিক অ্যাকশন প্রয়োজন", "Action Required"), 
      isUp: stats.pendingOrders > 0 ? false : true, 
      color: "#B45309", 
      bg: "#FFFBEB",
      border: "1px solid #FEF3C7" 
    },
    { 
      icon: Package, 
      label: t("মোট পণ্য", "Total Products"), 
      value: formatNum(stats.totalProducts), 
      trend: t("ইনভেন্টরিতে সক্রিয়", "Active in catalog"), 
      isUp: true, 
      color: "#6D28D9", 
      bg: "#F5F3FF",
      border: "1px solid #EDE9FE" 
    }
  ];

  return (
    <AdminLayout title={t("ড্যাশবোর্ড", "Dashboard Summary")}>
      <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 24 }}>
        
        {/* TOP INTERACTIVE CONTROL HERO */}
        <div style={{ 
          background: "linear-gradient(135deg, #0C1E0A 0%, #2D5A27 100%)", 
          borderRadius: 20, 
          padding: "36px 40px", 
          color: "#fff", 
          marginBottom: 32,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(12,30,10,0.08)",
          border: "1px solid rgba(255,255,255,0.08)"
        }}>
          {/* Decorative glows */}
          <div style={{ 
            position: "absolute", 
            right: "-20px", 
            top: "-20px", 
            width: 260, 
            height: 260, 
            borderRadius: "50%", 
            background: "radial-gradient(circle, rgba(109,175,103,0.18) 0%, transparent 70%)",
            pointerEvents: "none" 
          }} />
          <div style={{ 
            position: "absolute", 
            left: "25%", 
            bottom: "-60px", 
            width: 180, 
            height: 180, 
            borderRadius: "50%", 
            background: "radial-gradient(circle, rgba(109,175,103,0.12) 0%, transparent 60%)",
            pointerEvents: "none" 
          }} />

          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
            <div style={{ maxWidth: 680 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ 
                  backgroundColor: "rgba(109, 175, 103, 0.2)", 
                  color: "#99D393", 
                  fontSize: 10, 
                  fontWeight: 700, 
                  letterSpacing: "0.1em", 
                  padding: "4px 10px", 
                  borderRadius: 20,
                  textTransform: "uppercase",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  <Sparkles size={10} /> {t("লাইভ হাব", "SYSTEM STATUS: OPERATIONAL")}
                </span>
              </div>
              <h2 style={{ 
                fontFamily: "'Inter', sans-serif", 
                fontSize: 26, 
                fontWeight: 800, 
                color: "#ffffff", 
                margin: "0 0 10px",
                letterSpacing: "-0.02em"
              }}>
                {t("স্বাগতম, অ্যাডমিন প্যানেলে", "Control Center Operations Dashboard")}
              </h2>
              <p style={{ 
                fontSize: 14, 
                color: "#D0DFCC", 
                fontFamily: "'Inter',sans-serif", 
                lineHeight: 1.6, 
                margin: 0,
                fontWeight: 400
              }}>
                {t(
                  "অরগ্যাটিভা স্টোরের পণ্য ইনভেন্টরি, সাম্প্রতিক কাস্টমারদের অর্ডার এবং রাজস্ব ট্র্যাক করুন। নিচে আজকের পারফরম্যান্সের বিস্তারিত রূপরেখা দেওয়া হলো।",
                  "Oversee your premium natural product range, update prices, manage incoming order queues, and visualize your daily sales trends efficiently."
                )}
              </p>
            </div>

            <button
              onClick={loadDashboardData}
              disabled={loading}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 14,
                padding: "12px 20px",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {t("রিফ্রেশ করুন", "Sync System")}
            </button>
          </div>
        </div>

        {/* DATE FILTER CONTROL PANEL */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          border: "1px solid #EEF2ED",
          padding: "20px 24px",
          marginBottom: 32,
          boxShadow: "0 4px 12px rgba(45,90,39,0.01)",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#3E4A3B", display: "inline-flex", alignItems: "center", gap: 6 }}>
                📅 {t("তথ্য ফিল্টার করুন (তারিখ অনুযায়ী)", "Filter Insights by Date Range")}
              </span>
            </div>
            
            {/* Filter buttons */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {([
                ["all", t("সব সময়", "All Time")],
                ["today", t("আজকে (দৈনিক)", "Daily / Today")],
                ["weekly", t("এই সপ্তাহে (সাপ্তাহিক)", "Weekly")],
                ["monthly", t("এই মাসে (মাসিক)", "Monthly")],
                ["custom", t("কাস্টম তারিখ", "Custom Range")],
              ] as const).map(([val, label]) => {
                const active = dateFilter === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDateFilter(val)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: active ? `1.5px solid ${P}` : "1.5px solid #EAF0E9",
                      backgroundColor: active ? "#F4F7F3" : "#fff",
                      color: active ? P : "#4B5563",
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: "'Inter', sans-serif",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.borderColor = P;
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.borderColor = "#EAF0E9";
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
              padding: "12px 16px", 
              borderRadius: 12, 
              border: "1px solid #EAF0E9",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#6B726A" }}>{t("শুরু:", "Start:")}</span>
                <input 
                  type="date" 
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{
                    border: "1px solid #E5EFE2",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 12,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    outline: "none",
                    color: "#374151",
                    backgroundColor: "#fff"
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#6B726A" }}>{t("শেষ:", "End:")}</span>
                <input 
                  type="date" 
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{
                    border: "1px solid #E5EFE2",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 12,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    outline: "none",
                    color: "#374151",
                    backgroundColor: "#fff"
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* STATS VISUAL CARDS GRID */}
        <div className="admin-grid-4" style={{ marginBottom: 36 }}>
          {statCards.map((s) => (
            <div key={s.label} 
              style={{ 
                backgroundColor: "#fff", 
                borderRadius: 18, 
                border: "1px solid #EEF2ED", 
                padding: "26px", 
                display: "flex", 
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16,
                boxShadow: "0 10px 24px -10px rgba(45,90,39,0.03)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden"
              }}
              className="group"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 35px -12px rgba(45,90,39,0.08)";
                e.currentTarget.style.borderColor = "#D1DFCD";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 10px 24px -10px rgba(45,90,39,0.03)";
                e.currentTarget.style.borderColor = "#EEF2ED";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: s.bg, 
                  borderRadius: 14, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  flexShrink: 0,
                  border: s.border
                }}>
                  <s.icon size={22} style={{ color: s.color }} />
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  borderRadius: 8,
                  backgroundColor: s.isUp ? "#ECFDF5" : "#FFFBEB",
                  border: s.isUp ? "1px solid #D1FAE5" : "1px solid #FEF3C7"
                }}>
                  {s.isUp ? (
                    <ArrowUpRight size={12} style={{ color: "#059669" }} />
                  ) : (
                    <ArrowDownRight size={12} style={{ color: "#D97706" }} />
                  )}
                  <span style={{ 
                    fontSize: 10, 
                    fontWeight: 700, 
                    color: s.isUp ? "#059669" : "#D97706",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {s.trend}
                  </span>
                </div>
              </div>

              <div>
                <p style={{ 
                  fontSize: 11, 
                  color: "#6B7D65", 
                  fontFamily: "'Inter',sans-serif", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.08em", 
                  margin: "0 0 4px",
                  fontWeight: 700 
                }}>{s.label}</p>
                {loading ? (
                  <div style={{ width: 100, height: 28, backgroundColor: "#FAFBF9", borderRadius: 8, animation: "pulse 1.5s infinite", marginTop: 6 }} />
                ) : (
                  <p style={{ 
                    fontSize: 26, 
                    fontWeight: 800, 
                    color: "#111827", 
                    fontFamily: "'Inter',sans-serif", 
                    margin: 0,
                    letterSpacing: "-0.03em" 
                  }}>{s.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* TWO-COLUMN GRAPH & ACTIONS AREA */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "2fr 1fr", 
          gap: 32, 
          marginBottom: 36,
        }} className="admin-grid-2">
          
          {/* Left Column: Visual Sales Chart */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            border: "1px solid #EEF2ED",
            padding: "28px 32px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: "'Inter', sans-serif", margin: 0 }}>
                  {t("বিক্রয় ও গতিবিধি বিশ্লেষণ", "Weekly Performance")}
                </h3>
                <p style={{ fontSize: 12, color: "#6B726A", margin: "2px 0 0", fontFamily: "'Inter', sans-serif" }}>
                  {t("বিগত ৭ দিনের অর্ডারের উপর ভিত্তি করে রাজস্ব পর্যবেক্ষণ", "Revenue generated based on orders placed over the past 7 days")}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4B5563", fontWeight: 500 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: P, display: "inline-block" }} />
                  {t("রাজস্ব", "Revenue")}
                </span>
              </div>
            </div>

            <div style={{ width: "100%", height: 240, minHeight: 200 }}>
              {loading ? (
                <div style={{ width: "100%", height: "100%", backgroundColor: "#FAFBF9", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                  <RefreshCw size={24} className="animate-spin" />
                </div>
              ) : salesData.length === 0 ? (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                  {t("চার্ট লোড করার মতো পর্যাপ্ত তথ্য নেই।", "No data to visualize yet")}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={P} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={P} stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10} 
                      style={{ fontFamily: "'Inter', sans-serif" }} 
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      dx={-10}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      tickFormatter={(v) => `৳${v}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      labelStyle={{ fontWeight: 700, color: "#111827", fontFamily: "'Inter', sans-serif" }}
                      itemStyle={{ color: P, fontWeight: 600, fontSize: 13, fontFamily: "'Inter', sans-serif" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke={P} 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Right Column: High-value Quick Commands */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            border: "1px solid #EEF2ED",
            padding: "28px 30px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
            display: "flex",
            flexDirection: "column"
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", fontFamily: "'Inter', sans-serif", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              ⚡ {t("নিয়ন্ত্রণ কর্মসমূহ", "QUICK ACTIONS")}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {[
                { 
                  icon: Plus, 
                  label: t("নতুন পণ্য যোগ করুন", "Add Premium Product"), 
                  path: "/admin/products/new", 
                  color: "#2D5A27", 
                  bg: "#F4F7F3",
                  hoverBg: "#EAF5E9"
                },
                { 
                  icon: ShoppingBag, 
                  label: t("অর্ডার মডিউল খুলুন", "Manage Order Queues"), 
                  path: "/admin/orders", 
                  color: "#1E40AF", 
                  bg: "#EFF6FF",
                  hoverBg: "#E0F2FE"
                },
                { 
                  icon: FolderTree, 
                  label: t("ক্যাটাগরি সাজান", "Manage Shell Shelves"), 
                  path: "/admin/categories", 
                  color: "#B45309", 
                  bg: "#FFFBEB",
                  hoverBg: "#FEF3C7"
                },
                { 
                  icon: Settings, 
                  label: t("দোকানের সেটিংস", "Update Store Settings"), 
                  path: "/admin/settings", 
                  color: "#6D28D9", 
                  bg: "#F5F3FF",
                  hoverBg: "#EDE9FE"
                }
              ].map((btn, index) => (
                <button
                  key={index}
                  onClick={() => navigate(btn.path)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "1px solid #EEF2ED",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = btn.color;
                    e.currentTarget.style.backgroundColor = btn.bg;
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#EEF2ED";
                    e.currentTarget.style.backgroundColor = "#fff";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: btn.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <btn.icon size={18} style={{ color: btn.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1F2937", fontFamily: "'Inter', sans-serif" }}>
                      {btn.label}
                    </span>
                  </div>
                  <ChevronRight size={14} style={{ color: "#9CA3AF" }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY / TRANSACTIONS TABLE */}
        <div style={{ 
          backgroundColor: "#fff", 
          borderRadius: 20, 
          border: "1px solid #EEF2ED", 
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.01)"
        }}>
          <div style={{ 
            padding: "26px 32px", 
            borderBottom: "1px solid #EEF2ED", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16
          }}>
            <div>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>
                {t("সাম্প্রতিক অর্ডারসমূহ", "Latest Activity Logs")}
              </h3>
              <p style={{ fontSize: 12, color: "#6B726A", fontFamily: "'Inter',sans-serif", margin: "3px 0 0" }}>
                {t("আপনার দোকানে কাস্টমারদের পাঠানো সর্বশেষ অর্ডারের রিয়েল-টাইম তালিকা", "Live overview of premium buyers and their checkout statistics")}
              </p>
            </div>
            
            <button onClick={() => navigate("/admin/orders")}
              style={{ 
                fontSize: 12, 
                color: P, 
                fontFamily: "'Inter',sans-serif", 
                background: "#EAF5E9", 
                border: "none", 
                padding: "8px 16px",
                borderRadius: 10,
                cursor: "pointer", 
                fontWeight: 600, 
                display: "flex", 
                alignItems: "center", 
                gap: 6,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#D4ECD2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#EAF5E9"; }}
            >
              {t("সব অর্ডার দেখুন", "View Full Registry")} 
              <ChevronRight size={14} />
            </button>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#FAFBF9", borderBottom: "1px solid #EEF2ED" }}>
                  {[
                    t("অর্ডার নম্বর", "Reference No"), 
                    t("গ্রাহকের নাম", "Client / Buyer"), 
                    t("মোট পরিমাণ", "Gross Amount"), 
                    t("অবস্থা", "Status"), 
                    t("তারিখ ও সময়", "Order Date"), 
                    ""
                  ].map((h, idx) => (
                    <th key={idx} style={{ 
                      padding: "16px 28px", 
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
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} style={{ padding: "20px 28px" }}>
                          <div style={{ height: 14, backgroundColor: "#FAFBF9", borderRadius: 6, width: j === 0 ? 80 : j === 2 ? 60 : "75%", animation: "pulse 1.5s infinite" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "56px 32px", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#8B9E88" }}>
                        <AlertCircle size={32} style={{ opacity: 0.6 }} />
                        <span style={{ fontSize: 13, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                          {t("কোনো অর্ডার পাওয়া যায়নি।", "No customer transactions processed yet.")}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : recentOrders.map((order) => {
                  const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
                  return (
                    <tr key={order.id} 
                      style={{ 
                        borderBottom: "1px solid #EEF2ED", 
                        transition: "background 0.2s",
                        cursor: "pointer"
                      }}
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FAFBF9")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "")}
                    >
                      <td style={{ padding: "18px 28px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: P, fontFamily: "'Inter',sans-serif" }}>#{order.order_number}</span>
                      </td>
                      <td style={{ padding: "18px 28px" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1F2937", fontFamily: "'Inter',sans-serif" }}>{order.customer_name}</span>
                      </td>
                      <td style={{ padding: "18px 28px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "'Inter',sans-serif" }}>{formatPrice(order.total)}</span>
                      </td>
                      <td style={{ padding: "18px 28px" }}>
                        <span style={{ 
                          fontSize: 11, 
                          fontWeight: 700, 
                          color: st.color, 
                          backgroundColor: st.bg, 
                          borderRadius: 6, 
                          padding: "4px 10px", 
                          fontFamily: "'Inter',sans-serif", 
                          whiteSpace: "nowrap" 
                        }}>{st.label}</span>
                      </td>
                      <td style={{ padding: "18px 28px" }}>
                        <span style={{ fontSize: 12, color: "#4B5563", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
                          {new Date(order.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td style={{ padding: "18px 28px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
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
