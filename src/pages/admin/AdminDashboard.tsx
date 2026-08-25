import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { products as staticProducts, categories as staticCategories } from "@/data/products";
import { seedSupabaseData } from "@/lib/supabase-seed";
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  ArrowUpDown,
  Bell,
  Tag,
  AlertTriangle,
  Layers,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  Box
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const demoOrdersList = [
  { id: "101", order_number: "ORD-9821", customer_name: "রাফাত হোসেন", phone: "01712345678", email: "rafat@example.com", division: "ঢাকা", district: "ঢাকা", thana: "ধানমন্ডি", address: "রোড ৪, বাসা ১২", postcode: "1205", payment_method: "bkash", payment_number: "01712345678", transaction_id: "TRX9821BK", subtotal: 4150, delivery_fee: 100, total: 4250, status: "pending", notes: "জরুরি ডেলিভারি প্রয়োজন", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "102", order_number: "ORD-9820", customer_name: "সুমাইয়া বেগম", phone: "01812345679", email: "sumaiya@example.com", division: "চট্টগ্রাম", district: "চট্টগ্রাম", thana: "পাঁচলাইশ", address: "জিইসি মোড়", postcode: "4000", payment_method: "cod", payment_number: null, transaction_id: null, subtotal: 3000, delivery_fee: 100, total: 3100, status: "processing", notes: null, created_at: new Date(Date.now() - 3600000 * 2).toISOString(), updated_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "103", order_number: "ORD-9819", customer_name: "তানভীর আহমেদ", phone: "01912345680", email: null, division: "রাজশাহী", district: "রাজশাহী", thana: "বোয়ালিয়া", address: "সাহেব বাজার", postcode: "6000", payment_method: "nagad", payment_number: "01912345680", transaction_id: "NGD5512", subtotal: 5700, delivery_fee: 100, total: 5800, status: "shipped", notes: null, created_at: new Date(Date.now() - 3600000 * 5).toISOString(), updated_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: "104", order_number: "ORD-9818", customer_name: "নাসরিন সুলতানা", phone: "01612345681", email: null, division: "সিলেট", district: "সিলেট", thana: "জিন্দাবাজার", address: "জেল রোড", postcode: "3100", payment_method: "bkash", payment_number: "01612345681", transaction_id: "BKS8819", subtotal: 2300, delivery_fee: 100, total: 2400, status: "delivered", notes: null, created_at: new Date(Date.now() - 3600000 * 24).toISOString(), updated_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "105", order_number: "ORD-9817", customer_name: "মাহমুদুল হাসান", phone: "01512345682", email: null, division: "খুলনা", district: "খুলনা", thana: "সোনাডাঙ্গা", address: "বাসস্ট্যান্ড রোড", postcode: "9100", payment_method: "cod", payment_number: null, transaction_id: null, subtotal: 1750, delivery_fee: 100, total: 1850, status: "delivered", notes: null, created_at: new Date(Date.now() - 3600000 * 48).toISOString(), updated_at: new Date(Date.now() - 3600000 * 48).toISOString() },
];

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { formatPrice, formatNum } = useLanguage();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");

  // Raw fetched data from Supabase
  const [productsList, setProductsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // Controls & Filters
  const [revenuePeriod, setRevenuePeriod] = useState<"Monthly" | "Quarterly" | "Yearly">("Monthly");
  const [sortBy, setSortBy] = useState<"price-desc" | "price-asc" | "stock">("price-desc");
  const [filterStock, setFilterStock] = useState<"all" | "instock" | "lowstock">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load Real Data from Supabase
  async function loadDashboardData(isSilent = false) {
    if (!isSilent) setLoading(true);
    setRefreshing(true);

    if (!supabase) {
      setProductsList(staticProducts);
      setOrdersList(demoOrdersList);
      setCategoriesList(staticCategories);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // Fetch Products, Orders, and Categories in parallel
      const [prodRes, ordRes, catRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("display_order", { ascending: true })
      ]);

      if (prodRes.data && prodRes.data.length > 0) {
        setProductsList(prodRes.data);
      } else {
        setProductsList(staticProducts);
      }

      if (ordRes.data) {
        setOrdersList(ordRes.data);
      } else {
        setOrdersList([]);
      }

      if (catRes.data && catRes.data.length > 0) {
        setCategoriesList(catRes.data);
      } else {
        setCategoriesList(staticCategories);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setProductsList(staticProducts);
      setOrdersList([]);
      setCategoriesList(staticCategories);
    } finally {
      setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Initial load + Real-time Supabase Subscription
  useEffect(() => {
    loadDashboardData();

    if (!supabase) return;

    // Real-time listener for instant updates
    const channel = supabase
      .channel("admin-realtime-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          loadDashboardData(true);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          loadDashboardData(true);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeActive(true);
        }
      });

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // COMPUTED STATS FROM REAL SUPABASE DATA
  const computedStats = useMemo(() => {
    const totalProductsCount = productsList.length;
    const totalOrdersCount = ordersList.length;
    
    // Revenue from real orders
    const totalRevenue = ordersList.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    
    // Pending / Unfulfilled Order Value
    const pendingOrders = ordersList.filter(o => o.status === "pending" || o.status === "processing");
    const pendingTotal = pendingOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

    return {
      totalProducts: totalProductsCount,
      totalSales: totalOrdersCount,
      totalIncome: totalRevenue,
      pendingOrdersValue: pendingTotal,
      pendingCount: pendingOrders.length
    };
  }, [productsList, ordersList]);

  // COMPUTED CHART DATA
  const barChartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    if (revenuePeriod === "Monthly") {
      // Group by Month of current year
      const monthlyBuckets = months.map(m => ({ month: m, oneTime: 0, recurring: 0 }));
      
      ordersList.forEach(o => {
        const date = new Date(o.created_at || Date.now());
        const monthIdx = date.getMonth();
        const amt = Number(o.total) || 0;
        
        // Digital Payment = oneTime, Cash on Delivery = recurring
        if (o.payment_method === "bkash" || o.payment_method === "nagad") {
          monthlyBuckets[monthIdx].oneTime += amt;
        } else {
          monthlyBuckets[monthIdx].recurring += amt;
        }
      });

      // If no order data available yet, populate smooth visual distribution
      const hasValues = monthlyBuckets.some(b => b.oneTime > 0 || b.recurring > 0);
      if (!hasValues) {
        return [
          { month: "Jan", oneTime: 24000, recurring: 45000 },
          { month: "Feb", oneTime: 18000, recurring: 32000 },
          { month: "Mar", oneTime: 32000, recurring: 51000 },
          { month: "Apr", oneTime: 42000, recurring: 68000 },
          { month: "May", oneTime: 38000, recurring: 59000 },
          { month: "Jun", oneTime: 29000, recurring: 41000 },
          { month: "Jul", oneTime: 51000, recurring: 74000 },
          { month: "Aug", oneTime: 36000, recurring: 48000 },
        ];
      }
      return monthlyBuckets.slice(0, 8);
    } else if (revenuePeriod === "Quarterly") {
      const quarters = [
        { month: "Q1 (Jan-Mar)", oneTime: 0, recurring: 0 },
        { month: "Q2 (Apr-Jun)", oneTime: 0, recurring: 0 },
        { month: "Q3 (Jul-Sep)", oneTime: 0, recurring: 0 },
        { month: "Q4 (Oct-Dec)", oneTime: 0, recurring: 0 },
      ];
      ordersList.forEach(o => {
        const date = new Date(o.created_at || Date.now());
        const qIdx = Math.min(3, Math.floor(date.getMonth() / 3));
        const amt = Number(o.total) || 0;
        if (o.payment_method === "bkash" || o.payment_method === "nagad") {
          quarters[qIdx].oneTime += amt;
        } else {
          quarters[qIdx].recurring += amt;
        }
      });
      return quarters;
    } else {
      const currentYear = new Date().getFullYear();
      const years = [
        { month: String(currentYear - 2), oneTime: 0, recurring: 0 },
        { month: String(currentYear - 1), oneTime: 0, recurring: 0 },
        { month: String(currentYear), oneTime: 0, recurring: 0 },
      ];
      ordersList.forEach(o => {
        const date = new Date(o.created_at || Date.now());
        const y = date.getFullYear();
        const amt = Number(o.total) || 0;
        const target = years.find(item => item.month === String(y)) || years[2];
        if (o.payment_method === "bkash" || o.payment_method === "nagad") {
          target.oneTime += amt;
        } else {
          target.recurring += amt;
        }
      });
      return years;
    }
  }, [ordersList, revenuePeriod]);

  // COMPUTED CATEGORIES DONUT DATA
  const topCategoriesData = useMemo(() => {
    if (categoriesList.length === 0) {
      return [
        { name: "Organic Honey", value: 85000, percentage: "55%", color: "#6366F1" },
        { name: "Pure Ghee & Oils", value: 38000, percentage: "25%", color: "#EC4899" },
        { name: "Organic Tea & Spices", value: 18000, percentage: "12%", color: "#F59E0B" },
        { name: "Nuts & Seeds", value: 12000, percentage: "8%", color: "#8B5CF6" },
      ];
    }

    const palette = ["#6366F1", "#EC4899", "#F59E0B", "#10B981", "#8B5CF6", "#3B82F6"];
    const totalCount = productsList.length || 1;

    return categoriesList.slice(0, 4).map((cat, idx) => {
      const catProds = productsList.filter(p => p.category_slug === cat.slug || p.category_label === cat.label || p.category === cat.label);
      const count = catProds.length;
      const pct = Math.round((count / totalCount) * 100);
      const categoryTotalValue = catProds.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

      return {
        name: cat.label || cat.name || "Category",
        value: categoryTotalValue || (count * 1000),
        percentage: `${pct}%`,
        color: palette[idx % palette.length]
      };
    });
  }, [categoriesList, productsList]);

  // COMPUTED RECENT ACTIVITY FEED
  const activityFeed = useMemo(() => {
    const list: any[] = [];

    // Add recent orders
    ordersList.slice(0, 3).forEach((ord) => {
      let badgeBg = "#EFF6FF";
      let badgeColor = "#2563EB";
      let label = "New Order";

      if (ord.status === "processing") {
        badgeBg = "#FEF3C7";
        badgeColor = "#D97706";
        label = "Processing";
      } else if (ord.status === "shipped") {
        badgeBg = "#E0E7FF";
        badgeColor = "#4338CA";
        label = "Shipped";
      } else if (ord.status === "delivered") {
        badgeBg = "#DCFCE7";
        badgeColor = "#15803D";
        label = "Delivered";
      }

      list.push({
        id: `ord-${ord.id}`,
        type: "order",
        icon: ShoppingBag,
        bg: badgeBg,
        color: badgeColor,
        title: `Order #${ord.order_number || ord.id}`,
        sub: `${ord.customer_name || "Customer"} • ৳${formatNum(ord.total || 0)}`,
        badge: label,
        badgeBg,
        badgeColor,
        link: `/admin/orders`
      });
    });

    // Add low stock alerts from products
    const lowStockProds = productsList.filter(p => p.in_stock === false || (p.stock !== undefined && p.stock < 10));
    lowStockProds.slice(0, 2).forEach((p) => {
      list.push({
        id: `prod-${p.id}`,
        type: "stock",
        icon: AlertTriangle,
        bg: "#FEE2E2",
        color: "#DC2626",
        title: "Low Stock Alert",
        sub: `${p.name_en || p.name || "Product"}`,
        badge: "Low Stock",
        badgeBg: "#FEF2F2",
        badgeColor: "#DC2626",
        link: `/admin/products`
      });
    });

    if (list.length === 0) {
      return [
        { id: "1", icon: ShoppingBag, bg: "#EFF6FF", color: "#2563EB", title: "Order #ORD-9821", sub: "Raafat Hossain • ৳4,250", badge: "New Order", badgeBg: "#EFF6FF", badgeColor: "#2563EB", link: "/admin/orders" },
        { id: "2", icon: AlertTriangle, bg: "#FEE2E2", color: "#DC2626", title: "Low Stock Alert", sub: "Organic Sundarban Honey 500g", badge: "Low Stock", badgeBg: "#FEF2F2", badgeColor: "#DC2626", link: "/admin/products" },
        { id: "3", icon: Tag, bg: "#F3E8FF", color: "#7C3AED", title: "Promo Active", sub: "Free Delivery over ৳1,000", badge: "Campaign", badgeBg: "#F3E8FF", badgeColor: "#7C3AED", link: "/admin/settings" },
      ];
    }

    return list.slice(0, 4);
  }, [ordersList, productsList, formatNum]);

  // FILTERED AND SORTED PRODUCTS FOR TOP TABLE
  const processedProducts = useMemo(() => {
    let prods = [...productsList];

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      prods = prods.filter(p => 
        (p.name_en && p.name_en.toLowerCase().includes(q)) ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category_label && p.category_label.toLowerCase().includes(q))
      );
    }

    // Stock Filter
    if (filterStock === "instock") {
      prods = prods.filter(p => p.in_stock !== false);
    } else if (filterStock === "lowstock") {
      prods = prods.filter(p => p.in_stock === false || (p.stock && p.stock < 15));
    }

    // Sort
    if (sortBy === "price-desc") {
      prods.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "price-asc") {
      prods.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "stock") {
      prods.sort((a, b) => (b.stock || 50) - (a.stock || 50));
    }

    return prods.slice(0, 5);
  }, [productsList, searchQuery, filterStock, sortBy]);

  return (
    <AdminLayout title="Dashboard">
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* REALTIME STATUS & QUICK CONTROLS BAR */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          flexWrap: "wrap", 
          gap: 12,
          backgroundColor: "#FFFFFF",
          padding: "12px 20px",
          borderRadius: 14,
          border: "1px solid #E6E8EC",
          boxShadow: "0 1px 4px rgba(0,0,0,0.02)"
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
                {realtimeActive ? "Realtime Sync Active" : "Store Data Connected"}
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#6B7280" }}>
              • {computedStats.pendingCount > 0 ? `${computedStats.pendingCount} order${computedStats.pendingCount > 1 ? 's' : ''} awaiting processing` : "All orders fulfilled"} 
              {lastSyncedAt ? ` • Last synced at ${lastSyncedAt}` : ""}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => loadDashboardData()}
              disabled={refreshing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 700,
                color: "#2D5A27",
                backgroundColor: "#EDF5EC",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <RefreshCw size={13} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
              Refresh Data
            </button>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </div>

        {/* ROW 1: 4 STAT METRIC CARDS */}
        <div className="admin-grid-4">
          {/* Card 1: Total Products */}
          <div className="admin-card-padding" style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: "20px 22px",
            border: "1px solid #E6E8EC",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            minWidth: 0
          }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              backgroundColor: "#EEF2FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6366F1",
              flexShrink: 0
            }}>
              <Package size={22} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 4px" }}>Total Products</p>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.02em", wordBreak: "break-word" }}>
                {formatNum(computedStats.totalProducts)}
              </h3>
            </div>
          </div>

          {/* Card 2: Total Sales */}
          <div className="admin-card-padding" style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: "20px 22px",
            border: "1px solid #E6E8EC",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            minWidth: 0
          }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              backgroundColor: "#F3E8FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9333EA",
              flexShrink: 0
            }}>
              <DollarSign size={22} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 4px" }}>Total Orders</p>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.02em", wordBreak: "break-word" }}>
                {formatNum(computedStats.totalSales)}
              </h3>
            </div>
          </div>

          {/* Card 3: Total Income */}
          <div className="admin-card-padding" style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: "20px 22px",
            border: "1px solid #E6E8EC",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            minWidth: 0
          }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              backgroundColor: "#DCFCE7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#10B981",
              flexShrink: 0
            }}>
              <ArrowUpRight size={24} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 4px" }}>Total Revenue</p>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.02em", wordBreak: "break-word" }}>
                ৳{formatNum(computedStats.totalIncome)}
              </h3>
            </div>
          </div>

          {/* Card 4: Pending Volume */}
          <div className="admin-card-padding" style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: "20px 22px",
            border: "1px solid #E6E8EC",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            minWidth: 0
          }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              backgroundColor: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D97706",
              flexShrink: 0
            }}>
              <Clock size={22} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", margin: "0 0 4px" }}>Pending Orders</p>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.02em", wordBreak: "break-word" }}>
                {computedStats.pendingCount} <span style={{ fontSize: 13, fontWeight: 600, color: "#6B7280" }}>({formatPrice(computedStats.pendingOrdersValue)})</span>
              </h3>
            </div>
          </div>
        </div>

        {/* ROW 2: SALES REVENUE (65%) + TOP CATEGORIES (35%) */}
        <div className="admin-grid-revenue">
          
          {/* SALES REVENUE CHART */}
          <div className="admin-card-padding" style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid #E6E8EC",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            minWidth: 0
          }}>
            {/* Header + Legend + Period Toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>Sales Revenue</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#C7D2FE", display: "inline-block" }} />
                    Digital / Mobile Payments
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#6366F1", display: "inline-block" }} />
                    Cash On Delivery
                  </span>
                </div>
              </div>

              {/* Period Switcher */}
              <div style={{ display: "flex", backgroundColor: "#F3F4F8", borderRadius: 10, padding: 3 }}>
                {(["Monthly", "Quarterly", "Yearly"] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setRevenuePeriod(p)}
                    style={{
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: revenuePeriod === p ? 700 : 500,
                      color: revenuePeriod === p ? "#111827" : "#6B7280",
                      backgroundColor: revenuePeriod === p ? "#FFFFFF" : "transparent",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: revenuePeriod === p ? "0 1px 4px rgba(0,0,0,0.05)" : "none",
                      transition: "all 0.15s"
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Dual Bar Chart */}
            <div style={{ width: "100%", height: 260, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `৳${v/1000}K`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                    formatter={(val: any, name: any) => [`৳${formatNum(Number(val))}`, name === "oneTime" ? "Digital Payment" : "Cash On Delivery"]}
                  />
                  <Bar dataKey="oneTime" fill="#C7D2FE" radius={[6, 6, 0, 0]} barSize={18} />
                  <Bar dataKey="recurring" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TOP CATEGORIES DONUT CHART */}
          <div className="admin-card-padding" style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid #E6E8EC",
            padding: "24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            minWidth: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: 0 }}>Top Categories</h3>
              <button 
                onClick={() => navigate("/admin/categories")}
                style={{ fontSize: 12, fontWeight: 700, color: "#2D5A27", background: "#EDF5EC", border: "none", padding: "4px 10px", borderRadius: 8, cursor: "pointer" }}
              >
                See All
              </button>
            </div>

            {/* Donut Chart with Center Text */}
            <div style={{ position: "relative", width: "100%", height: 170, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCategoriesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {topCategoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", textAlign: "center", pointerEvents: "none" }}>
                <span style={{ fontSize: 10, color: "#6B7280", fontWeight: 600, display: "block" }}>Total Volume</span>
                <span style={{ fontSize: 14, color: "#111827", fontWeight: 800 }}>৳{formatNum(computedStats.totalIncome)}</span>
              </div>
            </div>

            {/* Category Breakdown List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topCategoriesData.map((cat, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: cat.color, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, color: "#111827" }}>৳{formatNum(cat.value)}</span>
                    <span style={{ fontWeight: 800, color: "#6B7280", minWidth: 28, textAlign: "right" }}>{cat.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ROW 3: RECENT ACTIVITY (40%) + TOP PRODUCTS TABLE (60%) */}
        <div className="admin-grid-activity">
          
          {/* RECENT ACTIVITY CARD */}
          <div className="admin-card-padding" style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid #E6E8EC",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            minWidth: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: 0 }}>Recent Activity</h3>
              <button 
                onClick={() => navigate("/admin/orders")}
                style={{ fontSize: 12, fontWeight: 700, color: "#2D5A27", background: "#EDF5EC", border: "none", padding: "4px 10px", borderRadius: 8, cursor: "pointer" }}
              >
                See All
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {activityFeed.map((act) => {
                const IconComponent = act.icon;
                return (
                  <div 
                    key={act.id} 
                    onClick={() => navigate(act.link)}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between", 
                      padding: "8px 0",
                      cursor: "pointer",
                      borderBottom: "1px solid #F8FAFC"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: act.bg, color: act.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IconComponent size={18} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{act.title}</h4>
                        <p style={{ fontSize: 11, color: "#6B7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{act.sub}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: act.badgeBg, color: act.badgeColor, padding: "4px 10px", borderRadius: 12, flexShrink: 0, marginLeft: 8 }}>
                      {act.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOP PRODUCTS TABLE */}
          <div className="admin-card-padding" style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid #E6E8EC",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            minWidth: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: 0 }}>Top Catalog Items</h3>
              
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {/* Search Bar in Table Header */}
                <div style={{ position: "relative", width: 140 }}>
                  <Search size={12} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                  <input
                    type="text"
                    placeholder="Filter name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "4px 8px 4px 24px",
                      fontSize: 11,
                      borderRadius: 6,
                      border: "1px solid #E5E7EB",
                      outline: "none"
                    }}
                  />
                </div>

                {/* Sort Toggle */}
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: "1px solid #E5E7EB",
                    backgroundColor: "#F9FAFB",
                    color: "#374151",
                    cursor: "pointer"
                  }}
                >
                  <option value="price-desc">Price: High to Low</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="stock">Highest Stock</option>
                </select>

                {/* Stock Filter Toggle */}
                <select
                  value={filterStock}
                  onChange={(e: any) => setFilterStock(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: "1px solid #E5E7EB",
                    backgroundColor: "#F9FAFB",
                    color: "#374151",
                    cursor: "pointer"
                  }}
                >
                  <option value="all">All Items</option>
                  <option value="instock">In Stock</option>
                  <option value="lowstock">Low Stock</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #F3F4F6", textAlign: "left" }}>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#6B7280" }}>Product</th>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#6B7280" }}>Status</th>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#6B7280" }}>Price</th>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#6B7280", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {processedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                        No matching products found.
                      </td>
                    </tr>
                  ) : (
                    processedProducts.map((prod, i) => (
                      <tr 
                        key={prod.id || i} 
                        style={{ borderBottom: "1px solid #F8FAFC", cursor: "pointer" }} 
                        onClick={() => navigate(`/admin/products/${prod.id}/edit`)}
                      >
                        <td style={{ padding: "12px", display: "flex", alignItems: "center", gap: 10 }}>
                          <img 
                            src={prod.image || prod.image_url} 
                            alt={prod.name_en || prod.name} 
                            style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover", backgroundColor: "#F3F4F8", flexShrink: 0 }} 
                          />
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                              {prod.name_en || prod.name}
                            </span>
                            <span style={{ fontSize: 11, color: "#6B7280" }}>
                              {prod.category_label || prod.weight || "Organic"}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 10,
                            backgroundColor: prod.in_stock !== false ? "#DCFCE7" : "#FEE2E2",
                            color: prod.in_stock !== false ? "#15803D" : "#DC2626"
                          }}>
                            {prod.in_stock !== false ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontSize: 13, fontWeight: 800, color: "#111827" }}>
                          ৳{prod.price}
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/products/${prod.id}/edit`);
                            }}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#2D5A27",
                              backgroundColor: "#EDF5EC",
                              border: "none",
                              padding: "4px 10px",
                              borderRadius: 6,
                              cursor: "pointer"
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
