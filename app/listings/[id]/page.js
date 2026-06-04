"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import BookingCalendar from "@/components/BookingCalendar";
import { useLanguage } from "@/hooks/useLanguage";
import HostDateManager from "@/components/HostDateManager";
import Navbar from "@/components/Navbar";

import "leaflet/dist/leaflet.css";
import LoadingScreen from "@/components/LoadingScreen";

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

const POLICY_META = {
  flexible: {
    icon: "🟢",
    labelEn: "Flexible",
    labelAr: "مرن",
    color: "#1D9E75",
    bg: "#EAF3DE",
  },
  moderate: {
    icon: "🟡",
    labelEn: "Moderate",
    labelAr: "معتدل",
    color: "#D97706",
    bg: "#FEF3C7",
  },
  strict: {
    icon: "🔴",
    labelEn: "Strict",
    labelAr: "صارم",
    color: "#e05a5a",
    bg: "#FCEBEB",
  },
  custom: {
    icon: "✏️",
    labelEn: "Custom",
    labelAr: "مخصص",
    color: "#555",
    bg: "#f7f6f2",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const fromDateString = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const displayDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

const createLocalDate = fromDateString;

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

// ── Normalise policy: support both old flat schema and new rulePairs schema ──
function normalisePolicy(policy) {
  if (!policy) return null;
  return {
    type: policy.type ?? "custom",
    descriptionEn: policy.descriptionEn ?? policy.description ?? "",
    descriptionAr: policy.descriptionAr ?? policy.description ?? "",
    // If stored with new rulePairs, use them. Otherwise migrate flat rules.
    rulePairs:
      policy.rulePairs ?? (policy.rules ?? []).map((r) => ({ en: r, ar: r })),
  };
}

// ── Full policy card (left column) ───────────────────────────────────────────
function CancellationPolicyCard({ policy: rawPolicy, isAr }) {
  const policy = normalisePolicy(rawPolicy);
  if (!policy) return null;

  const meta = POLICY_META[policy.type] ?? POLICY_META.custom;
  const label = isAr ? meta.labelAr : meta.labelEn;
  const description = isAr ? policy.descriptionAr : policy.descriptionEn;
  const rules = policy.rulePairs
    .map((p) => (isAr ? p.ar : p.en))
    .filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-black/7 px-5 pb-5">
      <div className="border-t-[3px] border-[#e8c547] pt-5 mb-4">
        <div className="text-[10px] tracking-[0.1em] uppercase text-[#999] mb-1.5">
          {isAr ? "سياسة الإلغاء" : "Cancellation Policy"}
        </div>
      </div>

      {/* Type badge */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold mb-3"
        style={{ background: meta.bg, color: meta.color }}
      >
        <span>{meta.icon}</span>
        <span>{label}</span>
      </div>

      {/* Description */}
      {description && (
        <p className="text-[13px] text-[#666] leading-[1.7] mb-3 italic">
          {description}
        </p>
      )}

      {/* Rules */}
      {rules.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {rules.map((rule, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-[13px] text-[#555]"
            >
              <span
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: meta.bg }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path
                    d="M1 4l2 2 4-4"
                    stroke={meta.color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {rule}
            </li>
          ))}
        </ul>
      ) : (
        !description && (
          <p className="text-[13px] text-[#999] italic">
            {isAr
              ? "تواصل مع المضيف للاستفسار عن شروط الإلغاء."
              : "Contact the host for cancellation terms."}
          </p>
        )
      )}
    </div>
  );
}

// ── Mini policy badge (booking panel) ────────────────────────────────────────
function CancellationPolicyMini({ policy: rawPolicy, isAr }) {
  const policy = normalisePolicy(rawPolicy);
  if (!policy) return null;

  const meta = POLICY_META[policy.type] ?? POLICY_META.custom;
  const label = isAr ? meta.labelAr : meta.labelEn;
  // First rule in the active language
  const firstRule =
    policy.rulePairs.length > 0
      ? isAr
        ? policy.rulePairs[0].ar
        : policy.rulePairs[0].en
      : null;

  return (
    <div
      className="rounded-lg px-3 py-2.5 text-[11px] leading-[1.6]"
      style={{ background: meta.bg, color: meta.color }}
    >
      <span className="font-semibold">
        {meta.icon} {label} {isAr ? "سياسة الإلغاء" : "cancellation"}
      </span>
      {firstRule && (
        <span className="block mt-0.5 opacity-80">{firstRule}</span>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ListingDetail({ params }) {
  const router = useRouter();
  const { lang, t, toggleLanguage } = useLanguage();
  const isAr = lang === "ar";

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
  const [listingView, setListingView] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

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
      .then((d) => setCurrentUser(d?.user));
  }, []);

  useEffect(() => {
    if (unwrappedParams?.id) fetchListing();
  }, [unwrappedParams]);

  useEffect(() => {
    if (currentUser && listing) setIsHost(currentUser.id === listing.host?.id);
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
      if (!res.ok) throw new Error(data.message);
      setListing(data.listing);
      setBookedDates(data.bookedDates);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!unwrappedParams?.id) return;
    (async () => {
      try {
        const res = await fetch(`/api/listings/${unwrappedParams.id}/view`, {
          method: "POST",
        });
        const data = await res.json();
        if (data.success) setListingView(data.views);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [unwrappedParams?.id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess("");
    setIsSubmitting(true);
    if (!booking.checkIn || !booking.checkOut) {
      setBookingError(t.pleaseSelectDates);
      setIsSubmitting(false);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async () => {
    setIsTogglingActive(true);
    try {
      const res = await fetch(`/api/listings/${unwrappedParams.id}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setListing((prev) => ({ ...prev, is_active: data.is_active }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingActive(false);
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
  const categoryInfo = listing?.category
    ? CATEGORIES.find((c) => c.id === listing.category)
    : null;
  const formatCurrency = (amount) =>
    isAr
      ? `${amount.toLocaleString()} دينار`
      : `${amount.toLocaleString()} LYD`;
  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "super_admin";
  const userInitials =
    currentUser?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  if (loading) return <LoadingScreen />;

  if (!listing)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2] flex-col gap-4">
        <div className="text-5xl">🏠</div>
        <div className="font-['Fraunces',serif] italic font-light text-[26px] text-[#111118]">
          {t.listingNotFound}
        </div>
        <Link
          href="/listings"
          className="text-[13px] text-[#185FA5] no-underline"
        >
          {t.backToListings}
        </Link>
      </div>
    );

  const blockedDatesArr = (listing.blockedDates || []).map((b) => ({
    startDate: b.startDate,
    endDate: b.endDate,
    reason: b.reason,
    id: b.id,
  }));
  const hostAvi = avi(listing.host?.name);
  const hostInitial = listing.host?.name?.charAt(0)?.toUpperCase() || "H";

  return (
    <div
      className="min-h-screen bg-[#f7f6f2]"
      dir={isAr ? "rtl" : "ltr"}
      style={{
        fontFamily: isAr
          ? "'Cairo', 'Tajawal', sans-serif"
          : "'DM Mono', monospace",
      }}
    >
      <Navbar
        NAV_LINKS={[
          { id: "dashboard", label: t.dashboard, href: "/dashboard" },
          { id: "browse", label: t.browse, href: "/listings" },
        ]}
        user={currentUser}
        lang={lang}
        toggleLanguage={toggleLanguage}
        ini={userInitials}
      />

      <main className="max-w-[1100px] mx-auto px-6 py-7">
        {/* Back + Title */}
        <div className="mb-5">
          <Link
            href="/listings"
            className="text-[12px] text-[#888] no-underline inline-flex items-center gap-1 mb-2.5"
          >
            ← {t.backToListings}
          </Link>
          {categoryInfo && (
            <div className="inline-flex items-center gap-1.5 bg-[#f7f6f2] px-3.5 py-1.5 rounded-3xl text-[13px] text-[#555] mb-4 border border-black/7">
              <span className="text-[18px]">{categoryInfo.icon}</span>
              <span>{isAr ? categoryInfo.labelAr : categoryInfo.labelEn}</span>
            </div>
          )}
          <h1
            className="font-light text-[clamp(24px,4vw,36px)] text-[#111118] leading-[1.1] mb-2"
            style={{
              fontFamily: isAr ? "'Cairo', sans-serif" : "'Fraunces', serif",
              fontStyle: isAr ? "normal" : "italic",
            }}
          >
            {listing.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#888]">
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1C4.07 1 2.5 2.57 2.5 4.5c0 2.78 3.5 6.5 3.5 6.5s3.5-3.72 3.5-6.5C9.5 2.57 7.93 1 6 1zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
                  fill="#bbb"
                />
              </svg>
              {listing.location}
            </div>
            <div className="flex items-center gap-1 text-[#666]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>
                {listingView || listing.view_count || 0}{" "}
                {isAr ? "مشاهدة" : "views"}
              </span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-6">
          <div className="h-[380px] rounded-2xl overflow-hidden bg-[#e0dfd9] mb-2.5">
            {listing.images?.[activeImage] && (
              <img
                src={listing.images[activeImage]}
                alt={listing.title}
                className="w-full h-full object-cover block transition-opacity duration-200"
              />
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
                    i === activeImage
                      ? "opacity-100 border-[#e8c547]"
                      : "opacity-60 border-transparent"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-5 items-start">
          {/* ── LEFT column ── */}
          <div className="flex flex-col gap-5">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-black/7 px-5 pb-5">
              <div className="border-t-[3px] border-[#378ADD] pt-5 mb-4">
                <div className="text-[10px] tracking-[0.1em] uppercase text-[#999] mb-1.5">
                  {t.about}
                </div>
              </div>
              <p className="text-[13px] text-[#555] leading-[1.75]">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            {listing.amenities?.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/7 px-5 pb-5 pt-5">
                <div className="text-[10px] tracking-[0.1em] uppercase text-[#999] mb-4">
                  {t.amenities}
                </div>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a, i) => (
                    <span
                      key={i}
                      className="bg-[#f7f6f2] px-3 py-[5px] rounded-2xl text-[12px] text-[#555]"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* House Rules */}
            {listing.rules?.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/7 px-5 pb-5">
                <div className="border-t-[3px] border-[#e8c547] pt-5 mb-4">
                  <div className="text-[10px] tracking-[0.1em] uppercase text-[#999] mb-1.5">
                    {t.houseRules}
                  </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                  {listing.rules.map((rule, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 text-[13px] text-[#555] px-2 py-1.5 bg-[#fafaf8] rounded-lg"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#FAEEDA] inline-flex items-center justify-center text-[10px] text-[#633806] flex-shrink-0">
                        ✓
                      </span>
                      {rule}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation Policy — full card, language-aware */}
            <CancellationPolicyCard
              policy={listing.cancellation_policy}
              isAr={isAr}
            />

            {/* Host */}
            <div className="bg-white rounded-2xl border border-black/7 px-5 pb-5 pt-5">
              <div className="text-[10px] tracking-[0.1em] uppercase text-[#999] mb-4">
                {t.hostedBy}
              </div>
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[16px] font-medium flex-shrink-0"
                  style={{ background: hostAvi.bg, color: hostAvi.color }}
                >
                  {hostInitial}
                </div>
                <div>
                  <div className="text-[14px] font-medium text-[#111118]">
                    {listing.host?.name}
                  </div>
                  <div className="text-[11px] text-[#999] mt-0.5">
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
            {listing.latitude && listing.longitude && leafletFixed && (
              <div className="bg-white rounded-2xl border border-black/7 px-5 pb-5 pt-5">
                <div className="text-[10px] tracking-[0.1em] uppercase text-[#999] mb-4">
                  {t.locationMap}
                </div>
                <div className="rounded-xl overflow-hidden h-[280px]">
                  <MapContainer
                    center={[listing.latitude, listing.longitude]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    <Marker position={[listing.latitude, listing.longitude]}>
                      <Popup>
                        <div
                          style={{
                            fontFamily: "sans-serif",
                            minWidth: "160px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#555",
                              marginBottom: "6px",
                            }}
                          >
                            {listing.location}
                          </div>
                          <a
                            href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              background: "#1a1a2e",
                              color: "#e8c547",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "600",
                              textDecoration: "none",
                            }}
                          >
                            {"📍 "}
                            {isAr ? "فتح في خرائط جوجل" : "Open in Google Maps"}
                          </a> <span> </span>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              background: "#1a1a2e",
                              color: "#e8c547",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "600",
                              textDecoration: "none",
                            }}
                          >
                             {"📍 "}
                            {isAr ? " الوجهة" : "Direction"}
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT column ── */}
          <div>
            {!isHost && !isAdmin ? (
              /* Guest booking panel */
              <div className="bg-white rounded-2xl border border-black/7 border-t-[3px] border-t-[#e8c547] px-5 pb-5">
                <div className="flex items-baseline gap-1 mb-5 pt-4">
                  <span
                    className="font-light text-[34px] text-[#111118] leading-none"
                    style={{
                      fontFamily: isAr
                        ? "'Cairo', sans-serif"
                        : "'Fraunces', serif",
                      fontStyle: isAr ? "normal" : "italic",
                    }}
                  >
                    {formatCurrency(listing.price)}
                  </span>
                  <span className="text-[12px] text-[#999]">/ {t.night}</span>
                </div>

                {!listing.is_active && (
                  <div className="bg-[#FEF3C7] border border-[#D97706]/20 rounded-lg px-3 py-2.5 text-[12px] text-[#92400E] mb-4">
                    {t.listingUnavailable ||
                      "This listing is currently unavailable for booking."}
                  </div>
                )}

                <form
                  onSubmit={handleBooking}
                  className="flex flex-col gap-3.5"
                >
                  <div>
                    <label className="block text-[10px] tracking-[0.1em] uppercase text-[#888] mb-1.5">
                      {t.selectDates}
                    </label>
                    <BookingCalendar
                      bookedDates={bookedDates}
                      onDateSelect={(dates) => {
                        setBooking((prev) => ({ ...prev, ...dates }));
                        if (dates.checkIn && dates.checkOut)
                          setBookingError("");
                      }}
                      checkIn={booking.checkIn}
                      checkOut={booking.checkOut}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      [t.checkIn, booking.checkIn],
                      [t.checkOut, booking.checkOut],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        className="bg-[#f7f6f2] border border-black/7 rounded-lg px-3 py-2.5"
                      >
                        <div className="text-[10px] tracking-[0.08em] uppercase text-[#999] mb-[3px]">
                          {label}
                        </div>
                        <div
                          className={`text-[12px] ${val ? "text-[#111118]" : "text-[#bbb]"}`}
                        >
                          {val ? displayDate(val) : "—"}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-[0.1em] uppercase text-[#888] mb-1.5">
                      {t.guests}
                    </label>
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
                      className="w-full px-3.5 py-2.5 border border-black/12 rounded-lg text-[13px] font-[inherit] text-[#111118] bg-[#fafaf8] outline-none"
                    />
                  </div>

                  {nights > 0 && (
                    <div className="bg-[#f7f6f2] rounded-lg px-3 py-3 border border-black/7">
                      <div className="flex justify-between text-[12px] text-[#666] mb-2">
                        <span>
                          {formatCurrency(listing.price)} × {nights}{" "}
                          {nights === 1 ? t.night : t.nights}
                        </span>
                        <span>{formatCurrency(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-[13px] font-medium text-[#111118] pt-2 border-t border-black/7">
                        <span>{t.total}</span>
                        <span className="text-[#1D9E75]">
                          {formatCurrency(totalPrice)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Cancellation policy mini — language-aware */}
                  {listing.cancellation_policy && (
                    <CancellationPolicyMini
                      policy={listing.cancellation_policy}
                      isAr={isAr}
                    />
                  )}

                  {bookingError && (
                    <div className="bg-[#FCEBEB] border border-[#A32D2D]/15 rounded-lg px-3 py-2.5 text-[12px] text-[#791F1F]">
                      {bookingError}
                    </div>
                  )}
                  {bookingSuccess && (
                    <div className="bg-[#EAF3DE] border border-[#27500A]/15 rounded-lg px-3 py-2.5 text-[12px] text-[#27500A]">
                      {bookingSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      !booking.checkIn ||
                      !booking.checkOut ||
                      isSubmitting ||
                      !listing.is_active
                    }
                    className="bg-[#e8c547] text-[#1a1a2e] px-3 py-3 rounded-[10px] text-[13px] font-semibold border-none cursor-pointer font-[inherit] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? isAr
                        ? "جاري المعالجة..."
                        : "Processing..."
                      : `${t.bookNow} →`}
                  </button>
                </form>
              </div>
            ) : isHost ? (
              /* Host management panel */
              <div className="bg-white rounded-2xl border border-black/7 border-t-[3px] border-t-[#7F77DD] px-5 pb-5">
                <div className="pt-4 text-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-[#EEEDFE] flex items-center justify-center mx-auto mb-3 text-[22px]">
                    🏠
                  </div>
                  <div
                    className="font-light text-[18px] text-[#111118] mb-1.5"
                    style={{
                      fontFamily: isAr
                        ? "'Cairo', sans-serif"
                        : "'Fraunces', serif",
                      fontStyle: isAr ? "normal" : "italic",
                    }}
                  >
                    {t.youOwnThisProperty}
                  </div>
                  <p className="text-[12px] text-[#999] leading-[1.6]">
                    {t.cannotBookOwnListing}
                  </p>
                </div>

                <div className="mb-4 px-1">
                  <div className="flex items-center justify-between bg-[#f7f6f2] rounded-xl px-4 py-3 border border-black/7">
                    <div>
                      <div className="text-[12px] font-medium text-[#111118]">
                        {listing.is_active
                          ? t.listingActive || "Listing Active"
                          : t.listingInactive || "Listing Inactive"}
                      </div>
                      <div className="text-[11px] text-[#999] mt-0.5">
                        {listing.is_active
                          ? t.listingActiveDesc ||
                            "Guests can book this listing"
                          : t.listingInactiveDesc || "New bookings are paused"}
                      </div>
                    </div>
                    <button
                      onClick={handleToggleActive}
                      disabled={isTogglingActive}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 border-none cursor-pointer flex-shrink-0 disabled:opacity-50 ${
                        listing.is_active ? "bg-[#1D9E75]" : "bg-[#ddd]"
                      }`}
                    >
                      <span
                        className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-200 ${
                          listing.is_active ? "left-[22px]" : "left-[3px]"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="border-t border-black/7">
                  <BookingCalendar
                    bookedDates={bookedDates}
                    onDateSelect={() => {}}
                    checkIn=""
                    checkOut=""
                    isHost={true}
                    language={lang}
                  />
                  <HostDateManager
                    listingId={listing.id}
                    blockedDates={blockedDatesArr}
                    onDatesUpdated={fetchListing}
                    language={lang}
                  />
                </div>

                <div className="mt-5 pt-4 border-t border-black/7 text-center">
                  <Link
                    href="/host/bookings"
                    className="text-[12px] text-[#185FA5] no-underline"
                  >
                    {t.viewAllBookings} →
                  </Link>
                </div>
              </div>
            ) : (
              /* Admin view */
              <div className="bg-white rounded-2xl border border-black/7 border-t-[3px] border-t-[#999] px-6 py-6 text-center">
                <div className="text-5xl mb-3">👑</div>
                <div
                  className="font-light text-[18px] text-[#111118] mb-2"
                  style={{
                    fontFamily: isAr
                      ? "'Cairo', sans-serif"
                      : "'Fraunces', serif",
                    fontStyle: isAr ? "normal" : "italic",
                  }}
                >
                  {t.adminViewOnly || "Admin View"}
                </div>
                <p className="text-[12px] text-[#666] leading-[1.6]">
                  {t.adminCannotBookOrBlock ||
                    "Admins can view listings but cannot make bookings or block dates."}
                </p>
                <Link
                  href="/admin"
                  className="inline-block mt-4 text-[12px] text-[#185FA5] no-underline"
                >
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
