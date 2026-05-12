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

  const [activeCategory, setActiveCategory] = useState(null);

  const isAr = lang === "ar";

  const categories = [
    { key: "beachfront",  icon: "🏖️", label: isAr ? "شاطئ"  : "Beachfront"  },
    { key: "mountain",    icon: "🏔️", label: isAr ? "جبال"  : "Mountain"    },
    { key: "city",        icon: "🏙️", label: isAr ? "مدينة" : "City"        },
    { key: "countryside", icon: "🏡", label: isAr ? "ريفي"  : "Countryside" },
    { key: "pool",        icon: "🏊", label: isAr ? "مسبح"  : "Pool"        },
    { key: "desert",      icon: "🏜️", label: isAr ? "صحراء" : "Desert"      },
    { key: "camping",     icon: "🏕️", label: isAr ? "تخييم" : "Camping"     },
    { key: "cabins",      icon: "🛖", label: isAr ? "كوخ"   : "Cabins"      },
  ];

  const filteredListings = activeCategory
    ? listings.filter((l) => {
        const haystack = [
          l.category, l.type, l.propertyType,
          ...(Array.isArray(l.tags) ? l.tags : []),
          l.title, l.description,
        ].filter(Boolean).map((s) => s.toLowerCase());
        return haystack.some((s) => s.includes(activeCategory.toLowerCase()));
      })
    : listings;

  const handleCategoryClick = (key) =>
    setActiveCategory((prev) => (prev === key ? null : key));

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
    } catch {
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
    } catch {}
  };

  const handleDashboardRedirect = () =>
    router.push(userType === "host" ? "/host-dashboard" : "/dashboard");

  const cardColors = [
    "bg-amber-100", "bg-sky-100", "bg-purple-100",
    "bg-emerald-100", "bg-pink-100", "bg-lime-100",
  ];

  const activeCatLabel = categories.find((c) => c.key === activeCategory)?.label;

  // ── Loading screen ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-7 h-7 rounded-full border-[2.5px] border-yellow-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="bg-white min-h-screen text-gray-900">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className={`sticky top-0 z-50 bg-white transition-all duration-200 ${scrolled ? "border-b border-gray-200 shadow-sm" : "border-b border-transparent"}`}>
        <div className="max-w-screen-xl mx-auto px-6 h-20 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="no-underline font-[Cairo,Tajawal,sans-serif] font-medium text-[26px] text-[#1a1a2e] tracking-wide"
          >
            مر<span className="font-bold text-yellow-400">حبا</span>
          </Link>

          {/* Location button */}
          <button
            onClick={getUserLocation}
            disabled={listingsLoading}
            className="bg-gray-100 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed border-none rounded-full px-4 py-2 text-[13px] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>📍</span>
            {listingsLoading
              ? (isAr ? "جاري التحميل..." : "Loading...")
              : locationPermission
                ? (isAr ? "قريب منك" : "Near you")
                : (isAr ? "أظهر القريب مني" : "Show near me")}
          </button>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleLanguage}
              className="bg-transparent border-none px-3 py-2 rounded-3xl text-[13px] cursor-pointer text-gray-900 font-medium hover:bg-gray-100 transition-colors"
            >
              {isAr ? "🇬🇧 English" : "🇸🇦 عربي"}
            </button>

            {isLoggedIn ? (
              <button
                onClick={handleDashboardRedirect}
                className="flex items-center gap-2 border border-gray-300 rounded-3xl py-1.5 ps-3.5 pe-2 bg-white cursor-pointer text-[13px] text-gray-900 font-medium hover:shadow-md transition-shadow"
              >
                {isAr ? "لوحة التحكم" : content.dashboard}
                <div className="w-[30px] h-[30px] rounded-full bg-[#1a1a2e] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="6" r="3" fill="#e8c547" />
                    <path d="M2 14c0-3.31 2.69-5 6-5s6 1.69 6 5" stroke="#e8c547" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </button>
            ) : (
              <>
                <Link href="/login" className="text-[13px] font-medium text-gray-900 no-underline px-3 py-2 rounded-3xl hover:bg-gray-100 transition-colors">
                  {content.signIn}
                </Link>
                <Link href="/signup" className="bg-[#1a1a2e] text-yellow-400 px-[18px] py-2.5 rounded-3xl text-[13px] font-semibold no-underline">
                  {content.getStarted}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[580px] flex items-center overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#2d2d5e] to-[#1a1a2e]">
        {/* Radial overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(232,197,71,0.15)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(55,138,221,0.1)_0%,transparent_50%)]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg,#e8c547 0px,#e8c547 1px,transparent 1px,transparent 40px)" }}
          />
        </div>

        <div className="relative max-w-screen-xl mx-auto px-6 py-20 w-full">
          <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 px-3.5 py-1.5 rounded-full text-[11px] tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
            {content.heroBadge}
          </div>

          <h1 className={`font-light text-[clamp(40px,6vw,72px)] text-white leading-[1.1] max-w-[640px] mb-5 ${isAr ? "font-[Cairo,Tajawal,sans-serif]" : "font-[Fraunces,serif] italic"}`}>
            {content.heroTitle1} {content.heroTitle2}{" "}
            <em className="not-italic text-yellow-400">{content.heroTitle3}</em>
          </h1>

          <p className="text-base text-white/60 max-w-[480px] leading-[1.75] mb-9">
            {content.heroSubtitle}
          </p>

          {!isLoggedIn ? (
            <div className="flex gap-3 flex-wrap">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-yellow-400 text-[#1a1a2e] px-7 py-3.5 rounded-xl text-sm font-semibold no-underline hover:bg-yellow-300 hover:-translate-y-px transition-all">
                {content.createAccount} →
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 bg-white/10 text-white px-7 py-3.5 rounded-xl text-sm font-medium no-underline border border-white/20 hover:bg-white/15 transition-colors">
                {content.signIn}
              </Link>
            </div>
          ) : (
            <button
              onClick={handleDashboardRedirect}
              className="inline-flex items-center gap-2 bg-yellow-400 text-[#1a1a2e] px-7 py-3.5 rounded-xl text-sm font-semibold border-none cursor-pointer hover:bg-yellow-300 hover:-translate-y-px transition-all"
            >
              {content.dashboard} →
            </button>
          )}

          <div className="flex gap-7 mt-10 flex-wrap">
            {[content.verifiedHosts, content.securePayments, content.support247].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-white/50">
                <span className="w-[18px] h-[18px] rounded-full bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center shrink-0">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4l2 2 4-4" stroke="#e8c547" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-6 pt-8">
          <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat) => (
              <div
                key={cat.key}
                onClick={() => handleCategoryClick(cat.key)}
                title={isAr ? `تصفية: ${cat.label}` : `Filter: ${cat.label}`}
                className={`flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 pb-2 border-b-2 transition-all ${
                  activeCategory === cat.key
                    ? "opacity-100 border-yellow-400"
                    : "opacity-50 border-transparent hover:opacity-80"
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium whitespace-nowrap text-gray-900">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LISTINGS ────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className={`font-light text-[clamp(22px,3vw,30px)] text-gray-900 ${isAr ? "font-[Cairo,Tajawal,sans-serif]" : "font-[Fraunces,serif] italic"}`}>
              {activeCategory
                ? (isAr ? `أماكن: ${activeCatLabel}` : `${activeCatLabel} stays`)
                : locationPermission
                  ? (isAr ? "أماكن قريبة منك" : "Places near you")
                  : (isAr ? "أماكن إقامة مميزة" : "Featured stays")}
            </h2>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="mt-1.5 inline-flex items-center gap-1.5 bg-[#1a1a2e] text-yellow-400 border-none rounded-full px-3 py-1 text-xs cursor-pointer"
              >
                {categories.find((c) => c.key === activeCategory)?.icon} {activeCatLabel}
                <span className="opacity-70 ms-0.5">✕</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {locationError && (
              <div className="bg-yellow-400/20 rounded-2xl px-3 py-1.5 text-xs text-yellow-700 inline-flex items-center gap-1.5">
                <span>📍</span> {locationError}
              </div>
            )}
            <Link href="/listings" className="text-sm font-semibold text-gray-900 underline cursor-pointer">
              {isAr ? "عرض الكل" : "Show all"} →
            </Link>
          </div>
        </div>

        {listingsLoading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-10 h-10 border-[3px] border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16 px-6 bg-gray-50 rounded-2xl animate-[fadeIn_0.3s_ease_both]">
            <div className="text-5xl mb-4">
              {activeCategory ? categories.find((c) => c.key === activeCategory)?.icon : "🏠"}
            </div>
            <p className="text-gray-500 text-sm mb-4">
              {activeCategory
                ? (isAr ? `لا توجد إقامات من نوع "${activeCatLabel}"` : `No ${activeCatLabel} stays found near you`)
                : (isAr ? "لا توجد قوائم قريبة من موقعك" : "No listings found near your location")}
            </p>
            {activeCategory ? (
              <button
                onClick={() => setActiveCategory(null)}
                className="bg-transparent border-none text-yellow-500 cursor-pointer text-sm underline"
              >
                {isAr ? "← عرض كل الإقامات" : "← Show all stays"}
              </button>
            ) : (
              <button
                onClick={getUserLocation}
                className="bg-transparent border-none text-yellow-500 cursor-pointer text-sm underline"
              >
                {isAr ? "حاول مرة أخرى" : "Try again"} →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {filteredListings.map((listing, index) => (
              <div
                key={listing._id || index}
                onClick={() => router.push(`/listings/${listing._id}`)}
                className="cursor-pointer rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform animate-[fadeIn_0.3s_ease_both]"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Card image */}
                <div className={`w-full aspect-[4/3] rounded-2xl overflow-hidden relative mb-3 ${cardColors[index % 6]}`}>
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {["🏙️", "🏡", "🏛️", "🕌"][index % 4]}
                    </div>
                  )}
                  <div className="absolute top-3 end-3 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 12.5S1 9 1 4.5a3 3 0 0 1 6 0 3 3 0 0 1 6 0C13 9 7 12.5 7 12.5z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="absolute top-3 start-3 bg-white text-gray-900 rounded-md px-2.5 py-1 text-[11px] font-semibold">
                    {isAr ? "🏆 مميز" : "🏆 Featured"}
                  </div>
                  {listing.distance && (
                    <div className="absolute bottom-3 end-3 bg-black/70 text-white rounded-full px-2.5 py-1 text-[11px] font-medium">
                      📍 {listing.distance} {isAr ? "كم" : "km"}
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="px-1">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-semibold text-sm text-gray-900">
                      {listing.location?.split(",")[0] || listing.title?.slice(0, 30)}
                    </span>
                    <span className="flex items-center gap-1 text-[13px] font-medium">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="#e8c547">
                        <path d="M6 1l1.4 2.8L11 4.3l-2.5 2.4.6 3.3L6 8.5 2.9 10l.6-3.3L1 4.3l3.6-.5L6 1z" />
                      </svg>
                      {listing.rating || "4.9"}
                    </span>
                  </div>
                  <div className="text-[13px] text-gray-400 mb-1">{listing.title?.slice(0, 50) || "Beautiful Space"}</div>
                  <div className="text-sm text-gray-900">
                    <strong className="font-bold">{listing.price}</strong> {isAr ? "دينار" : "LYD"} / {isAr ? "ليلة" : "night"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <div className="bg-[#1a1a2e] my-10 py-12 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { val: "10,000", suffix: "+", label: content.happyTravelers },
            { val: "5,000",  suffix: "+", label: content.activeHosts    },
            { val: "50,000", suffix: "+", label: content.bookingsMade   },
          ].map(({ val, suffix, label }) => (
            <div key={label}>
              <div className={`font-light text-[44px] leading-none text-white mb-1.5 ${isAr ? "font-[Cairo,Tajawal,sans-serif]" : "font-[Fraunces,serif] italic"}`}>
                {val}<span className="text-yellow-400">{suffix}</span>
              </div>
              <div className="text-[12px] tracking-widest uppercase text-white/40">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHOOSE PATH ─────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-1.5">{content.whoAreYou}</div>
          <h2 className={`font-light text-[clamp(22px,3vw,30px)] text-gray-900 ${isAr ? "font-[Cairo,Tajawal,sans-serif]" : "font-[Fraunces,serif] italic"}`}>
            {content.choosePath}
          </h2>
        </div>
        <p className="text-sm text-gray-400 mb-7">
          {isAr ? "اكتشف كيف يمكننا مساعدتك في رحلتك" : "Discover how we can help with your journey"}
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
          {/* Traveler */}
          <div className="rounded-[20px] p-9 relative overflow-hidden min-h-[340px] flex flex-col justify-end bg-gradient-to-br from-[#e6f3ff] to-[#cce4ff]">
            <div className={`text-5xl absolute top-7 ${isAr ? "left-7" : "right-7"}`}>✈️</div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold mb-3 bg-[#0C447C22] text-[#0C447C]">
              {content.traveler}
            </span>
            <div className={`font-light text-[26px] leading-[1.2] text-gray-900 mb-3 ${isAr ? "font-[Cairo,Tajawal,sans-serif]" : "font-[Fraunces,serif] italic"}`}>
              {content.travelerTagline}
            </div>
            <p className="text-[13px] leading-[1.7] text-gray-500 mb-5">{content.travelerDesc}</p>
            <ul className="list-none mb-6 flex flex-col gap-2">
              {[content.travelerPerk1, content.travelerPerk2, content.travelerPerk3, content.travelerPerk4].map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[13px] text-gray-700">
                  <span className="w-[18px] h-[18px] rounded-full bg-[#0C447C] flex items-center justify-center shrink-0">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            {!isLoggedIn && (
              <Link href="/signup" className="inline-flex items-center gap-1.5 bg-[#1a1a2e] text-yellow-400 px-5 py-2.5 rounded-[10px] text-[13px] font-semibold no-underline hover:opacity-85 transition-opacity w-fit">
                {content.getStartedAs} {content.traveler.toLowerCase()} →
              </Link>
            )}
          </div>

          {/* Host */}
          <div className="rounded-[20px] p-9 relative overflow-hidden min-h-[340px] flex flex-col justify-end bg-gradient-to-br from-[#1a1a2e] to-[#2d2d5e]">
            <div className={`text-5xl absolute top-7 ${isAr ? "left-7" : "right-7"}`}>🏠</div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold mb-3 bg-yellow-400/15 text-yellow-400">
              {content.host}
            </span>
            <div className={`font-light text-[26px] leading-[1.2] text-white mb-3 ${isAr ? "font-[Cairo,Tajawal,sans-serif]" : "font-[Fraunces,serif] italic"}`}>
              {content.hostTagline}
            </div>
            <p className="text-[13px] leading-[1.7] text-white/50 mb-5">{content.hostDesc}</p>
            <ul className="list-none mb-6 flex flex-col gap-2">
              {[content.hostPerk1, content.hostPerk2, content.hostPerk3, content.hostPerk4].map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[13px] text-white/80">
                  <span className="w-[18px] h-[18px] rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4l2 2 4-4" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            {!isLoggedIn && (
              <Link href="/signup" className="inline-flex items-center gap-1.5 bg-yellow-400 text-[#1a1a2e] px-5 py-2.5 rounded-[10px] text-[13px] font-semibold no-underline hover:opacity-85 transition-opacity w-fit">
                {content.getStartedAs} {content.host.toLowerCase()} →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <div className="bg-[#fafafa] py-16 border-t border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-1.5">{content.community}</div>
              <h2 className={`font-light text-[clamp(22px,3vw,30px)] text-gray-900 ${isAr ? "font-[Cairo,Tajawal,sans-serif]" : "font-[Fraunces,serif] italic"}`}>
                {content.whatPeopleSay}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {[
              { initials: "JD", name: "John Doe",   role: content.traveler, bg: "#E6F1FB", color: "#0C447C", quote: "Found the perfect place for my vacation. Booking was effortless and the host was wonderful — exactly what I needed." },
              { initials: "JS", name: "Jane Smith", role: content.host,     bg: "#EEEDFE", color: "#3C3489", quote: "I've been hosting for a year now. The platform handles everything and I've met some genuinely fascinating people." },
              { initials: "MR", name: "Mike Ross",  role: content.traveler, bg: "#EAF3DE", color: "#27500A", quote: "Best booking platform I've used. The selection is wide, the interface is clean, and support actually responds." },
            ].map(({ initials, name, role, bg, color, quote }) => (
              <div key={name} className="bg-gray-50 rounded-2xl p-6 border border-black/[0.07] hover:shadow-lg transition-shadow">
                <div className="flex gap-0.5 mb-3.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="#e8c547">
                      <path d="M6 1l1.4 2.8L11 4.3l-2.5 2.4.6 3.3L6 8.5 2.9 10l.6-3.3L1 4.3l3.6-.5L6 1z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-500 leading-[1.75] mb-5">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0"
                    style={{ background: bg, color }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{name}</div>
                    <div className="text-xs text-gray-400">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      {!isLoggedIn && (
        <div className="max-w-screen-xl mx-auto px-6 py-10">
          <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#2d2d5e] rounded-3xl px-12 py-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,197,71,0.2)_0%,transparent_60%)]" />
            <div className="relative z-10">
              <div className="text-[10px] tracking-[0.12em] uppercase text-yellow-400/60 mb-3">{content.ready}</div>
              <h2 className={`font-light text-[clamp(28px,5vw,44px)] text-white mb-3 leading-[1.15] ${isAr ? "font-[Cairo,Tajawal,sans-serif]" : "font-[Fraunces,serif] italic"}`}>
                {content.ctaTitle}
              </h2>
              <p className="text-[15px] text-white/45 max-w-[460px] mx-auto mb-7 leading-[1.75]">
                {content.ctaDesc}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/signup" className="bg-yellow-400 text-[#1a1a2e] px-7 py-3.5 rounded-xl text-sm font-bold no-underline">
                  {content.createAccount} →
                </Link>
                <Link href="/login" className="bg-white/10 text-white px-7 py-3.5 rounded-xl text-sm font-medium no-underline border border-white/20">
                  {content.signIn}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#111] px-6 pt-12 pb-7">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-8 mb-10 pb-10 border-b border-[#222]">
            <div>
              <div className={`font-light text-[22px] text-white mb-3 ${isAr ? "font-[Cairo,Tajawal,sans-serif]" : "font-[Fraunces,serif] italic"}`}>
                mar<span className="font-semibold text-yellow-400">haba</span>
              </div>
              <p className="text-sm text-[#555] leading-[1.7]">{content.footerDesc}</p>
            </div>
            {[
              { heading: content.travelersHeading, links: [content.howToBook, content.paymentMethods, content.travelTips] },
              { heading: content.hostsHeading,     links: [content.startHosting, content.hostResources, content.pricingTips] },
              { heading: content.supportHeading,   links: [content.helpCenter, content.safetyInfo, content.contactUs] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <div className="text-[11px] tracking-[0.1em] uppercase text-[#555] mb-4 font-semibold">{heading}</div>
                {links.map((l) => (
                  <Link key={l} href="#" className="block text-[13px] text-[#999] no-underline mb-2.5 hover:text-yellow-400 transition-colors">
                    {l}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-[#444]">&copy;{year} Marhaba. {content.rights}</p>
            <div className="flex gap-5">
              <Link href="#" className="text-xs text-[#999] no-underline hover:text-yellow-400 transition-colors">{content.privacy}</Link>
              <Link href="#" className="text-xs text-[#999] no-underline hover:text-yellow-400 transition-colors">{content.terms}</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}