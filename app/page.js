"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";

export default function Home() {
  const router = useRouter();
  const { lang, t, toggleLanguage } = useLanguage();
  const content = t;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [scrolled, setScrolled] = useState(false);

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);

  // ── Category filter state ────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState(null); // null = show all

  const isAr = lang === "ar";
  const arabicFont = "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishFont = "'DM Mono', monospace";
  const arabicDisplay = "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishDisplay = "'Fraunces', serif";
  const bodyFont = isAr ? arabicFont : englishFont;
  const displayFont = isAr ? arabicDisplay : englishDisplay;

  const categories = [
    { key: "beachfront", icon: "🏖️", label: isAr ? "شاطئ"  : "Beachfront" },
    { key: "mountain",   icon: "🏔️", label: isAr ? "جبال"  : "Mountain"   },
    { key: "city",       icon: "🏙️", label: isAr ? "مدينة" : "City"       },
    { key: "countryside",icon: "🏡", label: isAr ? "ريفي"  : "Countryside" },
    { key: "pool",       icon: "🏊", label: isAr ? "مسبح"  : "Pool"       },
    { key: "desert",     icon: "🏜️", label: isAr ? "صحراء" : "Desert"     },
    { key: "camping",    icon: "🏕️", label: isAr ? "تخييم" : "Camping"    },
    { key: "cabins",     icon: "🛖", label: isAr ? "كوخ"   : "Cabins"     },
  ];

  // ── Filter listings by active category ──────────────────────────────────
  // Matches against listing.category, listing.type, listing.tags, or title (fallback)
  const filteredListings = activeCategory
    ? listings.filter((l) => {
        const haystack = [
          l.category,
          l.type,
          l.propertyType,
          ...(Array.isArray(l.tags) ? l.tags : []),
          l.title,
          l.description,
        ]
          .filter(Boolean)
          .map((s) => s.toLowerCase());

        return haystack.some((s) => s.includes(activeCategory.toLowerCase()));
      })
    : listings;

  const handleCategoryClick = (key) => {
    // Clicking the same category deselects it (shows all)
    setActiveCategory((prev) => (prev === key ? null : key));
  };

  // ── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => { setYear(new Date().getFullYear()); }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUserType(data.user?.role || "user");
        } else {
          setIsLoggedIn(false);
          setUserType(null);
        }
      } catch {
        setIsLoggedIn(false);
        setUserType(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => { getUserLocation(); }, []);

  // ── Location + fetch ─────────────────────────────────────────────────────
  const getUserLocation = () => {
    setListingsLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError(isAr ? "متصفحك لا يدعم تحديد الموقع" : "Your browser doesn't support geolocation");
      setListingsLoading(false);
      fetchAllListings();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationPermission(true);
        await fetchNearbyListings(latitude, longitude);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocationError(
          err.code === 1
            ? (isAr ? "الرجاء السماح بالوصول إلى الموقع" : "Please allow location access")
            : (isAr ? "تعذر الحصول على موقعك" : "Unable to get your location")
        );
        setListingsLoading(false);
        fetchAllListings();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fetchNearbyListings = async (lat, lng) => {
    try {
      setListingsLoading(true);
      const res = await fetch(`/api/listings/nearby?lat=${lat}&lng=${lng}&radius=50&limit=12`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = res.headers.get("content-type");
      if (!ct?.includes("application/json")) throw new Error("Not JSON");
      const data = await res.json();
      if (data.success && data.listings?.length > 0) {
        setListings(data.listings);
      } else {
        await fetchAllListings();
      }
    } catch (e) {
      console.error(e);
      await fetchAllListings();
    } finally {
      setListingsLoading(false);
    }
  };

  const fetchAllListings = async () => {
    try {
      const res = await fetch("/api/listings");
      const data = await res.json();
      if (data.listings) setListings(data.listings);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDashboardRedirect = () =>
    router.push(userType === "host" ? "/host-dashboard" : "/dashboard");

  const getCardColor = (i) =>
    ["#f4e4c1", "#d4e8f4", "#e4d4f4", "#d4f4e4", "#f4d4e4", "#e4f4d4"][i % 6];

  // ── Active category label (for section heading) ──────────────────────────
  const activeCatLabel = categories.find((c) => c.key === activeCategory)?.label;

  // ── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2.5px solid #e8c547", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700&family=Almarai:wght@300;400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Mono:wght@300;400;500&display=swap");
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ${bodyFont}; background: #fff; color: #222; -webkit-font-smoothing: antialiased; }
        .display { font-family: ${displayFont}; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        /* NAV */
        .mrh-nav { position: sticky; top: 0; z-index: 100; background: ${scrolled ? "rgba(255,255,255,0.98)" : "#fff"}; border-bottom: 1px solid ${scrolled ? "#e5e5e5" : "transparent"}; transition: border-color 0.2s, box-shadow 0.2s; box-shadow: ${scrolled ? "0 1px 12px rgba(0,0,0,0.08)" : "none"}; }
        .mrh-nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; height: 80px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .mrh-lang-btn { background: none; border: none; padding: 8px 12px; border-radius: 24px; font-size: 13px; cursor: pointer; color: #222; font-family: ${bodyFont}; font-weight: 500; transition: background 0.15s; }
        .mrh-lang-btn:hover { background: #f7f7f7; }
        .mrh-user-btn { display: flex; align-items: center; gap: 8px; border: 1.5px solid #ddd; border-radius: 24px; padding: 6px 8px 6px 14px; background: #fff; cursor: pointer; font-family: ${bodyFont}; font-size: 13px; color: #222; font-weight: 500; transition: box-shadow 0.15s; }
        .mrh-user-btn:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
        .mrh-avatar { width: 30px; height: 30px; border-radius: 50%; background: #1a1a2e; display: flex; align-items: center; justify-content: center; }
        .location-btn { background: #f0f0f0; border: none; border-radius: 40px; padding: 8px 16px; font-size: 13px; font-family: ${bodyFont}; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.15s; }
        .location-btn:hover { background: #e5e5e5; }
        .location-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .location-badge { background: #e8c54720; border-radius: 20px; padding: 6px 12px; font-size: 12px; color: #b8960f; display: inline-flex; align-items: center; gap: 6px; }

        /* HERO */
        .mrh-hero { position: relative; min-height: 580px; display: flex; align-items: center; overflow: hidden; background: linear-gradient(135deg, #1a1a2e 0%, #2d2d5e 40%, #1a1a2e 100%); }
        .mrh-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 20% 50%, rgba(232,197,71,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(55,138,221,0.1) 0%, transparent 50%); }
        .mrh-hero-pattern { position: absolute; inset: 0; opacity: 0.04; background-image: repeating-linear-gradient(45deg, #e8c547 0px, #e8c547 1px, transparent 1px, transparent 40px); }
        .mrh-hero-inner { position: relative; max-width: 1280px; margin: 0 auto; padding: 80px 24px; width: 100%; }
        .mrh-hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(232,197,71,0.15); border: 1px solid rgba(232,197,71,0.3); color: #e8c547; padding: 6px 14px; border-radius: 20px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; }
        .mrh-hero-title { font-family: ${displayFont}; font-style: ${isAr ? "normal" : "italic"}; font-weight: 300; font-size: clamp(40px,6vw,72px); color: #fff; line-height: 1.1; max-width: 640px; margin-bottom: 20px; }
        .mrh-hero-title em { font-style: normal; color: #e8c547; }
        .mrh-hero-sub { font-size: 16px; color: rgba(255,255,255,0.6); max-width: 480px; line-height: 1.75; margin-bottom: 36px; }
        .mrh-hero-cta { display: inline-flex; align-items: center; gap: 8px; background: #e8c547; color: #1a1a2e; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; font-family: ${bodyFont}; transition: background 0.15s, transform 0.15s; }
        .mrh-hero-cta:hover { background: #d4b03c; transform: translateY(-1px); }
        .mrh-hero-cta-ghost { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); color: #fff; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 500; text-decoration: none; font-family: ${bodyFont}; border: 1px solid rgba(255,255,255,0.2); transition: background 0.15s; }
        .mrh-hero-cta-ghost:hover { background: rgba(255,255,255,0.15); }

        /* CATEGORIES */
        .mrh-cats { max-width: 1280px; margin: 0 auto; padding: 32px 24px 0; }
        .mrh-cats-scroll { display: flex; gap: 32px; overflow-x: auto; padding-bottom: 16px; scrollbar-width: none; }
        .mrh-cats-scroll::-webkit-scrollbar { display: none; }
        .mrh-cat-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; flex-shrink: 0; padding-bottom: 8px; border-bottom: 2px solid transparent; transition: border-color 0.15s, opacity 0.15s; opacity: 0.5; }
        .mrh-cat-item:hover { opacity: 0.8; }
        .mrh-cat-item.active { opacity: 1; border-bottom-color: #e8c547; }
        .mrh-cat-icon { font-size: 24px; }
        .mrh-cat-label { font-size: 12px; font-weight: 500; white-space: nowrap; color: #222; }

        /* LISTINGS */
        .mrh-section { max-width: 1280px; margin: 0 auto; padding: 40px 24px; }
        .mrh-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .mrh-section-title { font-family: ${displayFont}; font-style: ${isAr ? "normal" : "italic"}; font-weight: 300; font-size: clamp(22px,3vw,30px); color: #222; }
        .mrh-see-all { font-size: 14px; font-weight: 600; color: #222; text-decoration: underline; cursor: pointer; font-family: ${bodyFont}; }
        .mrh-listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }

        /* Empty category state */
        .mrh-empty { text-align: center; padding: 60px 24px; background: #f9f9f9; border-radius: 16px; animation: fadeIn 0.3s ease both; }
        .mrh-empty-icon { font-size: 52px; margin-bottom: 16px; }
        .mrh-empty-text { color: #666; font-size: 14px; margin-bottom: 16px; }
        .mrh-empty-clear { background: none; border: none; color: #e8c547; cursor: pointer; font-size: 13px; font-family: ${bodyFont}; text-decoration: underline; }

        /* Cards */
        .mrh-card { cursor: pointer; border-radius: 16px; overflow: hidden; transition: transform 0.2s; animation: fadeIn 0.3s ease both; }
        .mrh-card:hover { transform: translateY(-4px); }
        .mrh-card-img { width: 100%; aspect-ratio: 4/3; border-radius: 16px; overflow: hidden; position: relative; margin-bottom: 12px; }
        .mrh-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .mrh-card-img-inner { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 56px; }
        .mrh-card-fav { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; }
        .mrh-card-fav:hover { background: #fff; }
        .mrh-card-badge { position: absolute; top: 12px; left: 12px; background: #fff; color: #222; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 600; }
        .distance-badge { position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.7); color: #fff; border-radius: 20px; padding: 4px 10px; font-size: 11px; font-weight: 500; }
        .mrh-card-body { padding: 0 4px; }
        .mrh-card-row1 { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
        .mrh-card-city { font-weight: 600; font-size: 14px; color: #222; }
        .mrh-card-rating { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 500; }
        .mrh-card-type { font-size: 13px; color: #717171; margin-bottom: 4px; }
        .mrh-card-price { font-size: 14px; color: #222; }
        .mrh-card-price strong { font-weight: 700; }
        .listing-loading { min-height: 400px; display: flex; align-items: center; justify-content: center; }

        /* STATS */
        .mrh-stats { background: #1a1a2e; margin: 40px 0; padding: 48px 24px; }
        .mrh-stats-inner { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; text-align: center; }
        .mrh-stat-val { font-family: ${displayFont}; font-style: ${isAr ? "normal" : "italic"}; font-weight: 300; font-size: 44px; color: #fff; line-height: 1; margin-bottom: 6px; }
        .mrh-stat-val span { color: #e8c547; }
        .mrh-stat-label { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.4); }

        /* PATH CARDS */
        .mrh-path-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap: 20px; }
        .mrh-path-card { border-radius: 20px; padding: 36px; position: relative; overflow: hidden; min-height: 340px; display: flex; flex-direction: column; justify-content: flex-end; }
        .mrh-path-traveler { background: linear-gradient(160deg,#e6f3ff 0%,#cce4ff 100%); }
        .mrh-path-host { background: linear-gradient(160deg,#1a1a2e 0%,#2d2d5e 100%); }
        .mrh-path-emoji { font-size: 52px; position: absolute; top: 28px; right: ${isAr ? "auto" : "28px"}; left: ${isAr ? "28px" : "auto"}; }
        .mrh-path-tag { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 12px; }
        .mrh-path-heading { font-family: ${displayFont}; font-style: ${isAr ? "normal" : "italic"}; font-weight: 300; font-size: 26px; line-height: 1.2; margin-bottom: 12px; }
        .mrh-path-desc { font-size: 13px; line-height: 1.7; margin-bottom: 20px; }
        .mrh-path-perks { list-style: none; margin-bottom: 24px; display: flex; flex-direction: column; gap: 8px; }
        .mrh-path-perk { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .mrh-path-check { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mrh-path-link { display: inline-flex; align-items: center; gap: 6px; padding: 11px 22px; border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none; font-family: ${bodyFont}; transition: opacity 0.15s; }
        .mrh-path-link:hover { opacity: 0.85; }

        /* REVIEWS */
        .mrh-reviews-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 20px; }
        .mrh-review { background: #f7f7f7; border-radius: 16px; padding: 24px; transition: box-shadow 0.2s; }
        .mrh-review:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }

        /* CTA */
        .mrh-cta-box { background: linear-gradient(135deg,#1a1a2e 0%,#2d2d5e 100%); border-radius: 24px; padding: 64px 48px; text-align: center; position: relative; overflow: hidden; }
        .mrh-cta-box::before { content: ""; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%,rgba(232,197,71,0.2) 0%,transparent 60%); }

        /* FOOTER */
        .mrh-footer { background: #111; padding: 48px 24px 28px; }
        .mrh-footer-inner { max-width: 1280px; margin: 0 auto; }
        .mrh-footer-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: 32px; margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid #222; }
        .mrh-footer-col-title { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #555; margin-bottom: 16px; font-weight: 600; }
        .mrh-footer-link { display: block; font-size: 13px; color: #999; text-decoration: none; margin-bottom: 10px; transition: color 0.15s; }
        .mrh-footer-link:hover { color: #e8c547; }
        .mrh-footer-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .mrh-footer-copy { font-size: 12px; color: #444; }
        .mrh-footer-legal { display: flex; gap: 20px; }

        @media (max-width: 768px) {
          .mrh-stats-inner { grid-template-columns: repeat(3,1fr); gap: 12px; }
          .mrh-stat-val { font-size: 28px; }
          .mrh-cta-box { padding: 40px 24px; }
          .mrh-nav-inner { height: 64px; }
        }
        @media (max-width: 480px) {
          .mrh-stats-inner { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ direction: isAr ? "rtl" : "ltr", background: "#fff", minHeight: "100vh" }}>

        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <nav className="mrh-nav">
          <div className="mrh-nav-inner">
            <Link href="/" style={{ textDecoration: "none", fontFamily: "'Cairo','Tajawal',sans-serif", fontWeight: 500, fontSize: "26px", color: "#1a1a2e", letterSpacing: "1px" }}>
              مر<span style={{ fontWeight: 700, color: "#e8c547" }}>حبا</span>
            </Link>

            <button className="location-btn" onClick={getUserLocation} disabled={listingsLoading}>
              <span>📍</span>
              {listingsLoading
                ? (isAr ? "جاري التحميل..." : "Loading...")
                : locationPermission
                  ? (isAr ? "قريب منك" : "Near you")
                  : (isAr ? "أظهر القريب مني" : "Show near me")}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <button className="mrh-lang-btn" onClick={toggleLanguage}>
                {isAr ? "🇬🇧 English" : "🇸🇦 عربي"}
              </button>
              {isLoggedIn ? (
                <button className="mrh-user-btn" onClick={handleDashboardRedirect}>
                  {isAr ? "لوحة التحكم" : content.dashboard}
                  <div className="mrh-avatar">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="6" r="3" fill="#e8c547" />
                      <path d="M2 14c0-3.31 2.69-5 6-5s6 1.69 6 5" stroke="#e8c547" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </button>
              ) : (
                <>
                  <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: "#222", textDecoration: "none", padding: "8px 12px", borderRadius: 24, transition: "background 0.15s" }}>
                    {content.signIn}
                  </Link>
                  <Link href="/signup" style={{ background: "#1a1a2e", color: "#e8c547", padding: "10px 18px", borderRadius: 24, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                    {content.getStarted}
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="mrh-hero">
          <div className="mrh-hero-bg" />
          <div className="mrh-hero-pattern" />
          <div className="mrh-hero-inner">
            <div className="mrh-hero-badge">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8c547", flexShrink: 0 }} />
              {content.heroBadge}
            </div>
            <h1 className="mrh-hero-title">
              {content.heroTitle1} {content.heroTitle2} <em>{content.heroTitle3}</em>
            </h1>
            <p className="mrh-hero-sub">{content.heroSubtitle}</p>
            {!isLoggedIn ? (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/signup" className="mrh-hero-cta">{content.createAccount} →</Link>
                <Link href="/login" className="mrh-hero-cta-ghost">{content.signIn}</Link>
              </div>
            ) : (
              <button className="mrh-hero-cta" onClick={handleDashboardRedirect} style={{ border: "none", cursor: "pointer" }}>
                {content.dashboard} →
              </button>
            )}
            <div style={{ display: "flex", gap: 28, marginTop: 40, flexWrap: "wrap" }}>
              {[content.verifiedHosts, content.securePayments, content.support247].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(232,197,71,0.2)", border: "1px solid rgba(232,197,71,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#e8c547" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ──────────────────────────────────────────────────── */}
        <div style={{ borderBottom: "1px solid #f0f0f0" }}>
          <div className="mrh-cats">
            <div className="mrh-cats-scroll">
              {categories.map((cat) => (
                <div
                  key={cat.key}
                  className={`mrh-cat-item${activeCategory === cat.key ? " active" : ""}`}
                  onClick={() => handleCategoryClick(cat.key)}
                  title={isAr ? `تصفية: ${cat.label}` : `Filter: ${cat.label}`}
                >
                  <span className="mrh-cat-icon">{cat.icon}</span>
                  <span className="mrh-cat-label">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── LISTINGS ────────────────────────────────────────────────────── */}
        <div className="mrh-section">
          <div className="mrh-section-header">
            <div>
              <h2 className="mrh-section-title display">
                {activeCategory
                  ? (isAr ? `أماكن: ${activeCatLabel}` : `${activeCatLabel} stays`)
                  : locationPermission
                    ? (isAr ? "أماكن قريبة منك" : "Places near you")
                    : (isAr ? "أماكن إقامة مميزة" : "Featured stays")}
              </h2>
              {/* Active filter pill */}
              {activeCategory && (
                <button
                  onClick={() => setActiveCategory(null)}
                  style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, background: "#1a1a2e", color: "#e8c547", border: "none", borderRadius: 20, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: bodyFont }}
                >
                  {categories.find(c => c.key === activeCategory)?.icon} {activeCatLabel}
                  <span style={{ opacity: 0.7, marginInlineStart: 2 }}>✕</span>
                </button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {locationError && (
                <div className="location-badge">
                  <span>📍</span> {locationError}
                </div>
              )}
              <Link href="/listings" className="mrh-see-all">
                {isAr ? "عرض الكل" : "Show all"} →
              </Link>
            </div>
          </div>

          {listingsLoading ? (
            <div className="listing-loading">
              <div style={{ width: 40, height: 40, border: "3px solid #e8c547", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="mrh-empty">
              <div className="mrh-empty-icon">
                {activeCategory
                  ? categories.find(c => c.key === activeCategory)?.icon
                  : "🏠"}
              </div>
              <p className="mrh-empty-text">
                {activeCategory
                  ? (isAr
                    ? `لا توجد إقامات من نوع "${activeCatLabel}" في هذه المنطقة`
                    : `No ${activeCatLabel} stays found near you`)
                  : (isAr
                    ? "لا توجد قوائم قريبة من موقعك حالياً"
                    : "No listings found near your location")}
              </p>
              {activeCategory ? (
                <button className="mrh-empty-clear" onClick={() => setActiveCategory(null)}>
                  {isAr ? "← عرض كل الإقامات" : "← Show all stays"}
                </button>
              ) : (
                <button className="mrh-empty-clear" onClick={getUserLocation}>
                  {isAr ? "حاول مرة أخرى" : "Try again"} →
                </button>
              )}
            </div>
          ) : (
            <div className="mrh-listings-grid">
              {filteredListings.map((listing, index) => (
                <div
                  key={listing._id || index}
                  className="mrh-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => router.push(`/listings/${listing._id}`)}
                >
                  <div className="mrh-card-img" style={{ background: getCardColor(index) }}>
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt={listing.title} />
                    ) : (
                      <div className="mrh-card-img-inner">
                        {["🏙️", "🏡", "🏛️", "🕌"][index % 4]}
                      </div>
                    )}
                    <div className="mrh-card-fav">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 12.5S1 9 1 4.5a3 3 0 0 1 6 0 3 3 0 0 1 6 0C13 9 7 12.5 7 12.5z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="mrh-card-badge">{isAr ? "🏆 مميز" : "🏆 Featured"}</div>
                    {listing.distance && (
                      <div className="distance-badge">📍 {listing.distance} {isAr ? "كم" : "km"}</div>
                    )}
                  </div>
                  <div className="mrh-card-body">
                    <div className="mrh-card-row1">
                      <span className="mrh-card-city">
                        {listing.location?.split(",")[0] || listing.title?.slice(0, 30)}
                      </span>
                      <span className="mrh-card-rating">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="#e8c547">
                          <path d="M6 1l1.4 2.8L11 4.3l-2.5 2.4.6 3.3L6 8.5 2.9 10l.6-3.3L1 4.3l3.6-.5L6 1z" />
                        </svg>
                        {listing.rating || "4.9"}
                      </span>
                    </div>
                    <div className="mrh-card-type">{listing.title?.slice(0, 50) || "Beautiful Space"}</div>
                    <div className="mrh-card-price">
                      <strong>{listing.price}</strong> {isAr ? "دينار" : "LYD"} / {isAr ? "ليلة" : "night"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── STATS ───────────────────────────────────────────────────────── */}
        <div className="mrh-stats">
          <div className="mrh-stats-inner">
            {[
              { val: "10,000", suffix: "+", label: content.happyTravelers },
              { val: "5,000",  suffix: "+", label: content.activeHosts    },
              { val: "50,000", suffix: "+", label: content.bookingsMade   },
            ].map(({ val, suffix, label }) => (
              <div key={label}>
                <div className="mrh-stat-val">{val}<span>{suffix}</span></div>
                <div className="mrh-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CHOOSE PATH ─────────────────────────────────────────────────── */}
        <div className="mrh-section">
          <div className="mrh-section-header" style={{ marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>
                {content.whoAreYou}
              </div>
              <h2 className="mrh-section-title display">{content.choosePath}</h2>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "#717171", marginBottom: 28 }}>
            {isAr ? "اكتشف كيف يمكننا مساعدتك في رحلتك" : "Discover how we can help with your journey"}
          </p>
          <div className="mrh-path-grid">
            {/* Traveler */}
            <div className="mrh-path-card mrh-path-traveler">
              <div className="mrh-path-emoji">✈️</div>
              <span className="mrh-path-tag" style={{ background: "#0C447C22", color: "#0C447C" }}>{content.traveler}</span>
              <div className="mrh-path-heading" style={{ color: "#111" }}>{content.travelerTagline}</div>
              <p className="mrh-path-desc" style={{ color: "#555" }}>{content.travelerDesc}</p>
              <ul className="mrh-path-perks">
                {[content.travelerPerk1, content.travelerPerk2, content.travelerPerk3, content.travelerPerk4].map((p) => (
                  <li key={p} className="mrh-path-perk" style={{ color: "#333" }}>
                    <span className="mrh-path-check" style={{ background: "#0C447C" }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              {!isLoggedIn && (
                <Link href="/signup" className="mrh-path-link" style={{ background: "#1a1a2e", color: "#e8c547" }}>
                  {content.getStartedAs} {content.traveler.toLowerCase()} →
                </Link>
              )}
            </div>
            {/* Host */}
            <div className="mrh-path-card mrh-path-host">
              <div className="mrh-path-emoji">🏠</div>
              <span className="mrh-path-tag" style={{ background: "rgba(232,197,71,0.15)", color: "#e8c547" }}>{content.host}</span>
              <div className="mrh-path-heading" style={{ color: "#fff" }}>{content.hostTagline}</div>
              <p className="mrh-path-desc" style={{ color: "rgba(255,255,255,0.5)" }}>{content.hostDesc}</p>
              <ul className="mrh-path-perks">
                {[content.hostPerk1, content.hostPerk2, content.hostPerk3, content.hostPerk4].map((p) => (
                  <li key={p} className="mrh-path-perk" style={{ color: "rgba(255,255,255,0.8)" }}>
                    <span className="mrh-path-check" style={{ background: "#e8c547" }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              {!isLoggedIn && (
                <Link href="/signup" className="mrh-path-link" style={{ background: "#e8c547", color: "#1a1a2e" }}>
                  {content.getStartedAs} {content.host.toLowerCase()} →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
        <div style={{ background: "#fafafa", padding: "60px 0", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
          <div className="mrh-section" style={{ paddingTop: 0, paddingBottom: 0 }}>
            <div className="mrh-section-header">
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>{content.community}</div>
                <h2 className="mrh-section-title display">{content.whatPeopleSay}</h2>
              </div>
            </div>
            <div className="mrh-reviews-grid">
              {[
                { initials: "JD", name: "John Doe",   role: content.traveler, bg: "#E6F1FB", color: "#0C447C", quote: "Found the perfect place for my vacation. Booking was effortless and the host was wonderful — exactly what I needed." },
                { initials: "JS", name: "Jane Smith", role: content.host,     bg: "#EEEDFE", color: "#3C3489", quote: "I've been hosting for a year now. The platform handles everything and I've met some genuinely fascinating people." },
                { initials: "MR", name: "Mike Ross",  role: content.traveler, bg: "#EAF3DE", color: "#27500A", quote: "Best booking platform I've used. The selection is wide, the interface is clean, and support actually responds." },
              ].map(({ initials, name, role, bg, color, quote }) => (
                <div key={name} className="mrh-review">
                  <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="#e8c547">
                        <path d="M6 1l1.4 2.8L11 4.3l-2.5 2.4.6 3.3L6 8.5 2.9 10l.6-3.3L1 4.3l3.6-.5L6 1z" />
                      </svg>
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: "#444", lineHeight: 1.75, marginBottom: 20 }}>"{quote}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#222" }}>{name}</div>
                      <div style={{ fontSize: 12, color: "#999" }}>{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        {!isLoggedIn && (
          <div className="mrh-section">
            <div className="mrh-cta-box">
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(232,197,71,0.6)", marginBottom: 12 }}>{content.ready}</div>
                <h2 className="display" style={{ fontStyle: isAr ? "normal" : "italic", fontWeight: 300, fontSize: "clamp(28px,5vw,44px)", color: "#fff", marginBottom: 12, lineHeight: 1.15 }}>{content.ctaTitle}</h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.75 }}>{content.ctaDesc}</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/signup" style={{ background: "#e8c547", color: "#1a1a2e", padding: "14px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>{content.createAccount} →</Link>
                  <Link href="/login" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", padding: "14px 28px", borderRadius: 12, fontSize: 14, fontWeight: 500, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>{content.signIn}</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="mrh-footer">
          <div className="mrh-footer-inner">
            <div className="mrh-footer-grid">
              <div>
                <div className="display" style={{ fontStyle: isAr ? "normal" : "italic", fontWeight: 300, fontSize: 22, color: "#fff", marginBottom: 12 }}>
                  mar<span style={{ fontWeight: 600, color: "#e8c547" }}>haba</span>
                </div>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{content.footerDesc}</p>
              </div>
              {[
                { heading: content.travelersHeading, links: [content.howToBook, content.paymentMethods, content.travelTips] },
                { heading: content.hostsHeading,     links: [content.startHosting, content.hostResources, content.pricingTips] },
                { heading: content.supportHeading,   links: [content.helpCenter, content.safetyInfo, content.contactUs] },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <div className="mrh-footer-col-title">{heading}</div>
                  {links.map((l) => <Link key={l} href="#" className="mrh-footer-link">{l}</Link>)}
                </div>
              ))}
            </div>
            <div className="mrh-footer-bottom">
              <p className="mrh-footer-copy">&copy;{year} Marhaba. {content.rights}</p>
              <div className="mrh-footer-legal">
                <Link href="#" className="mrh-footer-link">{content.privacy}</Link>
                <Link href="#" className="mrh-footer-link">{content.terms}</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}