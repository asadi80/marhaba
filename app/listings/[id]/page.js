"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import BookingCalendar from "@/components/BookingCalendar";
import { useLanguage } from "@/hooks/useLanguage";
import "leaflet/dist/leaflet.css";
import "./style.css";

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

// Categories data
const CATEGORIES = [
  { id: "beachfront", icon: "🏖️", labelEn: "Beachfront", labelAr: "شاطئ", descriptionEn: "Beautiful beachfront properties", descriptionAr: "عقارات جميلة على الشاطئ" },
  { id: "mountain", icon: "🏔️", labelEn: "Mountain", labelAr: "جبال", descriptionEn: "Scenic mountain retreats", descriptionAr: "منتجعات جبلية خلابة" },
  { id: "city", icon: "🏙️", labelEn: "City", labelAr: "مدينة", descriptionEn: "Vibrant city apartments", descriptionAr: "شقق مدينة نابضة بالحياة" },
  { id: "countryside", icon: "🏡", labelEn: "Countryside", labelAr: "ريفي", descriptionEn: "Peaceful countryside homes", descriptionAr: "منازل ريفية هادئة" },
  { id: "pool", icon: "🏊", labelEn: "Pool", labelAr: "مسبح", descriptionEn: "Properties with pools", descriptionAr: "عقارات بها مسبح" },
  { id: "islands", icon: "🌴", labelEn: "Islands", labelAr: "جزيرة", descriptionEn: "Tropical island escapes", descriptionAr: "ملاذات استوائية في الجزر" },
  { id: "camping", icon: "🏕️", labelEn: "Camping", labelAr: "تخييم", descriptionEn: "Outdoor camping experiences", descriptionAr: "تجارب تخييم في الهواء الطلق" },
  { id: "cabins", icon: "🛖", labelEn: "Cabins", labelAr: "كوخ", descriptionEn: "Cozy cabin getaways", descriptionAr: "ملاذات كوخ مريحة" },
];

// Date utility functions
const toDateString = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fromDateString = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const displayDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

const getLocalDateString = toDateString;
const createLocalDate = fromDateString;

// ─── Host Date Manager ────────────────────────────────────────────────────────
function HostDateManager({ listingId, blockedDates, onDatesUpdated }) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [blockRange, setBlockRange] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!blockRange.startDate || !blockRange.endDate) {
      setError(t.pleaseSelectBothDates);
      setLoading(false);
      return;
    }
    if (new Date(blockRange.startDate) >= new Date(blockRange.endDate)) {
      setError(t.endDateAfterStart);
      setLoading(false);
      return;
    }
    if (new Date(blockRange.startDate) < new Date()) {
      setError(t.cannotBlockPastDates);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: blockRange.startDate,
          endDate: blockRange.endDate,
          reason: blockRange.reason || t.blockedByHost,
        }),
      });
      const data = await res.json();
     
      
      if (!res.ok) throw new Error(data.message);
      setSuccess(t.datesBlockedSuccess);
      setBlockRange({ startDate: "", endDate: "", reason: "" });
      setShowForm(false);
      onDatesUpdated?.();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBlock = async (blockId) => {
    if (!confirm(t.confirmRemoveBlock)) return;
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(t.removedSuccessfully);
      onDatesUpdated?.();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const fmtDate = (s) =>
    new Date(s).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div style={{ marginTop: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#999",
          }}
        >
          {t.blockedDates}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: showForm ? "transparent" : "#FCEBEB",
            color: showForm ? "#888" : "#791F1F",
            border: showForm
              ? "1px solid rgba(0,0,0,0.1)"
              : "1px solid rgba(163,45,45,0.15)",
            borderRadius: 6,
            padding: "5px 12px",
            fontSize: 11,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          {showForm ? t.cancel : `+ ${t.blockDates}`}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleBlockSubmit}
          style={{
            background: "#f7f6f2",
            borderRadius: 10,
            padding: "1rem",
            marginBottom: "1rem",
            border: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 10,
            }}
          >
            {[
              ["startDate", t.startDate],
              ["endDate", t.endDate],
            ].map(([field, label]) => (
              <div key={field}>
                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#999",
                    marginBottom: 5,
                  }}
                >
                  {label}
                </label>
                <input
                  type="date"
                  value={blockRange[field]}
                  onChange={(e) =>
                    setBlockRange({ ...blockRange, [field]: e.target.value })
                  }
                  min={
                    field === "endDate"
                      ? blockRange.startDate ||
                        new Date().toISOString().split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "9px 10px",
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: 7,
                    fontSize: 12,
                    fontFamily: "inherit",
                    color: "#111118",
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                display: "block",
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#999",
                marginBottom: 5,
              }}
            >
              {t.reasonOptional}
            </label>
            <input
              type="text"
              value={blockRange.reason}
              onChange={(e) =>
                setBlockRange({ ...blockRange, reason: e.target.value })
              }
              placeholder={t.reasonPlaceholder}
              style={{
                width: "100%",
                padding: "9px 10px",
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 7,
                fontSize: 12,
                fontFamily: "inherit",
                color: "#111118",
                outline: "none",
              }}
            />
          </div>
          {error && (
            <div
              style={{
                background: "#FCEBEB",
                border: "1px solid rgba(163,45,45,0.15)",
                borderRadius: 7,
                padding: "8px 12px",
                fontSize: 12,
                color: "#791F1F",
                marginBottom: 10,
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                background: "#EAF3DE",
                border: "1px solid rgba(39,80,10,0.15)",
                borderRadius: 7,
                padding: "8px 12px",
                fontSize: 12,
                color: "#27500A",
                marginBottom: 10,
              }}
            >
              {success}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#791F1F",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "9px 18px",
                fontSize: 12,
                fontFamily: "inherit",
                cursor: "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? t.blocking : t.blockDates}
            </button>
          </div>
        </form>
      )}

      {success && !showForm && (
        <div
          style={{
            background: "#EAF3DE",
            border: "1px solid rgba(39,80,10,0.15)",
            borderRadius: 7,
            padding: "8px 12px",
            fontSize: 12,
            color: "#27500A",
            marginBottom: 10,
          }}
        >
          {success}
        </div>
      )}

      {blockedDates?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {blockedDates.map((block, i) => (
            <div
              key={i}
              style={{
                background: "#FCEBEB",
                border: "1px solid rgba(163,45,45,0.12)",
                borderRadius: 8,
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <div>
                <div
                  style={{ fontSize: 12, color: "#791F1F", fontWeight: 500 }}
                >
                  {fmtDate(block.startDate)} → {fmtDate(block.endDate)}
                </div>
                {block.reason && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#A32D2D",
                      marginTop: 3,
                      opacity: 0.75,
                    }}
                  >
                    {block.reason}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRemoveBlock(block._id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#A32D2D",
                  fontSize: 11,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                {t.remove}
              </button>
            </div>
          ))}
        </div>
      )}
      {!blockedDates?.length && !showForm && (
        <div
          style={{
            fontSize: 12,
            color: "#bbb",
            textAlign: "center",
            padding: "1rem 0",
          }}
        >
          {t.noBlockedDates}
        </div>
      )}
    </div>
  );
}

const fixLeafletIcons = () => {
  if (typeof window !== "undefined") {
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ListingDetail({ params }) {
  const router = useRouter();
  const { lang, t, toggleLanguage } = useLanguage();
  const isAr = lang === 'ar';
  const [listing, setListing] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [booking, setBooking] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [leafletFixed, setLeafletFixed] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Font definitions
  const arabicFont = "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishFont = "'DM Mono', monospace";
  const arabicDisplay = "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishDisplay = "'Fraunces', serif";
  const bodyFont = isAr ? arabicFont : englishFont;
  const displayFont = isAr ? arabicDisplay : englishDisplay;

  useEffect(() => {
    fixLeafletIcons();
    setLeafletFixed(true);
  }, []);
  useEffect(() => {
    params.then ? params.then(setUnwrappedParams) : setUnwrappedParams(params);
  }, [params]);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCurrentUser(d.user));
  }, []);
  useEffect(() => {
    if (unwrappedParams?.id) fetchListing();
  }, [unwrappedParams]);
  useEffect(() => {
    if (currentUser && listing) setIsHost(currentUser.id === listing.host?._id);
  }, [currentUser, listing]);
  useEffect(() => {
    if (!listing || !booking.checkIn || !booking.checkOut) return;
    const nights = Math.ceil(
      (createLocalDate(booking.checkOut) - createLocalDate(booking.checkIn)) /
        86400000,
    );
    setTotalPrice(nights > 0 ? listing.price * nights : 0);
  }, [booking.checkIn, booking.checkOut, listing]);

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/listings/${unwrappedParams.id}`);
      const data = await res.json();
       console.log(data);
      if (!res.ok) throw new Error(data.message);
      setListing(data.listing);
      setBookedDates(data.bookedDates);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess("");

    if (!booking.checkIn || !booking.checkOut) {
      setBookingError(t.pleaseSelectDates);
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: unwrappedParams.id,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guests,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setBookingSuccess(t.bookingCreatedSuccess);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      setBookingError(err.message);
    }
  };

  const nights =
    booking.checkIn && booking.checkOut
      ? Math.ceil(
          (createLocalDate(booking.checkOut) -
            createLocalDate(booking.checkIn)) /
            86400000,
        )
      : 0;

  const AVATAR_PAL = [
    { bg: "#EEEDFE", color: "#3C3489" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FAEEDA", color: "#633806" },
  ];
  const avi = (name) =>
    AVATAR_PAL[(name?.charCodeAt(0) ?? 0) % AVATAR_PAL.length];

  const NAV_LINKS = [
    { href: "/dashboard", label: t.dashboard },
    { href: "/listings", label: t.browse },
  ];

  // Get category info
  const getCategoryInfo = () => {
    if (!listing?.category) return null;
    return CATEGORIES.find(c => c.id === listing.category);
  };
  
  const categoryInfo = getCategoryInfo();

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
            border: "2.5px solid #1a1a2e",
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  if (!listing)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f6f2",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 48 }}>🏠</div>
        <div
          style={{
            fontFamily: displayFont,
            fontStyle: isAr ? "normal" : "italic",
            fontWeight: 300,
            fontSize: 26,
            color: "#111118",
          }}
        >
          {t.listingNotFound}
        </div>
        <Link
          href="/listings"
          style={{ fontSize: 13, color: "#185FA5", textDecoration: "none" }}
        >
          {t.backToListings}
        </Link>
      </div>
    );

  const blockedDatesArr = (listing.blockedDates || []).map((b) => ({
    startDate: b.startDate,
    endDate: b.endDate,
    reason: b.reason,
    _id: b._id,
  }));
  const hostAvi = avi(listing.host?.name);
  const hostInitial = listing.host?.name?.charAt(0)?.toUpperCase() || "H";
  
  const handleLogout = async () => {
    try { 
      await fetch("/api/auth/logout", { method: "POST" }); 
    } catch {}
    router.push("/login");
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (isAr) {
      return `${amount.toLocaleString()} دينار`;
    }
    return `${amount.toLocaleString()} LYD`;
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=Almarai:wght@300;400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');
        
        body {
          font-family: ${bodyFont} !important;
          background: #f7f6f2;
          -webkit-font-smoothing: antialiased;
        }
        
        .font-display {
          font-family: ${displayFont} !important;
        }
        
        .field-label {
          display: block;
          font-size: 10px;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 6px;
        }
        
        .field-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          color: #111118;
          background: #fafaf8;
          outline: none;
        }
        
        .book-btn {
          background: #e8c547;
          color: #1a1a2e;
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.15s;
        }
        
        .book-btn:hover { opacity: 0.88; }
        .book-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .section-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.07);
          padding: 0 1.25rem 1.25rem 1.25rem;
        }
        
        .amenity-pill {
          background: #f7f6f2;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          color: #555;
        }
        
        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f7f6f2;
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 13px;
          color: #555;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        
        .hamburger span {
          display: block;
          width: 20px;
          height: 2px;
          background: rgba(255,255,255,0.7);
          border-radius: 2px;
          transition: all 0.2s;
        }
        
        .mobile-nav {
          display: none;
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          background: #1a1a2e;
          border-bottom: 1px solid rgba(232,197,71,0.15);
          padding: 1rem 1.5rem;
          z-index: 40;
          flex-direction: column;
          gap: 10px;
        }
        
        .mobile-nav.open {
          display: flex;
        }
        
        .mobile-nav-link {
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          padding: 8px 0;
        }
        
        .thumb {
          width: 70px;
          height: 70px;
          border-radius: 8px;
          object-fit: cover;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.15s;
          border: 2px solid transparent;
        }
        
        .thumb.active {
          opacity: 1;
          border-color: #e8c547;
        }
        
        @media (max-width: 768px) {
          .detail-layout {
            grid-template-columns: 1fr !important;
          }
          .hamburger {
            display: flex;
          }
          .desktop-nav {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f7f6f2", direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        {/* NAV */}
        <nav
          style={{
            background: "#1a1a2e",
            borderBottom: "1px solid rgba(232,197,71,0.15)",
            padding: "0 1.5rem",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          {/* LEFT */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
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


            {/* Dashboard-style tabs */}
            <div className="desktop-nav" style={{ display: "flex", gap: 6 }}>
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.65)",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(232,197,71,0.12)";
                      e.target.style.color = "#e8c547";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.color = "rgba(255,255,255,0.65)";
                    }}
                  >
                    {label}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div
            className="desktop-nav"
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            {/* Language Toggle */}
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
              {lang === "en" ? "🇸🇦 عربي" : "🇬🇧 English"}
            </button>

            {/* Listings */}
            <Link
              href="/listings"
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
              }}
            >
              {t.allListings}
            </Link>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 6,
                padding: "5px 10px",
                fontSize: 12,
                color: "#fff",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) =>
                (e.target.style.border = "1px solid #e8c547")
              }
              onMouseLeave={(e) =>
                (e.target.style.border = "1px solid rgba(255,255,255,0.2)")
              }
            >
              {t.logout || "Logout"}
            </button>
          </div>

          {/* HAMBURGER */}
          <button
            className="hamburger"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Menu"
          >
            <span
              style={{
                transform: mobileNavOpen
                  ? "rotate(45deg) translateY(7px)"
                  : "none",
              }}
            />
            <span style={{ opacity: mobileNavOpen ? 0 : 1 }} />
            <span
              style={{
                transform: mobileNavOpen
                  ? "rotate(-45deg) translateY(-7px)"
                  : "none",
              }}
            />
          </button>
        </nav>
        
        <div className={`mobile-nav ${mobileNavOpen ? "open" : ""}`}>
          {/* Language Toggle Button in Mobile Menu */}
          <button
            onClick={toggleLanguage}
            style={{
              background: "rgba(232,197,71,0.15)",
              border: "1px solid rgba(232,197,71,0.3)",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              cursor: "pointer",
              color: "#e8c547",
              fontFamily: "inherit",
              marginBottom: 10,
              width: "100%",
            }}
          >
            {lang === 'en' ? '🇸🇦 عربي' : '🇬🇧 English'}
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              width: "100%",
            }}
          >
            {t.logout || "Logout"}
          </button>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="mobile-nav-link"
              onClick={() => setMobileNavOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>

        <main
          className="main-pad"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "1.75rem 1.5rem",
          }}
        >
          {/* BACK + TITLE */}
          <div className="fu" style={{ marginBottom: "1.25rem" }}>
            <Link
              href="/listings"
              style={{
                fontSize: 12,
                color: "#888",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 10,
              }}
            >
              {t.backToListings}
            </Link>
            
            {/* Category Badge */}
            {categoryInfo && (
              <div className="category-badge">
                <span style={{ fontSize: 18 }}>{categoryInfo.icon}</span>
                <span>{isAr ? categoryInfo.labelAr : categoryInfo.labelEn}</span>
              </div>
            )}
            
            <h1
              className="font-display"
              style={{
                fontStyle: isAr ? "normal" : "italic",
                fontWeight: 300,
                fontSize: "clamp(24px,4vw,36px)",
                color: "#111118",
                lineHeight: 1.1,
              }}
            >
              {listing.title}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                fontSize: 12,
                color: "#888",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1C4.07 1 2.5 2.57 2.5 4.5c0 2.78 3.5 6.5 3.5 6.5s3.5-3.72 3.5-6.5C9.5 2.57 7.93 1 6 1zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
                  fill="#bbb"
                />
              </svg>
              {listing.location}
            </div>
          </div>

          {/* IMAGE GALLERY */}
          <div className="fu fu1" style={{ marginBottom: "1.5rem" }}>
            <div
              className="img-gallery"
              style={{
                height: 380,
                borderRadius: 14,
                overflow: "hidden",
                background: "#e0dfd9",
                marginBottom: 10,
              }}
            >
              {listing.images?.[activeImage] && (
                <img
                  src={listing.images[activeImage]}
                  alt={listing.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "opacity 0.2s",
                  }}
                />
              )}
            </div>
            {listing.images?.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {listing.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${t.view} ${i + 1}`}
                    className={`thumb ${i === activeImage ? "active" : ""}`}
                    onClick={() => setActiveImage(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* DETAIL LAYOUT */}
          <div
            className="detail-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 360px",
              gap: "1.25rem",
              alignItems: "start",
            }}
          >
            {/* LEFT: Info */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Description */}
              <div className="fu fu2 section-card">
                <div
                  style={{
                    borderTop: "3px solid #378ADD",
                    paddingTop: "1.25rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#999",
                      marginBottom: 6,
                    }}
                  >
                    {t.about}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.75 }}>
                  {listing.description}
                </p>
              </div>

              {/* Amenities */}
              {listing.amenities?.length > 0 && (
                <div className="fu fu2 section-card">
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#999",
                      marginBottom: "1rem",
                    }}
                  >
                    {t.amenities}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {listing.amenities.map((a, i) => (
                      <span key={i} className="amenity-pill">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* House Rules Section */}
              {listing.rules && listing.rules.length > 0 && (
                <div className="fu fu2 section-card">
                  <div
                    style={{
                      borderTop: "3px solid #e8c547",
                      paddingTop: "1.25rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#999",
                        marginBottom: 6,
                      }}
                    >
                      {t.houseRules}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: "0.75rem",
                    }}
                  >
                    {listing.rules.map((rule, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontSize: 13,
                          color: "#555",
                          padding: "6px 8px",
                          background: "#fafaf8",
                          borderRadius: 8,
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "#FAEEDA",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            color: "#633806",
                          }}
                        >
                          ✓
                        </span>
                        {rule}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Host */}
              <div className="fu fu2 section-card">
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#999",
                    marginBottom: "1rem",
                  }}
                >
                  {t.hostedBy}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: hostAvi.bg,
                      color: hostAvi.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    {hostInitial}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#111118",
                      }}
                    >
                      {listing.host?.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                      {t.hostSince}{" "}
                      {listing.host?.hostDetails?.joinedDate
                        ? new Date(
                            listing.host.hostDetails.joinedDate,
                          ).getFullYear()
                        : "2024"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              {listing.coordinates && leafletFixed && (
                <div className="fu fu3 section-card">
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#999",
                      marginBottom: "1rem",
                    }}
                  >
                    {t.locationMap}
                  </div>
                  <div
                    style={{
                      borderRadius: 10,
                      overflow: "hidden",
                      height: 280,
                    }}
                  >
                    <MapContainer
                      center={[
                        listing.coordinates.lat,
                        listing.coordinates.lng,
                      ]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <Marker
                        position={[
                          listing.coordinates.lat,
                          listing.coordinates.lng,
                        ]}
                      >
                        <Popup>{listing.location}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Booking / Host panel */}
            <div className="sidebar">
              {!isHost ? (
                <div
                  className="fu fu2 section-card"
                  style={{ borderTop: "3px solid #e8c547" }}
                >
                  {/* Price */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 4,
                      marginBottom: "1.25rem",
                      paddingTop: "1rem",
                    }}
                  >
                    <span
                      className="font-display"
                      style={{
                        fontStyle: isAr ? "normal" : "italic",
                        fontWeight: 300,
                        fontSize: 34,
                        color: "#111118",
                        lineHeight: 1,
                      }}
                    >
                      {formatCurrency(listing.price)}
                    </span>
                    <span style={{ fontSize: 12, color: "#999" }}>/ {t.night}</span>
                  </div>

                  <form
                    onSubmit={handleBooking}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <div>
                      <label className="field-label">{t.selectDates}</label>
                      <BookingCalendar
                        bookedDates={bookedDates}
                        onDateSelect={(dates) =>
                          setBooking((prev) => ({ ...prev, ...dates }))
                        }
                        checkIn={booking.checkIn}
                        checkOut={booking.checkOut}
                      />
                    </div>

                    {/* Date display */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      {[
                        [t.checkIn, booking.checkIn],
                        [t.checkOut, booking.checkOut],
                      ].map(([label, val]) => (
                        <div
                          key={label}
                          style={{
                            background: "#f7f6f2",
                            border: "1px solid rgba(0,0,0,0.07)",
                            borderRadius: 8,
                            padding: "10px 12px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: "#999",
                              marginBottom: 3,
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: val ? "#111118" : "#bbb",
                            }}
                          >
                            {val ? displayDate(val) : "—"}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="field-label">{t.guests}</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        required
                        value={booking.guests}
                        onChange={(e) =>
                          setBooking({
                            ...booking,
                            guests: parseInt(e.target.value),
                          })
                        }
                        className="field-input"
                      />
                    </div>

                    {/* Price breakdown */}
                    {nights > 0 && (
                      <div
                        style={{
                          background: "#f7f6f2",
                          borderRadius: 8,
                          padding: "12px",
                          border: "1px solid rgba(0,0,0,0.07)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            color: "#666",
                            marginBottom: 8,
                          }}
                        >
                          <span>
                            {formatCurrency(listing.price)} × {nights}{" "}
                            {nights === 1 ? t.night : t.nights}
                          </span>
                          <span>{formatCurrency(totalPrice)}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#111118",
                            paddingTop: 8,
                            borderTop: "1px solid rgba(0,0,0,0.07)",
                          }}
                        >
                          <span>{t.total}</span>
                          <span style={{ color: "#1D9E75" }}>
                            {formatCurrency(totalPrice)}
                          </span>
                        </div>
                      </div>
                    )}

                    {bookingError && (
                      <div
                        style={{
                          background: "#FCEBEB",
                          border: "1px solid rgba(163,45,45,0.15)",
                          borderRadius: 8,
                          padding: "10px 12px",
                          fontSize: 12,
                          color: "#791F1F",
                        }}
                      >
                        {bookingError}
                      </div>
                    )}
                    {bookingSuccess && (
                      <div
                        style={{
                          background: "#EAF3DE",
                          border: "1px solid rgba(39,80,10,0.15)",
                          borderRadius: 8,
                          padding: "10px 12px",
                          fontSize: 12,
                          color: "#27500A",
                        }}
                      >
                        {bookingSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!booking.checkIn || !booking.checkOut}
                      className="book-btn"
                    >
                      {t.bookNow} →
                    </button>
                  </form>
                </div>
              ) : (
                <div
                  className="fu fu2 section-card"
                  style={{ borderTop: "3px solid #7F77DD" }}
                >
                  <div
                    style={{
                      paddingTop: "1rem",
                      textAlign: "center",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: "#EEEDFE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                        fontSize: 22,
                      }}
                    >
                      🏠
                    </div>
                    <div
                      className="font-display"
                      style={{
                        fontStyle: isAr ? "normal" : "italic",
                        fontWeight: 300,
                        fontSize: 18,
                        color: "#111118",
                        marginBottom: 6,
                      }}
                    >
                      {t.youOwnThisProperty}
                    </div>
                    <p style={{ fontSize: 12, color: "#999", lineHeight: 1.6 }}>
                      {t.cannotBookOwnListing}
                    </p>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
                    <BookingCalendar
                      bookedDates={bookedDates}
                      onDateSelect={() => {}}
                      checkIn=""
                      checkOut=""
                      isHost={true}
                    />
                    <HostDateManager
                      listingId={listing._id}
                      blockedDates={blockedDatesArr}
                      onDatesUpdated={fetchListing}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: "1.25rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid rgba(0,0,0,0.07)",
                      textAlign: "center",
                    }}
                  >
                    <Link
                      href="/host/bookings"
                      style={{
                        fontSize: 12,
                        color: "#185FA5",
                        textDecoration: "none",
                      }}
                    >
                      {t.viewAllBookings} →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}