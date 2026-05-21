"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLanguage } from "@/hooks/useLanguage";
import "leaflet/dist/leaflet.css";
import LoadingScreen from "@/components/LoadingScreen";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

/* helpers */
const fmt = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const nights = (a, b) => Math.ceil((new Date(b) - new Date(a)) / 86400000);
const haversine = (la1, lo1, la2, lo2) => {
  const R = 6371,
    dLa = ((la2 - la1) * Math.PI) / 180,
    dLo = ((lo2 - lo1) * Math.PI) / 180;
  const a =
    Math.sin(dLa / 2) ** 2 +
    Math.cos((la1 * Math.PI) / 180) *
      Math.cos((la2 * Math.PI) / 180) *
      Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const AVATAR_PAL = [
  { bg: "#EEEDFE", c: "#3C3489" },
  { bg: "#E6F1FB", c: "#0C447C" },
  { bg: "#EAF3DE", c: "#27500A" },
  { bg: "#FAEEDA", c: "#633806" },
  { bg: "#E1F5EE", c: "#085041" },
  { bg: "#FBEAF0", c: "#72243E" },
];
const avi = (name) =>
  AVATAR_PAL[(name?.charCodeAt(0) ?? 0) % AVATAR_PAL.length];
const initials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "";
const statusStyle = (s) =>
  ({
    confirmed: { bg: "#EAF3DE", c: "#27500A" },
    pending: { bg: "#FAEEDA", c: "#633806" },
    cancelled: { bg: "#FCEBEB", c: "#791F1F" },
  })[s] ?? { bg: "#F1EFE8", c: "#444" };

export default function UserDashboard() {
  const router = useRouter();
  const { lang, t, toggleLanguage } = useLanguage();
  const isAr = lang === "ar";

  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [activeTab, setActiveTab] = useState("nearby");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [icons, setIcons] = useState({ user: null, house: null });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
    setIcons({
      user: L.divIcon({
        className: "emoji-pin",
        html: `<div style="font-size:24px;line-height:24px;transform:translateY(-8px);">📍</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      }),
      house: new L.Icon({
        iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z"
              fill="#e8c547" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        `)}`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -28],
      }),
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error();
        const data = await res.json();
        const role = data.user?.role || data.user?.userType;
        if (role === "super_admin" || role === "admin") {
          router.push("/admin");
          return;
        }
        if (role === "host") {
          router.push("/host-dashboard");
          return;
        }
        setUser(data.user);
        getUserLocation();
        fetchListings();
        fetchBookings();
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const getUserLocation = () => {
    if (!("geolocation" in navigator)) {
      setUserLocation({ lat: 51.505, lng: -0.09 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setUserLocation({ lat, lng });
        setMapCenter({ lat, lng });
      },
      () => setUserLocation({ lat: 51.505, lng: -0.09 })
    );
  };

  const fetchListings = async () => {
    try {
      const d = await (await fetch("/api/listings")).json();
      setListings(d.listings);
      setFiltered(d.listings);
    } catch {}
  };

  const fetchBookings = async () => {
    try {
      const d = await (await fetch("/api/bookings")).json();
      setBookings(d.bookings);
    } catch {}
  };

  const filterByDistance = (radius) => {
    if (!userLocation) return;
    setFiltered(
      listings.filter(
        (l) =>
          l.coordinates &&
          haversine(
            userLocation.lat,
            userLocation.lng,
            l.coordinates.lat,
            l.coordinates.lng
          ) <= radius
      )
    );
    setSearchRadius(radius);
  };

  const openMaps = (l) =>
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${l.coordinates.lat},${l.coordinates.lng}`,
      "_blank"
    );

  const getDirections = (l) => {
    if (!userLocation) {
      alert(
        isAr
          ? "قم بتفعيل خدمات الموقع أولاً"
          : "Enable location services first"
      );
      return;
    }
    window.open(
      `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${l.coordinates.lat},${l.coordinates.lng}`,
      "_blank"
    );
  };

  const cancelBooking = async (id) => {
    if (!confirm(isAr ? "هل تريد إلغاء هذا الحجز؟" : "Cancel this booking?"))
      return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) throw new Error("Failed");
      fetchBookings();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      ["MarhabaToken", "userType", "userData"].forEach((k) =>
        localStorage.removeItem(k)
      );
      router.push("/login");
    } catch {}
  };

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  const { bg: aviBg, c: aviColor } = avi(user.name);
  const ini = initials(user.name);

  const TABS = [
    { id: "nearby", l: isAr ? "الأماكن القريبة" : "nearby places" },
    {
      id: "bookings",
      l: `${isAr ? "الحجوزات" : "bookings"} (${bookings.length})`,
    },
  ];

  // Font classes based on language
  const arabicFontClass = "font-['Cairo','Tajawal',sans-serif]";
  const englishFontClass = "font-['DM_Mono',monospace]";
  const displayFontClass = isAr ? "font-['Cairo','Tajawal',sans-serif]" : "font-['Fraunces',serif]";
  const bodyFontClass = isAr ? "font-['Cairo','Tajawal',sans-serif]" : "font-['DM_Mono',monospace]";

  return (
    <div className={`min-h-screen bg-[#f7f6f2] ${isAr ? "rtl" : "ltr"} ${bodyFontClass}`}>
      {/* Navigation */}
      <nav className="bg-[#1a1a2e] border-b border-[rgba(232,197,71,.15)] sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between gap-2">
          {/* Logo */}
          <Link
            href="/"
            className="font-['Cairo','Tajawal',sans-serif] font-medium text-[26px] text-white tracking-[1px] flex-shrink-0"
          >
            مر<span className="font-bold text-[#e8c547]">حبا</span>
          </Link>

          {/* Desktop Tabs - Hidden on mobile */}
          <div className="hidden md:flex gap-0.5 flex-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-[11px] whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-[rgba(232,197,71,.1)] text-[#e8c547]"
                    : "text-white/45 hover:text-white/70"
                }`}
              >
                {tab.l}
              </button>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="bg-[rgba(232,197,71,.15)] border border-[rgba(232,197,71,.3)] rounded-md px-2.5 py-1 text-[11px] cursor-pointer text-[#e8c547]"
            >
              {isAr ? "🇬🇧" : "🇱🇾"}
            </button>

            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
              style={{ background: aviBg, color: aviColor }}
            >
              {ini}
            </div>

            {/* Logout - Hide text on mobile */}
            <button
              onClick={handleLogout}
              className="border border-[#e8c547] rounded-md px-2.5 py-1 text-[11px] cursor-pointer text-[#e8c547] bg-none"
            >
              <span className="hidden sm:inline">
                {isAr ? "خروج" : "logout"}
              </span>
              <span className="sm:hidden">🚪</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#e8c547] text-2xl p-1"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden flex flex-col border-t border-[rgba(232,197,71,.1)] bg-[#1a1a2e]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-3 text-left text-sm w-full ${
                  activeTab === tab.id
                    ? "bg-[rgba(232,197,71,.1)] text-[#e8c547]"
                    : "text-white/70"
                }`}
              >
                {tab.l}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto p-4 md:p-6">
        {/* Profile strip */}
        <div className="bg-white rounded-xl border border-black/7 p-4 md:p-5 mb-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-medium"
              style={{ background: aviBg, color: aviColor }}
            >
              {ini}
            </div>
            <div>
              <div className={`${displayFontClass} font-light text-xl text-[#111118] leading-tight ${isAr ? "italic" : ""}`}>
                {user.name}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {isAr ? "عضو منذ" : "member since"} {fmt(user.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex gap-5 flex-wrap">
            {[
              { l: isAr ? "الحجوزات" : "bookings", v: bookings.length },
              { l: isAr ? "القريبة" : "nearby", v: filtered.length },
            ].map(({ l, v }) => (
              <div key={l} className={isAr ? "text-left" : "text-right"}>
                <div className={`${displayFontClass} font-light text-2xl text-[#111118] leading-tight ${isAr ? "italic" : ""}`}>
                  {v}
                </div>
                <div className="text-[10px] tracking-wide uppercase text-gray-300 mt-0.5">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NEARBY TAB */}
        {activeTab === "nearby" && (
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2.5 mb-4">
              <div className={`${displayFontClass} font-light text-xl text-[#111118] ${isAr ? "italic" : ""}`}>
                {isAr ? "الأماكن القريبة" : "nearby places"}
                <span className="text-[13px] font-normal not-italic text-gray-400 ml-2">
                  ({filtered.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] tracking-wide uppercase text-gray-400">
                  {isAr ? "نصف القطر" : "radius"}
                </label>
                <select
                  onChange={(e) => filterByDistance(parseInt(e.target.value))}
                  value={searchRadius}
                  className="px-2.5 py-1.5 bg-[#fafaf8] border border-black/12 rounded-md text-xs outline-none"
                >
                  {[5, 10, 20, 50, 100].map((v) => (
                    <option key={v} value={v}>
                      {v} {isAr ? "كم" : "km"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Map */}
            {userLocation && (
              <div className="rounded-xl overflow-hidden border border-black/8 mb-5 h-[clamp(280px,45vw,440px)]">
                <MapContainer
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={12}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {icons.user && (
                    <Marker
                      position={[userLocation.lat, userLocation.lng]}
                      icon={icons.user}
                    >
                      <Popup>
                        <strong className="text-xs">
                          {isAr
                            ? "📍 موقعك الحالي"
                            : "📍 Your current location"}
                        </strong>
                      </Popup>
                    </Marker>
                  )}
                  {icons.house &&
                    filtered.map(
                      (l) =>
                        l.coordinates && (
                          <Marker
                            key={l.id}
                            position={[l.coordinates.lat, l.coordinates.lng]}
                            icon={icons.house}
                          >
                            <Popup>
                              <div className="text-xs min-w-[160px]">
                                {l.images?.[0] && (
                                  <img
                                    src={l.images[0]}
                                    alt={l.title}
                                    className="w-full h-[90px] object-cover rounded-md mb-2"
                                  />
                                )}
                                <div className="font-medium mb-0.5">
                                  🏠 {l.title}
                                </div>
                                <div className="text-gray-400 mb-1.5">
                                  {l.location}
                                </div>
                                <div className="flex gap-1.5">
                                  <Link
                                    href={`/listings/${l.id}`}
                                    className="flex-1 bg-[#1a1a2e] text-[#e8c547] py-1 rounded text-center text-[11px]"
                                  >
                                    {isAr ? "عرض" : "view"}
                                  </Link>
                                  <button
                                    onClick={() => getDirections(l)}
                                    className="flex-1 bg-[#1D9E75] text-white border-none rounded text-[11px] cursor-pointer"
                                  >
                                    {isAr ? "اتجاهات" : "dir"}
                                  </button>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        )
                    )}
                </MapContainer>
              </div>
            )}

            {/* Listing cards */}
            {filtered.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filtered.map((l) => {
                  const dist =
                    userLocation && l.coordinates
                      ? haversine(
                          userLocation.lat,
                          userLocation.lng,
                          l.coordinates.lat,
                          l.coordinates.lng
                        ).toFixed(1)
                      : null;
                  return (
                    <div
                      key={l.id}
                      className="flex flex-col sm:flex-row gap-5 bg-white rounded-xl border border-black/7 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="relative sm:w-[200px] sm:min-w-[200px] h-[200px] sm:h-[180px] overflow-hidden">
                        <img
                          src={l.images?.[0]}
                          alt={l.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                        {dist && (
                          <div className="absolute top-2 right-2 bg-[rgba(26,26,46,.85)] text-[#e8c547] text-[10px] px-2 py-0.5 rounded-full">
                            {dist} {isAr ? "كم" : "km"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4 sm:p-0 sm:py-4 sm:pr-5 flex flex-col justify-between">
                        <div>
                          <div className="text-base font-medium text-[#111118] mb-1.5">
                            {l.title}
                          </div>
                          <div className="text-[13px] text-gray-400 mb-2.5 flex items-center gap-1">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="text-[#e8c547]"
                            >
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            {l.location}
                          </div>
                          <div className={`${displayFontClass} font-light text-2xl text-[#1a1a2e] mb-3 ${isAr ? "italic" : ""}`}>
                            {l.price} {isAr ? " دينار" : "LYD"}
                            <span className="text-base font-normal not-italic text-[#242323]">
                              / {isAr ? "ليلة" : "night"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2.5 flex-wrap">
                          <Link
                            href={`/listings/${l.id}`}
                            className="bg-[#1a1a2e] text-[#e8c547] px-5 py-2.5 rounded-lg text-[13px] transition-opacity hover:opacity-90"
                          >
                            {isAr ? "عرض التفاصيل" : "view details"} →
                          </Link>
                          {l.coordinates && (
                            <>
                              <button
                                onClick={() => openMaps(l)}
                                className="bg-[#1D9E75] text-white border-none rounded-lg px-5 py-2.5 text-[13px] cursor-pointer flex items-center gap-1.5"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                  <circle cx="12" cy="9" r="3" />
                                </svg>
                                {isAr ? "عرض على الخريطة" : "view on map"}
                              </button>
                              <button
                                onClick={() => getDirections(l)}
                                className="bg-gray-100 text-[#1a1a2e] border border-gray-200 rounded-lg px-5 py-2.5 text-[13px] cursor-pointer flex items-center gap-1.5"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                  <circle cx="12" cy="9" r="3" />
                                </svg>
                                {isAr ? "اتجاهات" : "directions"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 px-8 bg-white rounded-xl border border-black/7">
                <div className={`${displayFontClass} font-light text-2xl text-gray-300 mb-3 ${isAr ? "italic" : ""}`}>
                  {isAr ? "لا توجد أماكن قريبة" : "nothing nearby"}
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  {isAr
                    ? `لا توجد أماكن ضمن ${searchRadius} كم`
                    : `No places within ${searchRadius} km`}
                </p>
                <button
                  onClick={() => filterByDistance(50)}
                  className="bg-none border-none text-[#185FA5] text-[13px] cursor-pointer font-medium"
                >
                  {isAr ? "توسيع إلى 50 كم →" : "expand to 50 km →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div>
            <div className={`${displayFontClass} font-light text-xl text-[#111118] mb-4 ${isAr ? "italic" : ""}`}>
              {isAr ? "حجوزاتي" : "my bookings"}
            </div>
            {bookings.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-xl border border-black/7">
                <div className={`${displayFontClass} font-light text-2xl text-gray-300 mb-3 ${isAr ? "italic" : ""}`}>
                  {isAr ? "لا توجد حجوزات بعد" : "no bookings yet"}
                </div>
                <p className="text-[13px] text-gray-400 mb-4">
                  {isAr
                    ? "اكتشف أماكن رائعة للإقامة"
                    : "Discover amazing places to stay"}
                </p>
                <Link
                  href="/listings"
                  className="bg-[#1a1a2e] text-[#e8c547] px-6 py-2.5 rounded-lg text-[13px] inline-block"
                >
                  {isAr ? "استعرض القوائم →" : "browse listings →"}
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {bookings.map((b) => {
                  const { bg: sBg, c: sC } = statusStyle(b.status);
                  const n = nights(b.check_in, b.check_out);
                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-xl border border-black/7 p-4 md:p-5"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                        <div className="text-sm font-medium text-[#111118]">
                          {b.listing?.title || (isAr ? "قائمة" : "Listing")}
                        </div>
                        <span
                          className="text-[10px] font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full"
                          style={{ background: sBg, color: sC }}
                        >
                          {b.status === "confirmed" &&
                            (isAr ? "مؤكد" : "confirmed")}
                          {b.status === "pending" &&
                            (isAr ? "قيد الانتظار" : "pending")}
                          {b.status === "cancelled" &&
                            (isAr ? "ملغي" : "cancelled")}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-4">
                        {b.listing?.location}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div>
                          <div className="text-[10px] tracking-wide uppercase text-gray-300 mb-0.5">
                            {isAr ? "تسجيل الوصول" : "check-in"}
                          </div>
                          <div className="text-xs text-[#111118]">
                            {b.check_in_display || fmt(b.check_in)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] tracking-wide uppercase text-gray-300 mb-0.5">
                            {isAr ? "تسجيل المغادرة" : "check-out"}
                          </div>
                          <div className="text-xs text-[#111118]">
                            {b.check_out_display || fmt(b.check_out)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] tracking-wide uppercase text-gray-300 mb-0.5">
                            {isAr ? "الليالي" : "nights"}
                          </div>
                          <div className="text-xs text-[#111118]">
                            {n} {n === 1 ? (isAr ? "ليلة" : "night") : isAr ? "ليالي" : "nights"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] tracking-wide uppercase text-gray-300 mb-0.5">
                            {isAr ? "الضيوف" : "guests"}
                          </div>
                          <div className="text-xs text-[#111118]">
                            {b.guests} {b.guests === 1 ? (isAr ? "ضيف" : "guest") : isAr ? "ضيوف" : "guests"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] tracking-wide uppercase text-gray-300 mb-0.5">
                          {isAr ? "المجموع" : "total"}
                        </div>
                        <div className={`${displayFontClass} font-light text-xl text-[#1a1a2e] ${isAr ? "italic" : ""}`}>
                          {b.total_price} {isAr ? " دينار" : "LYD"}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap mt-4">
                        {b.status !== "cancelled" && (
                          <>
                            <Link
                              href={`/listings/${b.listing_id}`}
                              className="bg-[#1a1a2e] text-[#e8c547] px-3.5 py-1.5 rounded-md text-xs"
                            >
                              {isAr ? "عرض القائمة" : "view listing"}
                            </Link>
                            <button
                              onClick={() => cancelBooking(b.id)}
                              className="bg-none border border-[rgba(163,45,45,.25)] text-[#A32D2D] px-3.5 py-1.5 rounded-md text-xs cursor-pointer"
                            >
                              {isAr ? "إلغاء" : "cancel"}
                            </button>
                          </>
                        )}
                        {b.listing?.coordinates && (
                          <button
                            onClick={() => openMaps(b.listing)}
                            className="bg-[#1D9E75] text-white border-none rounded-md px-3.5 py-1.5 text-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                              <circle cx="12" cy="9" r="3" />
                            </svg>
                            {isAr ? "خريطة" : "maps"}
                          </button>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-300 mt-3">
                        {isAr ? "تم الحجز" : "booked"} {fmt(b.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}