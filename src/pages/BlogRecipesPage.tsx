import { useState, useEffect } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useResponsive } from "@/hooks/use-responsive";
import { getCMSData, BlogPost } from "@/lib/cms-store";
import { BookOpen, Search, Clock, User, ArrowRight, Tag, X, Share2, Sparkles, ChevronRight } from "lucide-react";

const P = "#2D5A27";

export default function BlogRecipesPage() {
  const { lang, t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const [posts, setPosts] = useState<BlogPost[]>(() => getCMSData().blog_posts);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    setPosts(getCMSData().blog_posts);
  }, []);

  const px = isMobile ? "16px" : isTablet ? "24px" : "48px";

  const categories = [
    { id: "all", labelBn: "সকল লেখা", labelEn: "All Articles" },
    { id: "purity", labelBn: "বিশুদ্ধতা পরীক্ষা", labelEn: "Purity Guide" },
    { id: "health", labelBn: "স্বাস্থ্য টিপস", labelEn: "Health & Nutrition" },
    { id: "recipes", labelBn: "অর্গানিক রেসিপি", labelEn: "Organic Recipes" },
  ];

  const filteredPosts = posts.filter(post => {
    const title = lang === "en" ? post.titleEn : post.titleBn;
    const summary = lang === "en" ? post.summaryEn : post.summaryBn;
    const matchesSearch = !searchQuery.trim() ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeCategory === "all") return true;
    if (activeCategory === "purity") return post.categoryEn.includes("Purity") || post.categoryBn.includes("বিশুদ্ধতা");
    if (activeCategory === "health") return post.categoryEn.includes("Health") || post.categoryBn.includes("স্বাস্থ্য");
    if (activeCategory === "recipes") return post.categoryEn.includes("Recipes") || post.categoryBn.includes("রেসিপি");
    return true;
  });

  const featuredPost = posts.find(p => p.featured) || posts[0];

  return (
    <div style={{ backgroundColor: "#F9FAF8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      {/* Header Banner */}
      <div style={{ backgroundColor: "#0D1F0B", color: "#fff", padding: isMobile ? "28px 0" : "44px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: `0 ${px}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14, fontFamily: "'Inter', sans-serif" }}>
            <Link href="/" style={{ color: "#9ACA94", textDecoration: "none" }}>{t("হোম", "Home")}</Link>
            <ChevronRight size={14} />
            <span style={{ color: "#fff" }}>{t("ব্লগ ও অর্গানিক রেসিপি", "Blog & Recipes")}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(45,90,39,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <BookOpen size={24} className="text-[#9ACA94]" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: isMobile ? 24 : 34, margin: 0, fontWeight: 400, color: "#fff" }}>
                {t("অর্গানিক ব্লগ ও হেলথ রেসিপি", "Organic Blog & Healthy Recipes")}
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontFamily: "'Inter', sans-serif" }}>
                {t("সুস্থ জীবনের জন্য খাঁটি খাদ্যাভ্যাস, মধু-ঘি পরীক্ষার উপায় ও পুষ্টিকর রেসিপি", "Tips, guides, and natural wellness recipes for a healthier family lifestyle")}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", maxWidth: 600 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("ব্লগ বা রেসিপি খুঁজুন (যেমন: মধু পরীক্ষা, চিয়া বীজ)...", "Search articles or recipes (e.g. honey test, chia smoothie)...")}
              style={{
                width: "100%",
                padding: "14px 20px 14px 48px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: 14,
                fontFamily: "'Inter', sans-serif",
                outline: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            />
            <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)" }} />
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: `${isMobile ? 28 : 48}px ${px}` }}>
        
        {/* Category Filter Pills */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
          {categories.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  backgroundColor: active ? P : "#fff",
                  color: active ? "#fff" : "#374151",
                  border: `1px solid ${active ? P : "#E5E7EB"}`,
                  borderRadius: 999,
                  padding: "9px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                  boxShadow: active ? "0 4px 12px rgba(45,90,39,0.2)" : "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.15s ease"
                }}
              >
                {lang === "en" ? cat.labelEn : cat.labelBn}
              </button>
            );
          })}
        </div>

        {/* Featured Post Card (if available and searching all) */}
        {!searchQuery && activeCategory === "all" && featuredPost && (
          <div
            onClick={() => setSelectedPost(featuredPost)}
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              border: "1px solid #E5E7EB",
              overflow: "hidden",
              marginBottom: 40,
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              cursor: "pointer"
            }}
          >
            <div style={{ height: isMobile ? 220 : "100%", position: "relative" }}>
              <img
                src={featuredPost.image}
                alt={featuredPost.titleEn}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <span style={{ position: "absolute", top: 16, left: 16, backgroundColor: P, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                <Sparkles size={12} />
                {t("বিশেষ ফিচারড লেখা", "FEATURED ARTICLE")}
              </span>
            </div>

            <div style={{ padding: isMobile ? 20 : 36, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: P, fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>
                {lang === "en" ? featuredPost.categoryEn : featuredPost.categoryBn}
              </span>
              <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: isMobile ? 20 : 26, margin: "0 0 12px", color: "#1F2937", lineHeight: 1.3 }}>
                {lang === "en" ? featuredPost.titleEn : featuredPost.titleBn}
              </h2>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, margin: "0 0 20px", fontFamily: "'Inter', sans-serif" }}>
                {lang === "en" ? featuredPost.summaryEn : featuredPost.summaryBn}
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #F3F4F6", paddingTop: 16, flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#9CA3AF", fontFamily: "'Inter', sans-serif" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <User size={14} />
                    {featuredPost.author}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={14} />
                    {featuredPost.readTime}
                  </span>
                </div>

                <span style={{ color: P, fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Inter', sans-serif" }}>
                  {t("সম্পূর্ণ পড়ুন", "Read Article")}
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Blog Post Grid */}
        {filteredPosts.length === 0 ? (
          <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: 48, textAlign: "center" }}>
            <BookOpen size={40} style={{ color: "#9CA3AF", margin: "0 auto 12px" }} />
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#1F2937", fontFamily: "'Inter', sans-serif" }}>
              {t("কোনো লেখা পাওয়া যায়নি", "No blog posts found")}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "#6B7280", fontFamily: "'Inter', sans-serif" }}>
              {t("অন্য কোনো ক্যাটাগরি বা শব্দ দিয়ে আবার খুঁজুন।", "Try searching another keyword or category.")}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3, 1fr)", gap: 24 }}>
            {filteredPosts.map((post) => {
              const title = lang === "en" ? post.titleEn : post.titleBn;
              const summary = lang === "en" ? post.summaryEn : post.summaryBn;
              const category = lang === "en" ? post.categoryEn : post.categoryBn;

              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 16,
                    border: "1px solid #E5E7EB",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ height: 180, overflow: "hidden", position: "relative" }}>
                    <img
                      src={post.image}
                      alt={title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <span style={{ position: "absolute", bottom: 12, left: 12, backgroundColor: "rgba(13,31,11,0.85)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, fontFamily: "'Inter', sans-serif" }}>
                      {category}
                    </span>
                  </div>

                  <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: 16, margin: "0 0 8px", color: "#1F2937", lineHeight: 1.4, fontWeight: 700 }}>
                        {title}
                      </h3>
                      <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5, margin: "0 0 16px", fontFamily: "'Inter', sans-serif", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {summary}
                      </p>
                    </div>

                    <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#9CA3AF", fontFamily: "'Inter', sans-serif" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={13} />
                        {post.readTime}
                      </span>
                      <span style={{ color: P, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                        {t("পড়ুন", "Read")}
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* READ POST FULL MODAL */}
      {selectedPost && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 12 : 24, overflowY: "auto" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 20, maxWidth: 750, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.25)", position: "relative" }}>
            
            {/* Header image in modal */}
            <div style={{ height: 260, position: "relative" }}>
              <img
                src={selectedPost.image}
                alt={selectedPost.titleEn}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                onClick={() => setSelectedPost(null)}
                style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: isMobile ? 20 : 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#6B7280", marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>
                <span style={{ backgroundColor: "#EAF4E8", color: P, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                  {lang === "en" ? selectedPost.categoryEn : selectedPost.categoryBn}
                </span>
                <span>•</span>
                <span>{selectedPost.date}</span>
                <span>•</span>
                <span>{selectedPost.readTime}</span>
              </div>

              <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: isMobile ? 22 : 30, color: "#1F2937", margin: "0 0 16px", lineHeight: 1.3 }}>
                {lang === "en" ? selectedPost.titleEn : selectedPost.titleBn}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 20, marginBottom: 24, borderBottom: "1px solid #F3F4F6", fontSize: 13, color: "#4B5563", fontFamily: "'Inter', sans-serif" }}>
                <User size={16} className="text-[#2D5A27]" />
                <span>{t("লেখক:", "Author:")} <strong>{selectedPost.author}</strong></span>
              </div>

              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                {lang === "en" ? selectedPost.contentEn : selectedPost.contentBn}
              </div>

              <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  onClick={() => setSelectedPost(null)}
                  style={{ backgroundColor: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
                >
                  {t("বন্ধ করুন", "Close")}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
