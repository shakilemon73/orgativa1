import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { getProductName } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useResponsive } from "@/hooks/use-responsive";
import { submitOrder } from "@/lib/supabase-hooks";
import {
  Banknote,
  Smartphone,
  CreditCard,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Clock,
  Lock,
  RotateCcw
} from "lucide-react";

const P = "#2D5A27";
const P_DARK = "#1a4016";
const P_LIGHT = "#F4F7F3";

type PaymentType = "cod" | "online";
type OnlineMethod = "bkash" | "nagad" | "rocket" | "bank";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { lang, t, formatPrice, formatNum } = useLanguage();
  const { getSetting } = useSiteSettings();
  const { isMobile } = useResponsive();

  // Primary Payment Mode: "cod" (Cash on Delivery) vs "online" (Online Payment)
  const [paymentType, setPaymentType] = useState<PaymentType>("cod");
  // Sub-method if online payment is chosen
  const [onlineMethod, setOnlineMethod] = useState<OnlineMethod>("bkash");
  const [mobileNumber, setMobileNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Flow step: 0 = Form & Payment, 1 = Review & Confirmation
  const [currentStep, setCurrentStep] = useState<0 | 1>(0);

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId] = useState(`ORG-${Math.floor(100000 + Math.random() * 900000)}`);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placementError, setPlacementError] = useState<string | null>(null);

  // Simplified customer form layout
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
    deliveryZone: "dhaka", // "dhaka" | "outside_dhaka"
    notes: "",
  });

  function setF(key: string, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  // Delivery calculations
  const freeThreshold = Number(getSetting("delivery_free_threshold", "1500")) || 1500;
  const insideDhakaCharge = Number(getSetting("delivery_inside_dhaka", "60")) || 60;
  const outsideDhakaCharge = Number(getSetting("delivery_outside_dhaka", "120")) || 120;
  const contactPhone = getSetting("contact_phone", "01700-000000");

  const baseDeliveryCharge = form.deliveryZone === "dhaka" ? insideDhakaCharge : outsideDhakaCharge;
  const deliveryFree = subtotal >= freeThreshold;
  const deliveryCharge = deliveryFree ? 0 : baseDeliveryCharge;
  const total = subtotal + deliveryCharge;

  // Validation
  const isContactValid = form.fullName.trim().length >= 2 && form.phone.trim().length >= 10 && form.address.trim().length >= 5;
  const isOnlinePaymentValid = paymentType === "cod" || (mobileNumber.trim().length >= 10 && transactionId.trim().length >= 4);
  const isFormComplete = isContactValid && isOnlinePaymentValid;

  const onlineMethodsConfig: Record<OnlineMethod, {
    label: string;
    sub: string;
    accountNo: string;
    accountType: string;
    color: string;
    accentBg: string;
    icon: any;
    instructionsBn: string;
    instructionsEn: string;
  }> = {
    bkash: {
      label: "bKash",
      sub: t("বিকাশ মোবাইল ব্যাংকিং", "bKash Mobile Banking"),
      accountNo: contactPhone.replace(/[^0-9+]/g, "") || "01700000000",
      accountType: "Merchant / Personal (Send Money)",
      color: "#E2136E",
      accentBg: "#FDF2F7",
      icon: Smartphone,
      instructionsBn: "আপনার bKash অ্যাপ অথবা *247# ডায়াল করে 'Send Money' করুন। এরপর আপনার বিকাশ নম্বর ও TrxID নিচে লিখুন।",
      instructionsEn: "Open bKash App or dial *247# and Send Money to this number. Then submit your sender number & TrxID below."
    },
    nagad: {
      label: "Nagad",
      sub: t("নগদ মোবাইল ব্যাংকিং", "Nagad Mobile Banking"),
      accountNo: contactPhone.replace(/[^0-9+]/g, "") || "01700000000",
      accountType: "Merchant / Personal (Send Money)",
      color: "#F7941D",
      accentBg: "#FEF7EE",
      icon: Smartphone,
      instructionsBn: "আপনার Nagad অ্যাপ অথবা *167# ডায়াল করে 'Send Money' করুন। এরপর আপনার নগদ নম্বর ও TrxID নিচে লিখুন।",
      instructionsEn: "Open Nagad App or dial *167# and Send Money to this number. Then submit your sender number & TrxID below."
    },
    rocket: {
      label: "Rocket",
      sub: t("রকেট (ডিবিবিএল)", "DBBL Rocket Mobile"),
      accountNo: (contactPhone.replace(/[^0-9+]/g, "") || "01700000000") + "4",
      accountType: "Personal (Send Money)",
      color: "#8B22A0",
      accentBg: "#FAF4FB",
      icon: Smartphone,
      instructionsBn: "আপনার Rocket অ্যাপ বা *322# থেকে Send Money করুন। সফল ট্রানজেকশনের TrxID ও নম্বর নিচে প্রবেশ করুন।",
      instructionsEn: "Send money via Rocket App or *322#. Then enter the transaction TrxID and your Rocket number below."
    },
    bank: {
      label: "Bank Transfer",
      sub: t("ব্যাংক ট্রান্সফার / এনপিএসবি", "Direct Bank / NPSB Transfer"),
      accountNo: "1501203948291001",
      accountType: "BRAC Bank PLC (Gulshan Branch)",
      color: "#1A3A5C",
      accentBg: "#F0F5FA",
      icon: Building2,
      instructionsBn: "অ্যাকাউন্ট নাম: Orgativa Organic Foods | হিসাব নং: 1501203948291001 | ব্র্যাক ব্যাংক (গুলশান ব্রাঞ্চ)। রেফারেন্সে আপনার নাম বা ফোন দিন।",
      instructionsEn: "Account Name: Orgativa Organic Foods | A/C No: 1501203948291001 | BRAC Bank (Gulshan Branch). Use your name/phone as reference."
    }
  };

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  }

  async function handlePlaceOrder() {
    try {
      setIsPlacing(true);
      setPlacementError(null);

      const actualPaymentMethod = paymentType === "cod" ? "cod" : onlineMethod;
      const zoneLabel = form.deliveryZone === "dhaka" ? "Inside Dhaka (ঢাকা সিটি)" : "Outside Dhaka (ঢাকার বাইরে)";

      const res = await submitOrder({
        orderNumber: orderId,
        customerName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        division: form.deliveryZone === "dhaka" ? "Dhaka" : "Outside Dhaka",
        district: form.deliveryZone === "dhaka" ? "Dhaka" : "Nationwide",
        thana: form.deliveryZone === "dhaka" ? "Dhaka City" : "Outside Dhaka",
        address: `${form.address.trim()} (${zoneLabel})`,
        postcode: undefined,
        paymentMethod: actualPaymentMethod,
        paymentNumber: paymentType === "online" ? mobileNumber.trim() : undefined,
        transactionId: paymentType === "online" ? transactionId.trim() : undefined,
        subtotal,
        deliveryFee: deliveryCharge,
        total,
        notes: form.notes.trim() || undefined,
        items: items.map((item) => ({
          productId: typeof item.product.id === "string" ? item.product.id : undefined,
          productName: item.product.name,
          productImage: item.product.image,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.product.price * item.quantity,
        })),
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to save order to database.");
      }

      clearCart();
      setOrderPlaced(true);
    } catch (err: any) {
      console.error("Order placement error:", err);
      setPlacementError(err?.message || t("অর্ডার সম্পন্ন করা যায়নি। দয়া করে আবার চেষ্টা করুন।", "Could not complete your order. Please try again."));
    } finally {
      setIsPlacing(false);
    }
  }

  if (orderPlaced) {
    return <OrderSuccess orderId={orderId} total={total} lang={lang} t={t} formatPrice={formatPrice} />;
  }

  if (items.length === 0) {
    return (
      <div style={{ backgroundColor: "#F9F9F9", minHeight: "100vh" }}>
        <Header />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 32px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: 28, color: "#1A1C1C", fontWeight: 400 }}>
            {t("আপনার ঝুড়ি খালি", "Your Cart is Empty")}
          </h2>
          <button onClick={() => navigate("/")} style={{ marginTop: 24, background: P, color: "#fff", border: "none", borderRadius: 8, padding: "12px 32px", cursor: "pointer", fontSize: 14, fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>
            {t("এখনই কিনুন", "Shop Now")}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const px = isMobile ? "16px" : "48px";

  return (
    <div style={{ backgroundColor: "#F9FAF8", minHeight: "100vh" }}>
      <Header />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: `${isMobile ? 20 : 36}px ${px} 80px` }}>
        
        {/* Navigation & Header */}
        <div style={{ marginBottom: 24 }}>
          <button 
            onClick={() => navigate("/cart")} 
            style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, color: P, fontSize: 13, fontFamily: "'Inter',sans-serif", fontWeight: 600, marginBottom: 8 }}
          >
            <ArrowLeft size={16} />
            {t("ঝুড়িতে ফিরুন", "Back to Cart")}
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: isMobile ? 26 : 34, fontWeight: 500, color: "#111827", margin: 0 }}>
                {t("অর্ডার চেকআউট", "Order Checkout")}
              </h1>
              <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0", fontFamily: "'Inter',sans-serif" }}>
                {t("সহজ ও নিরাপদ অর্গানিক পণ্য ডেলিভারি", "Fast & Secure 100% Pure Organic Delivery")}
              </p>
            </div>

            {/* Quick Trust Badges */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: P, fontWeight: 700, backgroundColor: "#EAF3E8", padding: "6px 12px", borderRadius: 20 }}>
                <ShieldCheck size={14} />
                {t("১০০% খাঁটি পণ্য", "100% Pure & Lab Tested")}
              </span>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT: MAIN FORM & SUMMARY */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 380px", gap: 24, alignItems: "start" }}>
          
          {/* LEFT COLUMN: CUSTOMER DETAILS & PAYMENT METHOD */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* STEP 0: DETAILS & PAYMENT METHOD */}
            {currentStep === 0 ? (
              <>
                {/* 1. CUSTOMER & DELIVERY INFORMATION (CLEAN: Name, Number, Address, Email Optional) */}
                <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: isMobile ? 18 : 24, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, borderBottom: "1px solid #F3F4F6", paddingBottom: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: P, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, fontFamily: "'Inter',sans-serif" }}>
                      1
                    </div>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: 0, fontFamily: "'Inter',sans-serif" }}>
                        {t("ডেলিভারি তথ্য", "Delivery & Customer Details")}
                      </h2>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>
                        {t("পণ্য পৌঁছানোর জন্য আপনার সঠিক তথ্য প্রদান করুন", "Enter your information for delivery")}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                    {/* Name */}
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>
                        {t("আপনার নাম", "Full Name")} <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <input
                        type="text"
                        style={inputStyle}
                        placeholder={t("আপনার পুরো নাম লিখুন", "e.g. Mohammad Rahim")}
                        value={form.fullName}
                        onChange={(e) => setF("fullName", e.target.value)}
                      />
                    </div>

                    {/* Number / Phone */}
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>
                        {t("মোবাইল নম্বর", "Mobile Number")} <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#6B7280", fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
                          +880
                        </span>
                        <input
                          type="tel"
                          style={{ ...inputStyle, paddingLeft: 54 }}
                          placeholder="01XXXXXXXXX"
                          value={form.phone}
                          onChange={(e) => setF("phone", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Full Address */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>
                        {t("সম্পূর্ণ ডেলিভারি ঠিকানা", "Full Delivery Address")} <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <textarea
                        style={{ ...inputStyle, height: 75, resize: "vertical" }}
                        placeholder={t("বাসা/ফ্ল্যাট নং, রোড নং, এলাকা, থানা ও শহর", "House No, Road No, Area, Police Station & City")}
                        value={form.address}
                        onChange={(e) => setF("address", e.target.value)}
                      />
                    </div>

                    {/* Email (Optional) */}
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>
                        {t("ইমেইল (ঐচ্ছিক)", "Email (Optional)")}
                      </label>
                      <input
                        type="email"
                        style={inputStyle}
                        placeholder="yourname@example.com"
                        value={form.email}
                        onChange={(e) => setF("email", e.target.value)}
                      />
                    </div>

                    {/* Delivery Zone Selector (Inside Dhaka vs Outside Dhaka) */}
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>
                        {t("ডেলিভারি এরিয়া", "Delivery Location")} <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setF("deliveryZone", "dhaka")}
                          style={{
                            padding: "10px 8px",
                            borderRadius: 8,
                            border: form.deliveryZone === "dhaka" ? `2px solid ${P}` : "1px solid #D1D5DB",
                            backgroundColor: form.deliveryZone === "dhaka" ? "#F0FDF4" : "#fff",
                            color: form.deliveryZone === "dhaka" ? P : "#374151",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "'Inter',sans-serif",
                            cursor: "pointer",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            alignItems: "center"
                          }}
                        >
                          <span>{t("ঢাকা সিটি", "Inside Dhaka")}</span>
                          <span style={{ fontSize: 11, fontWeight: 500, color: form.deliveryZone === "dhaka" ? P : "#6B7280" }}>
                            {deliveryFree ? t("ফ্রি ডেলিভারি", "FREE") : `৳${insideDhakaCharge}`}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setF("deliveryZone", "outside_dhaka")}
                          style={{
                            padding: "10px 8px",
                            borderRadius: 8,
                            border: form.deliveryZone === "outside_dhaka" ? `2px solid ${P}` : "1px solid #D1D5DB",
                            backgroundColor: form.deliveryZone === "outside_dhaka" ? "#F0FDF4" : "#fff",
                            color: form.deliveryZone === "outside_dhaka" ? P : "#374151",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "'Inter',sans-serif",
                            cursor: "pointer",
                            textAlign: "center",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            alignItems: "center"
                          }}
                        >
                          <span>{t("ঢাকার বাইরে", "Outside Dhaka")}</span>
                          <span style={{ fontSize: 11, fontWeight: 500, color: form.deliveryZone === "outside_dhaka" ? P : "#6B7280" }}>
                            {deliveryFree ? t("ফ্রি ডেলিভারি", "FREE") : `৳${outsideDhakaCharge}`}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Special Instructions (Optional) */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>
                        {t("বিশেষ ডেলিভারি নির্দেশনা (ঐচ্ছিক)", "Special Order Notes (Optional)")}
                      </label>
                      <input
                        type="text"
                        style={inputStyle}
                        placeholder={t("যেমন: কল দিয়ে আসবেন / বিকালে ডেলিভারি দিন", "e.g. Call before delivery / deliver in evening")}
                        value={form.notes}
                        onChange={(e) => setF("notes", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. PAYMENT METHOD SELECTION TABS: Cash on Delivery vs Online Payment */}
                <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: isMobile ? 18 : 24, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, borderBottom: "1px solid #F3F4F6", paddingBottom: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: P, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, fontFamily: "'Inter',sans-serif" }}>
                      2
                    </div>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: 0, fontFamily: "'Inter',sans-serif" }}>
                        {t("পেমেন্ট পদ্ধতি নির্বাচন করুন", "Select Payment Method")}
                      </h2>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>
                        {t("ক্যাশ অন ডেলিভারি অথবা অনলাইন পেমেন্ট বেছে নিন", "Choose Cash on Delivery or Online Mobile/Bank Payment")}
                      </span>
                    </div>
                  </div>

                  {/* PRIMARY TABS: CASH ON DELIVERY vs ONLINE PAYMENT */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 20 }}>
                    
                    {/* Tab 1: Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => setPaymentType("cod")}
                      style={{
                        padding: "16px 18px",
                        borderRadius: 14,
                        border: paymentType === "cod" ? `2.5px solid ${P}` : "1.5px solid #E5E7EB",
                        backgroundColor: paymentType === "cod" ? "#F0FDF4" : "#FAFBF9",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        textAlign: "left",
                        transition: "all 0.15s ease",
                        position: "relative"
                      }}
                    >
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: paymentType === "cod" ? P : "#E5E7EB",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <Banknote size={22} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: paymentType === "cod" ? P : "#111827", fontFamily: "'Inter',sans-serif" }}>
                            {t("ক্যাশ অন ডেলিভারি", "Cash on Delivery")}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: "#E5E7EB", color: "#374151", padding: "2px 6px", borderRadius: 10 }}>
                            COD
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: "#6B7280", display: "block", marginTop: 2 }}>
                          {t("পণ্য হাতে পেয়ে মূল্য পরিশোধ", "Pay cash upon delivery")}
                        </span>
                      </div>
                      {paymentType === "cod" && (
                        <CheckCircle2 size={20} style={{ color: P }} />
                      )}
                    </button>

                    {/* Tab 2: Online Payment */}
                    <button
                      type="button"
                      onClick={() => setPaymentType("online")}
                      style={{
                        padding: "16px 18px",
                        borderRadius: 14,
                        border: paymentType === "online" ? `2.5px solid ${P}` : "1.5px solid #E5E7EB",
                        backgroundColor: paymentType === "online" ? "#F0FDF4" : "#FAFBF9",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        textAlign: "left",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: paymentType === "online" ? P : "#E5E7EB",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <Smartphone size={22} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: paymentType === "online" ? P : "#111827", fontFamily: "'Inter',sans-serif" }}>
                            {t("অনলাইন পেমেন্ট", "Online Payment")}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: "#FCE7F3", color: "#BE185D", padding: "2px 6px", borderRadius: 10 }}>
                            bKash/Nagad
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: "#6B7280", display: "block", marginTop: 2 }}>
                          {t("বিকাশ, নগদ, রকেট বা ব্যাংক", "bKash, Nagad, Rocket, Bank")}
                        </span>
                      </div>
                      {paymentType === "online" && (
                        <CheckCircle2 size={20} style={{ color: P }} />
                      )}
                    </button>
                  </div>

                  {/* IF CASH ON DELIVERY IS SELECTED */}
                  {paymentType === "cod" && (
                    <div style={{
                      backgroundColor: "#F0FDF4",
                      border: "1px solid #DCFCE7",
                      borderRadius: 12,
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12
                    }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: "#DCFCE7",
                        color: P,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <Truck size={18} />
                      </div>
                      <div>
                        <h4 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 800, color: "#166534", fontFamily: "'Inter',sans-serif" }}>
                          {t("পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন", "Pay in Cash Upon Receiving")}
                        </h4>
                        <p style={{ margin: 0, fontSize: 12, color: "#15803D", lineHeight: 1.5, fontFamily: "'Inter',sans-serif" }}>
                          {t("ডেলিভারি ম্যানের কাছ থেকে পার্সেল চেক করে মোট ", "Check your parcel from our delivery agent and pay ")}
                          <strong>{formatPrice(total)}</strong>
                          {t(" নগদ টাকায় পরিশোধ করুন। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।", " in cash. No advance payment required.")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* IF ONLINE PAYMENT IS SELECTED: SHOW DETAILED PAYMENT METHODS */}
                  {paymentType === "online" && (
                    <div style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: 14,
                      border: "1px solid #E5E7EB",
                      padding: 18,
                      animation: "fadeIn 0.2s ease-in-out"
                    }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10, fontFamily: "'Inter',sans-serif" }}>
                        {t("অনলাইন মাধ্যমটি নির্বাচন করুন:", "Select Online Payment Method:")}
                      </label>

                      {/* Sub-Methods Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
                        {(["bkash", "nagad", "rocket", "bank"] as OnlineMethod[]).map((mKey) => {
                          const method = onlineMethodsConfig[mKey];
                          const isSelected = onlineMethod === mKey;
                          return (
                            <button
                              key={mKey}
                              type="button"
                              onClick={() => setOnlineMethod(mKey)}
                              style={{
                                padding: "12px 10px",
                                borderRadius: 10,
                                border: isSelected ? `2px solid ${method.color}` : "1px solid #D1D5DB",
                                backgroundColor: isSelected ? method.accentBg : "#fff",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 6,
                                transition: "all 0.15s"
                              }}
                            >
                              <div style={{
                                width: 34,
                                height: 34,
                                borderRadius: 8,
                                backgroundColor: `${method.color}15`,
                                color: method.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}>
                                <method.icon size={18} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 800, color: isSelected ? method.color : "#111827", fontFamily: "'Inter',sans-serif" }}>
                                {method.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Payment Details Box for Selected Method */}
                      {(() => {
                        const curMethod = onlineMethodsConfig[onlineMethod];
                        return (
                          <div style={{
                            backgroundColor: "#fff",
                            borderRadius: 12,
                            border: `1px solid ${curMethod.color}30`,
                            padding: 16,
                            marginBottom: 16
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10, borderBottom: "1px solid #F3F4F6", paddingBottom: 10 }}>
                              <div>
                                <span style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>
                                  {curMethod.label} {t("অ্যাকাউন্ট নম্বর", "Account Number")}:
                                </span>
                                <div style={{ fontSize: 16, fontWeight: 800, color: curMethod.color, letterSpacing: "0.04em", fontFamily: "'Inter',sans-serif" }}>
                                  {curMethod.accountNo}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => copyToClipboard(curMethod.accountNo)}
                                style={{
                                  backgroundColor: copiedNumber ? "#DCFCE7" : "#F3F4F6",
                                  color: copiedNumber ? "#166534" : "#374151",
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6
                                }}
                              >
                                {copiedNumber ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copiedNumber ? t("কপি হয়েছে!", "Copied!") : t("নম্বর কপি করুন", "Copy Number")}</span>
                              </button>
                            </div>

                            <p style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.5, margin: "0 0 14px", fontFamily: "'Inter',sans-serif" }}>
                              {lang === "bn" ? curMethod.instructionsBn : curMethod.instructionsEn}
                            </p>

                            {/* Required Inputs for TrxID Verification */}
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                              <div>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 4, fontFamily: "'Inter',sans-serif" }}>
                                  {t("আপনার প্রেরক নম্বর / অ্যাকাউন্ট", "Your Sender Number")} <span style={{ color: "#DC2626" }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  style={inputStyle}
                                  placeholder={t("যে নম্বর থেকে পাঠিয়েছেন (01XXXXXXXXX)", "Sender Account (01XXXXXXXXX)")}
                                  value={mobileNumber}
                                  onChange={(e) => setMobileNumber(e.target.value)}
                                />
                              </div>

                              <div>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 4, fontFamily: "'Inter',sans-serif" }}>
                                  {t("ট্রানজেকশন আইডি (TrxID)", "Transaction ID (TrxID)")} <span style={{ color: "#DC2626" }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  style={inputStyle}
                                  placeholder={t("যেমন: 9B7H5X1KL9", "e.g. 9B7H5X1KL9")}
                                  value={transactionId}
                                  onChange={(e) => setTransactionId(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Proceed to Review / Confirm Order Action Button */}
                  <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      disabled={!isFormComplete}
                      onClick={() => setCurrentStep(1)}
                      style={{
                        backgroundColor: isFormComplete ? P : "#9CA3AF",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        padding: "14px 32px",
                        fontSize: 15,
                        fontWeight: 700,
                        fontFamily: "'Inter',sans-serif",
                        cursor: isFormComplete ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        width: isMobile ? "100%" : "auto",
                        boxShadow: isFormComplete ? "0 4px 14px rgba(45,90,39,0.25)" : "none",
                        transition: "all 0.15s"
                      }}
                    >
                      <span>{t("অর্ডার পর্যালোচনা ও নিশ্চিত করুন", "Review & Confirm Order")}</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* STEP 1: REVIEW & FINAL CONFIRMATION */
              <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: isMobile ? 18 : 26, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, borderBottom: "1px solid #F3F4F6", paddingBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: P, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, fontFamily: "'Inter',sans-serif" }}>
                    <Check size={16} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0, fontFamily: "'Inter',sans-serif" }}>
                      {t("অর্ডার পর্যালোচনা ও কনফার্মেশন", "Order Review & Confirmation")}
                    </h2>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>
                      {t("আপনার তথ্য চেক করে অর্ডার নিশ্চিত করুন", "Please verify your details before final placement")}
                    </span>
                  </div>
                </div>

                {/* Details Summary Card */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  
                  {/* Customer Information */}
                  <div style={{ backgroundColor: "#F9FAFB", borderRadius: 12, padding: 16, border: "1px solid #E5E7EB" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {t("গ্রাহক ও ডেলিভারি তথ্য", "Customer & Delivery Address")}
                    </span>
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontFamily: "'Inter',sans-serif" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6B7280" }}>{t("নাম:", "Name:")}</span>
                        <strong style={{ color: "#111827" }}>{form.fullName}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6B7280" }}>{t("ফোন:", "Phone:")}</span>
                        <strong style={{ color: "#111827" }}>+880 {form.phone}</strong>
                      </div>
                      {form.email && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#6B7280" }}>{t("ইমেইল:", "Email:")}</span>
                          <span style={{ color: "#111827" }}>{form.email}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6B7280" }}>{t("এরিয়া:", "Location:")}</span>
                        <span style={{ color: "#111827", fontWeight: 600 }}>
                          {form.deliveryZone === "dhaka" ? t("ঢাকা সিটি", "Inside Dhaka") : t("ঢাকার বাইরে", "Outside Dhaka")}
                        </span>
                      </div>
                      <div style={{ marginTop: 4, paddingTop: 6, borderTop: "1px dashed #E5E7EB" }}>
                        <span style={{ color: "#6B7280", fontSize: 11, display: "block" }}>{t("ঠিকানা:", "Address:")}</span>
                        <p style={{ margin: "2px 0 0", color: "#111827", fontWeight: 500, fontSize: 12, lineHeight: 1.4 }}>
                          {form.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div style={{ backgroundColor: "#F9FAFB", borderRadius: 12, padding: 16, border: "1px solid #E5E7EB" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {t("পেমেন্ট বিস্তারিত", "Payment Details")}
                    </span>
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8, fontSize: 13, fontFamily: "'Inter',sans-serif" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#6B7280" }}>{t("পদ্ধতি:", "Method:")}</span>
                        <strong style={{ color: P, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          {paymentType === "cod" ? t("ক্যাশ অন ডেলিভারি", "Cash on Delivery (COD)") : onlineMethodsConfig[onlineMethod]?.label}
                        </strong>
                      </div>

                      {paymentType === "online" && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#6B7280" }}>{t("প্রেরক নম্বর:", "Sender No:")}</span>
                            <strong style={{ color: "#111827" }}>{mobileNumber}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#6B7280" }}>TrxID:</span>
                            <span style={{ fontFamily: "monospace", fontWeight: 700, backgroundColor: "#E5E7EB", padding: "2px 6px", borderRadius: 4 }}>
                              {transactionId}
                            </span>
                          </div>
                        </>
                      )}

                      <div style={{ marginTop: 4, paddingTop: 6, borderTop: "1px dashed #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#111827", fontWeight: 700 }}>{t("পরিশোধযোগ্য মোট:", "Payable Total:")}</span>
                        <strong style={{ fontSize: 17, color: P }}>{formatPrice(total)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Banner if any */}
                {placementError && (
                  <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", color: "#DC2626", fontSize: 13, display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                    <AlertCircle size={18} />
                    <span>{placementError}</span>
                  </div>
                )}

                {/* Review Action Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <button
                    type="button"
                    disabled={isPlacing}
                    onClick={() => setCurrentStep(0)}
                    style={{
                      backgroundColor: "transparent",
                      color: "#4B5563",
                      border: "1px solid #D1D5DB",
                      borderRadius: 10,
                      padding: "12px 20px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: isPlacing ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>{t("তথ্য পরিবর্তন করুন", "Edit Details")}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isPlacing}
                    onClick={handlePlaceOrder}
                    style={{
                      backgroundColor: isPlacing ? "#9CA3AF" : P,
                      color: "#fff",
                      border: "none",
                      borderRadius: 12,
                      padding: "15px 36px",
                      fontSize: 15,
                      fontWeight: 800,
                      fontFamily: "'Inter',sans-serif",
                      cursor: isPlacing ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      boxShadow: isPlacing ? "none" : "0 4px 16px rgba(45,90,39,0.3)",
                      flex: isMobile ? 1 : "initial"
                    }}
                  >
                    {isPlacing ? (
                      <>
                        <RotateCcw size={18} className="animate-spin" />
                        <span>{t("অর্ডার প্রসেস হচ্ছে...", "Processing Order...")}</span>
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        <span>{t("অর্ডার কনফার্ম করুন", "Confirm & Place Order")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
          <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", overflow: "hidden", position: "sticky", top: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAFBF9" }}>
              <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: 17, fontWeight: 600, color: "#111827", margin: 0 }}>
                {t("অর্ডারের সারসংক্ষেপ", "Order Summary")}
              </h3>
              <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 700, backgroundColor: "#E5E7EB", padding: "2px 8px", borderRadius: 12 }}>
                {formatNum(items.length)} {t("টি পণ্য", "items")}
              </span>
            </div>

            {/* Items List */}
            <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 12, maxHeight: 260, overflowY: "auto" }}>
              {items.map((item) => {
                const name = getProductName(item.product, lang);
                return (
                  <div key={item.product.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, backgroundColor: "#F3F4F6", borderRadius: 8, padding: 4, flexShrink: 0 }}>
                      <img src={item.product.image} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontFamily: "'Inter',sans-serif", color: "#111827", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name}
                      </p>
                      <p style={{ fontSize: 11, color: "#6B7280", fontFamily: "'Inter',sans-serif", margin: "2px 0 0" }}>
                        {formatPrice(item.product.price)} × {formatNum(item.quantity)}
                      </p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "'Inter',sans-serif", color: "#111827", flexShrink: 0 }}>
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals Calculation */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: 10, backgroundColor: "#FAFBF9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4B5563" }}>
                <span>{t("উপমোট", "Subtotal")}</span>
                <span style={{ fontWeight: 600, color: "#111827" }}>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4B5563" }}>
                <span>{t("ডেলিভারি চার্জ", "Delivery Fee")}</span>
                <span style={{ fontWeight: 700, color: deliveryFree ? P : "#111827" }}>
                  {deliveryFree ? t("বিনামূল্যে (FREE)", "FREE") : formatPrice(deliveryCharge)}
                </span>
              </div>

              {!deliveryFree && (
                <div style={{ fontSize: 11, color: "#059669", backgroundColor: "#ECFDF5", padding: "6px 10px", borderRadius: 6 }}>
                  {t("৳১৫০০ টাকার কেনাকাটায় ফ্রি ডেলিভারি!", "Free delivery on orders over ৳1500!")}
                </div>
              )}

              <div style={{ height: 1, backgroundColor: "#E5E7EB", margin: "4px 0" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Noto Serif',serif", fontSize: 17, color: "#111827", fontWeight: 600 }}>
                  {t("সর্বমোট", "Grand Total")}
                </span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: P }}>
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Trust Footer */}
            <div style={{ padding: "12px 20px", backgroundColor: "#F3F4F6", borderTop: "1px solid #E5E7EB", fontSize: 11, color: "#6B7280", display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldCheck size={14} style={{ color: P }} />
              <span>{t("নিরাপদ পেমেন্ট ও খাঁটি পণ্যের নিশ্চয়তা", "100% Safe Checkout & Fresh Organic Harvest")}</span>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #D1D5DB",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 13,
  fontFamily: "'Inter',sans-serif",
  color: "#111827",
  backgroundColor: "#fff",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function OrderSuccess({ orderId, total, lang, t, formatPrice }: { orderId: string; total: number; lang: "bn" | "en"; t: (bn: string, en: string) => string; formatPrice: (p: number) => string }) {
  const [, navigate] = useLocation();
  const { isMobile } = useResponsive();

  return (
    <div style={{ backgroundColor: "#F9FAF8", minHeight: "100vh" }}>
      <Header />
      <div style={{ maxWidth: 580, margin: "40px auto 80px", padding: isMobile ? "0 20px" : "0 24px", textAlign: "center" }}>
        
        <div style={{
          width: 72,
          height: 72,
          backgroundColor: "#DCFCE7",
          color: P,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 8px 20px rgba(45,90,39,0.15)"
        }}>
          <CheckCircle2 size={42} />
        </div>

        <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: isMobile ? 24 : 32, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>
          {t("অর্ডার সফলভাবে নিশ্চিত হয়েছে!", "Order Confirmed Successfully!")}
        </h1>

        <p style={{ fontSize: 14, color: "#4B5563", fontFamily: "'Inter',sans-serif", lineHeight: 1.6, margin: "0 0 24px" }}>
          {t("ধন্যবাদ! আপনার অর্গানিক পণ্যের অর্ডারটি গৃহীত হয়েছে। শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।", "Thank you! Your order has been placed. Our representative will contact you shortly.")}
        </p>

        {/* Order Details Confirmation Card */}
        <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: "20px 24px", marginBottom: 24, textAlign: "left", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F3F4F6", fontSize: 13 }}>
            <span style={{ color: "#6B7280" }}>{t("অর্ডার রেফারেন্স নং", "Order Ref Number")}</span>
            <strong style={{ color: P, fontFamily: "'Inter',sans-serif" }}>#{orderId}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F3F4F6", fontSize: 13 }}>
            <span style={{ color: "#6B7280" }}>{t("মোট পরিশোধযোগ্য পরিমাণ", "Total Amount")}</span>
            <strong style={{ color: "#111827", fontSize: 15 }}>{formatPrice(total)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13 }}>
            <span style={{ color: "#6B7280" }}>{t("আনুমানিক ডেলিভারি সময়", "Estimated Delivery")}</span>
            <strong style={{ color: "#166534" }}>{t("২৪–৭২ ঘণ্টা", "24-72 Hours")}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => window.open(`/invoice/${orderId}`, "_blank")}
            style={{
              backgroundColor: "#fff",
              color: P,
              border: `2px solid ${P}`,
              borderRadius: 10,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Inter',sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s"
            }}
          >
            <span>{t("ইনভয়েস দেখুন ও প্রিন্ট করুন", "View & Print Official Invoice")}</span>
          </button>

          <button
            onClick={() => navigate(`/track?id=${orderId}`)}
            style={{
              backgroundColor: P,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "13px 24px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Inter',sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s"
            }}
          >
            <span>{t("লাইভ অর্ডার ট্র্যাকিং", "Track Your Order Live")}</span>
          </button>

          <button
            onClick={() => navigate("/")}
            style={{
              backgroundColor: "transparent",
              color: "#6B7280",
              border: "none",
              padding: "10px",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Inter',sans-serif",
              cursor: "pointer"
            }}
          >
            {t("আরও কেনাকাটা করুন", "Continue Shopping")}
          </button>
        </div>

      </div>
      <Footer />
    </div>
  );
}
