import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { useResponsive } from "@/hooks/use-responsive";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const P = "#2D5A27";
const P_DARK = "#1a4016";
const P_LIGHT = "#F4F7F3";

// Static demo orders with items for preview sandbox fidelity
const staticOrderItems: Record<string, any[]> = {
  "ORD-9821": [
    { product_name: "প্রিমিয়াম ক্যাশেও নাট (Premium Cashew Nuts)", quantity: 2, unit_price: 1200, total_price: 2400 },
    { product_name: "খাঁটি সুন্দরবনের মধু (Pure Sundarban Honey)", quantity: 1, unit_price: 1750, total_price: 1750 }
  ],
  "ORD-9820": [
    { product_name: "অর্গানিক বাসমতি চাল (Organic Basmati Rice)", quantity: 3, unit_price: 1000, total_price: 3000 }
  ],
  "ORD-9819": [
    { product_name: "ঘি - প্রিমিয়াম গ্রেড (Premium Ghee)", quantity: 2, unit_price: 2850, total_price: 5700 }
  ],
  "ORD-9818": [
    { product_name: "অর্গানিক হলুদ গুঁড়ো (Organic Turmeric)", quantity: 5, unit_price: 460, total_price: 2300 }
  ],
  "ORD-9817": [
    { product_name: "কালোজিরা তেল (Black Seed Oil)", quantity: 1, unit_price: 1750, total_price: 1750 }
  ]
};

const demoOrdersList: any[] = [
  { id: "101", order_number: "ORD-9821", customer_name: "রাফাত হোসেন", phone: "01712345678", email: "rafat@example.com", division: "Dhaka", district: "Dhaka", thana: "Dhanmondi", address: "রোড ৪, বাসা ১২", postcode: "1205", payment_method: "bkash", payment_number: "01712345678", transaction_id: "TRX9821BK", subtotal: 4150, delivery_fee: 100, total: 4250, status: "pending", notes: "জরুরি ডেলিভারি প্রয়োজন", created_at: new Date().toISOString() },
  { id: "102", order_number: "ORD-9820", customer_name: "সুমাইয়া বেগম", phone: "01812345679", email: "sumaiya@example.com", division: "Chattogram", district: "Chattogram", thana: "Panchlaish", address: "জিইসি মোড়", postcode: "4000", payment_method: "cod", payment_number: null, transaction_id: null, subtotal: 3000, delivery_fee: 100, total: 3100, status: "processing", notes: null, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "103", order_number: "ORD-9819", customer_name: "তানভীর আহমেদ", phone: "01912345680", email: null, division: "Rajshahi", district: "Rajshahi", thana: "Boalia", address: "সাহেব বাজার", postcode: "6000", payment_method: "nagad", payment_number: "01912345680", transaction_id: "NGD5512", subtotal: 5700, delivery_fee: 100, total: 5800, status: "shipped", notes: null, created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: "104", order_number: "ORD-9818", customer_name: "নাসরিন সুলতানা", phone: "01612345681", email: null, division: "Sylhet", district: "Sylhet", thana: "Zindabazar", address: "জেল রোড", postcode: "3100", payment_method: "bkash", payment_number: "01612345681", transaction_id: "BKS8819", subtotal: 2300, delivery_fee: 100, total: 2400, status: "delivered", notes: null, created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "105", order_number: "ORD-9817", customer_name: "মাহমুদুল হাসান", phone: "01512345682", email: null, division: "Khulna", district: "Khulna", thana: "Sonadanga", address: "বাসস্ট্যান্ড রোড", postcode: "9100", payment_method: "cod", payment_number: null, transaction_id: null, subtotal: 1750, delivery_fee: 100, total: 1850, status: "delivered", notes: null, created_at: new Date(Date.now() - 3600000 * 48).toISOString() },
];

// Helper to convert number to Bengali/English words
function numberToWords(num: number, lang: "bn" | "en"): string {
  if (lang === "bn") {
    // Basic representation for preview
    return `${num.toLocaleString("bn-BD")} টাকা মাত্র (Taka Only)`;
  }
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numStr = num.toString();
  if (numStr.length > 9) return 'overflow';
  const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  let str = '';
  str += n[1] != "00" ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
  str += n[2] != "00" ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
  str += n[3] != "00" ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
  str += n[4] != "0" ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
  str += n[5] != "00" ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) + 'Taka Only' : 'Taka Only';
  return str.trim();
}

export default function InvoicePage() {
  const [, params] = useRoute("/invoice/:orderNumber");
  const orderNumber = params?.orderNumber;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [pdfSettings, setPdfSettings] = useState<Record<string, string>>({
    invoice_title: "Orgativa",
    invoice_subtitle: "Premium Organic & Health Foods",
    invoice_accent_color: "#2D5A27",
    invoice_logo_url: "/assets/orgativa_logo.png",
    invoice_address: "Banani, Dhaka-1213 | Hotline: +880 1700-000000 | info@orgativa.com",
    invoice_terms: "ধন্যবাদ Orgativa এর সাথে থাকার জন্য! আমাদের পণ্য শতভাগ প্রাকৃতিক ও স্বাস্থ্যসম্মত। কোনো কারণে রিফান্ড বা এক্সচেঞ্জ করতে চাইলে পণ্য পাওয়ার ৭ দিনের মধ্যে অরিজিনাল ইনভয়েস সহ যোগাযোগ করুন।"
  });

  const P = pdfSettings.invoice_accent_color || "#2D5A27";
  const P_LIGHT = P.startsWith("#") ? `${P}12` : "#F4F7F3";
  const P_DARK = P;

  const { lang, t, formatPrice } = useLanguage();
  const [, navigate] = useLocation();

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const element = document.querySelector(".invoice-a4-container") as HTMLElement;
      if (!element) return;

      // Capture the element using html2canvas
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution for text sharpness
        useCORS: true, // Allow cross-origin images to render correctly
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      
      // Create pdf instance
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 210; // A4 standard width in mm
      const pageHeight = 297; // A4 standard height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Cover full page with precise image dimensions
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `invoice-${order?.order_number || "order"}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try printing to PDF instead.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!orderNumber) {
      setError("No order ID provided.");
      setLoading(false);
      return;
    }

    async function loadOrder() {
      const targetNum = orderNumber as string;
      try {
        setLoading(true);
        setError(null);

        if (supabase) {
          // Fetch site settings first to customize invoice PDF
          try {
            const { data: settingsData } = await supabase.from("site_settings").select("*");
            if (settingsData) {
              const mapped: Record<string, string> = {};
              settingsData.forEach((s) => {
                mapped[s.key] = s.value;
              });

              // Extract contact details
              const phone = mapped.contact_phone || mapped.site_phone || "";
              const email = mapped.contact_email || mapped.site_email || "";
              const address = mapped.contact_address || "";

              if (phone || email || address) {
                const parts = [];
                if (address) parts.push(address);
                if (phone) parts.push(`Hotline: ${phone}`);
                if (email) parts.push(email);
                if (!mapped.invoice_address || mapped.invoice_address.includes("1700-000000") || mapped.invoice_address.includes("info@orgativa.com")) {
                  mapped.invoice_address = parts.join(" | ");
                }
              }

              setPdfSettings((prev) => ({ ...prev, ...mapped }));
            }
          } catch (sErr) {
            console.warn("Failed to load custom invoice settings:", sErr);
          }

          // Fetch order with order_items
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetNum);
          let query = supabase
            .from("orders")
            .select(`
              *,
              order_items (*)
            `);

          if (isUuid) {
            query = query.or(`id.eq.${targetNum},order_number.eq.${targetNum}`);
          } else {
            query = query.eq("order_number", targetNum);
          }

          const { data, error: dbErr } = await query.maybeSingle();

          if (dbErr) {
            throw dbErr;
          }

          if (data) {
            setOrder(data);
          } else {
            // Check if matches demo order
            const foundDemo = demoOrdersList.find(o => o.order_number === targetNum || o.id === targetNum);
            if (foundDemo) {
              const items = staticOrderItems[foundDemo.order_number] || [
                { product_name: "প্রিমিয়াম অর্গানিক পণ্য (Premium Organic Product)", quantity: 1, unit_price: foundDemo.subtotal, total_price: foundDemo.subtotal }
              ];
              setOrder({
                ...foundDemo,
                order_items: items
              });
            } else {
              setError("Order not found.");
            }
          }
        } else {
          // Supabase not set, look up demo order
          const foundDemo = demoOrdersList.find(o => o.order_number === targetNum || o.id === targetNum);
          if (foundDemo) {
            const items = staticOrderItems[foundDemo.order_number] || [
              { product_name: "প্রিমিয়াম অর্গানিক পণ্য (Premium Organic Product)", quantity: 1, unit_price: foundDemo.subtotal, total_price: foundDemo.subtotal }
            ];
            setOrder({
              ...foundDemo,
              order_items: items
            });
          } else {
            setError("Order not found.");
          }
        }
      } catch (err: any) {
        console.error("Error loading invoice:", err);
        setError(t("অর্ডার ইনভয়েস খুঁজে পাওয়া যায়নি।", "Could not retrieve the specified invoice."));
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#FAFDF7" }}>
        <div style={{ width: 44, height: 44, border: `3px solid ${P_LIGHT}`, borderTop: `3px solid ${P}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 16 }} />
        <p style={{ fontSize: 15, color: "#6B7280", fontFamily: "'Inter', sans-serif" }}>{t("ইনভয়েস তৈরি হচ্ছে...", "Generating your world-class invoice...")}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#FAFDF7", padding: 24, textAlign: "center" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: "#EF4444", marginBottom: 16 }}>receipt_long</span>
        <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: 24, color: "#111827", margin: "0 0 8px" }}>{t("ইনভয়েস পাওয়া যায়নি", "Invoice Not Found")}</h2>
        <p style={{ fontSize: 14, color: "#6B7280", maxWidth: 400, marginBottom: 24, lineHeight: 1.5 }}>
          {error || t("অনুরোধকৃত অর্ডারের জন্য কোনো ইনভয়েস খুঁজে পাওয়া যায়নি। তথ্য সঠিকভাবে দিন।", "The requested order number could not be found in our systems.")}
        </p>
        <button
          onClick={() => navigate("/")}
          style={{ backgroundColor: P, color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          {t("হোমপেজে ফিরে যান", "Go to Homepage")}
        </button>
      </div>
    );
  }

  return (
    <div className="invoice-page-wrapper" style={{ backgroundColor: "#F3F5F2", minHeight: "100vh", padding: "40px 16px" }}>
      
      {/* Dynamic styles injected for A4 print layout */}
      <style>{`
        @media print {
          body, html {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-page-wrapper {
            background-color: #ffffff !important;
            padding: 0 !important;
            min-height: auto !important;
          }
          .no-print {
            display: none !important;
          }
          .invoice-a4-container {
            width: 210mm !important;
            height: 297mm !important;
            padding: 20mm !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            box-sizing: border-box;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* High-fidelity responsive action utility header bar */}
      <div className="no-print" style={{
        maxWidth: "210mm",
        margin: "0 auto 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: "16px 24px",
        borderRadius: 12,
        border: "1px solid #E5EBF0",
        boxShadow: "0 4px 12px rgba(13, 31, 11, 0.02)"
      }}>
        <button
          onClick={() => {
            // Attempt to go back to track or home
            window.history.length > 1 ? window.history.back() : navigate("/track");
          }}
          style={{
            background: "none",
            border: "none",
            color: "#6B7280",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          {t("পেছনে যান", "Go Back")}
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            style={{
              backgroundColor: downloading ? "#F3F4F6" : "#ffffff",
              color: downloading ? "#9CA3AF" : P,
              border: `2px solid ${P}`,
              borderRadius: 8,
              padding: "8px 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: downloading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              if (!downloading) {
                e.currentTarget.style.backgroundColor = P_LIGHT;
              }
            }}
            onMouseLeave={(e) => {
              if (!downloading) {
                e.currentTarget.style.backgroundColor = "#ffffff";
              }
            }}
          >
            {downloading ? (
              <>
                <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite", fontSize: 18 }}>sync</span>
                {t("ডাউনলোড হচ্ছে...", "Downloading...")}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                {t("পিডিএফ ডাউনলোড", "Download PDF")}
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            style={{
              backgroundColor: P,
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 10px rgba(45, 90, 39, 0.15)"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>print</span>
            {t("প্রিন্ট ইনভয়েস (A4)", "Print Invoice (A4)")}
          </button>
        </div>
      </div>

      {/* World-Class A4 Invoice Layout */}
      <div className="invoice-a4-container" style={{
        width: "100%",
        maxWidth: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        border: "1px solid #E5EBF0",
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(13, 31, 11, 0.04)",
        padding: "50px",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}>
        
        <div>
          {/* Top Banner and Watermark Brand Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `2px solid ${P}`, paddingBottom: 24, marginBottom: 32 }}>
            <div>
              {/* Brand Logo & Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <img 
                  src={pdfSettings.invoice_logo_url || "/assets/orgativa_logo.png"} 
                  alt="Logo" 
                  style={{ height: 48, width: "auto", objectFit: "contain", display: "block" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallbackEl = document.getElementById("invoice-fallback-logo");
                    if (fallbackEl) fallbackEl.style.display = "flex";
                  }}
                  referrerPolicy="no-referrer"
                />
                <div id="invoice-fallback-logo" style={{ display: "none", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: P, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ color: "#ffffff", fontSize: 20 }}>spa</span>
                  </div>
                  <span style={{ fontSize: 24, fontWeight: 700, color: P, letterSpacing: "0.05em", fontFamily: "'Noto Serif', serif" }}>
                    {pdfSettings.invoice_title || "Orgativa"}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 2px", fontFamily: "'Inter', sans-serif" }}>
                {pdfSettings.invoice_subtitle || t("অর্গানিক ও প্রিমিয়াম ফুড সাপ্লিমেন্ট", "Premium Organic & Health Foods")}
              </p>
              <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, fontFamily: "'Inter', sans-serif" }}>
                {pdfSettings.invoice_address}
              </p>
            </div>

            {/* Document details */}
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: P, display: "block", marginBottom: 4 }}>
                {t("ক্যাশ মেমো / ইনভয়েস", "OFFICIAL TAX INVOICE")}
              </span>
              <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: 26, fontWeight: 500, color: "#111827", margin: "0 0 10px", lineHeight: 1 }}>
                #{order.order_number}
              </h1>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
                <p style={{ fontSize: 11, color: "#4B5563", margin: 0 }}>
                  <strong>{t("তারিখ:", "Date:")}</strong> {new Date(order.created_at).toLocaleDateString(lang === "en" ? "en-US" : "bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                <p style={{ fontSize: 11, color: "#4B5563", margin: 0 }}>
                  <strong>{t("পদ্ধতি:", "Payment:")}</strong> <span style={{ textTransform: "uppercase" }}>{order.payment_method === "cod" ? t("ক্যাশ অন ডেলিভারি", "COD") : order.payment_method}</span>
                </p>
                {order.transaction_id && (
                  <p style={{ fontSize: 11, color: P, margin: 0 }}>
                    <strong>{t("ট্রানজেকশন:", "Txn ID:")}</strong> <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{order.transaction_id}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer / Billing & Shipping Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40, marginBottom: 36 }}>
            <div>
              <h3 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: P, borderBottom: `1px solid ${P}15`, paddingBottom: 6, marginBottom: 12 }}>
                {t("বিলিং ও ডেলিভারি বিবরণী", "BILL TO / RECIPIENT")}
              </h3>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>
                {order.customer_name}
              </p>
              <p style={{ fontSize: 13, color: "#4B5563", margin: "0 0 4px" }}>
                <strong>{t("মোবাইল নম্বর:", "Phone:")}</strong> {order.phone}
              </p>
              {order.email && (
                <p style={{ fontSize: 13, color: "#4B5563", margin: "0 0 4px" }}>
                  <strong>{t("ইমেইল:", "Email:")}</strong> {order.email}
                </p>
              )}
              <p style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.5, margin: 0 }}>
                <strong>{t("ঠিকানা:", "Address:")}</strong> {order.address}, {order.thana}, {order.district}, {order.division} {order.postcode ? ` - ${order.postcode}` : ""}
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: P, borderBottom: `1px solid ${P}15`, paddingBottom: 6, marginBottom: 12 }}>
                {t("অর্ডার স্ট্যাটাস", "FULFILLMENT STATUS")}
              </h3>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: order.status === "cancelled" ? "#FEF2F2" : order.status === "delivered" ? "#DCFCE7" : "#FFFBEB",
                  color: order.status === "cancelled" ? "#991B1B" : order.status === "delivered" ? "#166534" : "#92400E",
                  padding: "4px 10px",
                  borderRadius: 6,
                  textTransform: "uppercase"
                }}>
                  {order.status === "pending" ? t("পর্যালোচনা করা হচ্ছে", "Pending Review") :
                   order.status === "processing" ? t("প্রক্রিয়াকরণ হচ্ছে", "Processing") :
                   order.status === "shipped" ? t("শিপ করা হয়েছে", "Shipped") :
                   order.status === "delivered" ? t("ডেলিভারি হয়েছে", "Delivered") :
                   order.status === "cancelled" ? t("বাতিল", "Cancelled") : order.status}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                {t("আমাদের যেকোনো পণ্য সম্পর্কে জানতে বা আপনার ইনভয়েস সংশোধন করতে হেল্পলাইনে সরাসরি ফোন করতে পারেন।", "Need modifications to your shipping details? Contact our 24/7 client concierge.")}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
            <thead>
              <tr style={{ backgroundColor: P, color: "#ffffff" }}>
                <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, textTransform: "uppercase", fontWeight: 700, borderRadius: "6px 0 0 6px" }}>#</th>
                <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, textTransform: "uppercase", fontWeight: 700 }}>{t("পণ্যের নাম", "Product Description")}</th>
                <th style={{ textAlign: "right", padding: "10px 14px", fontSize: 11, textTransform: "uppercase", fontWeight: 700 }}>{t("মূল্য", "Unit Price")}</th>
                <th style={{ textAlign: "center", padding: "10px 14px", fontSize: 11, textTransform: "uppercase", fontWeight: 700 }}>{t("পরিমাণ", "Qty")}</th>
                <th style={{ textAlign: "right", padding: "10px 14px", fontSize: 11, textTransform: "uppercase", fontWeight: 700, borderRadius: "0 6px 6px 0" }}>{t("মোট", "Total")}</th>
              </tr>
            </thead>
            <tbody>
              {(order.order_items || []).map((item: any, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid #E5E7EB" }}>
                  <td style={{ padding: "14px", fontSize: 13, color: "#4B5563" }}>{i + 1}</td>
                  <td style={{ padding: "14px", fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.product_name}</td>
                  <td style={{ padding: "14px", fontSize: 13, color: "#4B5563", textAlign: "right" }}>{formatPrice(item.unit_price)}</td>
                  <td style={{ padding: "14px", fontSize: 13, color: "#111827", textAlign: "center", fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ padding: "14px", fontSize: 13, fontWeight: 700, color: "#111827", textAlign: "right" }}>{formatPrice(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Split Calculations Block */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40, alignItems: "start", marginBottom: 32 }}>
            {/* Amount In Words Block */}
            <div style={{ backgroundColor: P_LIGHT, borderRadius: 10, padding: 16 }}>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: P, display: "block", marginBottom: 6 }}>
                {t("কথায় মোট মূল্য", "AMOUNT IN WORDS")}
              </span>
              <p style={{ fontSize: 13, fontWeight: 700, color: P_DARK, margin: 0, textTransform: "capitalize" }}>
                {numberToWords(order.total, lang)}
              </p>
              {order.notes && (
                <div style={{ marginTop: 14, borderTop: "1px dashed #D1E3CF", paddingTop: 10 }}>
                  <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 4 }}>
                    {t("বিশেষ নির্দেশাবলী:", "DELIVERY NOTES:")}
                  </span>
                  <p style={{ fontSize: 11, color: "#4B5563", margin: 0, fontStyle: "italic" }}>
                    {order.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4B5563" }}>
                <span>{t("উপমোট (Subtotal)", "Subtotal")}</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4B5563" }}>
                <span>{t("ডেলিভারি চার্জ (Delivery Fee)", "Delivery Fee")}</span>
                <span>{order.delivery_fee === 0 ? t("বিনামূল্যে", "Free") : formatPrice(order.delivery_fee)}</span>
              </div>
              <div style={{ height: 1, backgroundColor: "#E5E7EB", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "#111827" }}>
                <span style={{ fontFamily: "'Noto Serif', serif" }}>{t("সর্বমোট পরিশোধযোগ্য", "GRAND TOTAL")}</span>
                <span style={{ color: P, fontSize: 18 }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer block (Perfect Stamp / Signature / Terms Alignment) */}
        <div>
          {/* Signatures */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40, borderTop: "1px dashed #E5E7EB", paddingTop: 30 }}>
            <div>
              <p style={{ fontSize: 11, color: "#6B7280", margin: "0 0 4px", fontFamily: "'Inter', sans-serif" }}>
                {t("অর্ডারটি অনলাইনের মাধ্যমে তৈরি করা হয়েছে।", "This is a computer generated invoice.")}
              </p>
              <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
                {t("কোনো স্বাক্ষরের প্রয়োজন নেই।", "No physical signature required.")}
              </p>
            </div>
            
            <div style={{ textAlign: "center", minWidth: 160 }}>
              <div style={{ width: 64, height: 64, border: `2px dashed ${P}`, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: 0.4, transform: "rotate(-12deg)", marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: P, fontWeight: 700, textTransform: "uppercase" }}>{pdfSettings.invoice_title || "ORGATIVA"}</span>
              </div>
              <div style={{ width: "100%", height: 1, backgroundColor: "#D1D5DB", marginBottom: 6 }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", margin: 0 }}>
                {t("অনুমোদিত কর্মকর্তা", "Authorized Signature")}
              </p>
            </div>
          </div>

          {/* Legal Notice Terms */}
          <div style={{ textAlign: "center", marginTop: 40, borderTop: "1px solid #F3F4F6", paddingTop: 16 }}>
            <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, lineHeight: 1.5 }}>
              {pdfSettings.invoice_terms}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
