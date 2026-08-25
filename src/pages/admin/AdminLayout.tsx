import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Receipt, 
  Settings, 
  LogOut, 
  Menu, 
  Store,
  ChevronDown,
  Search,
  Bell,
  Sun,
  Moon,
  HelpCircle,
  TrendingUp,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Edit2,
  Trash2,
  RefreshCw,
  Check,
  AlertCircle,
  BookOpen
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = "Dashboard" }: AdminLayoutProps) {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  // New interactive and production states
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [adminName, setAdminName] = useState(() => localStorage.getItem("orgativa_admin_name") || "System Administrator");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(adminName);

  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const MAIN_NAV = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/products", icon: Package, label: "Products" },
    { path: "/admin/orders", icon: Receipt, label: "Orders", badge: "Live" },
    { path: "/admin/categories", icon: FolderTree, label: "Categories" },
    { path: "/admin/pages-cms", icon: BookOpen, label: "Pages & Content" },
  ];

  const SETTINGS_NAV = [
    { path: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  async function fetchAlerts() {
    if (!supabase) return;
    try {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: products } = await supabase
        .from("products")
        .select("id, name, price")
        .eq("in_stock", false)
        .limit(5);

      const list: any[] = [];
      if (orders) {
        orders.forEach(o => {
          list.push({
            id: `ord-${o.id}`,
            type: "order",
            title: `New Order #${o.order_number}`,
            desc: `${o.customer_name} total ৳${o.total}`,
            time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            link: `/admin/orders/${o.id}`,
            read: localStorage.getItem(`read_notif_${o.id}`) === "true"
          });
        });
      }

      if (products) {
        products.forEach(p => {
          list.push({
            id: `prod-${p.id}`,
            type: "stock",
            title: "Out of Stock alert",
            desc: `"${p.name}" is out of stock`,
            time: "Replenish",
            link: `/admin/products`,
            read: localStorage.getItem(`read_notif_${p.id}`) === "true"
          });
        });
      }

      setAlerts(list);
      setUnreadAlertsCount(list.filter(item => !item.read).length);
    } catch (err) {
      console.error("Alerts load error:", err);
    }
  }

  useEffect(() => {
    if (!supabase || localStorage.getItem("orgativa_demo_admin") === "true") {
      setUser({ email: "admin@orgativa.com.bd" });
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate("/admin/login");
        return;
      }
      setUser({ email: data.user.email ?? "" });
    });
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    localStorage.removeItem("orgativa_demo_admin");
    if (supabase) await supabase.auth.signOut();
    navigate("/admin/login");
  }

  async function handleManualReseed() {
    setActionLoading(true);
    setProfileDropdownOpen(false);
    try {
      const { seedSupabaseData } = await import("@/lib/supabase-seed");
      const res = await seedSupabaseData(true);
      triggerToast(`Database re-seeded! Added ${res.productsSeeded} products, ${res.categoriesSeeded} categories.`);
      fetchAlerts();
    } catch (e: any) {
      triggerToast(`Error seeding database: ${e.message || e}`);
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePurgeTransactions() {
    if (!window.confirm("ARE YOU SURE? This will permanently delete all customer checkout logs, transactions, and order items in the live database!")) {
      return;
    }
    setActionLoading(true);
    setProfileDropdownOpen(false);
    try {
      if (!supabase) {
        triggerToast("Supabase is not configured.");
        return;
      }
      const { error: itemErr } = await supabase.from("order_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const { error: ordErr } = await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (itemErr || ordErr) {
        triggerToast(`Purge failed: ${itemErr?.message || ordErr?.message}`);
      } else {
        triggerToast("Database cleaned! All order transactions have been completely purged.");
        fetchAlerts();
      }
    } catch (e: any) {
      triggerToast(`Error purging data: ${e.message || e}`);
    } finally {
      setActionLoading(false);
    }
  }

  function handleSaveName() {
    localStorage.setItem("orgativa_admin_name", nameInput);
    setAdminName(nameInput);
    setIsEditingName(false);
    triggerToast("Admin display name updated successfully.");
  }

  function handleMarkAllAlertsRead() {
    alerts.forEach(a => {
      const rawId = a.id.replace("ord-", "").replace("prod-", "");
      localStorage.setItem(`read_notif_${rawId}`, "true");
    });
    setAlerts(prev => prev.map(item => ({ ...item, read: true })));
    setUnreadAlertsCount(0);
    triggerToast("All alerts marked as read");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F3F4F8", color: "#111827", fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside 
        className={`admin-sidebar ${mobileOpen ? "admin-sidebar-open" : ""}`}
        style={{
          width: sidebarOpen ? 250 : 0,
          backgroundColor: "#FAFAFC",
          borderRight: "1px solid #E6E8EC",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: mobileOpen ? 0 : (sidebarOpen ? 0 : -250),
          bottom: 0,
          zIndex: 200,
          transition: "all 0.25s ease",
          overflowX: "hidden",
          boxShadow: mobileOpen ? "8px 0 24px rgba(0,0,0,0.08)" : "none"
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 10, 
              backgroundColor: "#FFFFFF", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              overflow: "hidden"
            }}>
              <img 
                src="/assets/orgativa_logo.png" 
                alt="Orgativa Logo" 
                referrerPolicy="no-referrer"
                style={{ width: "100%", height: "100%", objectFit: "contain" }} 
              />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>Orgativa</span>
          </div>

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Store Switcher Pill */}
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            padding: "10px 14px", 
            backgroundColor: "#FFFFFF", 
            borderRadius: 12, 
            border: "1px solid #E6E8EC",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
                O
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Orgativa Foods</span>
            </div>
            <ChevronDown size={14} style={{ color: "#9CA3AF" }} />
          </div>
        </div>

        {/* Navigation List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* MAIN SECTION */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", padding: "0 12px 8px" }}>
              MAIN
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {MAIN_NAV.map((item) => {
                const active = location.startsWith(item.path);
                const IconComp = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMobileOpen(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "none",
                      backgroundColor: active ? "#FFFFFF" : "transparent",
                      boxShadow: active ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
                      color: active ? "#111827" : "#6B7280",
                      fontWeight: active ? 700 : 500,
                      fontSize: 13,
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = "#F3F4F6";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <IconComp size={18} style={{ color: active ? "#2D5A27" : "#9CA3AF" }} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: "#ECFDF5", color: "#047857", padding: "2px 6px", borderRadius: 10 }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SETTINGS SECTION */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", padding: "0 12px 8px" }}>
              SETTINGS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {SETTINGS_NAV.map((item) => {
                const active = location.startsWith(item.path);
                const IconComp = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMobileOpen(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "none",
                      backgroundColor: active ? "#FFFFFF" : "transparent",
                      boxShadow: active ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
                      color: active ? "#111827" : "#6B7280",
                      fontWeight: active ? 700 : 500,
                      fontSize: 13,
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = "#F3F4F6";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <IconComp size={18} style={{ color: active ? "#2D5A27" : "#9CA3AF" }} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => navigate("/")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#6B7280",
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <Store size={18} style={{ color: "#9CA3AF" }} />
                <span>Visit Storefront</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer controls & Promo Banner */}
        <div style={{ padding: 12, borderTop: "1px solid #E6E8EC", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Dark Mode toggle pill */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#F3F4F6", borderRadius: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#4B5563", display: "flex", alignItems: "center", gap: 6 }}>
              {darkMode ? <Moon size={14} /> : <Sun size={14} />} Dark Mode
            </span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              style={{
                width: 34,
                height: 18,
                borderRadius: 10,
                backgroundColor: darkMode ? "#2D5A27" : "#D1D5DB",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s"
              }}
            >
              <div style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#fff",
                position: "absolute",
                top: 2,
                left: darkMode ? 18 : 2,
                transition: "all 0.2s"
              }} />
            </button>
          </div>

          {/* Orgativa Premium Card */}
          <div style={{
            backgroundColor: "#EDF5EC",
            borderRadius: 14,
            padding: 14,
            border: "1px solid #D1E5D0"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, backgroundColor: "#2D5A27", color: "#fff", padding: "2px 8px", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Sparkles size={10} /> Active
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>Orgativa Pro</span>
            </div>
            <p style={{ fontSize: 11, color: "#4B5563", margin: "0 0 10px", lineHeight: 1.4 }}>
              Active cloud database connected & live synced.
            </p>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "8px",
                backgroundColor: "#2D5A27",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              <LogOut size={13} /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)", zIndex: 199 }} 
        />
      )}

      {/* Main Container */}
      <div 
        className="admin-main"
        style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          marginLeft: sidebarOpen ? 250 : 0, 
          transition: "margin-left 0.25s ease",
          minWidth: 0 
        }}
      >
        {/* Top Navigation Bar */}
        <header className="admin-header" style={{
          height: 72,
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E6E8EC",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100
        }}>
          {/* Left: Sidebar Toggle + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 6, display: "flex" }}
              >
                <PanelLeftOpen size={20} />
              </button>
            )}
            <button
              className="admin-mobile-toggle"
              onClick={() => setMobileOpen(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 6, display: "none" }}
            >
              <Menu size={20} />
            </button>

            {/* Continuous Branding Logo on closed sidebar or mobile */}
            {(!sidebarOpen || mobileOpen) && (
              <div className="admin-header-logo-container" style={{ display: "flex", alignItems: "center", width: 28, height: 28, borderRadius: 6, backgroundColor: "#fff", border: "1px solid #E6E8EC", padding: 2, overflow: "hidden" }}>
                <img 
                  src="/assets/orgativa_logo.png" 
                  alt="Orgativa Logo" 
                  referrerPolicy="no-referrer"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                />
              </div>
            )}

            <h1 className="admin-header-title" style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
              {title}
            </h1>
          </div>

          {/* Right: Search, Avatars, Notifications, Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Search Input Bar */}
            <div style={{ position: "relative", width: 200 }} className="admin-search-box">
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
              <input 
                type="text" 
                placeholder="Search catalog... (Enter)"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                    navigate(`/admin/products`);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 34px",
                  fontSize: 12,
                  backgroundColor: "#F3F4F8",
                  border: "1px solid transparent",
                  borderRadius: 10,
                  outline: "none",
                  color: "#111827",
                  fontWeight: 500
                }}
              />
            </div>

            {/* Avatar Group */}
            <div style={{ display: "flex", alignItems: "center", marginLeft: 4 }} className="admin-avatars">
              {["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"].map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  alt="Avatar" 
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    marginLeft: i === 0 ? 0 : -8,
                    objectFit: "cover"
                  }} 
                />
              ))}
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: "#2D5A27",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fff",
                marginLeft: -8
              }}>
                +2
              </div>
            </div>

            {/* Interactive Notification Bell */}
            <div style={{ position: "relative" }}>
              <button 
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                title="View Realtime Alerts"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: notifDropdownOpen ? "#EAF0E9" : "#F3F4F8",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative"
                }}
              >
                <Bell size={17} style={{ color: notifDropdownOpen ? "#2D5A27" : "#4B5563" }} />
                {unreadAlertsCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "#EF4444",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 800,
                    borderRadius: 10,
                    padding: "1px 4px",
                    lineHeight: 1
                  }}>
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Popover */}
              {notifDropdownOpen && (
                <>
                  <div 
                    onClick={() => setNotifDropdownOpen(false)} 
                    style={{ position: "fixed", inset: 0, zIndex: 110 }} 
                  />
                  <div style={{
                    position: "absolute",
                    right: 0,
                    top: 44,
                    width: 320,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                    border: "1px solid #E6E8EC",
                    padding: 14,
                    zIndex: 120,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F3F4F6", paddingBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>Live Alerts ({unreadAlertsCount})</span>
                      {unreadAlertsCount > 0 && (
                        <button 
                          onClick={handleMarkAllAlertsRead}
                          style={{ border: "none", background: "none", color: "#2D5A27", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
                      {alerts.length === 0 ? (
                        <div style={{ padding: "20px 10px", textAlign: "center", color: "#9CA3AF" }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>No live pending actions</span>
                        </div>
                      ) : (
                        alerts.map((a) => (
                          <div 
                            key={a.id} 
                            onClick={() => {
                              const rawId = a.id.replace("ord-", "").replace("prod-", "");
                              localStorage.setItem(`read_notif_${rawId}`, "true");
                              setNotifDropdownOpen(false);
                              navigate(a.link);
                            }}
                            style={{ 
                              padding: 8, 
                              borderRadius: 8, 
                              backgroundColor: a.read ? "transparent" : "#F4F7F3", 
                              cursor: "pointer", 
                              display: "flex", 
                              flexDirection: "column", 
                              gap: 2,
                              borderLeft: a.read ? "none" : "3px solid #2D5A27",
                              transition: "background-color 0.1s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F9FAFB"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = a.read ? "transparent" : "#F4F7F3"}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: "#111827" }}>{a.title}</span>
                              <span style={{ fontSize: 9, color: "#9CA3AF" }}>{a.time}</span>
                            </div>
                            <span style={{ fontSize: 11, color: "#4B5563" }}>{a.desc}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        navigate("/admin/notifications");
                      }}
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: "#F3F4F6",
                        color: "#1F2937",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        textAlign: "center"
                      }}
                    >
                      View All Alerts & Logs
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Admin Profile & Actions dropdown */}
            <div style={{ position: "relative" }}>
              <div 
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8, 
                  paddingLeft: 8, 
                  borderLeft: "1px solid #E6E8EC",
                  cursor: "pointer" 
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: "#2D5A27",
                  color: "#fff",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  boxShadow: "0 2px 6px rgba(45,90,39,0.2)"
                }}>
                  {adminName ? adminName[0].toUpperCase() : "A"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }} className="admin-profile-meta">
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{adminName}</span>
                  <span style={{ fontSize: 10, color: "#6B7280", marginTop: -2 }}>Super Admin</span>
                </div>
                <ChevronDown size={12} style={{ color: "#9CA3AF" }} className="admin-profile-meta" />
              </div>

              {/* Profile Dropdown Popover */}
              {profileDropdownOpen && (
                <>
                  <div 
                    onClick={() => setProfileDropdownOpen(false)} 
                    style={{ position: "fixed", inset: 0, zIndex: 110 }} 
                  />
                  <div style={{
                    position: "absolute",
                    right: 0,
                    top: 44,
                    width: 290,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                    border: "1px solid #E6E8EC",
                    padding: 16,
                    zIndex: 120,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                  }}>
                    {/* Admin Identity Registry Header */}
                    <div style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 10 }}>
                      {isEditingName ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input 
                            type="text" 
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            style={{
                              flex: 1,
                              border: "1px solid #D1D5DB",
                              borderRadius: 6,
                              padding: "4px 8px",
                              fontSize: 12,
                              outline: "none"
                            }}
                          />
                          <button 
                            onClick={handleSaveName}
                            style={{
                              backgroundColor: "#2D5A27",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              padding: "4px 8px",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <h4 style={{ fontSize: 13, fontWeight: 800, color: "#111827", margin: 0 }}>{adminName}</h4>
                            <span style={{ fontSize: 11, color: "#6B7280" }}>{user?.email || "admin@orgativa.com.bd"}</span>
                          </div>
                          <button 
                            onClick={() => { setIsEditingName(true); setNameInput(adminName); }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#2D5A27",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Production Ready Controls */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", letterSpacing: "0.05em" }}>PRODUCTION SYSTEMS</span>
                      
                      <button
                        onClick={handleManualReseed}
                        disabled={actionLoading}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "8px 10px",
                          backgroundColor: "#F4F7F3",
                          border: "none",
                          borderRadius: 8,
                          color: "#2D5A27",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          textAlign: "left"
                        }}
                      >
                        🔄 Re-seed Store Products
                      </button>

                      <button
                        onClick={handlePurgeTransactions}
                        disabled={actionLoading}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "8px 10px",
                          backgroundColor: "#FEF2F2",
                          border: "none",
                          borderRadius: 8,
                          color: "#DC2626",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          textAlign: "left"
                        }}
                      >
                        🗑️ Purge Checkout Orders
                      </button>

                      <button
                        onClick={() => {
                          fetchAlerts();
                          triggerToast("Cloud synchronizer re-verified live database states.");
                          setProfileDropdownOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "8px 10px",
                          backgroundColor: "#FFFBEB",
                          border: "none",
                          borderRadius: 8,
                          color: "#B45309",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          textAlign: "left"
                        }}
                      >
                        ⚡ Force Cloud Re-Sync
                      </button>
                    </div>

                    {/* Quick Access Signout */}
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: "#111827",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        marginTop: 4
                      }}
                    >
                      <LogOut size={13} /> Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Toast Notification popups */}
        {toastMessage && (
          <div style={{ 
            position: "fixed", 
            bottom: 24, 
            right: 24, 
            backgroundColor: "#111827", 
            color: "#fff", 
            borderRadius: 12, 
            padding: "12px 20px", 
            fontSize: 13, 
            fontWeight: 700, 
            zIndex: 9999, 
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            animation: "slideIn 0.2s ease-out"
          }}>
            <Sparkles size={14} style={{ color: "#34D399" }} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Area */}
        <main className="admin-main-content" style={{ flex: 1, padding: "28px 28px 48px", overflowX: "hidden" }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 1024px) {
          .admin-sidebar {
            left: -250px !important;
          }
          .admin-sidebar.admin-sidebar-open {
            left: 0px !important;
            width: 250px !important;
          }
          .admin-main {
            margin-left: 0 !important;
          }
          .admin-mobile-toggle {
            display: flex !important;
          }
          .admin-search-box {
            display: none;
          }
          .admin-avatars {
            display: none;
          }
        }
        @media (max-width: 768px) {
          .admin-header {
            padding: 0 12px !important;
            height: 64px !important;
          }
          .admin-header-title {
            font-size: 15px !important;
          }
          .admin-profile-meta {
            display: none !important;
          }
        }
        .admin-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .admin-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .admin-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .admin-grid-revenue { display: grid; grid-template-columns: 1.8fr 1fr; gap: 20px; }
        .admin-grid-activity { display: grid; grid-template-columns: 1.2fr 1.8fr; gap: 20px; }

        @media (max-width: 1024px) { 
          .admin-grid-4 { grid-template-columns: repeat(2, 1fr); } 
          .admin-grid-3 { grid-template-columns: repeat(2, 1fr); }
          .admin-grid-revenue, .admin-grid-activity { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) { 
          .admin-grid-4, .admin-grid-3, .admin-grid-2, .admin-grid-revenue, .admin-grid-activity { 
            grid-template-columns: 1fr !important; 
            gap: 16px !important;
          } 
          .admin-main-content { padding: 14px 12px 40px !important; }
          .admin-card-padding { padding: 16px 14px !important; }
        }
      `}</style>
    </div>
  );
}

