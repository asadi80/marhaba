"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom House Icon
const houseIcon = L.divIcon({
  html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#e8c547"/>
    <path d="M9 22V12H15V22" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#e8c547"/>
    <path d="M12 2L21 9" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3 9L12 2" stroke="#1a1a2e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: "custom-house-icon",
});

// Custom User Location Dot with Pulse
const userLocationIcon = L.divIcon({
  html: `<div style="position: relative;">
    <div style="width: 16px; height: 16px; background: #1D9E75; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 rgba(29,158,117,0.4); animation: pulse 1.5s infinite;"></div>
  </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
  className: "custom-user-dot",
});

// Add pulse animation to the page
const addPulseAnimation = () => {
  if (
    typeof document !== "undefined" &&
    !document.getElementById("pulse-style")
  ) {
    const style = document.createElement("style");
    style.id = "pulse-style";
    style.textContent = `
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(29,158,117,0.4); }
        70% { box-shadow: 0 0 0 10px rgba(29,158,117,0); }
        100% { box-shadow: 0 0 0 0 rgba(29,158,117,0); }
      }
      .custom-house-icon svg {
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        transition: transform 0.2s;
      }
      .custom-house-icon svg:hover {
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);
  }
};

// Helper function to make authenticated fetch requests with credentials
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("marhabaToken");

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};
/* ── helpers ── */
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
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#EAF3DE", color: "#27500A" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#FBEAF0", color: "#72243E" },
];
const avi = (name) =>
  AVATAR_PAL[name?.charCodeAt(0) % AVATAR_PAL.length] ?? AVATAR_PAL[0];

const statusStyle = (s) =>
  ({
    confirmed: { bg: "#EAF3DE", color: "#27500A" },
    pending: { bg: "#FAEEDA", color: "#633806" },
    cancelled: { bg: "#FCEBEB", color: "#791F1F" },
  })[s] ?? { bg: "#F1EFE8", color: "#444441" };

/* ── component ── */
export default function UserDashboard() {

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFiltered] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [activeTab, setActiveTab] = useState("nearby");
  const [iconsReady, setIconsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("marhabaToken");

    if (!token) {
      router.replace("/login"); // 🚨 protect page
    }
  }, []);

  // Initialize custom icons
  useEffect(() => {
    addPulseAnimation();
    setIconsReady(true);
  }, []);

 useEffect(() => {
  const init = async () => {
    const token = localStorage.getItem("marhabaToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const res = await authFetch("/api/auth/me");

      if (!res.ok) throw new Error();

      const data = await res.json();
      const role = data.user?.role || data.user?.userType;

      // ✅ ONLY redirect if NOT already on correct page
      if (role === "admin" || role === "super_admin") {
        router.replace("/admin");
        return;
      }

      if (role === "host") {
        router.replace("/host-dashboard");
        return;
      }

      // ✅ if user → stay here (DO NOTHING)

      setUser(data.user);
      getUserLocation();
      fetchListings();
      fetchBookings();

    } catch (err) {
      console.error("Auth failed:", err);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  init();
}, []);

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
      const d = await (await authFetch("/api/listings")).json();
      setListings(d.listings);
      setFiltered(d.listings);
    } catch {
      /* silent */
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await authFetch("/api/bookings");
      if (!response.ok) return;
      const d = await response.json();
      // Filter bookings to only show current user's bookings
      const userBookings = d.bookings.filter(
        (booking) =>
          booking.user?._id === user?.id || booking.user === user?.id,
      );
      setBookings(userBookings);
    } catch {
      /* silent */
    }
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
      alert("Enable location services first");
      return;
    }
    window.open(
      `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${l.coordinates.lat},${l.coordinates.lng}`,
      "_blank",
    );
  };

  const cancelBooking = async (id) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await authFetch(`/api/bookings/${id}`, {
        method: "PUT",
        body: JSON.stringify({ action: "cancel" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to cancel booking");
      }

      alert("Booking cancelled successfully");
      // Refresh bookings after cancellation
      fetchBookings();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleLogout = async () => {
    try {
      await authFetch("/api/auth/logout", { method: "POST" });
      ["marhabaToken", "userType", "userData"].forEach((k) =>
        localStorage.removeItem(k),
      );
      router.push("/login");
    } catch {
      /* silent */
    }
  };

  /* ── styles ── */
  const inputCls =
    "px-3 py-2 bg-[#fafaf8] border border-black/10 rounded-md text-[12px] text-[#111118] font-[inherit] outline-none focus:border-[#185FA5] transition-all";

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
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  if (!user) return null;



  const userInitials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const { bg: aviBg, color: aviColor } = avi(user.name);
  const TABS = [
    { id: "nearby", label: "nearby places" },
    { id: "bookings", label: `my bookings (${bookings.length})` },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Mono', monospace; background: #f7f6f2; }
        .font-display { font-family: 'Fraunces', serif; }
        .listing-card { transition: transform 0.18s, box-shadow 0.18s; }
        .listing-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.08); }
        .booking-card { transition: box-shadow 0.15s; }
        .booking-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
        .map-btn { transition: opacity 0.15s; }
        .map-btn:hover { opacity: 0.85; }
        .leaflet-popup-content-wrapper { border-radius: 10px !important; font-family: 'DM Mono', monospace !important; font-size: 12px !important; }
        .leaflet-popup-tip { display: none !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f7f6f2" }}>
        {/* NAV */}
        <nav
          style={{
            background: "#1a1a2e",
            borderBottom: "1px solid rgba(232,197,71,0.15)",
            padding: "0 2rem",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div
              className="font-display"
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: 20,
                color: "#fff",
              }}
            >
              mar
              <span
                style={{
                  fontStyle: "normal",
                  fontWeight: 500,
                  color: "#e8c547",
                }}
              >
                haba
              </span>
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    padding: "6px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    color:
                      activeTab === t.id ? "#e8c547" : "rgba(255,255,255,0.45)",
                    background:
                      activeTab === t.id
                        ? "rgba(232,197,71,0.1)"
                        : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/listings"
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.color = "rgba(255,255,255,0.85)")
              }
              onMouseLeave={(e) =>
                (e.target.style.color = "rgba(255,255,255,0.45)")
              }
            >
              browse listings
            </Link>
            <div
              style={{
                width: 1,
                height: 16,
                background: "rgba(255,255,255,0.1)",
              }}
            />
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: aviBg,
                color: aviColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {userInitials}
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: 4,
                color: "rgba(255,255,255,0.4)",
                fontFamily: "inherit",
                fontSize: 11,
                padding: "4px 12px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "rgba(255,100,100,0.5)";
                e.target.style.color = "rgba(255,100,100,0.9)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.12)";
                e.target.style.color = "rgba(255,255,255,0.4)";
              }}
            >
              logout
            </button>
          </div>
        </nav>

        <main
          style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}
        >
        
          {/* PROFILE STRIP */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "0.5px solid rgba(0,0,0,0.07)",
              padding: "1.25rem 1.5rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: aviBg,
                  color: aviColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {userInitials}
              </div>
              <div>
                <div
                  className="font-display"
                  style={{
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 20,
                    color: "#111118",
                    lineHeight: 1.1,
                  }}
                >
                  {user.name}
                </div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                  member since {fmt(user.createdAt)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {[
                { label: "total bookings", val: bookings.length },
                { label: "nearby places", val: filteredListings.length },
                {
                  /* { label:'your location', val: userLocation ? `${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)}` : '—' }, */
                },
              ].map(({ label, val }) => (
                <div key={label} style={{ textAlign: "right" }}>
                  <div
                    className="font-display"
                    style={{
                      fontStyle: "italic",
                      fontWeight: 300,
                      fontSize: 22,
                      color: "#111118",
                      lineHeight: 1,
                    }}
                  >
                    {val}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: "#bbb",
                      marginTop: 3,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
   

          {/* ── NEARBY TAB ── */}
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
                  className="font-display"
                  style={{
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: 22,
                    color: "#111118",
                  }}
                >
                  nearby places
                  <span
                    style={{
                      fontSize: 13,
                      fontStyle: "normal",
                      fontWeight: 400,
                      color: "#999",
                      marginLeft: 8,
                    }}
                  >
                    ({filteredListings.length} found)
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: "#999",
                    }}
                  >
                    radius
                  </label>
                  <select
                    className={inputCls}
                    value={searchRadius}
                    onChange={(e) => filterByDistance(parseInt(e.target.value))}
                  >
                    {[5, 10, 20, 50, 100].map((v) => (
                      <option key={v} value={v}>
                        {v} km
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {userLocation && iconsReady && (
                <div
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "0.5px solid rgba(0,0,0,0.08)",
                    marginBottom: "1.5rem",
                    height: 440,
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

                    <Marker
                      position={[userLocation.lat, userLocation.lng]}
                      icon={userLocationIcon}
                    >
                      <Popup>
                        <strong
                          style={{
                            fontFamily: "DM Mono,monospace",
                            fontSize: 12,
                          }}
                        >
                          📍 your location
                        </strong>
                      </Popup>
                    </Marker>

                    {filteredListings.map(
                      (l) =>
                        l.coordinates && (
                          <Marker
                            key={l._id}
                            position={[l.coordinates.lat, l.coordinates.lng]}
                            icon={houseIcon}
                          >
                            <Popup>
                              <div
                                style={{
                                  fontFamily: "DM Mono,monospace",
                                  fontSize: 12,
                                  minWidth: 180,
                                }}
                              >
                                {l.images?.[0] && (
                                  <img
                                    src={l.images[0]}
                                    alt={l.title}
                                    style={{
                                      width: "100%",
                                      height: 100,
                                      objectFit: "cover",
                                      borderRadius: 6,
                                      marginBottom: 8,
                                    }}
                                  />
                                )}
                                <div
                                  style={{
                                    fontWeight: 500,
                                    color: "#111118",
                                    marginBottom: 2,
                                  }}
                                >
                                  {l.title}
                                </div>
                                <div style={{ color: "#888", marginBottom: 6 }}>
                                  {l.location}
                                </div>
                                <div
                                  style={{
                                    color: "#1a1a2e",
                                    fontWeight: 500,
                                    marginBottom: 8,
                                  }}
                                >
                                  ${l.price}{" "}
                                  <span
                                    style={{ fontWeight: 400, color: "#999" }}
                                  >
                                    / night
                                  </span>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <Link
                                    href={`/listings/${l._id}`}
                                    style={{
                                      flex: 1,
                                      background: "#1a1a2e",
                                      color: "#e8c547",
                                      padding: "5px 0",
                                      borderRadius: 5,
                                      textAlign: "center",
                                      textDecoration: "none",
                                      fontSize: 11,
                                    }}
                                  >
                                    view
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
                                    }}
                                  >
                                    directions
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

              {filteredListings.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 16,
                  }}
                >
                  {filteredListings.map((l) => {
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
                      <div
                        key={l._id}
                        className="listing-card"
                        style={{
                          background: "#fff",
                          borderRadius: 12,
                          border: "0.5px solid rgba(0,0,0,0.07)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: 180,
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <img
                            src={l.images?.[0]}
                            alt={l.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.35s",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.transform = "scale(1.05)")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.transform = "scale(1)")
                            }
                          />
                          {dist && (
                            <div
                              style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                background: "rgba(26,26,46,0.85)",
                                color: "#e8c547",
                                fontSize: 10,
                                padding: "3px 9px",
                                borderRadius: 20,
                                letterSpacing: "0.04em",
                              }}
                            >
                              {dist} km
                            </div>
                          )}
                        </div>
                        <div style={{ padding: "1rem" }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#111118",
                              marginBottom: 4,
                            }}
                          >
                            {l.title}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#888",
                              marginBottom: 8,
                            }}
                          >
                            {l.location}
                          </div>
                          <div
                            className="font-display"
                            style={{
                              fontStyle: "italic",
                              fontWeight: 300,
                              fontSize: 20,
                              color: "#1a1a2e",
                              marginBottom: "0.75rem",
                            }}
                          >
                            ${l.price}{" "}
                            <span
                              style={{
                                fontSize: 12,
                                fontStyle: "normal",
                                color: "#999",
                              }}
                            >
                              / night
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Link
                              href={`/listings/${l._id}`}
                              style={{
                                flex: 1,
                                background: "#1a1a2e",
                                color: "#e8c547",
                                padding: "8px 0",
                                borderRadius: 7,
                                textAlign: "center",
                                textDecoration: "none",
                                fontSize: 12,
                              }}
                            >
                              view details
                            </Link>
                            {l.coordinates && (
                              <button
                                onClick={() => openMaps(l)}
                                className="map-btn"
                                style={{
                                  background: "#1D9E75",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 7,
                                  padding: "8px 14px",
                                  fontSize: 12,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                maps
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
                    padding: "4rem 1rem",
                    background: "#fff",
                    borderRadius: 12,
                    border: "0.5px solid rgba(0,0,0,0.07)",
                  }}
                >
                  <div
                    className="font-display"
                    style={{
                      fontStyle: "italic",
                      fontWeight: 300,
                      fontSize: 24,
                      color: "#ccc",
                      marginBottom: "0.75rem",
                    }}
                  >
                    nothing nearby
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#999",
                      marginBottom: "1rem",
                    }}
                  >
                    No places within {searchRadius} km
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
                    }}
                  >
                    expand to 50 km →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── BOOKINGS TAB ── */}
          {activeTab === "bookings" && (
            <div>
              <div
                className="font-display"
                style={{
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: 22,
                  color: "#111118",
                  marginBottom: "1.25rem",
                }}
              >
                my bookings
              </div>

              {bookings.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "5rem 1rem",
                    background: "#fff",
                    borderRadius: 12,
                    border: "0.5px solid rgba(0,0,0,0.07)",
                  }}
                >
                  <div
                    className="font-display"
                    style={{
                      fontStyle: "italic",
                      fontWeight: 300,
                      fontSize: 28,
                      color: "#ccc",
                      marginBottom: "0.75rem",
                    }}
                  >
                    no bookings yet
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#999",
                      marginBottom: "1.5rem",
                    }}
                  >
                    Discover amazing places to stay
                  </p>
                  <Link
                    href="/listings"
                    style={{
                      background: "#1a1a2e",
                      color: "#e8c547",
                      padding: "10px 24px",
                      borderRadius: 8,
                      fontSize: 13,
                      textDecoration: "none",
                    }}
                  >
                    browse listings →
                  </Link>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {bookings.map((b) => {
                    const { bg: sBg, color: sColor } = statusStyle(b.status);
                    const n = nights(b.checkIn, b.checkOut);
                    return (
                      <div
                        key={b._id}
                        className="booking-card"
                        style={{
                          background: "#fff",
                          borderRadius: 12,
                          border: "0.5px solid rgba(0,0,0,0.07)",
                          padding: "1.25rem 1.5rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: 12,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 6,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 500,
                                  color: "#111118",
                                }}
                              >
                                {b.listing?.title || "Listing"}
                              </div>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 500,
                                  letterSpacing: "0.04em",
                                  textTransform: "uppercase",
                                  background: sBg,
                                  color: sColor,
                                  padding: "3px 10px",
                                  borderRadius: 20,
                                }}
                              >
                                {b.status}
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
                                  "repeat(auto-fill, minmax(130px, 1fr))",
                                gap: "0.75rem",
                              }}
                            >
                              {[
                                { label: "check-in", val: fmt(b.checkIn) },
                                { label: "check-out", val: fmt(b.checkOut) },
                                {
                                  label: "nights",
                                  val: `${n} ${n === 1 ? "night" : "nights"}`,
                                },
                                {
                                  label: "guests",
                                  val: `${b.guests} ${b.guests === 1 ? "guest" : "guests"}`,
                                },
                              ].map(({ label, val }) => (
                                <div key={label}>
                                  <div
                                    style={{
                                      fontSize: 10,
                                      letterSpacing: "0.07em",
                                      textTransform: "uppercase",
                                      color: "#bbb",
                                      marginBottom: 2,
                                    }}
                                  >
                                    {label}
                                  </div>
                                  <div
                                    style={{ fontSize: 13, color: "#111118" }}
                                  >
                                    {val}
                                  </div>
                                </div>
                              ))}
                              <div>
                                <div
                                  style={{
                                    fontSize: 10,
                                    letterSpacing: "0.07em",
                                    textTransform: "uppercase",
                                    color: "#bbb",
                                    marginBottom: 2,
                                  }}
                                >
                                  total
                                </div>
                                <div
                                  className="font-display"
                                  style={{
                                    fontStyle: "italic",
                                    fontWeight: 300,
                                    fontSize: 20,
                                    color: "#1a1a2e",
                                  }}
                                >
                                  ${b.totalPrice}
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                fontSize: 11,
                                color: "#ccc",
                                marginTop: "0.75rem",
                              }}
                            >
                              booked {fmt(b.createdAt)}
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                              minWidth: 130,
                            }}
                          >
                            {b.status !== "cancelled" &&
                              b.status !== "confirmed" && (
                                <button
                                  onClick={() => cancelBooking(b._id)}
                                  style={{
                                    background: "none",
                                    border: "0.5px solid rgba(163,45,45,0.25)",
                                    color: "#A32D2D",
                                    padding: "7px 16px",
                                    borderRadius: 7,
                                    fontSize: 12,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    transition: "background 0.15s",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.target.style.background = "#FCEBEB")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.target.style.background = "none")
                                  }
                                >
                                  cancel
                                </button>
                              )}
                            {b.status === "confirmed" && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#1D9E75",
                                  textAlign: "center",
                                  padding: "7px 16px",
                                  background: "#EAF3DE",
                                  borderRadius: 7,
                                }}
                              >
                                ✓ confirmed
                              </div>
                            )}
                            {b.listing?.coordinates && (
                              <button
                                onClick={() => openMaps(b.listing)}
                                className="map-btn"
                                style={{
                                  background: "#1D9E75",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 7,
                                  padding: "8px 16px",
                                  fontSize: 12,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
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
                                view on map
                              </button>
                            )}
                          </div>
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
    </>
  );
}
