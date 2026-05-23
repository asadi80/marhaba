//app/host/listing
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import ImageUpload from "@/components/ImageUpload";
import { useLanguage } from "@/hooks/useLanguage";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const MapController = dynamic(
  () => import("./MapComponents").then((m) => m.MapController),
  { ssr: false },
);
const FixedCenterMarker = dynamic(
  () => import("./MapComponents").then((m) => m.FixedCenterMarker),
  { ssr: false },
);

const CATEGORIES = [
  {
    id: "beachfront",
    icon: "🏖️",
    labelEn: "Beachfront",
    labelAr: "شاطئ",
    descriptionEn: "Beautiful beachfront properties",
    descriptionAr: "عقارات جميلة على الشاطئ",
  },
  {
    id: "mountain",
    icon: "🏔️",
    labelEn: "Mountain",
    labelAr: "جبال",
    descriptionEn: "Scenic mountain retreats",
    descriptionAr: "منتجعات جبلية خلابة",
  },
  {
    id: "city",
    icon: "🏙️",
    labelEn: "City",
    labelAr: "مدينة",
    descriptionEn: "Vibrant city apartments",
    descriptionAr: "شقق مدينة نابضة بالحياة",
  },
  {
    id: "countryside",
    icon: "🏡",
    labelEn: "Countryside",
    labelAr: "ريفي",
    descriptionEn: "Peaceful countryside homes",
    descriptionAr: "منازل ريفية هادئة",
  },
  {
    id: "pool",
    icon: "🏊",
    labelEn: "Pool",
    labelAr: "مسبح",
    descriptionEn: "Properties with pools",
    descriptionAr: "عقارات بها مسبح",
  },
  {
    id: "desert",
    icon: "🏜️",
    labelEn: "Desert",
    labelAr: "صحراء",
    descriptionEn: "Stunning desert escapes",
    descriptionAr: "ملاذات صحراوية خلابة",
  },
  {
    id: "camping",
    icon: "🏕️",
    labelEn: "Camping",
    labelAr: "تخييم",
    descriptionEn: "Outdoor camping experiences",
    descriptionAr: "تجارب تخييم في الهواء الطلق",
  },
  {
    id: "cabins",
    icon: "🛖",
    labelEn: "Cabins",
    labelAr: "كوخ",
    descriptionEn: "Cozy cabin getaways",
    descriptionAr: "ملاذات كوخ مريحة",
  },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  price: "",
  location: "",
  coordinates: null,
  images: [],
  amenities: [""],
  rules: [],
  category: "city",
};

const DEFAULT_CENTER = { lat: 20, lng: 0 };

export default function HostListings() {
  const router = useRouter();
  const { lang, t, toggleLanguage } = useLanguage();
  const isAr = lang === "ar";

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [browserInfo, setBrowserInfo] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fixedMarkerIcon, setFixedMarkerIcon] = useState(null);
  const [user, setUser] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
    setFixedMarkerIcon(
      new L.DivIcon({
        className: "fixed-center-marker pointer-events-none",
        html: `<div style="position:relative;width:32px;height:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#e8c547" stroke="#1a1a2e" stroke-width="2"/>
          <circle cx="12" cy="9" r="3" fill="#1a1a2e"/>
        </svg>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;background-color:rgba(232,197,71,0.3);animation:pulse 1.5s ease-out infinite;pointer-events:none;"></div>
      </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -10],
      }),
    );
  }, []);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome") && !ua.includes("Edg")) setBrowserInfo("chrome");
    else if (ua.includes("Firefox")) setBrowserInfo("firefox");
    else if (ua.includes("Safari") && !ua.includes("Chrome"))
      setBrowserInfo("safari");
    else if (ua.includes("Edg")) setBrowserInfo("edge");
    else setBrowserInfo("other");
  }, []);

  const formatCurrency = (n) =>
    isAr
      ? `${Math.round(n).toLocaleString()} دينار`
      : `${Math.round(n).toLocaleString()} LYD`;

  const fetchListings = async () => {
    try {
      const res = await fetch("/api/host/listings");
      const data = await res.json();
      setListings(data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch {}
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      );
      const data = await res.json();
      return data.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const applyCoordinates = async (lat, lng) => {
    const address = await reverseGeocode(lat, lng);
    setSelectedLocation({ lat, lng, address });
    setFormData((p) => ({
      ...p,
      location: address,
      coordinates: { lat, lng },
    }));
  };

  const handleMapLocationSelect = useCallback(async (lat, lng) => {
    setMarkerPosition({ lat, lng });
    await applyCoordinates(lat, lng);
  }, []);

  const getIPLocation = async () => {
    try {
      const data = await (await fetch("https://ipapi.co/json/")).json();
      if (data.latitude && data.longitude)
        return {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city,
          country: data.country_name,
        };
    } catch {}
    return null;
  };

  const useCurrentLocation = async () => {
    if (!("geolocation" in navigator)) {
      const ip = await getIPLocation();
      if (
        ip &&
        confirm(
          isAr
            ? `موقع تقريبي (${ip.city}). استخدامه؟`
            : `Approximate location (${ip.city}). Use it?`,
        )
      ) {
        setMapCenter({ lat: ip.lat, lng: ip.lng });
        await applyCoordinates(ip.lat, ip.lng);
        mapRef.current?.setView([ip.lat, ip.lng], 13);
      } else {
        const msg = isAr
          ? "متصفحك لا يدعم تحديد الموقع"
          : "Geolocation not supported. Select manually on map.";
        setLocationError(msg);
        alert(msg);
      }
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);
    let success = false;

    for (const opts of [
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 30000 },
    ]) {
      if (success) break;
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, opts),
        );
        const { latitude: lat, longitude: lng } = pos.coords;
        setMapCenter({ lat, lng });
        await applyCoordinates(lat, lng);
        mapRef.current?.setView([lat, lng], opts.enableHighAccuracy ? 15 : 13);
        success = true;
      } catch {}
    }

    if (!success) {
      const ip = await getIPLocation();
      if (
        ip &&
        confirm(
          isAr
            ? `تعذر الموقع الدقيق. موقع تقريبي (${ip.city}). استخدامه؟`
            : `Exact location failed. Approximate (${ip.city}). Use it?`,
        )
      ) {
        setMapCenter({ lat: ip.lat, lng: ip.lng });
        await applyCoordinates(ip.lat, ip.lng);
        mapRef.current?.setView([ip.lat, ip.lng], 10);
        success = true;
      }
    }

    setIsGettingLocation(false);
    if (!success) {
      const msg = isAr
        ? "تعذر تحديد موقعك. حرك الخريطة يدوياً."
        : "Could not get location. Move the map to select manually.";
      setLocationError(msg);
      alert(msg);
    }
  };

  const handleInputChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleArrayChange = (i, field, val) =>
    setFormData((p) => {
      const a = [...p[field]];
      a[i] = val;
      return { ...p, [field]: a };
    });
  const addArrayField = (field) =>
    setFormData((p) => ({ ...p, [field]: [...p[field], ""] }));
  const removeArrayField = (field, i) =>
    setFormData((p) => ({
      ...p,
      [field]: p[field].filter((_, idx) => idx !== i),
    }));
  const handleImageUpload = (i, url) =>
    setFormData((p) => {
      const imgs = [...p.images];
      imgs[i] = url;
      return { ...p, images: imgs };
    });
  const handleImageRemove = (i) =>
    setFormData((p) => ({
      ...p,
      images: p.images.filter((_, idx) => idx !== i),
    }));
  const addImageSlot = () =>
    setFormData((p) => ({ ...p, images: [...p.images, ""] }));

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setMarkerPosition(null);
    setMapCenter(null);
    setSelectedLocation(null);
    setIsEditing(false);
    setEditingId(null);
    setLocationError(null);
  };
  const cancelEdit = () => {
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (listing) => {
    const coords =
      listing.coordinates?.lat && listing.coordinates?.lng
        ? listing.coordinates
        : null;
    setIsEditing(true);
    setEditingId(listing.id);
    setFormData({
      title: listing.title ?? "",
      description: listing.description ?? "",
      price: listing.price ?? "",
      location: listing.location ?? "",
      coordinates: coords,
      images: listing.images ?? [],
      amenities: listing.amenities?.length ? listing.amenities : [""],
      rules: listing.rules ?? [],
      category: listing.category ?? "city",
    });
    if (coords) {
      setMarkerPosition(coords);
      setMapCenter(coords);
      setSelectedLocation({ ...coords, address: listing.location ?? "" });
      setTimeout(
        () => mapRef.current?.setView([coords.lat, coords.lng], 14),
        500,
      );
    } else {
      setMapCenter(DEFAULT_CENTER);
    }
    setShowForm(true);
  };

  const handleToggleActive = async (listing) => {
    setTogglingId(listing.id);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, is_active: data.is_active } : l))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const validateForm = () => {
    if (!formData.location || !formData.coordinates) {
      alert(t.pleaseSelectLocation);
      return false;
    }
    if (!formData.images.length || !formData.images[0]) {
      alert(t.pleaseUploadImage);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowForm(false);
      resetForm();
      fetchListings();
      alert(t.listingCreatedSuccess);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await fetch(`/api/listings/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchListings();
      if (data.listing?.coordinates) {
        const { coordinates, location } = data.listing;
        setMarkerPosition(coordinates);
        setMapCenter(coordinates);
        setSelectedLocation({ ...coordinates, address: location });
        mapRef.current?.setView([coordinates.lat, coordinates.lng], 14);
      }
      setShowForm(false);
      setIsEditing(false);
      setEditingId(null);
      resetForm();
      alert(t.listingUpdatedSuccess);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDeleteListing)) return;
    try {
      const res = await fetch(`/api/listings/${id}?deleteListing=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchListings();
      alert(t.listingDeletedSuccess);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (showForm && !isEditing && !mapCenter && !isGettingLocation)
      setMapCenter(DEFAULT_CENTER);
  }, [showForm, isEditing, mapCenter, isGettingLocation]);

  const arabicFontClass = "font-['Cairo','Tajawal',sans-serif]";
  const displayFontClass = isAr
    ? "font-['Cairo','Tajawal',sans-serif]"
    : "font-['Fraunces',serif]";
  const bodyFontClass = isAr
    ? "font-['Cairo','Tajawal',sans-serif]"
    : "font-['DM_Mono',monospace]";

  const fieldInput = `w-full px-3.5 py-2.5 border border-black/12 rounded-lg text-[13px] font-[inherit] text-[#111118] bg-[#fafaf8] outline-none transition-all focus:border-[#e8c547] focus:shadow-[0_0_0_3px_rgba(232,197,71,0.12)] focus:bg-white ${bodyFontClass}`;

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "H";

  if (loading) return <LoadingScreen />;

  return (
    <div
      className={`min-h-screen bg-[#f7f6f2] ${bodyFontClass}`}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* NAV */}
      <Navbar
        NAV_LINKS={[
          { id: "overview", label: t.overview, href: "/host-dashboard" },
          { id: "listings", label: t.myListings, href: "/host/listings" },
          { id: "bookings", label: t.bookings, href: "/host/bookings" },
        ]}
        user={user}
        lang={lang}
        toggleLanguage={toggleLanguage}
        defaultActiveId="listings"
        ini={userInitials}
      />

      {/* Page header */}
      <div className="bg-[#1a1a2e] border-b border-[#e8c547]/12 px-6 py-10 pb-8">
        <div className="max-w-[1100px] mx-auto flex justify-between items-end gap-4">
          <div>
            <div
              className={`text-[10px] tracking-[0.12em] uppercase text-[#e8c547]/60 mb-2 ${bodyFontClass}`}
            >
              {t.hostPanel}
            </div>
            <h1
              className={`${displayFontClass} italic font-light text-[clamp(28px,4vw,38px)] text-white`}
            >
              {t.myListingsTitle1}{" "}
              <span className="font-medium text-[#e8c547]">{t.listings1}</span>
            </h1>
            <p className={`text-xs text-white/35 mt-1.5 ${bodyFontClass}`}>
              {listings.length}{" "}
              {listings.length !== 1 ? t.listingsActive : t.listingActive}
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className={`bg-[#e8c547] text-[#1a1a2e] px-5 py-2.5 rounded-lg text-xs font-medium border-none cursor-pointer shrink-0 hover:opacity-88 hover:-translate-y-px transition-all ${bodyFontClass}`}
            >
              + {t.addNewListing}
            </button>
          )}
        </div>
      </div>

      {/* Main */}
      <main className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">
        {/* FORM */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-black/7 p-8 mb-8">
            <div className="mb-7">
              <div
                className={`text-[10px] tracking-[0.12em] uppercase text-[#999] mb-1.5 ${bodyFontClass}`}
              >
                {isEditing ? t.editListing : t.newListing}
              </div>
              <h2
                className={`${displayFontClass} italic font-light text-[26px] text-[#111118]`}
              >
                {isEditing ? t.edit : t.createA}{" "}
                <span className="font-medium">{t.listing}</span>
              </h2>
            </div>

            <form
              onSubmit={isEditing ? handleUpdate : handleSubmit}
              className={bodyFontClass}
            >
              {/* Title */}
              <div className="mb-5">
                <label
                  className={`block text-[10px] tracking-[0.1em] uppercase text-[#888] mb-1.5 ${bodyFontClass}`}
                >
                  {t.title} *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className={fieldInput}
                  placeholder={t.titlePlaceholder}
                />
              </div>

              {/* Description */}
              <div className="mb-5">
                <label
                  className={`block text-[10px] tracking-[0.1em] uppercase text-[#888] mb-1.5 ${bodyFontClass}`}
                >
                  {t.description} *
                </label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`${fieldInput} resize-y`}
                  placeholder={t.descriptionPlaceholder}
                />
              </div>

              {/* Price */}
              <div className="mb-5">
                <label
                  className={`block text-[10px] tracking-[0.1em] uppercase text-[#888] mb-1.5 ${bodyFontClass}`}
                >
                  {t.pricePerNight} / {isAr ? "دينار" : "LYD"} *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={fieldInput}
                  placeholder="99"
                />
              </div>

              {/* Category */}
              <div className="mb-5">
                <label
                  className={`block text-[10px] tracking-[0.1em] uppercase text-[#888] mb-1.5 ${bodyFontClass}`}
                >
                  {isAr ? "الفئة" : "Category"} *
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`${fieldInput} cursor-pointer`}
                >
                  <option value="">
                    {isAr ? "اختر فئة" : "Select a category"}
                  </option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {isAr ? cat.labelAr : cat.labelEn}
                    </option>
                  ))}
                </select>
                {formData.category && (
                  <div
                    className={`text-[11px] text-[#666] mt-1.5 ${bodyFontClass}`}
                  >
                    {isAr
                      ? CATEGORIES.find((c) => c.id === formData.category)
                          ?.descriptionAr
                      : CATEGORIES.find((c) => c.id === formData.category)
                          ?.descriptionEn}
                  </div>
                )}
              </div>

              <hr className="border-none border-t border-black/7 my-6" />

              {/* Location */}
              <div className="mb-5">
                <label
                  className={`block text-[10px] tracking-[0.1em] uppercase text-[#888] mb-1.5 ${bodyFontClass}`}
                >
                  {t.location} *
                </label>

                {browserInfo && browserInfo !== "chrome" && (
                  <div className="bg-orange-50 border border-orange-300 rounded-lg px-3 py-2 mb-3 text-xs text-orange-800">
                    ℹ️{" "}
                    {browserInfo === "firefox" &&
                      (isAr
                        ? "فايرفوكس: دقة الموقع قد تكون أقل."
                        : "Firefox: Location accuracy may be lower.")}
                    {browserInfo === "safari" &&
                      (isAr
                        ? "سفاري: تأكد من تمكين خدمات الموقع."
                        : "Safari: Ensure location services are enabled.")}
                    {browserInfo === "edge" &&
                      (isAr
                        ? "إيدج: تحقق من إعدادات الخصوصية."
                        : "Edge: Check privacy settings.")}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap mb-2.5">
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`${fieldInput} flex-1 min-w-[180px]`}
                    placeholder={t.addressWillAppear}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={isGettingLocation}
                    className={`px-4 py-2.5 rounded-lg text-xs font-medium border-none cursor-pointer whitespace-nowrap transition-all hover:opacity-88 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${isGettingLocation ? "bg-[#ccc] text-white" : "bg-[#1D9E75] text-white"} ${bodyFontClass}`}
                  >
                    {isGettingLocation
                      ? t.gettingLocation
                      : `📍 ${t.myLocation}`}
                  </button>
                </div>

                {/* Map wrapper */}
                <div className="border border-black/10 rounded-xl overflow-hidden">
                  <div className="bg-[#1a1a2e] px-4 py-2.5 flex justify-between items-center flex-wrap gap-2">
                    <span
                      className={`text-[11px] text-white/50 ${bodyFontClass}`}
                    >
                      💡{" "}
                      {isAr
                        ? "حرك الخريطة لتحديد الموقع — العلامة ثابتة في المنتصف"
                        : "Move the map to select location — marker stays fixed in center"}
                    </span>
                  </div>

                  {(!mapCenter || isGettingLocation) && (
                    <div className="h-[400px] flex items-center justify-center bg-[#f7f6f2] flex-col gap-3">
                      {isGettingLocation ? (
                        <>
                          <div className="w-10 h-10 border-[3px] border-[#e8c547] border-t-transparent rounded-full animate-spin" />
                          <p className={`text-xs text-[#999] ${bodyFontClass}`}>
                            {t.gettingLocation}
                          </p>
                        </>
                      ) : (
                        <p className={`text-xs text-[#999] ${bodyFontClass}`}>
                          {locationError ||
                            (isAr
                              ? "انقر على 'موقعي' أو انتظر تحميل الخريطة"
                              : "Click 'My Location' or wait for map to load")}
                        </p>
                      )}
                    </div>
                  )}

                  {mapCenter && !isGettingLocation && (
                    <div className="h-[400px] w-full relative">
                      <MapContainer
                        key={`${mapCenter.lat}-${mapCenter.lng}`}
                        center={[mapCenter.lat, mapCenter.lng]}
                        zoom={markerPosition ? 14 : 2}
                        style={{ height: "100%", width: "100%" }}
                        whenCreated={(map) => {
                          mapRef.current = map;
                        }}
                        dragging
                        scrollWheelZoom
                        doubleClickZoom
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution="&copy; OpenStreetMap contributors"
                        />
                        {fixedMarkerIcon && (
                          <FixedCenterMarker icon={fixedMarkerIcon} />
                        )}
                        <MapController
                          onLocationSelect={handleMapLocationSelect}
                          initialCenter={mapCenter}
                          markerPosition={markerPosition}
                        />
                      </MapContainer>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-[#e8c547]/40 bg-[#e8c547]/[0.08] pointer-events-none z-[1000]" />
                    </div>
                  )}
                </div>

                {/* Location pill */}
                <div className="bg-[#fdf8e7] border border-[#e8c547]/30 rounded-xl px-3.5 py-2.5 mt-2.5">
                  <p
                    className={`text-xs text-[#7a6012] font-medium ${bodyFontClass}`}
                  >
                    📍{" "}
                    {selectedLocation?.address ||
                      (isAr
                        ? "حرك الخريطة لاختيار الموقع"
                        : "Move the map to select location")}
                  </p>
                  {selectedLocation && (
                    <p
                      className={`text-[11px] text-[#a08020] mt-0.5 ${bodyFontClass}`}
                    >
                      {selectedLocation.lat.toFixed(6)},{" "}
                      {selectedLocation.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>

              <hr className="border-none border-t border-black/7 my-6" />

              {/* Images */}
              <div className="mb-5">
                <label
                  className={`block text-[10px] tracking-[0.1em] uppercase text-[#888] mb-1.5 ${bodyFontClass}`}
                >
                  {t.imagesRequired}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.images.map((image, index) => (
                    <ImageUpload
                      key={index}
                      index={index}
                      imageUrl={image}
                      onImageUpload={handleImageUpload}
                      onRemove={handleImageRemove}
                    />
                  ))}
                  {formData.images.length < 6 && (
                    <button
                      type="button"
                      onClick={addImageSlot}
                      className={`border-2 border-dashed border-black/12 rounded-xl p-6 bg-transparent cursor-pointer w-full flex flex-col items-center gap-1.5 text-xs text-[#999] transition-colors hover:border-[#e8c547] hover:text-[#e8c547] ${bodyFontClass}`}
                    >
                      <svg
                        width="24"
                        height="24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      {t.addImage}
                    </button>
                  )}
                </div>
              </div>

              <hr className="border-none border-t border-black/7 my-6" />

              {/* Amenities */}
              <div className="mb-6">
                <label
                  className={`block text-[10px] tracking-[0.1em] uppercase text-[#888] mb-1.5 ${bodyFontClass}`}
                >
                  {t.amenities}
                </label>
                {formData.amenities.map((amenity, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={amenity}
                      onChange={(e) =>
                        handleArrayChange(index, "amenities", e.target.value)
                      }
                      placeholder={t.amenityPlaceholder}
                      className={`${fieldInput} flex-1`}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField("amenities", index)}
                        className={`bg-red-100 text-red-800 border-none rounded-md px-3 py-1.5 text-[11px] cursor-pointer ${bodyFontClass}`}
                      >
                        {t.remove}
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("amenities")}
                  className={`text-xs text-[#e8c547] bg-transparent border-none cursor-pointer py-1 mt-1 ${bodyFontClass}`}
                >
                  + {t.addAmenity}
                </button>
              </div>

              {/* Rules */}
              <div className="mb-5">
                <label
                  className={`block text-[10px] tracking-[0.1em] uppercase text-[#888] mb-1.5 ${bodyFontClass}`}
                >
                  {t.houseRules}
                </label>
                <div className="mb-3">
                  <div
                    className={`text-[10px] tracking-[0.08em] uppercase text-[#999] mb-2 ${bodyFontClass}`}
                  >
                    {t.quickAdd}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      t.ruleNoSmoking,
                      t.ruleNoParties,
                      t.ruleNoPets,
                      t.ruleQuietHours,
                      t.ruleSelfCheckIn,
                      t.ruleNoShoes,
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          if (!formData.rules.includes(suggestion))
                            setFormData((p) => ({
                              ...p,
                              rules: [...p.rules, suggestion],
                            }));
                        }}
                        className={`border border-black/10 rounded-full px-3 py-1 text-[11px] cursor-pointer transition-colors ${bodyFontClass} ${formData.rules.includes(suggestion) ? "bg-[#e8c547] text-[#1a1a2e]" : "bg-[#fafaf8] text-[#888]"}`}
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                {formData.rules.map((rule, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <div className="w-5 h-5 rounded shrink-0 bg-[#e8c547] flex items-center justify-center">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6l3 3 5-6"
                          stroke="#1a1a2e"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => {
                        const rules = [...formData.rules];
                        rules[index] = e.target.value;
                        setFormData((p) => ({ ...p, rules }));
                      }}
                      placeholder={t.rulePlaceholder}
                      className={`${fieldInput} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          rules: p.rules.filter((_, i) => i !== index),
                        }))
                      }
                      className="bg-transparent border-none text-[#e05a5a] text-lg cursor-pointer px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, rules: [...p.rules, ""] }))
                  }
                  className={`text-xs text-[#e8c547] bg-transparent border border-dashed border-[#e8c547]/50 rounded-lg cursor-pointer py-2 px-3 mt-2 w-full hover:border-[#e8c547] transition-colors ${bodyFontClass}`}
                >
                  + {t.addCustomRule}
                </button>
              </div>

              <hr className="border-none border-t border-black/7 my-6" />

              <div className="flex justify-end gap-2.5 pt-5 border-t border-black/7">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className={`bg-transparent text-[#555] px-3.5 py-2 rounded-lg text-xs border border-black/12 cursor-pointer hover:border-black/30 hover:text-[#111118] transition-colors ${bodyFontClass}`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className={`bg-[#1a1a2e] text-[#e8c547] px-5 py-2.5 rounded-lg text-xs font-medium border-none cursor-pointer hover:opacity-88 hover:-translate-y-px transition-all ${bodyFontClass}`}
                >
                  {isEditing ? t.updateListing : t.createListing}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LISTINGS GRID */}
        {!showForm &&
          (listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/7 py-20 px-6 text-center">
              <div className="text-5xl mb-3">🏠</div>
              <p className={`text-[13px] text-[#999] mb-4 ${bodyFontClass}`}>
                {t.noListingsYet}
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className={`bg-transparent border-none text-[#e8c547] text-[13px] cursor-pointer ${bodyFontClass}`}
              >
                {t.createFirstListing} →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => {
                const category = CATEGORIES.find(
                  (c) => c.id === listing.category,
                );
                const isToggling = togglingId === listing.id;
                return (
                  <div
                    key={listing.id}
                    className={`bg-white rounded-2xl border overflow-hidden transition-all duration-[220ms] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] ${
                      listing.is_active ? "border-black/7" : "border-[#e05a5a]/30"
                    }`}
                  >
                    <div className="h-[200px] overflow-hidden relative">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className={`w-full h-full object-cover transition-all ${!listing.is_active ? "opacity-60 grayscale" : ""}`}
                      />
                      <div className="absolute top-3 right-3 bg-[rgba(26,26,46,0.92)] text-[#e8c547] rounded-lg px-2.5 py-1 text-xs font-medium">
                        {formatCurrency(listing.price)}
                        <span className="text-[10px] text-[#e8c547]/60">
                          /{t.night}
                        </span>
                      </div>
                      {category && (
                        <div className="absolute bottom-3 left-3 bg-[rgba(26,26,46,0.9)] text-[#e8c547] rounded-full px-2.5 py-1 text-[11px] flex items-center gap-1">
                          {category.icon}{" "}
                          {isAr ? category.labelAr : category.labelEn}
                        </div>
                      )}
                      {/* Active/Inactive badge */}
                      <div
                        className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-medium flex items-center gap-1 ${
                          listing.is_active
                            ? "bg-[#1D9E75] text-white"
                            : "bg-[#e05a5a] text-white"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full bg-white ${listing.is_active ? "opacity-100" : "opacity-70"}`} />
                        {listing.is_active
                          ? (isAr ? "نشط" : "Active")
                          : (isAr ? "غير نشط" : "Inactive")}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3
                        className={`text-[15px] font-medium text-[#111118] mb-1.5 ${bodyFontClass}`}
                      >
                        {listing.title}
                      </h3>
                      <p className={`text-xs text-[#888] mb-3 ${bodyFontClass}`}>
                        📍 {listing.location}
                      </p>

                      {/* Toggle row */}
                      <div className="flex items-center justify-between bg-[#f7f6f2] rounded-lg px-3 py-2 mb-3 border border-black/5">
                        <span className={`text-[11px] text-[#666] ${bodyFontClass}`}>
                          {listing.is_active
                            ? (isAr ? "مفتوح للحجز" : "Open for booking")
                            : (isAr ? "الحجز متوقف" : "Booking paused")}
                        </span>
                        <button
                          onClick={() => handleToggleActive(listing)}
                          disabled={isToggling}
                          className={`relative w-9 h-5 rounded-full border-none cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                            listing.is_active ? "bg-[#1D9E75]" : "bg-[#ddd]"
                          }`}
                        >
                          <span
                            className={`absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-all duration-200 ${
                              listing.is_active ? "left-[19px]" : "left-[3px]"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex justify-between items-center border-t border-black/[0.06] pt-3.5">
                        <Link
                          href={`/listings/${listing.id}`}
                          className={`text-xs text-[#1a1a2e] no-underline ${bodyFontClass}`}
                        >
                          {t.viewDetails} →
                        </Link>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(listing)}
                            className={`text-xs text-[#185FA5] bg-transparent border-none cursor-pointer ${bodyFontClass}`}
                          >
                            {t.edit}
                          </button>
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className={`text-xs text-[#e05a5a] bg-transparent border-none cursor-pointer ${bodyFontClass}`}
                          >
                            {t.delete}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
      </main>
    </div>
  );
}