"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import BookingCalendar from "@/components/BookingCalendar";
import { useLanguage } from "@/hooks/useLanguage";
import HostDateManager from '@/components/HostDateManager';

import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

const CATEGORIES = [
  { id: "beachfront", icon: "🏖️", labelEn: "Beachfront", labelAr: "شاطئ" },
  { id: "mountain", icon: "🏔️", labelEn: "Mountain", labelAr: "جبال" },
  { id: "city", icon: "🏙️", labelEn: "City", labelAr: "مدينة" },
  { id: "countryside", icon: "🏡", labelEn: "Countryside", labelAr: "ريفي" },
  { id: "pool", icon: "🏊", labelEn: "Pool", labelAr: "مسبح" },
  { id: "islands", icon: "🌴", labelEn: "Islands", labelAr: "جزيرة" },
  { id: "camping", icon: "🏕️", labelEn: "Camping", labelAr: "تخييم" },
  { id: "cabins", icon: "🛖", labelEn: "Cabins", labelAr: "كوخ" },
];

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
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};

const createLocalDate = fromDateString;

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
  const [booking, setBooking] = useState({ checkIn: "", checkOut: "", guests: 1 });
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [leafletFixed, setLeafletFixed] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => { fixLeafletIcons(); setLeafletFixed(true); }, []);
  useEffect(() => { params.then ? params.then(setUnwrappedParams) : setUnwrappedParams(params); }, [params]);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setCurrentUser(d?.user); });
  }, []);
  useEffect(() => { if (unwrappedParams?.id) fetchListing(); }, [unwrappedParams]);
  useEffect(() => { if (currentUser && listing) setIsHost(currentUser.id === listing.host?.id); }, [currentUser, listing]);
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
    if (!booking.checkIn || !booking.checkOut) { setBookingError(t.pleaseSelectDates); return; }
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: unwrappedParams.id, checkIn: booking.checkIn, checkOut: booking.checkOut, guests: booking.guests }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBookingSuccess(t.bookingCreatedSuccess);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) { setBookingError(err.message); }
  };

  const nights = booking.checkIn && booking.checkOut
    ? Math.ceil((createLocalDate(booking.checkOut) - createLocalDate(booking.checkIn)) / 86400000)
    : 0;

  const AVATAR_PAL = [
    { bg: "#EEEDFE", color: "#3C3489" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FAEEDA", color: "#633806" },
  ];
  const avi = (name) => AVATAR_PAL[(name?.charCodeAt(0) ?? 0) % AVATAR_PAL.length];

  const NAV_LINKS = [
    { href: "/dashboard", label: t.dashboard },
    { href: "/listings", label: t.browse },
  ];

  const getCategoryInfo = () => listing?.category ? CATEGORIES.find(c => c.id === listing.category) : null;
  const categoryInfo = getCategoryInfo();

  const formatCurrency = (amount) => isAr ? `${amount.toLocaleString()} دينار` : `${amount.toLocaleString()} LYD`;

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    router.push("/login");
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2]">
      <div className="w-7 h-7 rounded-full border-[2.5px] border-[#1a1a2e] border-t-transparent animate-spin" />
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2] flex-col gap-4">
      <div className="text-5xl">🏠</div>
      <div className="font-[Fraunces,serif] italic font-light text-[26px] text-[#111118]">{t.listingNotFound}</div>
      <Link href="/listings" className="text-[13px] text-[#185FA5] no-underline">{t.backToListings}</Link>
    </div>
  );

  const blockedDatesArr = (listing.blockedDates || []).map((b) => ({
    startDate: b.startDate, endDate: b.endDate, reason: b.reason, id: b.id,
  }));
  const hostAvi = avi(listing.host?.name);
  const hostInitial = listing.host?.name?.charAt(0)?.toUpperCase() || "H";

  return (
    <div className="min-h-screen bg-[#f7f6f2]" dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? "'Cairo', 'Tajawal', sans-serif" : "'DM Mono', monospace" }}>

      {/* NAV */}
      <nav className="bg-[#1a1a2e] border-b border-[#e8c547]/15 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="no-underline font-['Cairo','Tajawal',sans-serif] font-medium text-[26px] text-white tracking-[1px]">
            مر<span className="font-bold text-[#e8c547]">حبا</span>
          </Link>
          <div className="hidden md:flex gap-1.5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="no-underline px-3 py-1.5 rounded-md text-[13px] text-white/65 hover:bg-[#e8c547]/12 hover:text-[#e8c547] transition-all">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={toggleLanguage}
            className="bg-[#e8c547]/15 border border-[#e8c547]/30 rounded-md px-2.5 py-1 text-[11px] cursor-pointer text-[#e8c547] font-[inherit]"
          >
            {lang === "en" ? "🇸🇦 عربي" : "🇬🇧 English"}
          </button>
          <Link href="/listings" className="text-[12px] text-white/50 no-underline">{t.allListings}</Link>
          <button
            onClick={handleLogout}
            className="bg-transparent border border-[#e8c547] rounded-md px-2.5 py-[5px] text-[12px] text-[#e8c547] cursor-pointer hover:border-[#e64949] transition-colors font-[inherit]"
          >
            {t.logout || "Logout"}
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-white/70 rounded transition-all ${mobileNavOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white/70 rounded transition-all ${mobileNavOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white/70 rounded transition-all ${mobileNavOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile nav */}
      {mobileNavOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bg-[#1a1a2e] border-b border-[#e8c547]/15 px-6 py-4 z-40 flex flex-col gap-2.5">
          <button
            onClick={toggleLanguage}
            className="bg-[#e8c547]/15 border border-[#e8c547]/30 rounded-md px-3 py-2 text-[12px] cursor-pointer text-[#e8c547] font-[inherit] mb-2.5 w-full"
          >
            {lang === 'en' ? '🇸🇦 عربي' : '🇬🇧 English'}
          </button>
          <button
            onClick={handleLogout}
            className="bg-transparent border border-white/20 rounded-md px-3 py-2 text-[12px] text-white cursor-pointer font-[inherit] w-full"
          >
            {t.logout || "Logout"}
          </button>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="text-[13px] text-white/70 no-underline py-2" onClick={() => setMobileNavOpen(false)}>
              {label}
            </Link>
          ))}
        </div>
      )}

      <main className="max-w-[1100px] mx-auto px-6 py-7">
        {/* Back + Title */}
        <div className="mb-5">
          <Link href="/listings" className="text-[12px] text-[#888] no-underline inline-flex items-center gap-1 mb-2.5">
            {t.backToListings}
          </Link>
          {categoryInfo && (
            <div className="inline-flex items-center gap-1.5 bg-[#f7f6f2] px-3.5 py-1.5 rounded-3xl text-[13px] text-[#555] mb-4 border border-black/7">
              <span className="text-[18px]">{categoryInfo.icon}</span>
              <span>{isAr ? categoryInfo.labelAr : categoryInfo.labelEn}</span>
            </div>
          )}
          <h1 className="font-light text-[clamp(24px,4vw,36px)] text-[#111118] leading-[1.1] mb-2"
            style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'Fraunces', serif", fontStyle: isAr ? 'normal' : 'italic' }}>
            {listing.title}
          </h1>
          <div className="flex items-center gap-1.5 text-[12px] text-[#888]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5c0 2.78 3.5 6.5 3.5 6.5s3.5-3.72 3.5-6.5C9.5 2.57 7.93 1 6 1zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="#bbb" />
            </svg>
            {listing.location}
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-6">
          <div className="h-[380px] rounded-2xl overflow-hidden bg-[#e0dfd9] mb-2.5">
            {listing.images?.[activeImage] && (
              <img src={listing.images[activeImage]} alt={listing.title} className="w-full h-full object-cover block transition-opacity duration-200" />
            )}
          </div>
          {listing.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {listing.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`view ${i + 1}`}
                  onClick={() => setActiveImage(i)}
                  className={`w-[70px] h-[70px] rounded-lg object-cover cursor-pointer transition-all border-2 ${
                    i === activeImage ? 'opacity-100 border-[#e8c547]' : 'opacity-60 border-transparent'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-5 items-start">

          {/* LEFT: Info */}
          <div className="flex flex-col gap-5">

            {/* Description */}
            <div className="bg-white rounded-2xl border border-black/7 px-5 pb-5">
              <div className="border-t-[3px] border-[#378ADD] pt-5 mb-4">
                <div className="text-[10px] tracking-[0.1em] uppercase text-[#999] mb-1.5">{t.about}</div>
              </div>
              <p className="text-[13px] text-[#555] leading-[1.75]">{listing.description}</p>
            </div>

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/7 px-5 pb-5 pt-5">
                <div className="text-[10px] tracking-[0.1em] uppercase text-[#999] mb-4">{t.amenities}</div>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a, i) => (
                    <span key={i} className="bg-[#f7f6f2] px-3 py-[5px] rounded-2xl text-[12px] text-[#555]">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* House Rules */}
            {listing.rules?.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/7 px-5 pb-5">
                <div className="border-t-[3px] border-[#e8c547] pt-5 mb-4">
                  <div className="text-[10px] tracking-[0.1em] uppercase text-[#999] mb-1.5">{t.houseRules}</div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                  {listing.rules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[13px] text-[#555] px-2 py-1.5 bg-[#fafaf8] rounded-lg">
                      <span className="w-5 h-5 rounded-full bg-[#FAEEDA] inline-flex items-center justify-center text-[10px] text-[#633806] flex-shrink-0">✓</span>
                      {rule}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Host */}
            <div className="bg-white rounded-2xl border border-black/7 px-5 pb-5 pt-5">
              <div className="text-[10px] tracking-[0.1em] uppercase text-[#999] mb-4">{t.hostedBy}</div>
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[16px] font-medium flex-shrink-0"
                  style={{ background: hostAvi.bg, color: hostAvi.color }}
                >
                  {hostInitial}
                </div>
                <div>
                  <div className="text-[14px] font-medium text-[#111118]">{listing.host?.name}</div>
                  <div className="text-[11px] text-[#999] mt-0.5">
                    {t.hostSince} {listing.host?.hostDetails?.joinedDate ? new Date(listing.host.hostDetails.joinedDate).getFullYear() : "2024"}
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            {listing.coordinates && leafletFixed && (
              <div className="bg-white rounded-2xl border border-black/7 px-5 pb-5 pt-5">
                <div className="text-[10px] tracking-[0.1em] uppercase text-[#999] mb-4">{t.locationMap}</div>
                <div className="rounded-xl overflow-hidden h-[280px]">
                  <MapContainer center={[listing.coordinates.lat, listing.coordinates.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                    <Marker position={[listing.coordinates.lat, listing.coordinates.lng]}>
                      <Popup>{listing.location}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Booking / Host panel */}
          <div>
            {!isHost && !isAdmin ? (
              // Regular users — booking panel
              <div className="bg-white rounded-2xl border border-black/7 border-t-[3px] border-t-[#e8c547] px-5 pb-5">
                <div className="flex items-baseline gap-1 mb-5 pt-4">
                  <span className="font-light text-[34px] text-[#111118] leading-none"
                    style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'Fraunces', serif", fontStyle: isAr ? 'normal' : 'italic' }}>
                    {formatCurrency(listing.price)}
                  </span>
                  <span className="text-[12px] text-[#999]">/ {t.night}</span>
                </div>

                <form onSubmit={handleBooking} className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-[10px] tracking-[0.1em] uppercase text-[#888] mb-1.5">{t.selectDates}</label>
                    <BookingCalendar
                      bookedDates={bookedDates}
                      onDateSelect={(dates) => setBooking((prev) => ({ ...prev, ...dates }))}
                      checkIn={booking.checkIn}
                      checkOut={booking.checkOut}
                    />
                  </div>

                  {/* Date display */}
                  <div className="grid grid-cols-2 gap-2">
                    {[[t.checkIn, booking.checkIn], [t.checkOut, booking.checkOut]].map(([label, val]) => (
                      <div key={label} className="bg-[#f7f6f2] border border-black/7 rounded-lg px-3 py-2.5">
                        <div className="text-[10px] tracking-[0.08em] uppercase text-[#999] mb-[3px]">{label}</div>
                        <div className={`text-[12px] ${val ? 'text-[#111118]' : 'text-[#bbb]'}`}>{val ? displayDate(val) : "—"}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-[0.1em] uppercase text-[#888] mb-1.5">{t.guests}</label>
                    <input
                      type="number" min="1" max="10" required value={booking.guests}
                      onChange={(e) => setBooking({ ...booking, guests: parseInt(e.target.value) })}
                      className="w-full px-3.5 py-2.5 border border-black/12 rounded-lg text-[13px] font-[inherit] text-[#111118] bg-[#fafaf8] outline-none"
                    />
                  </div>

                  {/* Price breakdown */}
                  {nights > 0 && (
                    <div className="bg-[#f7f6f2] rounded-lg px-3 py-3 border border-black/7">
                      <div className="flex justify-between text-[12px] text-[#666] mb-2">
                        <span>{formatCurrency(listing.price)} × {nights} {nights === 1 ? t.night : t.nights}</span>
                        <span>{formatCurrency(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-[13px] font-medium text-[#111118] pt-2 border-t border-black/7">
                        <span>{t.total}</span>
                        <span className="text-[#1D9E75]">{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>
                  )}

                  {bookingError && (
                    <div className="bg-[#FCEBEB] border border-[#A32D2D]/15 rounded-lg px-3 py-2.5 text-[12px] text-[#791F1F]">{bookingError}</div>
                  )}
                  {bookingSuccess && (
                    <div className="bg-[#EAF3DE] border border-[#27500A]/15 rounded-lg px-3 py-2.5 text-[12px] text-[#27500A]">{bookingSuccess}</div>
                  )}

                  <button
                    type="submit"
                    disabled={!booking.checkIn || !booking.checkOut}
                    className="bg-[#e8c547] text-[#1a1a2e] px-3 py-3 rounded-[10px] text-[13px] font-semibold border-none cursor-pointer font-[inherit] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.bookNow} →
                  </button>
                </form>
              </div>

            ) : isHost ? (
              // Host panel
              <div className="bg-white rounded-2xl border border-black/7 border-t-[3px] border-t-[#7F77DD] px-5 pb-5">
                <div className="pt-4 text-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-[#EEEDFE] flex items-center justify-center mx-auto mb-3 text-[22px]">🏠</div>
                  <div className="font-light text-[18px] text-[#111118] mb-1.5"
                    style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'Fraunces', serif", fontStyle: isAr ? 'normal' : 'italic' }}>
                    {t.youOwnThisProperty}
                  </div>
                  <p className="text-[12px] text-[#999] leading-[1.6]">{t.cannotBookOwnListing}</p>
                </div>
                <div className="border-t border-black/7">
                  <BookingCalendar bookedDates={bookedDates} onDateSelect={() => {}} checkIn="" checkOut="" isHost={true} />
                  <HostDateManager listingId={listing.id} blockedDates={blockedDatesArr} onDatesUpdated={fetchListing} />
                </div>
                <div className="mt-5 pt-4 border-t border-black/7 text-center">
                  <Link href="/host/bookings" className="text-[12px] text-[#185FA5] no-underline">{t.viewAllBookings} →</Link>
                </div>
              </div>

            ) : (
              // Admin panel
              <div className="bg-white rounded-2xl border border-black/7 border-t-[3px] border-t-[#999] px-6 py-6 text-center">
                <div className="text-5xl mb-3">👑</div>
                <div className="font-light text-[18px] text-[#111118] mb-2"
                  style={{ fontFamily: isAr ? "'Cairo', sans-serif" : "'Fraunces', serif", fontStyle: isAr ? 'normal' : 'italic' }}>
                  {t.adminViewOnly || "Admin View"}
                </div>
                <p className="text-[12px] text-[#666] leading-[1.6]">
                  {t.adminCannotBookOrBlock || "Admins can view listings but cannot make bookings or block dates."}
                </p>
                <Link href="/admin" className="inline-block mt-4 text-[12px] text-[#185FA5] no-underline">
                  {t.goToAdminPanel || "Go to Admin Panel →"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}