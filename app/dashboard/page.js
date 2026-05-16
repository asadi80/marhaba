"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLanguage } from "@/hooks/useLanguage";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
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
  const [menuOpen, setMenuOpen] = useState(false);
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
      () => setUserLocation({ lat: 51.505, lng: -0.09 }),
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
            l.coordinates.lng,
          ) <= radius,
      ),
    );
    setSearchRadius(radius);
  };

  const openMaps = (l) =>
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${l.coordinates.lat},${l.coordinates.lng}`,
      "_blank",
    );

  const getDirections = (l) => {
    if (!userLocation) {
      alert(
        isAr
          ? "قم بتفعيل خدمات الموقع أولاً"
          : "Enable location services first",
      );
      return;
    }
    window.open(
      `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${l.coordinates.lat},${l.coordinates.lng}`,
      "_blank",
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
        localStorage.removeItem(k),
      );
      router.push("/login");
    } catch {}
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f6f2",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "2px solid #1a1a2e",
            borderTopColor: "transparent",
            animation: "spin .7s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

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

  const arabicFont =
    "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishFont = "'DM Mono', monospace";
  const arabicDisplay =
    "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishDisplay = "'Fraunces', serif";
  const bodyFont = isAr ? arabicFont : englishFont;
  const displayFont = isAr ? arabicDisplay : englishDisplay;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700&family=Almarai:wght@300;400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,500;1,300&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:${bodyFont};background:#f7f6f2;}
        .fd{font-family:${displayFont};}
        .lc:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.08);}
        .lc{transition:transform .18s,box-shadow .18s;}
        .tabs::-webkit-scrollbar{display:none;}
        .tabs{-ms-overflow-style:none;scrollbar-width:none;}
        a{text-decoration:none;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .mob-menu{display:none;flex-direction:column;gap:10px;padding:12px 1rem;border-top:0.5px solid rgba(255,255,255,.08);}
        .mob-menu.open{display:flex;}
        .leaflet-popup-content-wrapper{border-radius:10px!important;font-family:${bodyFont}!important;font-size:12px!important;}
        .leaflet-popup-tip{display:none!important;}
        
        .listings-single-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .listing-row {
          display: flex;
          gap: 20px;
          background: #fff;
          border-radius: 12px;
          border: 0.5px solid rgba(0,0,0,.07);
          overflow: hidden;
          transition: transform .18s, box-shadow .18s;
        }
        
        .listing-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0,0,0,.08);
        }
        
        .listing-row-image {
          width: 200px;
          min-width: 200px;
          height: 180px;
          overflow: hidden;
          position: relative;
        }
        
        .listing-row-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .35s;
        }
        
        .listing-row-image img:hover {
          transform: scale(1.05);
        }
        
        .listing-row-content {
          flex: 1;
          padding: 16px 20px 16px 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .listing-row-distance {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(26,26,46,.85);
          color: #e8c547;
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 20px;
        }
        
        @media (max-width: 640px) {
          .listing-row {
            flex-direction: column;
          }
          .listing-row-image {
            width: 100%;
            height: 200px;
          }
          .listing-row-content {
            padding: 16px;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#f7f6f2",
          direction: isAr ? "rtl" : "ltr",
        }}
      >
        {/* NAV */}
        <nav
          style={{
            background: "#1a1a2e",
            borderBottom: "1px solid rgba(232,197,71,.15)",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div
            style={{
              padding: "0 1rem",
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 0,
                flex: 1,
              }}
            >
              <Link
                href="/"
                style={{
                  textDecoration: "none",
                  fontFamily: "'Cairo', 'Tajawal', sans-serif",
                  fontWeight: 500,
                  fontSize: "26px",
                  color: "#ffffff",
                  letterSpacing: "1px",
                }}
              >
                مر<span style={{ fontWeight: 700, color: "#e8c547" }}>حبا</span>
              </Link>

              <button
                onClick={toggleLanguage}
                style={{
                  background: "rgba(232,197,71,0.15)",
                  border: "1px solid rgba(232,197,71,0.3)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  cursor: "pointer",
                  color: "#e8c547",
                  fontFamily: "inherit",
                }}
              >
                {isAr ? "🇬🇧 English" : "🇸🇦 عربي"}
              </button>

              <div
                className="tabs"
                style={{ display: "flex", gap: 2, overflowX: "auto", flex: 1 }}
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background:
                        activeTab === tab.id ? "rgba(232,197,71,.1)" : "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: 11,
                      whiteSpace: "nowrap",
                      color:
                        activeTab === tab.id
                          ? "#e8c547"
                          : "rgba(255,255,255,.45)",
                      fontFamily: "inherit",
                      flexShrink: 0,
                      transition: "all .15s",
                    }}
                  >
                    {tab.l}
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <Link
                href="/listings"
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.4)",
                  display: "none",
                }}
                className="sm-show"
              >
                {isAr ? "استعرض" : "browse"}
              </Link>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: aviBg,
                  color: aviColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 500,
                }}
              >
                {ini}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "0.5px solid #e8c547",
                  borderRadius: 4,
                  color: "#e8c547",
                  fontFamily: "inherit",
                  fontSize: 11,
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                {isAr ? "خروج" : "logout"}
              </button>
            </div>
          </div>
        </nav>

        <main
          style={{ maxWidth: 1200, margin: "0 auto", padding: "1.25rem 1rem" }}
        >
          {/* Profile strip */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "0.5px solid rgba(0,0,0,.07)",
              padding: "1rem 1.25rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: aviBg,
                  color: aviColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {ini}
              </div>
              <div>
                <div
                  className="fd"
                  style={{
                    fontStyle: isAr ? "normal" : "italic",
                    fontWeight: 300,
                    fontSize: 20,
                    color: "#111118",
                    lineHeight: 1.1,
                  }}
                >
                  {user.name}
                </div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                  {isAr ? "عضو منذ" : "member since"} {fmt(user.createdAt)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { l: isAr ? "الحجوزات" : "bookings", v: bookings.length },
                { l: isAr ? "القريبة" : "nearby", v: filtered.length },
              ].map(({ l, v }) => (
                <div key={l} style={{ textAlign: isAr ? "left" : "right" }}>
                  <div
                    className="fd"
                    style={{
                      fontStyle: isAr ? "normal" : "italic",
                      fontWeight: 300,
                      fontSize: 22,
                      color: "#111118",
                      lineHeight: 1,
                    }}
                  >
                    {v}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: ".07em",
                      textTransform: "uppercase",
                      color: "#bbb",
                      marginTop: 2,
                    }}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NEARBY TAB */}
          {activeTab === "nearby" && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div
                  className="fd"
                  style={{
                    fontStyle: isAr ? "normal" : "italic",
                    fontWeight: 300,
                    fontSize: 20,
                    color: "#111118",
                  }}
                >
                  {isAr ? "الأماكن القريبة" : "nearby places"}
                  <span
                    style={{
                      fontSize: 13,
                      fontStyle: "normal",
                      color: "#999",
                      marginLeft: 8,
                    }}
                  >
                    ({filtered.length})
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label
                    style={{
                      fontSize: 11,
                      letterSpacing: ".07em",
                      textTransform: "uppercase",
                      color: "#999",
                    }}
                  >
                    {isAr ? "نصف القطر" : "radius"}
                  </label>
                  <select
                    onChange={(e) => filterByDistance(parseInt(e.target.value))}
                    value={searchRadius}
                    style={{
                      padding: "7px 10px",
                      background: "#fafaf8",
                      border: "0.5px solid rgba(0,0,0,.12)",
                      borderRadius: 7,
                      fontSize: 12,
                      fontFamily: "inherit",
                      outline: "none",
                    }}
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
                <div
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "0.5px solid rgba(0,0,0,.08)",
                    marginBottom: "1.25rem",
                    height: "clamp(280px,45vw,440px)",
                  }}
                >
                  <MapContainer
                    center={[mapCenter.lat, mapCenter.lng]}
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />

                    {/* User Location Marker */}
                    {icons.user && (
                      <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={icons.user}
                      >
                        <Popup>
                          <strong
                            style={{ fontFamily: bodyFont, fontSize: 12 }}
                          >
                            {isAr
                              ? "📍 موقعك الحالي"
                              : "📍 Your current location"}
                          </strong>
                        </Popup>
                      </Marker>
                    )}

                    {/* Listing Markers */}
                    {icons.house &&
                      filtered.map(
                        (l) =>
                          l.coordinates && (
                            <Marker
                              key={l._id}
                              position={[l.coordinates.lat, l.coordinates.lng]}
                              icon={icons.house}
                            >
                              <Popup>
                                <div
                                  style={{
                                    fontFamily: bodyFont,
                                    fontSize: 12,
                                    minWidth: 160,
                                  }}
                                >
                                  {l.images?.[0] && (
                                    <img
                                      src={l.images[0]}
                                      alt={l.title}
                                      style={{
                                        width: "100%",
                                        height: 90,
                                        objectFit: "cover",
                                        borderRadius: 6,
                                        marginBottom: 8,
                                      }}
                                    />
                                  )}
                                  <div
                                    style={{ fontWeight: 500, marginBottom: 2 }}
                                  >
                                    🏠 {l.title}
                                  </div>
                                  <div
                                    style={{ color: "#888", marginBottom: 6 }}
                                  >
                                    {l.location}
                                  </div>
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <Link
                                      href={`/listings/${l.id}`}
                                      style={{
                                        flex: 1,
                                        background: "#1a1a2e",
                                        color: "#e8c547",
                                        padding: "5px 0",
                                        borderRadius: 5,
                                        textAlign: "center",
                                        fontSize: 11,
                                      }}
                                    >
                                      {isAr ? "عرض" : "view"}
                                    </Link>
                                    <button
                                      onClick={() => getDirections(l)}
                                      style={{
                                        flex: 1,
                                        background: "#1D9E75",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 5,
                                        fontSize: 11,
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                      }}
                                    >
                                      {isAr ? "اتجاهات" : "dir"}
                                    </button>
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                          ),
                      )}
                  </MapContainer>
                </div>
              )}

              {/* Listing cards */}
              {filtered.length > 0 ? (
                <div className="listings-single-column">
                  {filtered.map((l) => {
                    const dist =
                      userLocation && l.coordinates
                        ? haversine(
                            userLocation.lat,
                            userLocation.lng,
                            l.coordinates.lat,
                            l.coordinates.lng,
                          ).toFixed(1)
                        : null;
                    return (
                      <div key={l._id} className="listing-row">
                        <div className="listing-row-image">
                          <img src={l.images?.[0]} alt={l.title} />
                          {dist && (
                            <div className="listing-row-distance">
                              {dist} {isAr ? "كم" : "km"}
                            </div>
                          )}
                        </div>
                        <div className="listing-row-content">
                          <div>
                            <div
                              style={{
                                fontSize: 16,
                                fontWeight: 500,
                                color: "#111118",
                                marginBottom: 6,
                              }}
                            >
                              {l.title}
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "#888",
                                marginBottom: 10,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                style={{ color: "#e8c547" }}
                              >
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                              </svg>
                              {l.location}
                            </div>
                            <div
                              className="fd"
                              style={{
                                fontStyle: isAr ? "normal" : "italic",
                                fontWeight: 300,
                                fontSize: 24,
                                color: "#1a1a2e",
                                marginBottom: 12,
                              }}
                            >
                              {l.price} {isAr ? " دينار" : "LYD"}
                              <span
                                style={{
                                  fontSize: 16,
                                  fontStyle: "normal",
                                  color: "#242323",
                                }}
                              >
                                / {isAr ? "ليلة" : "night"}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              flexWrap: "wrap",
                            }}
                          >
                            <Link
                              href={`/listings/${l._id}`}
                              style={{
                                background: "#1a1a2e",
                                color: "#e8c547",
                                padding: "10px 20px",
                                borderRadius: 8,
                                textAlign: "center",
                                fontSize: 13,
                                textDecoration: "none",
                                transition: "opacity .15s",
                              }}
                            >
                              {isAr ? "عرض التفاصيل" : "view details"} →
                            </Link>
                            {l.coordinates && (
                              <button
                                onClick={() => openMaps(l)}
                                style={{
                                  background: "#1D9E75",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "10px 20px",
                                  fontSize: 13,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                {isAr ? "عرض على الخريطة" : "view on map"}
                              </button>
                            )}
                            {l.coordinates && (
                              <button
                                onClick={() => getDirections(l)}
                                style={{
                                  background: "#f5f5f5",
                                  color: "#1a1a2e",
                                  border: "1px solid #ddd",
                                  borderRadius: 8,
                                  padding: "10px 20px",
                                  fontSize: 13,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                  <circle
                                    cx="12"
                                    cy="9"
                                    r="3"
                                    fill="currentColor"
                                  />
                                </svg>
                                {isAr ? "اتجاهات" : "directions"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "4rem 2rem",
                    background: "#fff",
                    borderRadius: 12,
                    border: "0.5px solid rgba(0,0,0,.07)",
                  }}
                >
                  <div
                    className="fd"
                    style={{
                      fontStyle: isAr ? "normal" : "italic",
                      fontWeight: 300,
                      fontSize: 26,
                      color: "#ccc",
                      marginBottom: ".75rem",
                    }}
                  >
                    {isAr ? "لا توجد أماكن قريبة" : "nothing nearby"}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#999",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {isAr
                      ? `لا توجد أماكن ضمن ${searchRadius} كم`
                      : `No places within ${searchRadius} km`}
                  </p>
                  <button
                    onClick={() => filterByDistance(50)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#185FA5",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 500,
                    }}
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
              <div
                className="fd"
                style={{
                  fontStyle: isAr ? "normal" : "italic",
                  fontWeight: 300,
                  fontSize: 20,
                  color: "#111118",
                  marginBottom: "1rem",
                }}
              >
                {isAr ? "حجوزاتي" : "my bookings"}
              </div>
              {bookings.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "4rem 1rem",
                    background: "#fff",
                    borderRadius: 12,
                    border: "0.5px solid rgba(0,0,0,.07)",
                  }}
                >
                  <div
                    className="fd"
                    style={{
                      fontStyle: isAr ? "normal" : "italic",
                      fontWeight: 300,
                      fontSize: 26,
                      color: "#ccc",
                      marginBottom: ".75rem",
                    }}
                  >
                    {isAr ? "لا توجد حجوزات بعد" : "no bookings yet"}
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#999",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {isAr
                      ? "اكتشف أماكن رائعة للإقامة"
                      : "Discover amazing places to stay"}
                  </p>
                  <Link
                    href="/listings"
                    style={{
                      background: "#1a1a2e",
                      color: "#e8c547",
                      padding: "10px 24px",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  >
                    {isAr ? "استعرض القوائم →" : "browse listings →"}
                  </Link>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {bookings.map((b) => {
                    const { bg: sBg, c: sC } = statusStyle(b.status);
                    const n = nights(b.checkIn, b.checkOut);
                    return (
                      <div
                        key={b._id}
                        style={{
                          background: "#fff",
                          borderRadius: 12,
                          border: "0.5px solid rgba(0,0,0,.07)",
                          padding: "1.1rem 1.25rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 6,
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#111118",
                            }}
                          >
                            {b.listing?.title || (isAr ? "قائمة" : "Listing")}
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 500,
                              letterSpacing: ".04em",
                              textTransform: "uppercase",
                              background: sBg,
                              color: sC,
                              padding: "3px 10px",
                              borderRadius: 20,
                            }}
                          >
                            {b.status === "confirmed" &&
                              (isAr ? "مؤكد" : "confirmed")}
                            {b.status === "pending" &&
                              (isAr ? "قيد الانتظار" : "pending")}
                            {b.status === "cancelled" &&
                              (isAr ? "ملغي" : "cancelled")}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#888",
                            marginBottom: "1rem",
                          }}
                        >
                          {b.listing?.location}
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill,minmax(110px,1fr))",
                            gap: "0.75rem",
                            marginBottom: "1rem",
                          }}
                        >
                          {[
                            {
                              l: isAr ? "تسجيل الوصول" : "check-in",
                              v: fmt(b.checkIn),
                            },
                            {
                              l: isAr ? "تسجيل المغادرة" : "check-out",
                              v: fmt(b.checkOut),
                            },
                            {
                              l: isAr ? "الليالي" : "nights",
                              v: `${n} ${n === 1 ? (isAr ? "ليلة" : "night") : isAr ? "ليالي" : "nights"}`,
                            },
                            {
                              l: isAr ? "الضيوف" : "guests",
                              v: `${b.guests} ${b.guests === 1 ? (isAr ? "ضيف" : "guest") : isAr ? "ضيوف" : "guests"}`,
                            },
                          ].map(({ l, v }) => (
                            <div key={l}>
                              <div
                                style={{
                                  fontSize: 10,
                                  letterSpacing: ".07em",
                                  textTransform: "uppercase",
                                  color: "#bbb",
                                  marginBottom: 2,
                                }}
                              >
                                {l}
                              </div>
                              <div style={{ fontSize: 12, color: "#111118" }}>
                                {v}
                              </div>
                            </div>
                          ))}
                          <div>
                            <div
                              style={{
                                fontSize: 10,
                                letterSpacing: ".07em",
                                textTransform: "uppercase",
                                color: "#bbb",
                                marginBottom: 2,
                              }}
                            >
                              {isAr ? "المجموع" : "total"}
                            </div>
                            <div
                              className="fd"
                              style={{
                                fontStyle: isAr ? "normal" : "italic",
                                fontWeight: 300,
                                fontSize: 20,
                                color: "#1a1a2e",
                              }}
                            >
                              {b.totalPrice} {isAr ? " دينار" : "LYD"}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                        >
                          {b.status !== "cancelled" && (
                            <>
                              <Link
                                href={`/listings/${b.listing?._id}`}
                                style={{
                                  background: "#1a1a2e",
                                  color: "#e8c547",
                                  padding: "7px 14px",
                                  borderRadius: 7,
                                  fontSize: 12,
                                }}
                              >
                                {isAr ? "عرض القائمة" : "view listing"}
                              </Link>
                              <button
                                onClick={() => cancelBooking(b._id)}
                                style={{
                                  background: "none",
                                  border: "0.5px solid rgba(163,45,45,.25)",
                                  color: "#A32D2D",
                                  padding: "7px 14px",
                                  borderRadius: 7,
                                  fontSize: 12,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                }}
                              >
                                {isAr ? "إلغاء" : "cancel"}
                              </button>
                            </>
                          )}
                          {b.listing?.coordinates && (
                            <button
                              onClick={() => openMaps(b.listing)}
                              style={{
                                background: "#1D9E75",
                                color: "#fff",
                                border: "none",
                                borderRadius: 7,
                                padding: "7px 14px",
                                fontSize: 12,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                              </svg>
                              {isAr ? "خريطة" : "maps"}
                            </button>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#ccc",
                            marginTop: ".75rem",
                          }}
                        >
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

      <style>{`
        @media(min-width:640px){
          .sm-show{display:inline!important;}
          main{padding:1.5rem 1.5rem!important;}
        }
      `}</style>
    </>
  );
}
