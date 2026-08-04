import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import AdminLayout from "./AdminLayout";
import { supabase, DbOrder, DbOrderItem, OrderStatus } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { products as staticProducts, getProductName } from "@/data/products";
import { 
  ArrowLeft, 
  Clock, 
  Loader2, 
  RefreshCw, 
  Truck, 
  CheckCircle, 
  XCircle, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CreditCard, 
  DollarSign, 
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
  ArrowRight
} from "lucide-react";

const P = "#2D5A27";
const P_DARK = "#1a4016";

const STATUS_FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

function InfoBlock({ icon: Icon, label, value, color = P }: { icon: any; label: string; value?: string | null; color?: string }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ 
        width: 32, 
        height: 32, 
        borderRadius: 8, 
        backgroundColor: "#FAFBF9", 
        border: "1px solid #E5EFE2", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 2
      }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#6B726A", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
          {label}
        </span>
        <span style={{ fontSize: 13, color: "#1F2937", fontFamily: "'Inter', sans-serif", fontWeight: 500, lineHeight: 1.4 }}>
          {value}
        </span>
      </div>
    </div>
  );
}

const demoOrdersList: DbOrder[] = [
  { id: "101", order_number: "ORD-9821", customer_name: "রাফাত হোসেন", phone: "01712345678", email: "rafat@example.com", division: "ঢাকা", district: "ঢাকা", thana: "ধানমন্ডি", address: "রোড ৪, বাসা ১২", postcode: "1205", payment_method: "bkash", payment_number: "01712345678", transaction_id: "TRX9821BK", subtotal: 4150, delivery_fee: 100, total: 4250, status: "pending", notes: "জরুরি ডেলিভারি প্রয়োজন", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "102", order_number: "ORD-9820", customer_name: "সুমাইয়া বেগম", phone: "01812345679", email: "sumaiya@example.com", division: "চট্টগ্রাম", district: "চট্টগ্রাম", thana: "পাঁচলাইশ", address: "জিইসি মোড়", postcode: "4000", payment_method: "cod", payment_number: null, transaction_id: null, subtotal: 3000, delivery_fee: 100, total: 3100, status: "processing", notes: null, created_at: new Date(Date.now() - 3600000 * 2).toISOString(), updated_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "103", order_number: "ORD-9819", customer_name: "তানভীর আহমেদ", phone: "01912345680", email: null, division: "রাজশাহী", district: "রাজশাহী", thana: "বোয়ালিয়া", address: "সাহেব বাজার", postcode: "6000", payment_method: "nagad", payment_number: "01912345680", transaction_id: "NGD5512", subtotal: 5700, delivery_fee: 100, total: 5800, status: "shipped", notes: null, created_at: new Date(Date.now() - 3600000 * 5).toISOString(), updated_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: "104", order_number: "ORD-9818", customer_name: "নাসরিন সুলতানা", phone: "01612345681", email: null, division: "সিলেট", district: "সিলেট", thana: "জিন্দাবাজার", address: "জেল রোড", postcode: "3100", payment_method: "bkash", payment_number: "01612345681", transaction_id: "BKS8819", subtotal: 2300, delivery_fee: 100, total: 2400, status: "delivered", notes: null, created_at: new Date(Date.now() - 3600000 * 24).toISOString(), updated_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "105", order_number: "ORD-9817", customer_name: "মাহমুদুল হাসান", phone: "01512345682", email: null, division: "খুলনা", district: "খুলনা", thana: "সোনাডাঙ্গা", address: "বাসস্ট্যান্ড রোড", postcode: "9100", payment_method: "cod", payment_number: null, transaction_id: null, subtotal: 1750, delivery_fee: 100, total: 1850, status: "delivered", notes: null, created_at: new Date(Date.now() - 3600000 * 48).toISOString(), updated_at: new Date(Date.now() - 3600000 * 48).toISOString() },
];

const demoItems: DbOrderItem[] = [
  { id: "item-1", order_id: "101", product_id: "1", product_name: "বন্য বনের মধু (৫০০ গ্রাম)", product_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBq58vEH7gYivPXEcLtToX4pCgGkviWmugMHiaigVEtrhNKVWTb4fTxR1hT32LDpNdlSJzxRskyCEBJLI9quHz9O_6QJVWrn2OIY0kpmCMFk7aQwMx5LqiF6lunsosrCjrayF1NNm2DDGr068cYTrgWBexlw0yOmDhPOzDAp1MypmTUW6y9JGsEHMxMHefsdhAn4UsSDMBRDY5ICzk37jUhLrIrO4ZkFiI3ZE-r9CNn86Gtqi1oO6X-niuYbLh0cNTrJ99yBDhQFyb7", quantity: 1, unit_price: 2400, total_price: 2400, created_at: new Date().toISOString() },
  { id: "item-2", order_id: "101", product_id: "2", product_name: "ঠান্ডা চাপা সরিষার তেল (৭৫০ মিলি)", product_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5GzOFWh1pgalQi48-L6jXrnrBdcvDxK-Gb2S8CCtBZFhvlX6tSY2Kz_j7uleHESVRHEh2qnBrg-_pdX-Ks_uVdKF5QPfZpif5WE-0yV3F0MmXlPDL9MqfTONTNjX7iazXEden3BKL14y5eckX2gd8w4dug-rDpGiPJIq0JpnVgtv8zQNZ2mKOn1kg3Iisw4JEuaZNxS0M2pjAGoHHG_zXdz9MCZGlp3pmHyrpaZ0fMr2frPb0LRDYEWVdycoyfZpBlnXXx4gm11UX", quantity: 1, unit_price: 1850, total_price: 1850, created_at: new Date().toISOString() },
];

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { lang, t, formatPrice, formatNum } = useLanguage();
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [items, setItems] = useState<DbOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const STATUS_LABELS: Record<OrderStatus, { label: string; bg: string; color: string; icon: any }> = {
    pending:    { label: "Pending",     bg: "#FFFBEB", color: "#B45309", icon: Clock },
    processing: { label: "Processing",  bg: "#EFF6FF", color: "#1D4ED8", icon: RefreshCw },
    shipped:    { label: "Shipped", bg: "#F5F3FF", color: "#6D28D9", icon: Truck },
    delivered:  { label: "Delivered", bg: "#ECFDF5", color: "#047857", icon: CheckCircle },
    cancelled:  { label: "Cancelled",           bg: "#FEF2F2", color: "#B91C1C", icon: XCircle },
  };

  const PAYMENT_LABELS: Record<string, string> = {
    bkash: "bKash Mobile Wallet", 
    nagad: "Nagad Mobile Wallet", 
    rocket: "Rocket Mobile Wallet", 
    cod: "Cash on Delivery (COD)", 
    bank: "Bank Account Transfer",
  };

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  useEffect(() => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "");

    const fetchOrderData = () => {
      const applyDemo = () => {
        const found = demoOrdersList.find(o => o.id === id) ?? demoOrdersList[0];
        setOrder(found);
        setItems(demoItems);
        setLoading(false);
      };

      if (!supabase || !isUuid) {
        applyDemo();
        return;
      }

      Promise.all([
        supabase.from("orders").select("*").eq("id", id).single(),
        supabase.from("order_items").select("*").eq("order_id", id),
      ]).then(([orderRes, itemsRes]) => {
        if (!orderRes.data) {
          applyDemo();
        } else {
          setOrder(orderRes.data);
          setItems(itemsRes.data ?? []);
          setLoading(false);
        }
      }).catch(() => {
        applyDemo();
      });
    };

    fetchOrderData();

    if (supabase && isUuid) {
      const channel = supabase
        .channel(`admin-order-detail-${id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders", filter: `id=eq.${id}` },
          (payload) => {
            if (payload.new) {
              setOrder(payload.new as DbOrder);
            }
          }
        )
        .subscribe();

      return () => {
        supabase!.removeChannel(channel);
      };
    }
  }, [id]);

  async function updateStatus(status: OrderStatus) {
    setUpdatingStatus(true);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "");
    if (supabase && isUuid) {
      const { error } = await supabase!.from("orders").update({ status }).eq("id", id);
      if (error) {
        showToast(`Failed to update status: ${error.message}`);
        setUpdatingStatus(false);
        return;
      }
    }
    setOrder((prev) => prev ? { ...prev, status } : prev);
    showToast(`Order status changed successfully: ${STATUS_LABELS[status].label}`);
    setUpdatingStatus(false);
  }

  if (loading) {
    return (
      <AdminLayout title="Loading Transaction Details">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, gap: 16 }}>
          <Loader2 size={36} className="animate-spin" style={{ color: P }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#6B726A" }}>
            Synchronizing transaction files...
          </span>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Record Not Found">
        <div style={{ textAlign: "center", padding: 64 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#DC2626" }}>
            <AlertCircle size={28} />
          </div>
          <p style={{ fontSize: 14, color: "#6B726A", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
            This order entry could not be located in the files.
          </p>
          <button onClick={() => navigate("/admin/orders")} style={{ marginTop: 20, backgroundColor: P, color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(45,90,39,0.15)" }}>
            Go Back to List
          </button>
        </div>
      </AdminLayout>
    );
  }

  const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
  const currentStepIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <AdminLayout title={`Order ID #${order.order_number}`}>
      {/* Toast Notification */}
      {toast && (
        <div style={{ 
          position: "fixed", 
          bottom: 32, 
          right: 32, 
          backgroundColor: "#1F2937", 
          color: "#fff", 
          borderRadius: 14, 
          padding: "16px 24px", 
          fontSize: 13, 
          fontFamily: "'Inter',sans-serif", 
          fontWeight: 600, 
          zIndex: 9999, 
          boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <CheckCircle size={16} style={{ color: "#34D399" }} />
          <span>{toast}</span>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 48 }}>
        
        {/* Navigation back */}
        <button onClick={() => navigate("/admin/orders")}
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 8, 
            background: "none", 
            border: "none", 
            cursor: "pointer", 
            color: P, 
            fontSize: 13, 
            fontFamily: "'Inter',sans-serif", 
            marginBottom: 24, 
            fontWeight: 700,
            transition: "all 0.2s" 
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = P_DARK; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = P; }}
        >
          <ArrowLeft size={16} />
          Back to Orders Registry
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }}>

          {/* HEADER ORDER META INFO */}
          <div style={{ 
            backgroundColor: "#fff", 
            borderRadius: 20, 
            border: "1px solid #EEF2ED", 
            padding: "28px 32px", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            flexWrap: "wrap", 
            gap: 24,
            boxShadow: "0 4px 16px rgba(0,0,0,0.005)"
          }}>
            <div>
              <span style={{ 
                backgroundColor: "#F4F7F3", 
                color: P, 
                fontSize: 9, 
                fontWeight: 700, 
                letterSpacing: "0.1em", 
                padding: "4px 8px", 
                borderRadius: 20,
                textTransform: "uppercase",
                display: "inline-block",
                marginBottom: 8
              }}>
                TRANSACTION RECORD
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 6px", fontFamily: "'Inter', sans-serif" }}>
                #{order.order_number}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B726A" }}>
                <span>Placed on:</span>
                <span style={{ fontWeight: 600, color: "#111827" }}>
                  {new Date(order.created_at).toLocaleString("en-US", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                  TOTAL AMOUNT
                </span>
                <span style={{ fontSize: 24, fontWeight: 800, color: P, fontFamily: "'Inter', sans-serif" }}>
                  {formatPrice(order.total)}
                </span>
              </div>

              <span style={{ 
                fontSize: 11, 
                fontWeight: 700, 
                color: st.color, 
                backgroundColor: st.bg, 
                borderRadius: 10, 
                padding: "8px 16px", 
                fontFamily: "'Inter',sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                <st.icon size={13} />
                {st.label}
              </span>
            </div>
          </div>

          {/* PROGRESS STEP INDICATOR TRACKER */}
          {order.status !== "cancelled" && (
            <div style={{ 
              backgroundColor: "#fff", 
              borderRadius: 20, 
              border: "1px solid #EEF2ED", 
              padding: "28px 32px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.005)"
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 24px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                🚚 DISPATCH LIFECYCLE PROGRESS
              </h3>
              
              <div style={{ overflowX: "auto", paddingBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between", position: "relative", minWidth: 500 }}>
                {STATUS_FLOW.map((s, i) => {
                  const done = currentStepIdx >= i;
                  const stepLabel = STATUS_LABELS[s];
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STATUS_FLOW.length - 1 ? 1 : "none" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", zIndex: 2 }}>
                        <div style={{ 
                          width: 44, 
                          height: 44, 
                          borderRadius: "50%", 
                          backgroundColor: done ? P : "#F3F4F6", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          border: done ? "4px solid #E5EFE2" : "1px solid #E5E7EB",
                          color: done ? "#fff" : "#9CA3AF",
                          transition: "all 0.3s"
                        }}>
                          <stepLabel.icon size={18} />
                        </div>
                        <span style={{ 
                          fontSize: 11, 
                          color: done ? P : "#9CA3AF", 
                          fontFamily: "'Inter',sans-serif", 
                          whiteSpace: "nowrap", 
                          fontWeight: done ? 700 : 500 
                        }}>
                          {stepLabel.label}
                        </span>
                      </div>
                      
                      {i < STATUS_FLOW.length - 1 && (
                        <div style={{ 
                          flex: 1, 
                          height: 3, 
                          backgroundColor: currentStepIdx > i ? P : "#E5E7EB", 
                          margin: "0 8px", 
                          transform: "translateY(-14px)",
                          borderRadius: 2,
                          transition: "all 0.3s"
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          )}

          {/* UPDATE STATUS ACTION BOARD */}
          <div style={{ 
            backgroundColor: "#fff", 
            borderRadius: 20, 
            border: "1px solid #EEF2ED", 
            padding: "24px 32px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.005)"
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              ⚡ SYSTEM PROGRESS TRIGGERS
            </h3>
            
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(Object.entries(STATUS_LABELS) as [OrderStatus, typeof STATUS_LABELS[OrderStatus]][]).map(([s, info]) => {
                const isCurrent = order.status === s;
                return (
                  <button key={s} onClick={() => updateStatus(s)}
                    disabled={isCurrent || updatingStatus}
                    style={{ 
                      padding: "10px 20px", 
                      borderRadius: 12, 
                      border: isCurrent ? `2px solid ${info.color}` : "1.5px solid #E5EFE2", 
                      backgroundColor: isCurrent ? info.bg : "#fff", 
                      cursor: isCurrent ? "default" : "pointer", 
                      fontSize: 12, 
                      fontWeight: 700, 
                      color: isCurrent ? info.color : "#4B5563", 
                      fontFamily: "'Inter',sans-serif", 
                      opacity: updatingStatus ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => { if(!isCurrent) e.currentTarget.style.borderColor = P; }}
                    onMouseLeave={(e) => { if(!isCurrent) e.currentTarget.style.borderColor = "#E5EFE2"; }}
                  >
                    <info.icon size={13} />
                    {info.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ gap: 28 }} className="admin-grid-2">
            
            {/* Customer Details Block */}
            <div style={{ 
              backgroundColor: "#fff", 
              borderRadius: 20, 
              border: "1px solid #EEF2ED", 
              padding: "28px 32px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.005)",
              display: "flex",
              flexDirection: "column",
              gap: 20
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                👤 BUYER & DISPATCH ADDRESS
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <InfoBlock icon={User} label="Full Name" value={order.customer_name} />
                <InfoBlock icon={Phone} label="Mobile Number" value={order.phone} />
                <InfoBlock icon={Mail} label="Email Address" value={order.email} />
                <InfoBlock icon={MapPin} label="Delivery Destination Address" value={`${order.address}, ${order.thana}, ${order.district}, ${order.division} - ${order.postcode || ""}`} />
                <InfoBlock icon={FileText} label="Order Remarks / Notes" value={order.notes} color="#B45309" />
              </div>
            </div>

            {/* Payment & Receipts Block */}
            <div style={{ 
              backgroundColor: "#fff", 
              borderRadius: 20, 
              border: "1px solid #EEF2ED", 
              padding: "28px 32px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.005)",
              display: "flex",
              flexDirection: "column",
              gap: 20
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                💳 PAYMENT & LEDGER RECORDS
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <InfoBlock icon={CreditCard} label="Gateway Protocol" value={PAYMENT_LABELS[order.payment_method] ?? order.payment_method} />
                  <InfoBlock icon={Phone} label="Sender Account Number" value={order.payment_number} />
                  <InfoBlock icon={ShieldCheck} label="Transaction Verification ID" value={order.transaction_id} color="#059669" />
                </div>

                <div style={{ borderTop: "1px solid #EEF2ED", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#6B726A", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Subtotal</span>
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif", color: "#111827" }}>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#6B726A", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>Shipping & Dispatch</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: order.delivery_fee === 0 ? P : "#111827", fontFamily: "'Inter',sans-serif" }}>
                      {order.delivery_fee === 0 ? "Free Shipping" : formatPrice(order.delivery_fee)}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1.5px dashed #E5EFE2", paddingTop: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 14, color: "#111827", fontWeight: 700 }}>Grand Ledger Total</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: P, fontFamily: "'Inter',sans-serif" }}>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ITEM LINE DETAIL LIST */}
          <div style={{ 
            backgroundColor: "#fff", 
            borderRadius: 20, 
            border: "1px solid #EEF2ED", 
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.005)"
          }}>
            <div style={{ padding: "22px 32px", borderBottom: "1px solid #EEF2ED", display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingBag size={18} style={{ color: P }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                📦 PACKAGED ITEM LINE DETAILS ({formatNum(items.length)} lines)
              </h3>
            </div>
            
            <div style={{ padding: "16px 32px", display: "flex", flexDirection: "column" }}>
              {items.map((item, index) => {
                const match = staticProducts.find((sp) => sp.id.toString() === item.product_id);
                const displayName = match ? getProductName(match, lang) : item.product_name;

                return (
                  <div key={item.id} 
                    style={{ 
                      display: "flex", 
                      gap: 16, 
                      alignItems: "center", 
                      padding: "16px 0", 
                      borderBottom: index < items.length - 1 ? "1.5px dashed #F4F7F3" : "none" 
                    }}
                  >
                    <div style={{ 
                      width: 56, 
                      height: 56, 
                      backgroundColor: "#FAFBF9", 
                      borderRadius: 12, 
                      overflow: "hidden", 
                      padding: 6, 
                      flexShrink: 0,
                      border: "1px solid #E5EFE2"
                    }}>
                      <img src={item.product_image} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "contain" }} referrerPolicy="no-referrer" />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "'Inter',sans-serif", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {displayName}
                      </p>
                      <p style={{ fontSize: 11, color: "#6B726A", fontFamily: "'Inter',sans-serif", margin: 0, fontWeight: 500 }}>
                        {formatPrice(item.unit_price)} x {formatNum(item.quantity)} units
                      </p>
                    </div>
                    
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#111827", fontFamily: "'Inter',sans-serif", flexShrink: 0 }}>
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                );
              })}
            </div>
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
