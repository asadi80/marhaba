"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import ImageUpload from "@/components/ImageUpload";
import { useLanguage } from "@/hooks/useLanguage";
import "./style.css";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then((m) => m.TileLayer),    { ssr: false });
const MapController    = dynamic(() => import("./MapComponents").then((m) => m.MapController),    { ssr: false });
const FixedCenterMarker = dynamic(() => import("./MapComponents").then((m) => m.FixedCenterMarker), { ssr: false });

const CATEGORIES = [
  { id: "beachfront",  icon: "🏖️", labelEn: "Beachfront",  labelAr: "شاطئ",  descriptionEn: "Beautiful beachfront properties",   descriptionAr: "عقارات جميلة على الشاطئ" },
  { id: "mountain",    icon: "🏔️", labelEn: "Mountain",    labelAr: "جبال",   descriptionEn: "Scenic mountain retreats",            descriptionAr: "منتجعات جبلية خلابة" },
  { id: "city",        icon: "🏙️", labelEn: "City",        labelAr: "مدينة",  descriptionEn: "Vibrant city apartments",             descriptionAr: "شقق مدينة نابضة بالحياة" },
  { id: "countryside", icon: "🏡", labelEn: "Countryside",  labelAr: "ريفي",   descriptionEn: "Peaceful countryside homes",          descriptionAr: "منازل ريفية هادئة" },
  { id: "pool",        icon: "🏊", labelEn: "Pool",         labelAr: "مسبح",   descriptionEn: "Properties with pools",               descriptionAr: "عقارات بها مسبح" },
  { id: "desert",      icon: "🏜️", labelEn: "Desert",      labelAr: "صحراء",  descriptionEn: "Stunning desert escapes",             descriptionAr: "ملاذات صحراوية خلابة" },
  { id: "camping",     icon: "🏕️", labelEn: "Camping",     labelAr: "تخييم",  descriptionEn: "Outdoor camping experiences",         descriptionAr: "تجارب تخييم في الهواء الطلق" },
  { id: "cabins",      icon: "🛖",  labelEn: "Cabins",      labelAr: "كوخ",    descriptionEn: "Cozy cabin getaways",                 descriptionAr: "ملاذات كوخ مريحة" },
];

const EMPTY_FORM = {
  title: "", description: "", price: "", location: "",
  coordinates: null, images: [], amenities: [""], rules: [], category: "city",
};

const DEFAULT_CENTER = { lat: 20, lng: 0 };

export default function HostListings() {
  const router = useRouter();
  const { lang, t, toggleLanguage } = useLanguage();
  const isAr = lang === "ar";

  const [listings,          setListings]          = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [showForm,          setShowForm]          = useState(false);
  const [isEditing,         setIsEditing]         = useState(false);
  const [editingId,         setEditingId]         = useState(null);
  const [markerPosition,    setMarkerPosition]    = useState(null);
  const [mapCenter,         setMapCenter]         = useState(null);
  const [selectedLocation,  setSelectedLocation]  = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError,     setLocationError]     = useState(null);
  const [browserInfo,       setBrowserInfo]       = useState(null);
  const [menuOpen,          setMenuOpen]          = useState(false);
  const [formData,          setFormData]          = useState(EMPTY_FORM);
  const [fixedMarkerIcon,   setFixedMarkerIcon]   = useState(null);

  const mapRef = useRef(null);

  // Init Leaflet client-side only
useEffect(() => {
  if (typeof window === "undefined") return;
  const L = require("leaflet");
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
  
  // Simple 📍-style gold pin marker
  setFixedMarkerIcon(new L.DivIcon({
    className: "fixed-center-marker",
    html: `<div style="
        position: relative;
        width: 32px;
        height: 32px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <!-- Pin shape like 📍 -->
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
                fill="#e8c547" 
                stroke="#1a1a2e" 
                stroke-width="2"/>
          <circle cx="12" cy="9" r="3" fill="#1a1a2e"/>
        </svg>
        
        <!-- Pulsing ring -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: rgba(232,197,71,0.3);
          animation: pulse 1.5s ease-out infinite;
          pointer-events: none;
        "></div>
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -10],
  }));
}, []);
  // Detect browser
  useEffect(() => {
    const ua = navigator.userAgent;
    if      (ua.includes("Chrome") && !ua.includes("Edg")) setBrowserInfo("chrome");
    else if (ua.includes("Firefox"))                        setBrowserInfo("firefox");
    else if (ua.includes("Safari") && !ua.includes("Chrome")) setBrowserInfo("safari");
    else if (ua.includes("Edg"))                            setBrowserInfo("edge");
    else                                                    setBrowserInfo("other");
  }, []);

  const bodyFont    = isAr ? "'Cairo','Tajawal','Almarai',sans-serif"    : "'DM Mono',monospace";
  const displayFont = isAr ? "'Cairo','Tajawal','Almarai',sans-serif" : "'Fraunces',serif";
  const formatCurrency = (n) => isAr ? `${Math.round(n).toLocaleString()} دينار` : `${Math.round(n).toLocaleString()} LYD`;

  // ── Data ────────────────────────────────────────────────────────────────────

  const fetchListings = async () => {
    try {
      const res  = await fetch("/api/host/listings");
      const data = await res.json();
      setListings(data.listings);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, []);

  // ── Location ─────────────────────────────────────────────────────────────────

  const reverseGeocode = async (lat, lng) => {
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      return data.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch { return `${lat.toFixed(6)}, ${lng.toFixed(6)}`; }
  };

  const applyCoordinates = async (lat, lng) => {
    const address = await reverseGeocode(lat, lng);
    setSelectedLocation({ lat, lng, address });
    setFormData((p) => ({ ...p, location: address, coordinates: { lat, lng } }));
  };

  // Called by MapController on every moveend
  const handleMapLocationSelect = useCallback(async (lat, lng) => {
    setMarkerPosition({ lat, lng });
    await applyCoordinates(lat, lng);
  }, []);

  const getIPLocation = async () => {
    try {
      const data = await (await fetch("https://ipapi.co/json/")).json();
      if (data.latitude && data.longitude)
        return { lat: data.latitude, lng: data.longitude, city: data.city, country: data.country_name };
    } catch {}
    return null;
  };

  const useCurrentLocation = async () => {
    if (!("geolocation" in navigator)) {
      const ip = await getIPLocation();
      if (ip && confirm(isAr ? `موقع تقريبي (${ip.city}). استخدامه؟` : `Approximate location (${ip.city}). Use it?`)) {
        setMapCenter({ lat: ip.lat, lng: ip.lng });
        await applyCoordinates(ip.lat, ip.lng);
        mapRef.current?.setView([ip.lat, ip.lng], 13);
      } else {
        const msg = isAr ? "متصفحك لا يدعم تحديد الموقع" : "Geolocation not supported. Select manually on map.";
        setLocationError(msg); alert(msg);
      }
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);
    let success = false;

    for (const opts of [
      { enableHighAccuracy: true,  timeout: 10000, maximumAge: 0 },
      { enableHighAccuracy: false, timeout: 8000,  maximumAge: 30000 },
    ]) {
      if (success) break;
      try {
        const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, opts));
        const { latitude: lat, longitude: lng } = pos.coords;
        setMapCenter({ lat, lng });
        await applyCoordinates(lat, lng);
        mapRef.current?.setView([lat, lng], opts.enableHighAccuracy ? 15 : 13);
        success = true;
      } catch {}
    }

    if (!success) {
      const ip = await getIPLocation();
      if (ip && confirm(isAr ? `تعذر الموقع الدقيق. موقع تقريبي (${ip.city}). استخدامه؟` : `Exact location failed. Approximate (${ip.city}). Use it?`)) {
        setMapCenter({ lat: ip.lat, lng: ip.lng });
        await applyCoordinates(ip.lat, ip.lng);
        mapRef.current?.setView([ip.lat, ip.lng], 10);
        success = true;
      }
    }

    setIsGettingLocation(false);
    if (!success) {
      const msg = isAr ? "تعذر تحديد موقعك. حرك الخريطة يدوياً." : "Could not get location. Move the map to select manually.";
      setLocationError(msg); alert(msg);
    }
  };

  // ── Form helpers ─────────────────────────────────────────────────────────────

  const handleInputChange  = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleArrayChange  = (i, field, val) => setFormData((p) => { const a = [...p[field]]; a[i] = val; return { ...p, [field]: a }; });
  const addArrayField      = (field) => setFormData((p) => ({ ...p, [field]: [...p[field], ""] }));
  const removeArrayField   = (field, i) => setFormData((p) => ({ ...p, [field]: p[field].filter((_, idx) => idx !== i) }));
  const handleImageUpload  = (i, url) => setFormData((p) => { const imgs = [...p.images]; imgs[i] = url; return { ...p, images: imgs }; });
  const handleImageRemove  = (i) => setFormData((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));
  const addImageSlot       = () => setFormData((p) => ({ ...p, images: [...p.images, ""] }));

  const resetForm = () => {
    setFormData(EMPTY_FORM); setMarkerPosition(null); setMapCenter(null);
    setSelectedLocation(null); setIsEditing(false); setEditingId(null); setLocationError(null);
  };
  const cancelEdit = () => { setShowForm(false); resetForm(); };

  const handleEdit = (listing) => {
    const coords = listing.coordinates?.lat && listing.coordinates?.lng ? listing.coordinates : null;
    setIsEditing(true); setEditingId(listing._id);
    setFormData({
      title: listing.title ?? "", description: listing.description ?? "",
      price: listing.price ?? "", location: listing.location ?? "",
      coordinates: coords, images: listing.images ?? [],
      amenities: listing.amenities?.length ? listing.amenities : [""],
      rules: listing.rules ?? [], category: listing.category ?? "city",
    });
    if (coords) {
      setMarkerPosition(coords); setMapCenter(coords);
      setSelectedLocation({ ...coords, address: listing.location ?? "" });
      setTimeout(() => mapRef.current?.setView([coords.lat, coords.lng], 14), 500);
    } else {
      setMapCenter(DEFAULT_CENTER);
    }
    setShowForm(true);
  };

  const validateForm = () => {
    if (!formData.location || !formData.coordinates) { alert(t.pleaseSelectLocation); return false; }
    if (!formData.images.length || !formData.images[0]) { alert(t.pleaseUploadImage); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validateForm()) return;
    try {
      const res  = await fetch("/api/listings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowForm(false); resetForm(); fetchListings(); alert(t.listingCreatedSuccess);
    } catch (err) { alert(err.message); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); if (!validateForm()) return;
    try {
      const res  = await fetch(`/api/listings/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchListings();
      if (data.listing?.coordinates) {
        const { coordinates, location } = data.listing;
        setMarkerPosition(coordinates); setMapCenter(coordinates);
        setSelectedLocation({ ...coordinates, address: location });
        mapRef.current?.setView([coordinates.lat, coordinates.lng], 14);
      }
      setShowForm(false); setIsEditing(false); setEditingId(null); resetForm(); alert(t.listingUpdatedSuccess);
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDeleteListing)) return;
    try {
      const res  = await fetch(`/api/listings/${id}?deleteListing=true`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchListings(); alert(t.listingDeletedSuccess);
    } catch (err) { alert(err.message); }
  };

  useEffect(() => {
    if (showForm && !isEditing && !mapCenter && !isGettingLocation) setMapCenter(DEFAULT_CENTER);
  }, [showForm, isEditing, mapCenter, isGettingLocation]);

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f6f2" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e8c547", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=Almarai:wght@300;400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ${bodyFont} !important; background: #f7f6f2; -webkit-font-smoothing: antialiased; }
        .font-display { font-family: ${displayFont} !important; }
        .nav-link { font-size: 12px; color: rgba(255,255,255,0.5); text-decoration: none; padding: 6px 12px; border-radius: 6px; transition: color .15s, background .15s; }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .nav-link.active { color: #e8c547; }
        .btn-primary { background: #e8c547; color: #1a1a2e; padding: 9px 20px; border-radius: 8px; font-size: 12px; font-family: inherit; font-weight: 500; border: none; cursor: pointer; transition: opacity .15s, transform .15s; }
        .btn-primary:hover { opacity: .88; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-dark { background: #1a1a2e; color: #e8c547; padding: 9px 20px; border-radius: 8px; font-size: 12px; font-family: inherit; font-weight: 500; border: none; cursor: pointer; transition: opacity .15s, transform .15s; }
        .btn-dark:hover { opacity: .88; transform: translateY(-1px); }
        .btn-ghost-sm { background: transparent; color: #555; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-family: inherit; border: 1px solid rgba(0,0,0,0.12); cursor: pointer; transition: border-color .15s, color .15s; }
        .btn-ghost-sm:hover { border-color: rgba(0,0,0,0.3); color: #111118; }
        .form-panel { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.07); padding: 2rem; margin-bottom: 2rem; }
        .field-label { display: block; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #888; margin-bottom: 6px; }
        .field-input { width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; font-size: 13px; font-family: inherit; color: #111118; background: #fafaf8; outline: none; transition: border-color .15s, box-shadow .15s; }
        .field-input:focus { border-color: #e8c547; box-shadow: 0 0 0 3px rgba(232,197,71,0.12); background: #fff; }
        .field-textarea { width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; font-size: 13px; font-family: inherit; color: #111118; background: #fafaf8; outline: none; resize: vertical; transition: border-color .15s, box-shadow .15s; }
        .field-textarea:focus { border-color: #e8c547; box-shadow: 0 0 0 3px rgba(232,197,71,0.12); background: #fff; }
        .map-wrapper { border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; position: relative; }
        .map-header { background: #1a1a2e; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
        .location-pill { background: #fdf8e7; border: 1px solid rgba(232,197,71,0.3); border-radius: 10px; padding: 10px 14px; margin-top: 10px; }
        .images-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .add-img-btn { border: 2px dashed rgba(0,0,0,0.12); border-radius: 12px; padding: 1.5rem; background: none; cursor: pointer; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 6px; transition: border-color .15s; font-family: inherit; font-size: 12px; color: #999; }
        .add-img-btn:hover { border-color: #e8c547; color: #e8c547; }
        .divider { border: none; border-top: 1px solid rgba(0,0,0,0.07); margin: 1.5rem 0; }
        .listings-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .listing-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.07); overflow: hidden; transition: transform .22s, box-shadow .22s; }
        .listing-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
        .category-badge { position: absolute; bottom: 12px; left: 12px; background: rgba(26,26,46,0.9); color: #e8c547; border-radius: 20px; padding: 4px 10px; font-size: 11px; display: flex; align-items: center; gap: 4px; }
        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .hamburger span { display: block; width: 20px; height: 2px; background: rgba(255,255,255,0.7); border-radius: 2px; transition: all .2s; }
        .mobile-menu { display: none; position: fixed; top: 56px; left: 0; right: 0; background: #1a1a2e; border-bottom: 1px solid rgba(232,197,71,0.15); padding: 1rem 1.5rem; z-index: 40; flex-direction: column; gap: 10px; }
        .mobile-menu.open { display: flex; }
        .fixed-center-marker { pointer-events: none !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .listings-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px)  { .listings-grid { grid-template-columns: 1fr; } .images-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .hamburger { display: flex; } .desktop-nav { display: none !important; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f7f6f2", direction: isAr ? "rtl" : "ltr" }}>

        {/* Nav */}
        <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(26,26,46,0.97)", borderBottom: "1px solid rgba(232,197,71,0.15)", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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

          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Link href="/host-dashboard" className="nav-link">{t.overview}</Link>
            <Link href="/host/listings"  className="nav-link active">{t.myListings}</Link>
            <Link href="/host/bookings"  className="nav-link">{t.bookings}</Link>
            <button onClick={toggleLanguage} style={{ background: "rgba(232,197,71,0.15)", border: "1px solid rgba(232,197,71,0.3)", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", color: "#e8c547", fontFamily: "inherit", marginLeft: 8 }}>
              {isAr ? "🇬🇧 English" : "🇸🇦 عربي"}
            </button>
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.12)", margin: "0 6px" }} />
            <button onClick={() => router.push("/host-dashboard")} className="btn-primary" style={{ padding: "6px 14px" }}>{t.dashboard} →</button>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            <span style={{ transform: menuOpen ? "rotate(45deg) translateY(7px)"   : "none" }} />
            <span style={{ opacity:   menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        </nav>

        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <button onClick={toggleLanguage} style={{ background: "rgba(232,197,71,0.15)", border: "1px solid rgba(232,197,71,0.3)", borderRadius: 6, padding: "8px 12px", fontSize: 12, cursor: "pointer", color: "#e8c547", fontFamily: "inherit", width: "100%", marginBottom: 8 }}>
            {isAr ? "🇬🇧 English" : "🇸🇦 عربي"}
          </button>
          <Link href="/host-dashboard" style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "8px 0" }}>{t.overview}</Link>
          <Link href="/host/listings"  style={{ fontSize: 13, color: "#e8c547",               textDecoration: "none", padding: "8px 0" }}>{t.myListings}</Link>
          <Link href="/host/bookings"  style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "8px 0" }}>{t.bookings}</Link>
        </div>

        {/* Page header */}
        <div style={{ background: "#1a1a2e", borderBottom: "1px solid rgba(232,197,71,0.12)", padding: "2.5rem 1.5rem 2rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(232,197,71,0.6)", marginBottom: 8 }}>{t.hostPanel}</div>
              <h1 className="font-display" style={{ fontStyle: isAr ? "normal" : "italic", fontWeight: 300, fontSize: "clamp(28px,4vw,38px)", color: "#fff" }}>
                {t.myListingsTitle} <span style={{ fontWeight: 500, color: "#e8c547" }}>{t.listings}</span>
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                {listings.length} {listings.length !== 1 ? t.listingsActive : t.listingActive}
              </p>
            </div>
            {!showForm && (
              <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary" style={{ flexShrink: 0 }}>
                + {t.addNewListing}
              </button>
            )}
          </div>
        </div>

        {/* Main */}
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>

          {showForm && (
            <div className="form-panel">
              <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: 6 }}>
                  {isEditing ? t.editListing : t.newListing}
                </div>
                <h2 className="font-display" style={{ fontStyle: isAr ? "normal" : "italic", fontWeight: 300, fontSize: 26, color: "#111118" }}>
                  {isEditing ? t.edit : t.createA} <span style={{ fontWeight: 500 }}>{t.listing}</span>
                </h2>
              </div>

              <form onSubmit={isEditing ? handleUpdate : handleSubmit}>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="field-label">{t.title} *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="field-input" placeholder={t.titlePlaceholder} />
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="field-label">{t.description} *</label>
                  <textarea name="description" required rows="4" value={formData.description} onChange={handleInputChange} className="field-textarea" placeholder={t.descriptionPlaceholder} />
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="field-label">{t.pricePerNight} / {isAr ? "دينار" : "LYD"} *</label>
                  <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleInputChange} className="field-input" placeholder="99" />
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="field-label">{isAr ? "الفئة" : "Category"} *</label>
                  <select name="category" required value={formData.category} onChange={handleInputChange} className="field-input" style={{ cursor: "pointer" }}>
                    <option value="">{isAr ? "اختر فئة" : "Select a category"}</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {isAr ? cat.labelAr : cat.labelEn}</option>
                    ))}
                  </select>
                  {formData.category && (
                    <div style={{ fontSize: 11, color: "#666", marginTop: 5 }}>
                      {isAr ? CATEGORIES.find((c) => c.id === formData.category)?.descriptionAr : CATEGORIES.find((c) => c.id === formData.category)?.descriptionEn}
                    </div>
                  )}
                </div>

                <hr className="divider" />

                {/* Location */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="field-label">{t.location} *</label>

                  {browserInfo && browserInfo !== "chrome" && (
                    <div style={{ background: "#FFF3E0", border: "1px solid #FFB74D", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#E65100" }}>
                      ℹ️ {browserInfo === "firefox" && (isAr ? "فايرفوكس: دقة الموقع قد تكون أقل." : "Firefox: Location accuracy may be lower.")}
                      {browserInfo === "safari"  && (isAr ? "سفاري: تأكد من تمكين خدمات الموقع." : "Safari: Ensure location services are enabled.")}
                      {browserInfo === "edge"    && (isAr ? "إيدج: تحقق من إعدادات الخصوصية." : "Edge: Check privacy settings.")}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    <input type="text" name="location" required value={formData.location} onChange={handleInputChange} className="field-input" placeholder={t.addressWillAppear} readOnly style={{ flex: 1, minWidth: 180 }} />
                    <button type="button" onClick={useCurrentLocation} disabled={isGettingLocation} className="btn-primary" style={{ background: isGettingLocation ? "#ccc" : "#1D9E75", whiteSpace: "nowrap" }}>
                      {isGettingLocation ? t.gettingLocation : `📍 ${t.myLocation}`}
                    </button>
                  </div>

                  <div className="map-wrapper">
                    <div className="map-header">
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                        💡 {isAr ? "حرك الخريطة لتحديد الموقع — العلامة ثابتة في المنتصف" : "Move the map to select location — marker stays fixed in center"}
                      </span>
                    </div>

                    {(!mapCenter || isGettingLocation) && (
                      <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f6f2", flexDirection: "column", gap: 12 }}>
                        {isGettingLocation ? (
                          <>
                            <div style={{ width: 40, height: 40, border: "3px solid #e8c547", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                            <p style={{ fontSize: 12, color: "#999" }}>{t.gettingLocation}</p>
                          </>
                        ) : (
                          <p style={{ fontSize: 12, color: "#999" }}>
                            {locationError || (isAr ? "انقر على 'موقعي' أو انتظر تحميل الخريطة" : "Click 'My Location' or wait for map to load")}
                          </p>
                        )}
                      </div>
                    )}

                    {mapCenter && !isGettingLocation && (
                      <div style={{ height: 400, width: "100%", position: "relative" }}>
                        <MapContainer
                          key={`${mapCenter.lat}-${mapCenter.lng}`}
                          center={[mapCenter.lat, mapCenter.lng]}
                          zoom={markerPosition ? 14 : 2}
                          style={{ height: "100%", width: "100%" }}
                          whenCreated={(map) => { mapRef.current = map; }}
                          dragging scrollWheelZoom doubleClickZoom
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                          {fixedMarkerIcon && <FixedCenterMarker icon={fixedMarkerIcon} />}
                          <MapController onLocationSelect={handleMapLocationSelect} initialCenter={mapCenter} markerPosition={markerPosition} />
                        </MapContainer>

                        {/* Pulse ring behind the marker */}
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 48, height: 48, borderRadius: "50%", border: "2px solid rgba(232,197,71,0.4)", background: "rgba(232,197,71,0.08)", pointerEvents: "none", zIndex: 1000 }} />
                      </div>
                    )}
                  </div>

                  <div className="location-pill">
                    <p style={{ fontSize: 12, color: "#7a6012", fontWeight: 500 }}>
                      📍 {selectedLocation?.address || (isAr ? "حرك الخريطة لاختيار الموقع" : "Move the map to select location")}
                    </p>
                    {selectedLocation && (
                      <p style={{ fontSize: 11, color: "#a08020" }}>{selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
                    )}
                  </div>
                </div>

                <hr className="divider" />

                {/* Images */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="field-label">{t.imagesRequired}</label>
                  <div className="images-grid">
                    {formData.images.map((image, index) => (
                      <ImageUpload key={index} index={index} imageUrl={image} onImageUpload={handleImageUpload} onRemove={handleImageRemove} />
                    ))}
                    {formData.images.length < 6 && (
                      <button type="button" onClick={addImageSlot} className="add-img-btn">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        {t.addImage}
                      </button>
                    )}
                  </div>
                </div>

                <hr className="divider" />

                {/* Amenities */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="field-label">{t.amenities}</label>
                  {formData.amenities.map((amenity, index) => (
                    <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <input type="text" value={amenity} onChange={(e) => handleArrayChange(index, "amenities", e.target.value)} placeholder={t.amenityPlaceholder} className="field-input" style={{ flex: 1 }} />
                      {index > 0 && (
                        <button type="button" onClick={() => removeArrayField("amenities", index)} style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, cursor: "pointer" }}>{t.remove}</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addArrayField("amenities")} style={{ fontSize: 12, color: "#e8c547", background: "none", border: "none", cursor: "pointer", padding: "4px 0", marginTop: 4 }}>
                    + {t.addAmenity}
                  </button>
                </div>

                {/* Rules */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="field-label">{t.houseRules}</label>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 8 }}>{t.quickAdd}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {[t.ruleNoSmoking, t.ruleNoParties, t.ruleNoPets, t.ruleQuietHours, t.ruleSelfCheckIn, t.ruleNoShoes].map((suggestion) => (
                        <button key={suggestion} type="button"
                          onClick={() => { if (!formData.rules.includes(suggestion)) setFormData((p) => ({ ...p, rules: [...p.rules, suggestion] })); }}
                          style={{ background: formData.rules.includes(suggestion) ? "#e8c547" : "#fafaf8", color: formData.rules.includes(suggestion) ? "#1a1a2e" : "#888", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 20, padding: "4px 12px", fontSize: 11, cursor: "pointer" }}>
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                  {formData.rules.map((rule, index) => (
                    <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: "#e8c547", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <input type="text" value={rule}
                        onChange={(e) => { const rules = [...formData.rules]; rules[index] = e.target.value; setFormData((p) => ({ ...p, rules })); }}
                        placeholder={t.rulePlaceholder} className="field-input" style={{ flex: 1 }} />
                      <button type="button" onClick={() => setFormData((p) => ({ ...p, rules: p.rules.filter((_, i) => i !== index) }))}
                        style={{ background: "none", border: "none", color: "#e05a5a", fontSize: 18, cursor: "pointer", padding: "0 8px" }}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setFormData((p) => ({ ...p, rules: [...p.rules, ""] }))}
                    style={{ fontSize: 12, color: "#e8c547", background: "none", border: "1px dashed rgba(232,197,71,0.5)", borderRadius: 8, cursor: "pointer", padding: "8px 12px", marginTop: 8, width: "100%" }}>
                    + {t.addCustomRule}
                  </button>
                </div>

                <hr className="divider" />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: "1.25rem", borderTop: "1px solid rgba(0,0,0,0.07)" }}>
                  <button type="button" onClick={cancelEdit} className="btn-ghost-sm">{t.cancel}</button>
                  <button type="submit" className="btn-dark">{isEditing ? t.updateListing : t.createListing}</button>
                </div>
              </form>
            </div>
          )}

          {!showForm && (
            listings.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)", padding: "5rem", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
                <p style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>{t.noListingsYet}</p>
                <button onClick={() => { resetForm(); setShowForm(true); }} style={{ background: "none", border: "none", color: "#e8c547", fontSize: 13, cursor: "pointer" }}>
                  {t.createFirstListing} →
                </button>
              </div>
            ) : (
              <div className="listings-grid">
                {listings.map((listing) => {
                  const category = CATEGORIES.find((c) => c.id === listing.category);
                  return (
                    <div key={listing._id} className="listing-card">
                      <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                        <img src={listing.images[0]} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(26,26,46,0.92)", color: "#e8c547", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 500 }}>
                          {formatCurrency(listing.price)}<span style={{ fontSize: 10, color: "rgba(232,197,71,0.6)" }}>/{t.night}</span>
                        </div>
                        {category && (
                          <div className="category-badge">{category.icon} {isAr ? category.labelAr : category.labelEn}</div>
                        )}
                      </div>
                      <div style={{ padding: "1.25rem" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 500, color: "#111118", marginBottom: 6 }}>{listing.title}</h3>
                        <p style={{ fontSize: 12, color: "#888", marginBottom: "0.5rem" }}>📍 {listing.location}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "0.875rem" }}>
                          <Link href={`/listings/${listing._id}`} style={{ fontSize: 12, color: "#1a1a2e", textDecoration: "none" }}>{t.viewDetails} →</Link>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => handleEdit(listing)}       style={{ fontSize: 12, color: "#185FA5", background: "none", border: "none", cursor: "pointer" }}>{t.edit}</button>
                            <button onClick={() => handleDelete(listing.id)} style={{ fontSize: 12, color: "#e05a5a", background: "none", border: "none", cursor: "pointer" }}>{t.delete}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </main>

        {/* <footer style={{ background: "#111118", borderTop: "1px solid rgba(232,197,71,0.08)", padding: "2rem 1.5rem", marginTop: "3rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div className="font-display" style={{ fontStyle: isAr ? "normal" : "italic", fontWeight: 300, fontSize: 18, color: "#fff" }}>
              mar<span style={{ fontStyle: "normal", fontWeight: 500, color: "#e8c547" }}>haba</span>
            </div>
            <p style={{ fontSize: 11, color: "#333" }}>© 2024 Marhaba. {t.rights}</p>
          </div>
        </footer> */}
      </div>
    </>
  );
}