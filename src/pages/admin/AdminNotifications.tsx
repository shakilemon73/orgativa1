import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  Clock, 
  ShoppingBag, 
  AlertTriangle, 
  Search, 
  ExternalLink,
  RefreshCw,
  Info
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: "order" | "stock" | "system";
  title: string;
  description: string;
  time: string;
  timestamp: number;
  read: boolean;
  link?: string;
}

const P = "#2D5A27";

export default function AdminNotifications() {
  const [, navigate] = useLocation();
  const { formatPrice, formatNum } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function loadAlerts(isSilent = false) {
    if (!isSilent) setLoading(true);
    const list: NotificationItem[] = [];

    try {
      if (supabase) {
        // 1. Fetch recent orders
        const { data: allOrders } = await supabase
          .from("orders")
          .select("id, order_number, customer_name, total, status, created_at, payment_method")
          .order("created_at", { ascending: false })
          .limit(20);

        if (allOrders && allOrders.length > 0) {
          allOrders.forEach((ord) => {
            const dateObj = new Date(ord.created_at);
            const timeStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
            const notifId = `order-${ord.status}-${ord.id}`;
            const isRead = localStorage.getItem(`read_notif_${ord.id}`) === "true";

            let title = `Order #${ord.order_number}`;
            let description = `Customer ${ord.customer_name} placed an order of ${formatPrice(ord.total)} via ${(ord.payment_method || 'payment').toUpperCase()}.`;

            if (ord.status === "pending") {
              title = `⚡ New Pending Order #${ord.order_number}`;
              description = `Customer ${ord.customer_name} placed an order of ${formatPrice(ord.total)}. Awaiting verification.`;
            } else if (ord.status === "processing") {
              title = `📦 Order #${ord.order_number} In Processing`;
              description = `Order for ${ord.customer_name} (${formatPrice(ord.total)}) is currently being packaged.`;
            } else if (ord.status === "shipped") {
              title = `🚚 Order #${ord.order_number} Shipped`;
              description = `Order for ${ord.customer_name} has been dispatched for delivery.`;
            } else if (ord.status === "delivered") {
              title = `✅ Order #${ord.order_number} Delivered`;
              description = `Order for ${ord.customer_name} was successfully delivered.`;
            } else if (ord.status === "cancelled") {
              title = `❌ Order #${ord.order_number} Cancelled`;
              description = `Order for ${ord.customer_name} was marked as cancelled.`;
            }

            list.push({
              id: notifId,
              type: "order",
              title,
              description,
              time: timeStr,
              timestamp: dateObj.getTime(),
              read: isRead,
              link: `/admin/orders/${ord.id}`
            });
          });
        }

        // 2. Fetch out-of-stock products
        const { data: oosProducts } = await supabase
          .from("products")
          .select("id, name, price, created_at")
          .eq("in_stock", false);

        if (oosProducts && oosProducts.length > 0) {
          oosProducts.forEach((prod) => {
            const notifId = `stock-oos-${prod.id}`;
            list.push({
              id: notifId,
              type: "stock",
              title: "⚠️ Product Out of Stock!",
              description: `"${prod.name}" (${formatPrice(prod.price)}) is marked out of stock. Stock replenishment recommended.`,
              time: "Attention Needed",
              timestamp: Date.now() - 1000,
              read: localStorage.getItem(`read_notif_${prod.id}`) === "true",
              link: `/admin/products`
            });
          });
        }

        // 3. Dynamic system metrics
        const { count: prodCount } = await supabase.from("products").select("*", { count: "exact", head: true });
        const { count: orderCount } = await supabase.from("orders").select("*", { count: "exact", head: true });

        list.push({
          id: "sys-realtime-live",
          type: "system",
          title: "🟢 Realtime Sync Active",
          description: `Postgres Sockets connected. Currently managing ${formatNum(prodCount || 0)} products and ${formatNum(orderCount || 0)} customer orders in real-time.`,
          time: "Live Socket",
          timestamp: Date.now(),
          read: localStorage.getItem("read_notif_sys-realtime-live") === "true"
        });
      }
    } catch (err) {
      console.error("Error loading alerts:", err);
    } finally {
      // Sort by timestamp desc
      list.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(list);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();

    if (!supabase) return;

    // Real-time Postgres Listener for immediate notification updates
    const channel = supabase
      .channel("admin-notifications-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          loadAlerts(true);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          loadAlerts(true);
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  function handleMarkRead(id: string, realId?: string) {
    const rawId = id.replace("order-pending-", "").replace("stock-oos-", "");
    localStorage.setItem(`read_notif_${rawId}`, "true");
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    showToast("Alert marked as read");
  }

  function handleMarkAllRead() {
    notifications.forEach(n => {
      const rawId = n.id.replace("order-pending-", "").replace("stock-oos-", "");
      localStorage.setItem(`read_notif_${rawId}`, "true");
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read");
  }

  function handleClearAlerts() {
    notifications.forEach(n => {
      const rawId = n.id.replace("order-pending-", "").replace("stock-oos-", "");
      localStorage.setItem(`read_notif_${rawId}`, "true");
    });
    setNotifications([]);
    showToast("Notification board cleared");
  }

  const filtered = notifications.filter(n => {
    // Read status filter
    if (filter === "unread" && n.read) return false;
    if (filter === "read" && !n.read) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <AdminLayout title="Notification & Alerts Hub">
      {/* Toast Notification */}
      {toast && (
        <div style={{ 
          position: "fixed", 
          bottom: 32, 
          right: 32, 
          backgroundColor: "#111827", 
          color: "#fff", 
          borderRadius: 12, 
          padding: "12px 20px", 
          fontSize: 13, 
          fontWeight: 600, 
          zIndex: 9999, 
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <CheckCheck size={16} style={{ color: "#10B981" }} />
          <span>{toast}</span>
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 40 }}>
        
        {/* Controls Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#EAF0E9", color: P, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={20} />
            </div>
            <div>
              <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>System Core Logs</p>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0 }}>
                Alert Management Registry ({notifications.filter(n => !n.read).length} unread)
              </h2>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button 
              onClick={() => loadAlerts()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#fff",
                border: "1px solid #E6E8EC",
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                color: "#4B5563",
                cursor: "pointer"
              }}
            >
              <RefreshCw size={14} /> Refresh Logs
            </button>
            <button 
              onClick={handleMarkAllRead}
              disabled={notifications.length === 0}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#fff",
                border: "1px solid #E6E8EC",
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                color: P,
                cursor: "pointer"
              }}
            >
              <CheckCheck size={14} /> Mark All Read
            </button>
            <button 
              onClick={handleClearAlerts}
              disabled={notifications.length === 0}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#FEF2F2",
                border: "1px solid #FEE2E2",
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                color: "#DC2626",
                cursor: "pointer"
              }}
            >
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          border: "1px solid #E6E8EC",
          padding: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
        }}>
          {/* Left: Tab selectors */}
          <div style={{ display: "flex", gap: 6 }}>
            {([
              ["all", "All Logs"],
              ["unread", "Unread Alerts"],
              ["read", "Read History"]
            ] as const).map(([val, label]) => {
              const active = filter === val;
              const count = val === "all" 
                ? notifications.length 
                : val === "unread" 
                  ? notifications.filter(n => !n.read).length 
                  : notifications.filter(n => n.read).length;

              return (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  style={{
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: active ? P : "#F4F7F3",
                    color: active ? "#fff" : "#4B5563",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <span>{label}</span>
                  <span style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 8,
                    backgroundColor: active ? "rgba(255,255,255,0.25)" : "#E5EFE2",
                    color: active ? "#fff" : P
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Search box */}
          <div style={{
            position: "relative",
            width: 280,
            maxWidth: "100%"
          }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input 
              type="text"
              placeholder="Search alert messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #E6E8EC",
                borderRadius: 10,
                padding: "8px 12px 8px 34px",
                fontSize: 13,
                outline: "none",
                fontWeight: 500,
                color: "#1F2937"
              }}
            />
          </div>
        </div>

        {/* Alerts List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E6E8EC", padding: 48, textAlign: "center" }}>
              <RefreshCw size={24} className="animate-spin" style={{ color: P, margin: "0 auto 12px" }} />
              <p style={{ fontSize: 13, color: "#6B7280", margin: 0, fontWeight: 600 }}>Analyzing system database logs & status registries...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E6E8EC", padding: 48, textAlign: "center" }}>
              <Info size={32} style={{ color: "#9CA3AF", margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>System Board Clear</h3>
              <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>No alerts matched your active selection filters.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.type === "order" ? ShoppingBag : item.type === "stock" ? AlertTriangle : Clock;
              const bg = item.type === "order" ? "#EBF5FF" : item.type === "stock" ? "#FEF2F2" : "#F4F7F3";
              const color = item.type === "order" ? "#1E40AF" : item.type === "stock" ? "#DC2626" : P;

              return (
                <div 
                  key={item.id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 16,
                    border: "1px solid #E6E8EC",
                    padding: 18,
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    position: "relative",
                    opacity: item.read ? 0.75 : 1,
                    boxShadow: item.read ? "none" : "0 2px 10px rgba(0,0,0,0.02)"
                  }}
                >
                  {/* Status indicator line */}
                  {!item.read && (
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: color, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: bg,
                    color: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <Icon size={18} />
                  </div>

                  {/* Text Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 800, color: "#111827", margin: "0 0 3px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {item.title}
                        {!item.read && (
                          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color }} />
                        )}
                      </h4>
                      <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>
                        {item.time}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#4B5563", margin: "0 0 10px", lineHeight: 1.5, wordBreak: "break-word" }}>
                      {item.description}
                    </p>

                    <div style={{ display: "flex", gap: 10 }}>
                      {item.link && (
                        <button
                          onClick={() => {
                            const rawId = item.id.replace("order-pending-", "").replace("stock-oos-", "");
                            localStorage.setItem(`read_notif_${rawId}`, "true");
                            navigate(item.link!);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            border: "none",
                            backgroundColor: "#F4F7F3",
                            color: P,
                            borderRadius: 6,
                            padding: "4px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          View Source <ExternalLink size={10} />
                        </button>
                      )}

                      {!item.read && (
                        <button
                          onClick={() => handleMarkRead(item.id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            border: "none",
                            backgroundColor: "transparent",
                            color: "#6B7280",
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
