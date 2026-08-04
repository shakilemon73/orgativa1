import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { getProductName } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useResponsive } from "@/hooks/use-responsive";
import { submitOrder } from "@/lib/supabase-hooks";

const P = "#2D5A27";
const P_DARK = "#1a4016";
const P_LIGHT = "#F4F7F3";

const divisions = [
  { bn: "ঢাকা", en: "Dhaka" },
  { bn: "চট্টগ্রাম", en: "Chattogram" },
  { bn: "সিলেট", en: "Sylhet" },
  { bn: "রাজশাহী", en: "Rajshahi" },
  { bn: "খুলনা", en: "Khulna" },
  { bn: "বরিশাল", en: "Barishal" },
  { bn: "রংপুর", en: "Rangpur" },
  { bn: "ময়মনসিংহ", en: "Mymensingh" },
];

const districtsByDivision: Record<string, { bn: string; en: string }[]> = {
  "Dhaka": [
    { bn: "ঢাকা", en: "Dhaka" }, { bn: "গাজীপুর", en: "Gazipur" }, { bn: "নারায়ণগঞ্জ", en: "Narayanganj" },
    { bn: "নরসিংদী", en: "Narsingdi" }, { bn: "টাঙ্গাইল", en: "Tangail" }, { bn: "মুন্সীগঞ্জ", en: "Munshiganj" },
    { bn: "মানিকগঞ্জ", en: "Manikganj" }, { bn: "ফরিদপুর", en: "Faridpur" }
  ],
  "Chattogram": [
    { bn: "চট্টগ্রাম", en: "Chattogram" }, { bn: "কক্সবাজার", en: "Cox's Bazar" }, { bn: "কুমিল্লা", en: "Cumilla" },
    { bn: "ফেনী", en: "Feni" }, { bn: "নোয়াখালী", en: "Noakhali" }, { bn: "লক্ষ্মীপুর", en: "Lakshmipur" }, { bn: "চাঁদপুর", en: "Chandpur" }
  ],
  "Sylhet": [
    { bn: "সিলেট", en: "Sylhet" }, { bn: "মৌলভীবাজার", en: "Moulvibazar" }, { bn: "হবিগঞ্জ", en: "Habiganj" }, { bn: "সুনামগঞ্জ", en: "Sunamganj" }
  ],
  "Rajshahi": [
    { bn: "রাজশাহী", en: "Rajshahi" }, { bn: "বগুড়া", en: "Bogra" }, { bn: "জয়পুরহাট", en: "Joypurhat" },
    { bn: "নওগাঁ", en: "Naogaon" }, { bn: "নাটোর", en: "Natore" }, { bn: "নবাবগঞ্জ", en: "Nawabganj" },
    { bn: "পাবনা", en: "Pabna" }, { bn: "সিরাজগঞ্জ", en: "Sirajganj" }
  ],
  "Khulna": [
    { bn: "খুলনা", en: "Khulna" }, { bn: "বাগেরহাট", en: "Bagerhat" }, { bn: "চুয়াডাঙ্গা", en: "Chuadanga" },
    { bn: "যশোর", en: "Jashore" }, { bn: "ঝিনাইদহ", en: "Jhenaidah" }, { bn: "মাগুরা", en: "Magura" },
    { bn: "মেহেরপুর", en: "Meherpur" }, { bn: "নড়াইল", en: "Narail" }, { bn: "সাতক্ষীরা", en: "Satkhira" }
  ],
  "Barishal": [
    { bn: "বরিশাল", en: "Barishal" }, { bn: "বরগুনা", en: "Barguna" }, { bn: "ভোলা", en: "Bhola" },
    { bn: "ঝালকাঠি", en: "Jhalokati" }, { bn: "পটুয়াখালী", en: "Patuakhali" }, { bn: "পিরোজপুর", en: "Pirojpur" }
  ],
  "Rangpur": [
    { bn: "রংপুর", en: "Rangpur" }, { bn: "দিনাজপুর", en: "Dinajpur" }, { bn: "গাইবান্ধা", en: "Gaibandha" },
    { bn: "কুড়িগ্রাম", en: "Kurigram" }, { bn: "লালমনিরহাট", en: "Lalmonirhat" }, { bn: "নীলফামারী", en: "Nilphamari" },
    { bn: "পঞ্চগড়", en: "Panchagarh" }, { bn: "ঠাকুরগাঁও", en: "Thakurgaon" }
  ],
  "Mymensingh": [
    { bn: "ময়মনসিংহ", en: "Mymensingh" }, { bn: "জামালপুর", en: "Jamalpur" }, { bn: "নেত্রকোণা", en: "Netrokona" }, { bn: "শেরপুর", en: "Sherpur" }
  ],
};

type PayMethod = "bkash" | "nagad" | "rocket" | "cod" | "bank";

const DELIVERY_THRESHOLD = 1000;
const DELIVERY_CHARGE = 60;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { lang, t, formatPrice, formatNum } = useLanguage();

  const payMethods = [
    { id: "bkash" as PayMethod, label: "bKash", color: "#E2136E", icon: "account_balance_wallet", sub: t("মোবাইল ব্যাংকিং", "Mobile Banking") },
    { id: "nagad" as PayMethod, label: "Nagad", color: "#F7941D", icon: "account_balance_wallet", sub: t("মোবাইল ব্যাংকিং", "Mobile Banking") },
    { id: "rocket" as PayMethod, label: "Rocket", color: "#8B22A0", icon: "account_balance_wallet", sub: t("ডাচ-বাংলা মোবাইল", "DBBL Mobile") },
    { id: "cod" as PayMethod, label: t("ক্যাশ অন ডেলিভারি", "Cash on Delivery"), color: "#2D5A27", icon: "payments", sub: t("পণ্য পেয়ে পরিশোধ", "Pay upon delivery") },
    { id: "bank" as PayMethod, label: t("ব্যাংক ট্রান্সফার", "Bank Transfer"), color: "#1A3A5C", icon: "account_balance", sub: t("ব্র্যাক / ডাচ-বাংলা", "BRAC / DBBL") },
  ];

  const steps = [t("ডেলিভারি", "Delivery"), t("পেমেন্ট", "Payment"), t("পর্যালোচনা", "Review")];

  const [step, setStep] = useState(0);
  const [payMethod, setPayMethod] = useState<PayMethod>("bkash");
  const [mobileNumber, setMobileNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId] = useState(`ORG-${Math.floor(100000 + Math.random() * 900000)}`);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placementError, setPlacementError] = useState<string | null>(null);
  const { isMobile } = useResponsive();

  const deliveryFree = subtotal >= DELIVERY_THRESHOLD;
  const deliveryCharge = deliveryFree ? 0 : DELIVERY_CHARGE;
  const total = subtotal + deliveryCharge;
  const px = isMobile ? "16px" : "64px";

  const [form, setForm] = useState({
    fullName: "", phone: "", email: "",
    division: "Dhaka", district: "Dhaka",
    thana: "", address: "", postcode: "", notes: "",
  });
  function setF(key: string, val: string) { setForm((prev) => ({ ...prev, [key]: val })); }

  async function handlePlaceOrder() {
    try {
      setIsPlacing(true);
      setPlacementError(null);
      const res = await submitOrder({
        orderNumber: orderId,
        customerName: form.fullName,
        phone: form.phone,
        email: form.email || undefined,
        division: form.division,
        district: form.district,
        thana: form.thana,
        address: form.address,
        postcode: form.postcode || undefined,
        paymentMethod: payMethod,
        paymentNumber: mobileNumber || undefined,
        transactionId: transactionId || undefined,
        subtotal,
        deliveryFee: deliveryCharge,
        total,
        notes: form.notes || undefined,
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
      setPlacementError(err?.message || t("অর্ডার সফলভাবে সম্পন্ন করা যায়নি। দয়া করে আবার চেষ্টা করুন।", "Could not complete your order. Please try again."));
    } finally {
      setIsPlacing(false);
    }
  }

  if (orderPlaced) return <OrderSuccess orderId={orderId} total={total} lang={lang} t={t} formatPrice={formatPrice} />;

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

  return (
    <div style={{ backgroundColor: "#F9F9F9", minHeight: "100vh" }}>
      <Header />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: `${isMobile ? 24 : 40}px ${px} 80px` }}>
        <div style={{ marginBottom: 32 }}>
          <button onClick={() => navigate("/cart")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: P, fontSize: 13, fontFamily: "'Inter',sans-serif", marginBottom: 10 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            {t("ঝুড়িতে ফিরুন", "Back to Cart")}
          </button>
          <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: isMobile ? 28 : 40, fontWeight: 400, color: "#1A1C1C" }}>
            {t("চেকআউট", "Checkout")}
          </h1>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 36, maxWidth: isMobile ? "100%" : 400 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: i < step ? "pointer" : "default" }}
                onClick={() => i < step && setStep(i)}>
                <div style={{ width: isMobile ? 30 : 36, height: isMobile ? 30 : 36, borderRadius: "50%", backgroundColor: i <= step ? P : "#E8E8E8", color: i <= step ? "#fff" : "#737973", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>
                  {i < step ? <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span> : i + 1}
                </div>
                <span style={{ fontSize: isMobile ? 9 : 11, fontWeight: i === step ? 700 : 400, color: i <= step ? P : "#737973", fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 2, backgroundColor: i < step ? P : "#E8E8E8", margin: "0 6px", marginBottom: 20 }} />}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 360px", gap: 24, alignItems: "start" }}>
          <div>
            {step === 0 && <DeliveryStep form={form} setF={setF} onNext={() => setStep(1)} isMobile={isMobile} lang={lang} t={t} />}
            {step === 1 && (
              <PaymentStep payMethod={payMethod} setPayMethod={setPayMethod} payMethods={payMethods}
                mobileNumber={mobileNumber} setMobileNumber={setMobileNumber}
                transactionId={transactionId} setTransactionId={setTransactionId}
                onNext={() => setStep(2)} onBack={() => setStep(0)} total={total} isMobile={isMobile} t={t} formatPrice={formatPrice} />
            )}
            {step === 2 && (
              <ReviewStep 
                form={form} 
                payMethod={payMethod} 
                payMethods={payMethods} 
                onBack={() => setStep(1)} 
                onPlace={handlePlaceOrder} 
                isMobile={isMobile} 
                t={t}
                isPlacing={isPlacing}
                placementError={placementError}
              />
            )}
          </div>

          {/* Order summary sidebar */}
          <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E8E8E8", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #E8E8E8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: 18, fontWeight: 400, color: "#1A1C1C" }}>
                {t("অর্ডারের সারসংক্ষেপ", "Order Summary")}
              </h3>
              <span style={{ fontSize: 12, color: "#737973", fontFamily: "'Inter',sans-serif" }}>
                {formatNum(items.length)} {t("টি পণ্য", "items")}
              </span>
            </div>
            <div style={{ padding: "14px 22px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 240, overflowY: "auto" }}>
              {items.map((item) => {
                const name = getProductName(item.product, lang);
                return (
                  <div key={item.product.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, backgroundColor: "#F3F3F4", borderRadius: 8, padding: 5, flexShrink: 0 }}>
                      <img src={item.product.image} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontFamily: "'Inter',sans-serif", color: "#1A1C1C", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                      <p style={{ fontSize: 11, color: "#737973", fontFamily: "'Inter',sans-serif" }}>×{formatNum(item.quantity)}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Inter',sans-serif", color: "#1A1C1C", flexShrink: 0 }}>{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "14px 22px 22px", borderTop: "1px solid #E8E8E8", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#434843", fontFamily: "'Inter',sans-serif" }}>{t("উপমোট", "Subtotal")}</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#434843", fontFamily: "'Inter',sans-serif" }}>{t("ডেলিভারি", "Delivery Charge")}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: deliveryFree ? P : "#1A1C1C", fontFamily: "'Inter',sans-serif" }}>{deliveryFree ? t("বিনামূল্যে", "FREE") : formatPrice(deliveryCharge)}</span>
              </div>
              <div style={{ height: 1, backgroundColor: "#E8E8E8" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Noto Serif',serif", fontSize: 17, color: "#1A1C1C" }}>{t("মোট", "Total")}</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 700, color: "#1A1C1C" }}>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid #E8E8E8", overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "16px 22px", borderBottom: "1px solid #E8E8E8" }}>
        <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: 20, fontWeight: 400, color: "#1A1C1C" }}>{title}</h2>
      </div>
      <div style={{ padding: "22px" }}>{children}</div>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#434843", fontFamily: "'Inter',sans-serif" }}>
        {label}{required && <span style={{ color: "#D64545" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid #E8E8E8", borderRadius: 8,
  paddingTop: 11, paddingRight: 14, paddingBottom: 11, paddingLeft: 14,
  fontSize: 15, fontFamily: "'Inter',sans-serif", color: "#1A1C1C", backgroundColor: "#fff",
  outline: "none", transition: "border 0.2s", boxSizing: "border-box",
};

function DeliveryStep({ form, setF, onNext, isMobile, lang, t }: { form: any; setF: (k: string, v: string) => void; onNext: () => void; isMobile: boolean; lang: "bn" | "en"; t: (bn: string, en: string) => string }) {
  const currentDistricts = districtsByDivision[form.division] || [];
  const valid = form.fullName && form.phone && form.division && form.district && form.thana && form.address;
  const cols = isMobile ? "1fr" : "1fr 1fr";

  return (
    <>
      <Section title={t("যোগাযোগের তথ্য", "Contact Information")}>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 16 }}>
          <Field label={t("পূর্ণ নাম", "Full Name")} required>
            <input style={inputStyle} placeholder={t("আপনার পুরো নাম লিখুন", "Enter your full name")} value={form.fullName} onChange={(e) => setF("fullName", e.target.value)} onFocus={(e) => (e.target.style.borderColor = P)} onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")} />
          </Field>
          <Field label={t("মোবাইল নম্বর", "Mobile Number")} required>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#737973", fontFamily: "'Inter',sans-serif" }}>+880</span>
              <input style={{ ...inputStyle, paddingLeft: 56 }} placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setF("phone", e.target.value)} onFocus={(e) => (e.target.style.borderColor = P)} onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")} />
            </div>
          </Field>
          <Field label={t("ইমেইল (ঐচ্ছিক)", "Email (Optional)")}>
            <input style={inputStyle} type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setF("email", e.target.value)} onFocus={(e) => (e.target.style.borderColor = P)} onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")} />
          </Field>
        </div>
      </Section>
      <Section title={t("ডেলিভারি ঠিকানা", "Delivery Address")}>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 16 }}>
          <Field label={t("বিভাগ", "Division")} required>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.division}
              onChange={(e) => {
                const newDiv = e.target.value;
                setF("division", newDiv);
                const firstDist = districtsByDivision[newDiv]?.[0]?.en ?? "Dhaka";
                setF("district", firstDist);
              }}
              onFocus={(e) => (e.target.style.borderColor = P)} onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")}>
              {divisions.map((d) => <option key={d.en} value={d.en}>{lang === "en" ? d.en : d.bn}</option>)}
            </select>
          </Field>
          <Field label={t("জেলা", "District")} required>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.district} onChange={(e) => setF("district", e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = P)} onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")}>
              {currentDistricts.map((d) => <option key={d.en} value={d.en}>{lang === "en" ? d.en : d.bn}</option>)}
            </select>
          </Field>
          <Field label={t("থানা / উপজেলা", "Thana / Upazila")} required>
            <input style={inputStyle} placeholder={t("যেমন: গুলশান, ধানমন্ডি", "e.g. Gulshan, Dhanmondi")} value={form.thana} onChange={(e) => setF("thana", e.target.value)} onFocus={(e) => (e.target.style.borderColor = P)} onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")} />
          </Field>
          <Field label={t("পোস্টকোড", "Post Code")}>
            <input style={inputStyle} placeholder={t("যেমন: ১২১২", "e.g. 1212")} value={form.postcode} onChange={(e) => setF("postcode", e.target.value)} onFocus={(e) => (e.target.style.borderColor = P)} onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")} />
          </Field>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label={t("সম্পূর্ণ ঠিকানা", "Full Address")} required>
              <textarea style={{ ...inputStyle, resize: "none", height: 80 }} placeholder={t("বাড়ি/ফ্ল্যাট নং, রোড নং, এলাকা", "House/Flat No, Road No, Area")} value={form.address} onChange={(e) => setF("address", e.target.value)} onFocus={(e) => (e.target.style.borderColor = P)} onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")} />
            </Field>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label={t("অর্ডারের নোট", "Order Notes")}>
              <textarea style={{ ...inputStyle, resize: "none", height: 68 }} placeholder={t("বিশেষ ডেলিভারি নির্দেশনা? (ঐচ্ছিক)", "Special delivery instructions? (Optional)")} value={form.notes} onChange={(e) => setF("notes", e.target.value)} onFocus={(e) => (e.target.style.borderColor = P)} onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")} />
            </Field>
          </div>
        </div>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onNext} disabled={!valid}
            style={{ backgroundColor: valid ? P : "#C3C8C1", color: "#fff", border: "none", borderRadius: 10, padding: "13px 36px", fontSize: 14, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: valid ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 8, width: isMobile ? "100%" : "auto", justifyContent: "center" }}>
            {t("পেমেন্টে যান", "Proceed to Payment")}
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>
        </div>
      </Section>
    </>
  );
}

function PaymentStep({ payMethod, setPayMethod, payMethods, mobileNumber, setMobileNumber, transactionId, setTransactionId, onNext, onBack, total, isMobile, t, formatPrice }: any) {
  const needsMobile = ["bkash", "nagad", "rocket"].includes(payMethod);
  const valid = payMethod === "cod" || payMethod === "bank" || (mobileNumber.length >= 11 && transactionId.length >= 6);

  return (
    <Section title={t("পেমেন্ট পদ্ধতি", "Payment Method")}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {payMethods.map((m: any) => (
          <button key={m.id} onClick={() => setPayMethod(m.id)}
            style={{ border: payMethod === m.id ? `2px solid ${m.color}` : "2px solid #E8E8E8", borderRadius: 12, padding: "14px 18px", backgroundColor: payMethod === m.id ? `${m.color}08` : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: m.color }}>{m.icon}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: payMethod === m.id ? m.color : "#1A1C1C", fontFamily: "'Inter',sans-serif", margin: 0 }}>{m.label}</p>
              <p style={{ fontSize: 11, color: "#737973", fontFamily: "'Inter',sans-serif", margin: 0 }}>{m.sub}</p>
            </div>
            {payMethod === m.id && <span className="material-symbols-outlined fill" style={{ marginLeft: "auto", fontSize: 18, color: m.color, flexShrink: 0 }}>check_circle</span>}
          </button>
        ))}
      </div>

      {needsMobile && (
        <div style={{ backgroundColor: "#F9F9F9", borderRadius: 12, padding: 20, marginBottom: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ backgroundColor: "#fff3cd", borderRadius: 8, padding: "11px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#856404", flexShrink: 0, marginTop: 1 }}>info</span>
            <p style={{ fontSize: 12, color: "#856404", fontFamily: "'Inter',sans-serif", lineHeight: 1.5, margin: 0 }}>
              {t("নম্বরে ", "Send ")}<strong>{formatPrice(total)}</strong>{t(" পাঠান: ", " to: ")}<strong>01XXXXXXXXX</strong>{t("। তারপর নিচের তথ্য পূরণ করুন।", ". Then enter the transaction details below.")}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            <Field label={t("আপনার মোবাইল নম্বর", "Your Mobile Number")} required>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#737973", fontFamily: "'Inter',sans-serif" }}>+880</span>
                <input style={{ ...inputStyle, paddingLeft: 54 }} placeholder="01XXXXXXXXX" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} onFocus={(e) => (e.target.style.borderColor = P)} onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")} />
              </div>
            </Field>
            <Field label={t("ট্রানজেকশন আইডি", "Transaction ID")} required>
              <input style={inputStyle} placeholder={t("যেমন: 8B7D4G3KS9", "e.g. 8B7D4G3KS9")} value={transactionId} onChange={(e) => setTransactionId(e.target.value)} onFocus={(e) => (e.target.style.borderColor = P)} onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")} />
            </Field>
          </div>
        </div>
      )}
      {payMethod === "cod" && (
        <div style={{ backgroundColor: "#DFF2D8", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: P }}>payments</span>
          <p style={{ fontSize: 13, color: P, fontFamily: "'Inter',sans-serif", margin: 0 }}>
            {t("পণ্য পাওয়ার সময় ", "Pay ")}<strong>{formatPrice(total)}</strong>{t(" নগদে পরিশোধ করুন।", " in cash upon delivery.")}
          </p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #E8E8E8", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontFamily: "'Inter',sans-serif", cursor: "pointer", color: "#434843", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span> {t("পেছনে", "Back")}
        </button>
        <button onClick={onNext} disabled={!valid}
          style={{ backgroundColor: valid ? P : "#C3C8C1", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: valid ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          {t("অর্ডার পর্যালোচনা করুন", "Review Order")}
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
        </button>
      </div>
    </Section>
  );
}

function ReviewStep({ form, payMethod, payMethods, onBack, onPlace, isMobile, t, isPlacing, placementError }: { form: any; payMethod: PayMethod; payMethods: any[]; onBack: () => void; onPlace: () => void; isMobile: boolean; t: (bn: string, en: string) => string; isPlacing?: boolean; placementError?: string | null }) {
  const method = payMethods.find((m) => m.id === payMethod)!;
  return (
    <>
      <Section title={t("ডেলিভারির বিবরণ", "Delivery Details")}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: 14 }}>
          {[[t("নাম", "Name"), form.fullName], [t("ফোন", "Phone"), `+880 ${form.phone}`], [t("বিভাগ", "Division"), form.division], [t("জেলা", "District"), form.district], [t("থানা", "Thana"), form.thana], [t("পোস্টকোড", "Postcode"), form.postcode || "—"]].map(([k, v]) => (
            <div key={k as string}>
              <p style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#737973", letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif", marginBottom: 3 }}>{k as string}</p>
              <p style={{ fontSize: 14, color: "#1A1C1C", fontFamily: "'Inter',sans-serif" }}>{v as string}</p>
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#737973", letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif", marginBottom: 3 }}>{t("ঠিকানা", "Address")}</p>
            <p style={{ fontSize: 14, color: "#1A1C1C", fontFamily: "'Inter',sans-serif" }}>{form.address}</p>
          </div>
        </div>
      </Section>
      <Section title={t("পেমেন্ট", "Payment")}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: `${method.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: method.color }}>{method.icon}</span>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Inter',sans-serif", color: "#1A1C1C", margin: 0 }}>{method.label}</p>
            <p style={{ fontSize: 12, color: "#737973", fontFamily: "'Inter',sans-serif", margin: 0 }}>{method.sub}</p>
          </div>
        </div>
      </Section>

      {placementError && (
        <div style={{ 
          backgroundColor: "#FEF2F2", 
          border: "1px solid #FDE8E8", 
          borderRadius: 12, 
          padding: "14px 18px", 
          color: "#991B1B", 
          fontSize: 13, 
          fontFamily: "'Inter', sans-serif",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>error</span>
          <span>{placementError}</span>
        </div>
      )}

      <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1px solid #E8E8E8", padding: 22, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 12 }}>
        <button 
          onClick={onBack} 
          disabled={isPlacing}
          style={{ background: "none", border: "1px solid #E8E8E8", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontFamily: "'Inter',sans-serif", cursor: isPlacing ? "not-allowed" : "pointer", color: "#434843", display: "flex", alignItems: "center", gap: 6, justifyContent: "center", opacity: isPlacing ? 0.6 : 1 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span> {t("পেছনে", "Back")}
        </button>
        <button 
          onClick={onPlace}
          disabled={isPlacing}
          style={{ 
            backgroundColor: isPlacing ? "#A1A8A1" : P, 
            color: "#fff", 
            border: "none", 
            borderRadius: 10, 
            padding: "15px 36px", 
            fontSize: 15, 
            fontWeight: 700, 
            fontFamily: "'Inter',sans-serif", 
            cursor: isPlacing ? "not-allowed" : "pointer", 
            display: "flex", 
            alignItems: "center", 
            gap: 10, 
            boxShadow: isPlacing ? "none" : "0 4px 16px rgba(45,90,39,0.3)", 
            letterSpacing: "0.04em", 
            justifyContent: "center" 
          }}
        >
          {isPlacing ? (
            <>
              <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite", fontSize: 20 }}>sync</span>
              {t("অর্ডার প্রসেস হচ্ছে...", "Processing...")}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>lock</span>
              {t("নিরাপদে অর্ডার দিন", "Place Secure Order")}
            </>
          )}
        </button>
      </div>
    </>
  );
}

function OrderSuccess({ orderId, total, lang, t, formatPrice }: { orderId: string; total: number; lang: "bn" | "en"; t: (bn: string, en: string) => string; formatPrice: (p: number) => string }) {
  const [, navigate] = useLocation();
  const { isMobile } = useResponsive();
  return (
    <div style={{ backgroundColor: "#F9F9F9", minHeight: "100vh" }}>
      <Header />
      <div style={{ maxWidth: 600, margin: "60px auto", padding: isMobile ? "0 20px 60px" : "0 32px 80px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ width: 88, height: 88, backgroundColor: "#DFF2D8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="material-symbols-outlined fill" style={{ fontSize: 48, color: P }}>check_circle</span>
        </div>
        <div>
          <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: isMobile ? 28 : 36, fontWeight: 400, color: "#1A1C1C", marginBottom: 10 }}>
            {t("অর্ডার নিশ্চিত হয়েছে!", "Order Confirmed!")}
          </h1>
          <p style={{ fontSize: 15, color: "#434843", fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>
            {t("আপনার অর্ডারের জন্য ধন্যবাদ। শীঘ্রই আমরা প্রস্তুত করে শিপমেন্টের সময় জানাব।", "Thank you for your order. We are preparing your items and will notify you when shipped.")}
          </p>
        </div>
        <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E8E8E8", padding: "24px 32px", width: "100%" }}>
          {[[t("অর্ডার আইডি", "Order ID"), orderId], [t("পরিশোধিত পরিমাণ", "Total Amount"), formatPrice(total)], [t("আনুমানিক ডেলিভারি", "Estimated Delivery"), t("২–৪ কার্যদিবস", "2-4 Business Days")]].map(([k, v]) => (
            <div key={k as string} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F3F3F4" }}>
              <span style={{ fontSize: 14, color: "#737973", fontFamily: "'Inter',sans-serif" }}>{k as string}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1C1C", fontFamily: "'Inter',sans-serif" }}>{v as string}</span>
            </div>
          ))}
        </div>

        {/* Dynamic World-class Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <button onClick={() => window.open(`/invoice/${orderId}`, "_blank")}
            style={{ backgroundColor: "#ffffff", color: P, border: `2.5px solid ${P}`, borderRadius: 10, padding: "13px 36px", fontSize: 14, fontWeight: 700, fontFamily: "'Inter',sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P_LIGHT; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>receipt_long</span>
            {t("অফিসিয়াল ইনভয়েস দেখুন ও প্রিন্ট করুন", "View & Print Official Invoice")}
          </button>

          <button onClick={() => navigate(`/track?id=${orderId}`)}
            style={{ backgroundColor: P, color: "#ffffff", border: "none", borderRadius: 10, padding: "14px 36px", fontSize: 14, fontWeight: 700, fontFamily: "'Inter',sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P_DARK; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = P; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>gps_fixed</span>
            {t("লাইভ অর্ডার ট্র্যাকিং", "Live Order Tracking")}
          </button>

          <button onClick={() => navigate("/")}
            style={{ backgroundColor: "transparent", color: "#6B7280", border: "1px solid #D1D5DB", borderRadius: 10, padding: "11px 36px", fontSize: 14, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            {t("কেনাকাটা চালিয়ে যান", "Continue Shopping")}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
