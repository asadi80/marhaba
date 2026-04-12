"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";



// ─── Calendar View Component ─────────────────────────────────────────────────
function HostCalendar({ bookings, onConfirmBooking, onCancelBooking }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(null);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const getBookingsForDay = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    return bookings.filter(b => {
      const ci = new Date(b.checkIn);
      const co = new Date(b.checkOut);
      return date >= ci && date <= co;
    });
  };

  const statusColor = (s) => s === "confirmed" ? "#1D9E75" : s === "pending" ? "#e8c547" : "#e05a5a";

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Month Nav */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <button
          onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y-1); } else setCurrentMonth(m => m-1); }}
          style={{ background:"none", border:"1px solid rgba(0,0,0,0.1)", borderRadius:8, padding:"6px 14px", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}
        >←</button>
        <span className="font-display" style={{ fontStyle:"italic", fontWeight:300, fontSize:22, color:"#111118" }}>
          {monthNames[currentMonth]} <span style={{ fontWeight:500 }}>{currentYear}</span>
        </span>
        <button
          onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y+1); } else setCurrentMonth(m => m+1); }}
          style={{ background:"none", border:"1px solid rgba(0,0,0,0.1)", borderRadius:8, padding:"6px 14px", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}
        >→</button>
      </div>

      {/* Day labels */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:4, marginBottom:4 }}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", color:"#999", padding:"4px 0" }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const dayBookings = getBookingsForDay(day);
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          return (
            <div
              key={day}
              onClick={() => setSelected(selected === day ? null : day)}
              style={{
                minHeight: 64,
                borderRadius: 10,
                border: `1px solid ${selected === day ? "#e8c547" : "rgba(0,0,0,0.07)"}`,
                background: isToday ? "#1a1a2e" : selected === day ? "#fdf8e7" : "#fff",
                padding: "6px 8px",
                cursor: dayBookings.length ? "pointer" : "default",
                transition: "border-color 0.15s, box-shadow 0.15s",
                boxShadow: selected === day ? "0 0 0 2px rgba(232,197,71,0.3)" : "none",
                position: "relative",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: isToday ? 600 : 400, color: isToday ? "#e8c547" : "#111118" }}>{day}</span>
              <div style={{ display:"flex", flexDirection:"column", gap:2, marginTop:4 }}>
                {dayBookings.slice(0,2).map(b => (
                  <div key={b._id} style={{ height:4, borderRadius:2, background: statusColor(b.status), opacity:0.85 }} />
                ))}
                {dayBookings.length > 2 && <div style={{ fontSize:9, color:"#999" }}>+{dayBookings.length-2}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected day details */}
      {selected && getBookingsForDay(selected).length > 0 && (
        <div style={{ marginTop:"1.5rem", borderRadius:12, border:"1px solid rgba(0,0,0,0.07)", overflow:"hidden" }}>
          <div style={{ background:"#1a1a2e", padding:"0.75rem 1rem" }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>
              {monthNames[currentMonth]} {selected} — {getBookingsForDay(selected).length} booking(s)
            </span>
          </div>
          {getBookingsForDay(selected).map(b => (
            <div key={b._id} style={{ padding:"1rem", borderBottom:"1px solid rgba(0,0,0,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ fontWeight:500, fontSize:13, color:"#111118", marginBottom:2 }}>{b.listing?.title}</div>
                <div style={{ fontSize:12, color:"#777" }}>{b.user?.name} · {b.user?.email} . {b.user?.phoneNumber} . {b.guests} guest{b.guests!==1?"s":""}</div>
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <span style={{ fontSize:11, padding:"2px 10px", borderRadius:20, background: b.status==="confirmed"?"#DCFCE7":b.status==="pending"?"#FEF9C3":"#FEE2E2", color: b.status==="confirmed"?"#166534":b.status==="pending"?"#713f12":"#991b1b" }}>
                  {b.status}
                </span>
                {b.status === "pending" && (
                  <button onClick={() => onConfirmBooking(b._id)} style={{ background:"#1D9E75", color:"#fff", border:"none", borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>confirm</button>
                )}
                {b.status !== "cancelled" && (
                  <button onClick={() => onCancelBooking(b._id)} style={{ background:"#fee2e2", color:"#991b1b", border:"none", borderRadius:6, padding:"4px 10px", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{ display:"flex", gap:16, marginTop:"1.5rem", flexWrap:"wrap" }}>
        {[["confirmed","#1D9E75"],["pending","#e8c547"],["cancelled","#e05a5a"]].map(([s,c]) => (
          <div key={s} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#777" }}>
            <div style={{ width:12, height:4, borderRadius:2, background:c }} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HostBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
    useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }
      
      setBookings(data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

    const handleConfirmBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to confirm this booking?')) return;
    
    setActionLoading(bookingId);
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'confirm' }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }
      
      // Refresh bookings
      fetchBookings();
      alert('Booking confirmed successfully');
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    setActionLoading(bookingId);
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cancel' }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }
      
      // Refresh bookings
      fetchBookings();
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getFiltered = () => filter === "all" || filter === "calendar"
    ? bookings
    : bookings.filter(b => b.status === filter);

  const formatDate = (s) => new Date(s).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
  const calcNights = (ci, co) => Math.ceil((new Date(co) - new Date(ci)) / 86400000);

  const statusStyle = (s) => ({
    confirmed: { bg:"#DCFCE7", color:"#166534" },
    pending:   { bg:"#FEF9C3", color:"#713f12" },
    cancelled: { bg:"#FEE2E2", color:"#991b1b" },
  }[s] || { bg:"#F3F4F6", color:"#374151" });

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f7f6f2" }}>
      <div style={{ width:40, height:40, border:"3px solid #e8c547", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,300;1,9..144,500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Mono', monospace; background: #f7f6f2; color: #111118; -webkit-font-smoothing: antialiased; }
        .font-display { font-family: 'Fraunces', serif; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

        .fu { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .fu0 { animation-delay: 0s; }
        .fu1 { animation-delay: 0.08s; }
        .fu2 { animation-delay: 0.16s; }

        .nav-blur { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }

        .nav-link { font-size:12px; color:rgba(255,255,255,0.5); text-decoration:none; padding:6px 12px; border-radius:6px; transition:color 0.15s, background 0.15s; }
        .nav-link:hover { color:#fff; background:rgba(255,255,255,0.06); }
        .nav-link.active { color:#e8c547; }

        .btn-primary {
          background:#e8c547; color:#1a1a2e;
          padding:9px 20px; border-radius:8px;
          font-size:12px; font-family:'DM Mono',monospace; font-weight:500;
          text-decoration:none; display:inline-flex; align-items:center; gap:6px;
          border:none; cursor:pointer;
          transition:opacity 0.15s, transform 0.15s;
        }
        .btn-primary:hover { opacity:0.88; transform:translateY(-1px); }

        .filter-tab {
          padding:8px 16px; border:none; background:none;
          font-family:'DM Mono',monospace; font-size:12px; cursor:pointer;
          color:#888; border-bottom:2px solid transparent;
          transition:color 0.15s, border-color 0.15s;
          display:inline-flex; align-items:center; gap:6px;
          white-space:nowrap;
        }
        .filter-tab:hover { color:#111118; }
        .filter-tab.active { color:#1a1a2e; border-bottom-color:#e8c547; }

        .booking-card {
          background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:14px;
          padding:1.25rem 1.5rem; transition:box-shadow 0.2s, transform 0.2s;
        }
        .booking-card:hover { box-shadow:0 10px 32px rgba(0,0,0,0.07); transform:translateY(-2px); }

        .action-btn {
          padding:8px 16px; border-radius:8px; font-size:12px;
          font-family:'DM Mono',monospace; font-weight:500; cursor:pointer;
          border:none; display:inline-flex; align-items:center; gap:5px;
          transition:opacity 0.15s, transform 0.15s;
        }
        .action-btn:hover { opacity:0.85; transform:translateY(-1px); }
        .action-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

        .hamburger { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:4px; }
        .hamburger span { display:block; width:20px; height:2px; background:rgba(255,255,255,0.7); border-radius:2px; transition:all 0.2s; }
        .mobile-menu { display:none; position:fixed; top:56px; left:0; right:0; background:#1a1a2e; border-bottom:1px solid rgba(232,197,71,0.15); padding:1rem 1.5rem; z-index:40; flex-direction:column; gap:10px; }
        .mobile-menu.open { display:flex; animation:fadeIn 0.2s ease; }
        .stats-bar { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }

        @media (max-width: 900px) {
          .stats-bar { grid-template-columns:repeat(2,1fr); }
          .booking-inner { flex-direction:column !important; }
          .action-col { flex-direction:row !important; margin-top:1rem; }
        }
        @media (max-width: 640px) {
          .hamburger { display:flex; }
          .desktop-nav { display:none !important; }
          .stats-bar { grid-template-columns:1fr 1fr; }
          .filter-tabs { overflow-x:auto; }
          .meta-grid { grid-template-columns:1fr 1fr !important; }
          .section-inner { padding:1.25rem !important; }
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#f7f6f2" }}>

        {/* ── NAV ── */}
        <nav className="nav-blur" style={{ position:"sticky", top:0, zIndex:50, background:"rgba(26,26,46,0.97)", borderBottom:"1px solid rgba(232,197,71,0.15)", padding:"0 1.5rem", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link href="/" style={{ textDecoration:"none" }}>
            <div className="font-display" style={{ fontStyle:"italic", fontWeight:300, fontSize:22, color:"#fff" }}>
              mar<span style={{ fontStyle:"normal", fontWeight:500, color:"#e8c547" }}>haba</span>
            </div>
          </Link>

          <div className="desktop-nav" style={{ display:"flex", alignItems:"center", gap:4 }}>
            <Link href="/host-dashboard" className="nav-link">overview</Link>
            <Link href="/host/listings" className="nav-link">my listings</Link>
            <Link href="/host/bookings" className="nav-link active">bookings</Link>
            <div style={{ width:1, height:16, background:"rgba(255,255,255,0.12)", margin:"0 6px" }} />
            <button onClick={() => router.push("/host-dashboard")} className="btn-primary" style={{ padding:"6px 14px" }}>dashboard →</button>
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span style={{ transform: menuOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        </nav>

        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <Link href="/host-dashboard" style={{ fontSize:13, color:"rgba(255,255,255,0.7)", textDecoration:"none", padding:"8px 0" }}>overview</Link>
          <Link href="/host/listings" style={{ fontSize:13, color:"rgba(255,255,255,0.7)", textDecoration:"none", padding:"8px 0" }}>my listings</Link>
          <Link href="/host/bookings" style={{ fontSize:13, color:"#e8c547", textDecoration:"none", padding:"8px 0" }}>bookings</Link>
        </div>

        {/* ── PAGE HEADER ── */}
        <div style={{ background:"#1a1a2e", borderBottom:"1px solid rgba(232,197,71,0.12)", padding:"2.5rem 1.5rem 2rem" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div className="fu fu0" style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(232,197,71,0.6)", marginBottom:8 }}>host panel</div>
            <h1 className="fu fu1 font-display" style={{ fontStyle:"italic", fontWeight:300, fontSize:"clamp(28px,4vw,38px)", color:"#fff", marginBottom:"1.75rem" }}>
              Bookings <span style={{ fontWeight:500, color:"#e8c547" }}>management</span>
            </h1>

            {/* Stats bar */}
            <div className="fu fu2 stats-bar">
              {[
                { label:"total", val: bookings.length, c:"rgba(255,255,255,0.2)" },
                { label:"confirmed", val: bookings.filter(b=>b.status==="confirmed").length, c:"#1D9E75" },
                { label:"pending", val: bookings.filter(b=>b.status==="pending").length, c:"#e8c547" },
                { label:"cancelled", val: bookings.filter(b=>b.status==="cancelled").length, c:"#e05a5a" },
              ].map(({ label, val, c }) => (
                <div key={label} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderTop:`3px solid ${c}`, borderRadius:10, padding:"0.875rem 1rem" }}>
                  <div className="font-display" style={{ fontStyle:"italic", fontWeight:300, fontSize:28, color:"#fff", lineHeight:1 }}>{val}</div>
                  <div style={{ fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginTop:4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <main style={{ maxWidth:1100, margin:"0 auto", padding:"2rem 1.5rem" }}>

          {/* Filter tabs */}
          <div className="filter-tabs" style={{ display:"flex", borderBottom:"1px solid rgba(0,0,0,0.08)", marginBottom:"1.5rem", overflowX:"auto" }}>
            {[
              { id:"all", label:"All" },
              { id:"confirmed", label:"Confirmed" },
              { id:"pending", label:"Pending" },
              { id:"cancelled", label:"Cancelled" },
              { id:"calendar", label:"📅 Calendar" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`filter-tab ${filter === id ? "active" : ""}`}
              >
                {label}
                {!["all","calendar"].includes(id) && (
                  <span style={{ fontSize:10, background: filter===id ? "#1a1a2e" : "rgba(0,0,0,0.06)", color: filter===id ? "#e8c547" : "#888", padding:"1px 7px", borderRadius:20 }}>
                    {bookings.filter(b=>b.status===id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", color:"#991B1B", padding:"12px 16px", borderRadius:10, marginBottom:"1rem", fontSize:13 }}>{error}</div>
          )}

          {/* Calendar View */}
          {filter === "calendar" ? (
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid rgba(0,0,0,0.07)", padding:"1.5rem" }} className="section-inner">
              <HostCalendar bookings={bookings} onConfirmBooking={handleConfirmBooking} onCancelBooking={handleCancelBooking} />
            </div>
          ) : getFiltered().length === 0 ? (
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid rgba(0,0,0,0.07)", padding:"4rem", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📅</div>
              <p style={{ fontSize:13, color:"#999" }}>No bookings found</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {getFiltered().map((booking, idx) => {
                const ss = statusStyle(booking.status);
                const nights = calcNights(booking.checkIn, booking.checkOut);
                const isLoading = actionLoading === booking._id;
                return (
                  <div key={booking._id} className="booking-card fu" style={{ animationDelay:`${idx*0.05}s` }}>
                    <div className="booking-inner" style={{ display:"flex", gap:"1.5rem", justifyContent:"space-between" }}>

                      {/* Left: info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        {/* Title row */}
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"0.75rem", flexWrap:"wrap" }}>
                          <h3 style={{ fontSize:15, fontWeight:500, color:"#111118" }}>{booking.listing?.title || "Listing"}</h3>
                          <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:ss.bg, color:ss.color, fontWeight:500, letterSpacing:"0.05em", textTransform:"uppercase" }}>
                            {booking.status}
                          </span>
                        </div>

                        {/* Guest info */}
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.375rem 1.5rem", marginBottom:"1rem" }}>
                          {[
                            ["guest", booking.user?.name || "Guest"],
                            ["email", booking.user?.email],
                            ["phone", booking.user?.phoneNumber],
                            ["location", booking.listing?.location],
                          ].map(([label, val]) => (
                            <div key={label}>
                              <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", color:"#bbb" }}>{label} </span>
                              <span style={{ fontSize:12, color:"#555" }}>{val}</span>
                            </div>
                          ))}
                        </div>

                        {/* Date / nights / guests / price */}
                        <div className="meta-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", borderTop:"1px solid rgba(0,0,0,0.05)", paddingTop:"0.875rem" }}>
                          {[
                            ["check-in", formatDate(booking.checkIn)],
                            ["check-out", formatDate(booking.checkOut)],
                            ["nights", `${nights} night${nights!==1?"s":""}`],
                            ["guests", `${booking.guests} guest${booking.guests!==1?"s":""}`],
                          ].map(([label, val]) => (
                            <div key={label}>
                              <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", color:"#bbb", marginBottom:2 }}>{label}</div>
                              <div style={{ fontSize:12, fontWeight:500, color:"#333" }}>{val}</div>
                            </div>
                          ))}
                        </div>

                        <div style={{ marginTop:"0.75rem", display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", color:"#bbb" }}>total</span>
                          <span style={{ fontSize:16, fontWeight:500, color:"#1a1a2e" }}>${booking.totalPrice.toLocaleString()}</span>
                          <span style={{ fontSize:11, color:"#bbb", marginLeft:"auto" }}>booked {formatDate(booking.createdAt)}</span>
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div className="action-col" style={{ display:"flex", flexDirection:"column", gap:8, flexShrink:0, minWidth:140 }}>
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleConfirmBooking(booking._id)}
                              disabled={isLoading}
                              className="action-btn"
                              style={{ background:"#1a1a2e", color:"#e8c547", justifyContent:"center" }}
                            >
                              {isLoading ? <Spinner /> : "✓ confirm"}
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              disabled={isLoading}
                              className="action-btn"
                              style={{ background:"#FEE2E2", color:"#991b1b", justifyContent:"center" }}
                            >
                              {isLoading ? <Spinner dark /> : "✗ cancel"}
                            </button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={isLoading}
                            className="action-btn"
                            style={{ background:"#FEE2E2", color:"#991b1b", justifyContent:"center" }}
                          >
                            {isLoading ? <Spinner dark /> : "cancel"}
                          </button>
                        )}
                        {booking.status === "cancelled" && (
                          <div style={{ fontSize:11, color:"#bbb", textAlign:"center", padding:"8px 0" }}>cancelled</div>
                        )}
                        <Link
                          href={`/listings/${booking.listing?._id}`}
                          style={{ background:"rgba(0,0,0,0.04)", color:"#555", textDecoration:"none", textAlign:"center", padding:"8px 16px", borderRadius:8, fontSize:12, fontFamily:"inherit", border:"1px solid rgba(0,0,0,0.08)", transition:"background 0.15s" }}
                        >
                          view listing
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* ── FOOTER ── */}
        {/* <footer style={{ background:"#111118", borderTop:"1px solid rgba(232,197,71,0.08)", padding:"2rem 1.5rem", marginTop:"3rem" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
            <div className="font-display" style={{ fontStyle:"italic", fontWeight:300, fontSize:18, color:"#fff" }}>
              mar<span style={{ fontStyle:"normal", fontWeight:500, color:"#e8c547" }}>haba</span>
            </div>
            <p style={{ fontSize:11, color:"#333" }}>© 2024 Marhaba. All rights reserved.</p>
          </div>
        </footer> */}
      </div>
    </>
  );
}

function Spinner({ dark }) {
  return (
    <span style={{ width:12, height:12, border:`2px solid ${dark ? "#991b1b" : "#e8c547"}`, borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
  );
}