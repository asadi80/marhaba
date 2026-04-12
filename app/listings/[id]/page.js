"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

const getLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const createLocalDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

// ─── Calendar ───────────────────────────────────────────────────────────────
function BookingCalendar({ bookedDates, onDateSelect, checkIn, checkOut, isHost = false }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(checkIn ? createLocalDate(checkIn) : null);
  const [selectedEndDate, setSelectedEndDate] = useState(checkOut ? createLocalDate(checkOut) : null);
  const [hoverDate, setHoverDate] = useState(null);
  const [bookedDatesMap, setBookedDatesMap] = useState(new Map());

  useEffect(() => {
    const map = new Map();
    if (!bookedDates?.length) { setBookedDatesMap(map); return; }
    bookedDates.forEach(({ checkIn, checkOut, status }) => {
      let cur = new Date(checkIn);
      const end = new Date(checkOut);
      while (cur < end) {
        const key = getLocalDateString(cur);
        if (!map.has(key)) map.set(key, isHost ? status : "booked");
        cur.setDate(cur.getDate() + 1);
      }
    });
    setBookedDatesMap(map);
  }, [bookedDates, isHost]);

  useEffect(() => {
    setSelectedStartDate(checkIn ? createLocalDate(checkIn) : null);
    setSelectedEndDate(checkOut ? createLocalDate(checkOut) : null);
  }, [checkIn, checkOut]);

  const isDateBooked = (d) => bookedDatesMap.has(getLocalDateString(d));
  const getDateStatus = (d) => bookedDatesMap.get(getLocalDateString(d));
  const isDateInPast = (d) => { const t = new Date(); t.setHours(0,0,0,0); return d < t; };
  const isDateSelected = (d) => {
    if (!selectedStartDate) return false;
    if (selectedEndDate) return d >= selectedStartDate && d <= selectedEndDate;
    return d.getTime() === selectedStartDate.getTime();
  };
  const isDateInRange = (d) => {
    if (!selectedStartDate || selectedEndDate || !hoverDate) return false;
    return d > selectedStartDate && d <= hoverDate;
  };

  const handleDateClick = (date) => {
    if (isDateBooked(date) || isDateInPast(date)) return;
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date); setSelectedEndDate(null);
      onDateSelect({ checkIn: getLocalDateString(date), checkOut: "" });
    } else if (selectedStartDate && !selectedEndDate) {
      if (date > selectedStartDate) {
        setSelectedEndDate(date);
        onDateSelect({ checkIn: getLocalDateString(selectedStartDate), checkOut: getLocalDateString(date) });
      } else {
        setSelectedStartDate(date);
        onDateSelect({ checkIn: getLocalDateString(date), checkOut: "" });
      }
    }
  };

  const getDaysInMonth = (date) => {
    const y = date.getFullYear(), m = date.getMonth();
    const firstDay = new Date(y, m, 1), lastDay = new Date(y, m + 1, 0);
    const days = [];
    for (let i = firstDay.getDay() - 1; i >= 0; i--) days.push({ date: new Date(y, m, -i), isCurrentMonth: false });
    for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(y, m, i), isCurrentMonth: true });
    for (let i = 1; days.length < 42; i++) days.push({ date: new Date(y, m + 1, i), isCurrentMonth: false });
    return days;
  };

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const WEEK_DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const days = getDaysInMonth(currentMonth);

  // Status → style map
  const getDateStyle = (date, status, isBooked, isPast, isSelected, isInRange, isCurrentMonth) => {
    if (isSelected) return { bg: "#1a1a2e", color: "#e8c547", cursor: "pointer" };
    if (isInRange) return { bg: "#e8e4c9", color: "#5a4f0a", cursor: "pointer" };
    if (isBooked) {
      if (isHost) {
        if (status === "confirmed") return { bg: "#FCEBEB", color: "#791F1F", cursor: "not-allowed", strikethrough: true };
        if (status === "pending") return { bg: "#FAEEDA", color: "#633806", cursor: "not-allowed", strikethrough: true, dot: "#BA7517" };
        if (status === "blocked") return { bg: "#D3D1C7", color: "#444441", cursor: "not-allowed", strikethrough: true };
      }
      return { bg: "#D3D1C7", color: "#888780", cursor: "not-allowed", strikethrough: true };
    }
    if (isPast) return { bg: "#f7f6f2", color: "#c0bfbb", cursor: "not-allowed" };
    if (!isCurrentMonth) return { bg: "transparent", color: "#D3D1C7", cursor: "default" };
    return { bg: "transparent", color: "#111118", cursor: "pointer", hover: true };
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.07)", padding: "1rem" }}>
      {/* Month nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth()-1); setCurrentMonth(d); }}
          style={{ background: "none", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 14, color: "#555" }}>←</button>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#111118" }}>
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth()+1); setCurrentMonth(d); }}
          style={{ background: "none", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 14, color: "#555" }}>→</button>
      </div>

      {/* Week headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 4 }}>
        {WEEK_DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#999", padding: "4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {days.map(({ date, isCurrentMonth }, i) => {
          const status = getDateStatus(date);
          const isBooked = !!status;
          const isPast = isDateInPast(date);
          const isSelected = isDateSelected(date);
          const isInRange = isDateInRange(date);
          const isDisabled = isBooked || isPast;
          const s = getDateStyle(date, status, isBooked, isPast, isSelected, isInRange, isCurrentMonth);

          return (
            <button key={i} type="button"
              onClick={() => !isDisabled && handleDateClick(date)}
              onMouseEnter={() => { if (!isDisabled && selectedStartDate && !selectedEndDate && date > selectedStartDate) setHoverDate(date); }}
              onMouseLeave={() => setHoverDate(null)}
              disabled={isDisabled}
              style={{
                position: "relative", aspectRatio: "1", borderRadius: 6,
                border: "none", background: s.bg, color: s.color,
                fontSize: 12, cursor: s.cursor,
                textDecoration: s.strikethrough ? "line-through" : "none",
                fontFamily: "inherit", transition: "background 0.1s",
                opacity: !isCurrentMonth ? 0.4 : 1,
              }}>
              {date.getDate()}
              {isHost && status === "pending" && (
                <span style={{ position: "absolute", top: 2, right: 2, width: 5, height: 5, borderRadius: "50%", background: "#BA7517", display: "block" }} />
              )}
              {isHost && status === "confirmed" && (
                <span style={{ position: "absolute", top: 2, right: 2, width: 5, height: 5, borderRadius: "50%", background: "#A32D2D", display: "block" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.07)" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 8 }}>
          {isHost ? "host view" : "legend"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px" }}>
          {(isHost ? [
            { color: "#fff", border: "1px solid rgba(0,0,0,0.15)", label: "Available" },
            { color: "#1a1a2e", label: "Selected", textColor: "#e8c547" },
            { color: "#e8e4c9", label: "Range" },
            { color: "#FAEEDA", label: "Pending", textColor: "#633806" },
            { color: "#FCEBEB", label: "Confirmed", textColor: "#791F1F" },
            { color: "#D3D1C7", label: "Blocked" },
            { color: "#f7f6f2", label: "Past", border: "1px solid rgba(0,0,0,0.08)" },
          ] : [
            { color: "#fff", border: "1px solid rgba(0,0,0,0.15)", label: "Available" },
            { color: "#1a1a2e", label: "Selected", textColor: "#e8c547" },
            { color: "#e8e4c9", label: "Range" },
            { color: "#D3D1C7", label: "Unavailable" },
            { color: "#f7f6f2", label: "Past", border: "1px solid rgba(0,0,0,0.08)" },
          ]).map(({ color, border, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: color, border: border || "none", display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#888" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Host Date Manager ────────────────────────────────────────────────────────
function HostDateManager({ listingId, blockedDates, onDatesUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [blockRange, setBlockRange] = useState({ startDate: "", endDate: "", reason: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    if (!blockRange.startDate || !blockRange.endDate) { setError("Please select both dates"); setLoading(false); return; }
    if (new Date(blockRange.startDate) >= new Date(blockRange.endDate)) { setError("End date must be after start date"); setLoading(false); return; }
    if (new Date(blockRange.startDate) < new Date()) { setError("Cannot block past dates"); setLoading(false); return; }
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: blockRange.startDate, endDate: blockRange.endDate, reason: blockRange.reason || "Blocked by host" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("Dates blocked successfully!");
      setBlockRange({ startDate: "", endDate: "", reason: "" });
      setShowForm(false);
      onDatesUpdated?.();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleRemoveBlock = async (blockId) => {
    if (!confirm("Remove this blocked date range?")) return;
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("Removed successfully!");
      onDatesUpdated?.();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) { setError(err.message); }
  };

  const fmtDate = (s) => new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div style={{ marginTop: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999" }}>blocked dates</div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: showForm ? "transparent" : "#FCEBEB",
          color: showForm ? "#888" : "#791F1F",
          border: showForm ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(163,45,45,0.15)",
          borderRadius: 6, padding: "5px 12px", fontSize: 11,
          fontFamily: "inherit", cursor: "pointer",
        }}>
          {showForm ? "cancel" : "+ block dates"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleBlockSubmit} style={{ background: "#f7f6f2", borderRadius: 10, padding: "1rem", marginBottom: "1rem", border: "1px solid rgba(0,0,0,0.07)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {[["startDate","Start Date"], ["endDate","End Date"]].map(([field, label]) => (
              <div key={field}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 5 }}>{label}</label>
                <input type="date" value={blockRange[field]}
                  onChange={(e) => setBlockRange({ ...blockRange, [field]: e.target.value })}
                  min={field === "endDate" ? blockRange.startDate || new Date().toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
                  required
                  style={{ width: "100%", padding: "9px 10px", background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 7, fontSize: 12, fontFamily: "inherit", color: "#111118", outline: "none" }} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 5 }}>reason (optional)</label>
            <input type="text" value={blockRange.reason}
              onChange={(e) => setBlockRange({ ...blockRange, reason: e.target.value })}
              placeholder="Maintenance, personal use…"
              style={{ width: "100%", padding: "9px 10px", background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 7, fontSize: 12, fontFamily: "inherit", color: "#111118", outline: "none" }} />
          </div>
          {error && <div style={{ background: "#FCEBEB", border: "1px solid rgba(163,45,45,0.15)", borderRadius: 7, padding: "8px 12px", fontSize: 12, color: "#791F1F", marginBottom: 10 }}>{error}</div>}
          {success && <div style={{ background: "#EAF3DE", border: "1px solid rgba(39,80,10,0.15)", borderRadius: 7, padding: "8px 12px", fontSize: 12, color: "#27500A", marginBottom: 10 }}>{success}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={loading} style={{
              background: "#791F1F", color: "#fff", border: "none", borderRadius: 7,
              padding: "9px 18px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", opacity: loading ? 0.5 : 1,
            }}>{loading ? "blocking…" : "block dates"}</button>
          </div>
        </form>
      )}

      {success && !showForm && (
        <div style={{ background: "#EAF3DE", border: "1px solid rgba(39,80,10,0.15)", borderRadius: 7, padding: "8px 12px", fontSize: 12, color: "#27500A", marginBottom: 10 }}>{success}</div>
      )}

      {blockedDates?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {blockedDates.map((block, i) => (
            <div key={i} style={{ background: "#FCEBEB", border: "1px solid rgba(163,45,45,0.12)", borderRadius: 8, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: "#791F1F", fontWeight: 500 }}>{fmtDate(block.startDate)} → {fmtDate(block.endDate)}</div>
                {block.reason && <div style={{ fontSize: 11, color: "#A32D2D", marginTop: 3, opacity: 0.75 }}>{block.reason}</div>}
              </div>
              <button onClick={() => handleRemoveBlock(block._id)} style={{ background: "none", border: "none", color: "#A32D2D", fontSize: 11, fontFamily: "inherit", cursor: "pointer", flexShrink: 0, padding: 0 }}>remove</button>
            </div>
          ))}
        </div>
      )}
      {!blockedDates?.length && !showForm && (
        <div style={{ fontSize: 12, color: "#bbb", textAlign: "center", padding: "1rem 0" }}>no blocked dates</div>
      )}
    </div>
  );
}

const fixLeafletIcons = () => {
  if (typeof window !== "undefined") {
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ListingDetail({ params }) {
  const router = useRouter();
  const [listing, setListing] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [booking, setBooking] = useState({ checkIn: "", checkOut: "", guests: 1 });
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [leafletFixed, setLeafletFixed] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => { fixLeafletIcons(); setLeafletFixed(true); }, []);
  useEffect(() => { params.then ? params.then(setUnwrappedParams) : setUnwrappedParams(params); }, [params]);
  useEffect(() => { fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => d && setCurrentUser(d.user)); }, []);
  useEffect(() => { if (unwrappedParams?.id) fetchListing(); }, [unwrappedParams]);
  useEffect(() => { if (currentUser && listing) setIsHost(currentUser.id === listing.host?._id); }, [currentUser, listing]);
  useEffect(() => {
    if (!listing || !booking.checkIn || !booking.checkOut) return;
    const nights = Math.ceil((createLocalDate(booking.checkOut) - createLocalDate(booking.checkIn)) / 86400000);
    setTotalPrice(nights > 0 ? listing.price * nights : 0);
  }, [booking.checkIn, booking.checkOut, listing]);

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/listings/${unwrappedParams.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setListing(data.listing);
      setBookedDates(data.bookedDates);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError(""); setBookingSuccess("");
    if (!booking.checkIn || !booking.checkOut) { setBookingError("Please select check-in and check-out dates"); return; }
    const ci = createLocalDate(booking.checkIn), co = createLocalDate(booking.checkOut);
    const today = new Date(); today.setHours(0,0,0,0);
    if (ci < today) { setBookingError("Check-in date cannot be in the past"); return; }
    if (ci >= co) { setBookingError("Check-out must be after check-in"); return; }
    const conflict = bookedDates.some(b => ci < new Date(b.checkOut) && co > new Date(b.checkIn));
    if (conflict) { setBookingError("Selected dates are not available"); return; }
    try {
      const res = await fetch("/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: unwrappedParams.id,
          checkIn: new Date(Date.UTC(ci.getFullYear(), ci.getMonth(), ci.getDate())).toISOString(),
          checkOut: new Date(Date.UTC(co.getFullYear(), co.getMonth(), co.getDate())).toISOString(),
          guests: booking.guests,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBookingSuccess("Booking created successfully!");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) { setBookingError(err.message); }
  };

  const nights = booking.checkIn && booking.checkOut
    ? Math.ceil((createLocalDate(booking.checkOut) - createLocalDate(booking.checkIn)) / 86400000)
    : 0;

  const AVATAR_PAL = [
    { bg:"#EEEDFE", color:"#3C3489" }, { bg:"#E6F1FB", color:"#0C447C" },
    { bg:"#EAF3DE", color:"#27500A" }, { bg:"#FAEEDA", color:"#633806" },
  ];
  const avi = (name) => AVATAR_PAL[(name?.charCodeAt(0) ?? 0) % AVATAR_PAL.length];

  const NAV_LINKS = [{ href: "/dashboard", label: "dashboard" }, { href: "/listings", label: "browse" }];

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f6f2" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2.5px solid #1a1a2e", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!listing) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f6f2", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🏠</div>
      <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontWeight: 300, fontSize: 26, color: "#111118" }}>Listing not found</div>
      <Link href="/listings" style={{ fontSize: 13, color: "#185FA5", textDecoration: "none" }}>← back to listings</Link>
    </div>
  );

  const blockedDatesArr = (listing.blockedDates || []).map(b => ({ startDate: b.startDate, endDate: b.endDate, reason: b.reason, _id: b._id }));
  const hostAvi = avi(listing.host?.name);
  const hostInitial = listing.host?.name?.charAt(0)?.toUpperCase() || "H";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Mono', monospace; background: #f7f6f2; -webkit-font-smoothing: antialiased; }
        .font-display { font-family: 'Fraunces', serif; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        .fu  { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .fu1 { animation-delay: 0.07s; }
        .fu2 { animation-delay: 0.14s; }
        .fu3 { animation-delay: 0.21s; }

        .nav-link { color: rgba(255,255,255,0.45); text-decoration: none; font-size: 12px; padding: 6px 12px; border-radius: 6px; transition: color 0.15s, background 0.15s; }
        .nav-link:hover { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.06); }

        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .hamburger span { display: block; width: 18px; height: 2px; background: rgba(255,255,255,0.6); border-radius: 2px; transition: all 0.2s; }

        .mobile-nav { display: none; position: fixed; top: 56px; left: 0; right: 0; background: #1a1a2e; border-bottom: 1px solid rgba(232,197,71,0.12); padding: 1rem 1.5rem; z-index: 40; flex-direction: column; gap: 4px; }
        .mobile-nav.open { display: flex; }
        .mobile-nav-link { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 13px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); display: block; }

        /* Thumbnail strip */
        .thumb { width: 60px; height: 50px; object-fit: cover; border-radius: 6px; cursor: pointer; opacity: 0.55; transition: opacity 0.15s; border: 2px solid transparent; flex-shrink: 0; }
        .thumb.active { opacity: 1; border-color: #e8c547; }
        .thumb:hover { opacity: 0.85; }

        /* Amenity pill */
        .amenity-pill { display: inline-flex; align-items: center; background: #f0efe9; border: 1px solid rgba(0,0,0,0.07); border-radius: 20px; padding: 4px 12px; font-size: 12px; color: #555; }

        /* Book btn */
        .book-btn { width: 100%; padding: 12px; background: #1a1a2e; color: #e8c547; border: none; border-radius: 10px; font-size: 13px; font-family: inherit; cursor: pointer; transition: opacity 0.15s, transform 0.15s; }
        .book-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .book-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Field input */
        .field-input { width: 100%; padding: 10px 12px; background: #fafaf8; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; font-size: 13px; color: #111118; font-family: inherit; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .field-input:focus { border-color: #185FA5; box-shadow: 0 0 0 3px rgba(24,95,165,0.08); }
        .field-label { display: block; font-size: 10px; letter-spacing: 0.09em; text-transform: uppercase; color: #999; margin-bottom: 6px; }

        /* Section card */
        .section-card { background: #fff; border-radius: 14px; border: 1px solid rgba(0,0,0,0.07); padding: 1.5rem; }

        /* Sidebar sticky */
        .sidebar { position: sticky; top: 72px; }

        /* Responsive layout */
        @media (max-width: 900px) {
          .hamburger { display: flex; }
          .desktop-nav { display: none !important; }
          .detail-layout { grid-template-columns: 1fr !important; }
          .sidebar { position: static; }
          .img-gallery { height: 260px !important; }
          .block-date-grid { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 480px) {
          .main-pad { padding: 1.25rem 1rem !important; }
          .img-gallery { height: 220px !important; }
          .section-card { padding: 1.25rem; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f7f6f2" }}>

        {/* NAV */}
        <nav style={{ background: "#1a1a2e", borderBottom: "1px solid rgba(232,197,71,0.15)", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div className="font-display" style={{ fontStyle: "italic", fontWeight: 300, fontSize: 20, color: "#fff" }}>
                mar<span style={{ fontStyle: "normal", fontWeight: 500, color: "#e8c547" }}>haba</span>
              </div>
            </Link>
            <div className="desktop-nav" style={{ display: "flex", gap: 2 }}>
              {NAV_LINKS.map(({ href, label }) => <Link key={href} href={href} className="nav-link">{label}</Link>)}
            </div>
          </div>
          <div className="desktop-nav" style={{ display: "flex", gap: 8 }}>
            <Link href="/listings" style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>← all listings</Link>
          </div>
          <button className="hamburger" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Menu">
            <span style={{ transform: mobileNavOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
            <span style={{ opacity: mobileNavOpen ? 0 : 1 }} />
            <span style={{ transform: mobileNavOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        </nav>
        <div className={`mobile-nav ${mobileNavOpen ? "open" : ""}`}>
          {NAV_LINKS.map(({ href, label }) => <Link key={href} href={href} className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>{label}</Link>)}
        </div>

        <main className="main-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "1.75rem 1.5rem" }}>

          {/* BACK + TITLE */}
          <div className="fu" style={{ marginBottom: "1.25rem" }}>
            <Link href="/listings" style={{ fontSize: 12, color: "#888", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
              ← back to listings
            </Link>
            <h1 className="font-display" style={{ fontStyle: "italic", fontWeight: 300, fontSize: "clamp(24px,4vw,36px)", color: "#111118", lineHeight: 1.1 }}>
              {listing.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "#888" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1C4.07 1 2.5 2.57 2.5 4.5c0 2.78 3.5 6.5 3.5 6.5s3.5-3.72 3.5-6.5C9.5 2.57 7.93 1 6 1zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="#bbb"/></svg>
              {listing.location}
            </div>
          </div>

          {/* IMAGE GALLERY */}
          <div className="fu fu1" style={{ marginBottom: "1.5rem" }}>
            <div className="img-gallery" style={{ height: 380, borderRadius: 14, overflow: "hidden", background: "#e0dfd9", marginBottom: 10 }}>
              {listing.images?.[activeImage] && (
                <img src={listing.images[activeImage]} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.2s" }} />
              )}
            </div>
            {listing.images?.length > 1 && (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {listing.images.map((img, i) => (
                  <img key={i} src={img} alt={`view ${i+1}`} className={`thumb ${i === activeImage ? "active" : ""}`} onClick={() => setActiveImage(i)} />
                ))}
              </div>
            )}
          </div>

          {/* DETAIL LAYOUT */}
          <div className="detail-layout" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.25rem", alignItems: "start" }}>

            {/* LEFT: Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Description */}
              <div className="fu fu2 section-card">
                <div style={{ borderTop: "3px solid #378ADD", paddingTop: "1.25rem", marginBottom: "1rem" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>about</div>
                </div>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.75 }}>{listing.description}</p>
              </div>

              {/* Amenities */}
              {listing.amenities?.length > 0 && (
                <div className="fu fu2 section-card">
                  <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", marginBottom: "1rem" }}>amenities</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {listing.amenities.map((a, i) => <span key={i} className="amenity-pill">{a}</span>)}
                  </div>
                </div>
              )}

              {/* Host */}
              <div className="fu fu2 section-card">
                <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", marginBottom: "1rem" }}>hosted by</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: hostAvi.bg, color: hostAvi.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 500, flexShrink: 0 }}>
                    {hostInitial}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#111118" }}>{listing.host?.name}</div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                      host since {listing.host?.hostDetails?.joinedDate ? new Date(listing.host.hostDetails.joinedDate).getFullYear() : "2024"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              {listing.coordinates && leafletFixed && (
                <div className="fu fu3 section-card">
                  <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", marginBottom: "1rem" }}>location map</div>
                  <div style={{ borderRadius: 10, overflow: "hidden", height: 280 }}>
                    <MapContainer center={[listing.coordinates.lat, listing.coordinates.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                      <Marker position={[listing.coordinates.lat, listing.coordinates.lng]}>
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
                <div className="fu fu2 section-card" style={{ borderTop: "3px solid #e8c547" }}>
                  {/* Price */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: "1.25rem", paddingTop: "1rem" }}>
                    <span className="font-display" style={{ fontStyle: "italic", fontWeight: 300, fontSize: 34, color: "#111118", lineHeight: 1 }}>${listing.price}</span>
                    <span style={{ fontSize: 12, color: "#999" }}>/ night</span>
                  </div>

                  <form onSubmit={handleBooking} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label className="field-label">select dates</label>
                      <BookingCalendar
                        bookedDates={bookedDates}
                        onDateSelect={(dates) => setBooking(prev => ({ ...prev, ...dates }))}
                        checkIn={booking.checkIn}
                        checkOut={booking.checkOut}
                      />
                    </div>

                    {/* Date display */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[["check-in", booking.checkIn], ["check-out", booking.checkOut]].map(([label, val]) => (
                        <div key={label} style={{ background: "#f7f6f2", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 12, color: val ? "#111118" : "#bbb" }}>
                            {val ? new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="field-label">guests</label>
                      <input type="number" min="1" max="10" required value={booking.guests}
                        onChange={(e) => setBooking({ ...booking, guests: parseInt(e.target.value) })}
                        className="field-input" />
                    </div>

                    {/* Price breakdown */}
                    {nights > 0 && (
                      <div style={{ background: "#f7f6f2", borderRadius: 8, padding: "12px", border: "1px solid rgba(0,0,0,0.07)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 8 }}>
                          <span>${listing.price} × {nights} {nights === 1 ? "night" : "nights"}</span>
                          <span>${totalPrice}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 500, color: "#111118", paddingTop: 8, borderTop: "1px solid rgba(0,0,0,0.07)" }}>
                          <span>total</span>
                          <span style={{ color: "#1D9E75" }}>${totalPrice}</span>
                        </div>
                      </div>
                    )}

                    {bookingError && (
                      <div style={{ background: "#FCEBEB", border: "1px solid rgba(163,45,45,0.15)", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#791F1F" }}>{bookingError}</div>
                    )}
                    {bookingSuccess && (
                      <div style={{ background: "#EAF3DE", border: "1px solid rgba(39,80,10,0.15)", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#27500A" }}>{bookingSuccess}</div>
                    )}

                    <button type="submit" disabled={!booking.checkIn || !booking.checkOut} className="book-btn">
                      book now →
                    </button>
                  </form>
                </div>
              ) : (
                <div className="fu fu2 section-card" style={{ borderTop: "3px solid #7F77DD" }}>
                  <div style={{ paddingTop: "1rem", textAlign: "center", marginBottom: "1.25rem" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 22 }}>🏠</div>
                    <div className="font-display" style={{ fontStyle: "italic", fontWeight: 300, fontSize: 18, color: "#111118", marginBottom: 6 }}>
                      You own this property
                    </div>
                    <p style={{ fontSize: 12, color: "#999", lineHeight: 1.6 }}>You cannot book your own listing. Manage availability below.</p>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
                    <BookingCalendar bookedDates={bookedDates} onDateSelect={() => {}} checkIn="" checkOut="" isHost={true} />
                    <HostDateManager listingId={listing._id} blockedDates={blockedDatesArr} onDatesUpdated={fetchListing} />
                  </div>

                  <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.07)", textAlign: "center" }}>
                    <Link href="/host/bookings" style={{ fontSize: 12, color: "#185FA5", textDecoration: "none" }}>view all bookings →</Link>
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