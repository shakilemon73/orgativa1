import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
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
  ChevronRight,
  Globe,
  UserCheck
} from "lucide-react";

const P = "#2D5A27";
const DARK = "#0D1F0B";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const { lang, setLang, t } = useLanguage();

  const NAV = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: t("ড্যাশবোর্ড", "Dashboard") },
    { path: "/admin/products", icon: Package, label: t("পণ্য", "Products") },
    { path: "/admin/categories", icon: FolderTree, label: t("বিভাগ", "Categories") },
    { path: "/admin/orders", icon: Receipt, label: t("অর্ডার", "Orders") },
    { path: "/admin/settings", icon: Settings, label: t("সেটিংস", "Settings") },
  ];

  useEffect(() => {
    if (!supabase || localStorage.getItem("orgativa_demo_admin") === "true") {
      setUser({ email: "admin@orgativa.com.bd (Demo)" });
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

  async function handleLogout() {
    localStorage.removeItem("orgativa_demo_admin");
    if (supabase) await supabase.auth.signOut();
    navigate("/admin/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F7F9F6" }}>
      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: "linear-gradient(180deg, #0C1E0A 0%, #173514 100%)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: sidebarOpen ? 0 : -260,
        bottom: 0,
        zIndex: 200,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: sidebarOpen ? "8px 0 32px rgba(12, 30, 10, 0.15)" : "none",
        borderRight: "1px solid rgba(255,255,255,0.06)"
      }}
        className="admin-sidebar"
      >
        <div style={{ padding: "28px 24px 20px", display: "flex", flexDirection: "column", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Logo size={38} variant="dark" />
          <span style={{ fontSize: 9, fontWeight: 700, color: "#8B9E88", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>
            Control Center
          </span>
        </div>

        <nav style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
          {NAV.map((item) => {
            const active = location.startsWith(item.path);
            const IconComponent = item.icon;
            return (
              <button key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  padding: "12px 16px", 
                  borderRadius: 12, 
                  border: "none", 
                  backgroundColor: active ? "rgba(109, 175, 103, 0.15)" : "transparent", 
                  cursor: "pointer", 
                  textAlign: "left", 
                  width: "100%", 
                  transition: "all 0.2s ease",
                  position: "relative"
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
                <IconComponent size={18} style={{ 
                  color: active ? "#6DAF67" : "rgba(255,255,255,0.45)", 
                  flexShrink: 0,
                  transition: "color 0.2s"
                }} />
                <span style={{ 
                  fontSize: 13, 
                  fontWeight: active ? 600 : 500, 
                  color: active ? "#fff" : "rgba(255,255,255,0.65)", 
                  fontFamily: "'Inter',sans-serif",
                  transition: "color 0.2s"
                }}>{item.label}</span>
                {active && (
                  <div style={{ 
                    position: "absolute",
                    left: 0,
                    width: 4,
                    height: 20,
                    borderRadius: "0 4px 4px 0",
                    backgroundColor: "#6DAF67"
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "20px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(0,0,0,0.15)" }}>
          {user && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 10, 
              padding: "10px 12px", 
              marginBottom: 12,
              backgroundColor: "rgba(255,255,255,0.03)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.04)"
            }}>
              <div style={{ 
                width: 32, 
                height: 32, 
                backgroundColor: "#6DAF67", 
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                flexShrink: 0,
                boxShadow: "0 4px 10px rgba(109,175,103,0.3)"
              }}>
                <span style={{ fontSize: 13, color: "#fff", fontFamily: "'Inter',sans-serif", fontWeight: 700 }}>{user.email[0].toUpperCase()}</span>
              </div>
              <div style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                  <UserCheck size={11} style={{ color: "#6DAF67" }} /> Admin
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 10, 
              padding: "11px 14px", 
              borderRadius: 10, 
              border: "1px solid rgba(248,113,113,0.15)", 
              backgroundColor: "rgba(248,113,113,0.02)", 
              cursor: "pointer", 
              width: "100%", 
              transition: "all 0.2s" 
            }}
            onMouseEnter={(e) => { 
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(248,113,113,0.08)"; 
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,0.3)";
            }}
            onMouseLeave={(e) => { 
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(248,113,113,0.02)"; 
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(248,113,113,0.15)";
            }}>
            <LogOut size={16} style={{ color: "#f87171" }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#f87171", fontFamily: "'Inter',sans-serif" }}>{t("লগ আউট", "Log Out")}</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(12,30,10,0.4)", backdropFilter: "blur(4px)", zIndex: 199 }} />
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", transition: "all 0.3s" }} className="admin-main">
        {/* Top bar */}
        <header style={{ 
          backgroundColor: "#fff", 
          borderBottom: "1px solid #EEF2ED", 
          padding: "0 32px", 
          height: 70, 
          display: "flex", 
          alignItems: "center", 
          gap: 16, 
          position: "sticky", 
          top: 0, 
          zIndex: 100,
          boxShadow: "0 1px 3px rgba(45,90,39,0.02)"
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ 
              background: "none", 
              border: "1px solid #EAF0E9", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              width: 38, 
              height: 38, 
              borderRadius: 10,
              backgroundColor: "#FAFBF9",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#F4F7F3"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#FAFBF9"; }}>
            <Menu size={18} style={{ color: "#2D5A27" }} />
          </button>
          
          <div style={{ flex: 1 }}>
            {title && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#8B9E88", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>{t("অ্যাডমিন প্যানেল", "Admin Area")}</span>
                <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 700, color: "#1A1C1C", margin: 0 }}>{title}</h1>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div style={{ display: "flex", alignItems: "center", backgroundColor: "#F4F7F3", borderRadius: 10, padding: 3, border: "1.5px solid #E5EFE2" }}>
            <button onClick={() => setLang("bn")}
              style={{ 
                padding: "6px 12px", 
                borderRadius: 8, 
                border: "none", 
                backgroundColor: lang === "bn" ? P : "transparent", 
                color: lang === "bn" ? "#fff" : "#4A5548", 
                fontSize: 11, 
                fontWeight: 700, 
                cursor: "pointer", 
                transition: "all 0.2s",
                boxShadow: lang === "bn" ? "0 2px 6px rgba(45,90,39,0.2)" : "none"
              }}>
              বাংলা
            </button>
            <button onClick={() => setLang("en")}
              style={{ 
                padding: "6px 12px", 
                borderRadius: 8, 
                border: "none", 
                backgroundColor: lang === "en" ? P : "transparent", 
                color: lang === "en" ? "#fff" : "#4A5548", 
                fontSize: 11, 
                fontWeight: 700, 
                cursor: "pointer", 
                transition: "all 0.2s",
                boxShadow: lang === "en" ? "0 2px 6px rgba(45,90,39,0.2)" : "none"
              }}>
              ENG
            </button>
          </div>

          <button onClick={() => navigate("/")}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              padding: "9px 16px", 
              borderRadius: 10, 
              border: "1.5px solid #E5EFE2", 
              backgroundColor: "#fff", 
              cursor: "pointer", 
              fontSize: 12, 
              fontWeight: 600,
              fontFamily: "'Inter',sans-serif", 
              color: "#2D5A27",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { 
              (e.currentTarget as HTMLElement).style.backgroundColor = "#F4F7F3"; 
              (e.currentTarget as HTMLElement).style.borderColor = "#C2D9BC";
            }}
            onMouseLeave={(e) => { 
              (e.currentTarget as HTMLElement).style.backgroundColor = "#fff"; 
              (e.currentTarget as HTMLElement).style.borderColor = "#E5EFE2";
            }}>
            <Store size={16} />
            {t("স্টোর দেখুন", "View Store")}
          </button>
        </header>

        <main style={{ flex: 1, padding: "36px 36px 60px", overflow: "auto" }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .admin-sidebar { left: 0 !important; box-shadow: none !important; }
          .admin-main { margin-left: 260px; }
        }
        .admin-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .admin-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        @media (max-width: 1024px) { .admin-grid-4 { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .admin-grid-4 { grid-template-columns: 1fr; } .admin-grid-2 { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
