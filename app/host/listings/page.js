"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import ImageUpload from "@/components/ImageUpload";
import { useLanguage } from "@/hooks/useLanguage";
import "./style.css";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

const CATEGORIES = [
  { id: "beachfront", icon: "🏖️", labelEn: "Beachfront",  labelAr: "شاطئ",  descriptionEn: "Beautiful beachfront properties",    descriptionAr: "عقارات جميلة على الشاطئ" },
  { id: "mountain",  icon: "🏔️", labelEn: "Mountain",    labelAr: "جبال",   descriptionEn: "Scenic mountain retreats",             descriptionAr: "منتجعات جبلية خلابة" },
  { id: "city",      icon: "🏙️", labelEn: "City",        labelAr: "مدينة",  descriptionEn: "Vibrant city apartments",              descriptionAr: "شقق مدينة نابضة بالحياة" },
  { id: "countryside",icon:"🏡", labelEn: "Countryside",  labelAr: "ريفي",   descriptionEn: "Peaceful countryside homes",           descriptionAr: "منازل ريفية هادئة" },
  { id: "pool",      icon: "🏊", labelEn: "Pool",         labelAr: "مسبح",   descriptionEn: "Properties with pools",                descriptionAr: "عقارات بها مسبح" },
 { id: "desert",    icon: "🏜️", labelEn: "Desert",      labelAr: "صحراء",  descriptionEn: "Stunning desert escapes",              descriptionAr: "ملاذات صحراوية خلابة" },  { id: "camping",   icon: "🏕️", labelEn: "Camping",     labelAr: "تخييم",  descriptionEn: "Outdoor camping experiences",          descriptionAr: "تجارب تخييم في الهواء الطلق" },
  { id: "cabins",    icon: "🛖", labelEn: "Cabins",       labelAr: "كوخ",    descriptionEn: "Cozy cabin getaways",                  descriptionAr: "ملاذات كوخ مريحة" },
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

  const [listings,          setListings]          = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [showForm,          setShowForm]          = useState(false);
  const [isEditing,         setIsEditing]         = useState(false);
  const [editingId,         setEditingId]         = useState(null);
  const [markerPosition,    setMarkerPosition]    = useState(null);
  const [mapCenter,         setMapCenter]         = useState(null);
  const [selectedLocation,  setSelectedLocation]  = useState(null);
  const [isMapMoving,       setIsMapMoving]       = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError,     setLocationError]     = useState(null);
  const [browserInfo,       setBrowserInfo]       = useState(null);
  const [menuOpen,          setMenuOpen]          = useState(false);
  const [formData,          setFormData]          = useState(EMPTY_FORM);
  const [draggableIcon,     setDraggableIcon]     = useState(null);

  const mapRef = useRef(null);

  // Initialize Leaflet icons client-side only
  useEffect(() => {
    if (typeof window === "undefined") return;
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl:       "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl:     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
    setDraggableIcon(new L.Icon({
      iconUrl:       "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      shadowUrl:     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      iconSize:    [25, 41],
      iconAnchor:  [12, 41],
      popupAnchor: [1, -34],
      shadowSize:  [41, 41],
    }));
  }, []);

  // Detect browser
  useEffect(() => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1) {
      setBrowserInfo("chrome");
    } else if (userAgent.indexOf("Firefox") > -1) {
      setBrowserInfo("firefox");
    } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
      setBrowserInfo("safari");
    } else if (userAgent.indexOf("Edg") > -1) {
      setBrowserInfo("edge");
    } else {
      setBrowserInfo("other");
    }
  }, []);

  const arabicFont    = "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishFont   = "'DM Mono', monospace";
  const arabicDisplay  = "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishDisplay = "'Fraunces', serif";
  const bodyFont    = isAr ? arabicFont    : englishFont;
  const displayFont = isAr ? arabicDisplay : englishDisplay;

  const formatCurrency = (amount) =>
    isAr
      ? `${Math.round(amount).toLocaleString()} دينار`
      : `${Math.round(amount).toLocaleString()} LYD`;

  const fetchListings = async () => {
    try {
      const res  = await fetch("/api/host/listings");
      const data = await res.json();
      setListings(data.listings);
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  useEffect(() => {
    if (isEditing && mapRef.current && formData.coordinates?.lat && formData.coordinates?.lng) {
      mapRef.current.setView([formData.coordinates.lat, formData.coordinates.lng], 14);
      setMarkerPosition(formData.coordinates);
    }
  }, [formData.coordinates, isEditing]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
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
    setFormData((prev) => ({ ...prev, location: address, coordinates: { lat, lng } }));
  };

  const getIPBasedLocation = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      if (data.latitude && data.longitude) {
        return { lat: data.latitude, lng: data.longitude, accuracy: "ip-based", city: data.city, country: data.country_name };
      }
      return null;
    } catch (error) {
      console.error("IP geolocation failed:", error);
      return null;
    }
  };

  const useCurrentLocation = async () => {
    if (!("geolocation" in navigator)) {
      const ipLocation = await getIPBasedLocation();
      if (ipLocation) {
        const userConfirm = confirm(
          isAr
            ? `متصفحك لا يدعم تحديد الموقع الدقيق. تم العثور على موقع تقريبي (${ipLocation.city}, ${ipLocation.country}). هل تريد استخدام هذا الموقع؟`
            : `Your browser doesn't support precise location. Found approximate location (${ipLocation.city}, ${ipLocation.country}). Do you want to use this location?`
        );
        if (userConfirm) {
          setMarkerPosition({ lat: ipLocation.lat, lng: ipLocation.lng });
          setMapCenter({ lat: ipLocation.lat, lng: ipLocation.lng });
          await applyCoordinates(ipLocation.lat, ipLocation.lng);
          mapRef.current?.setView([ipLocation.lat, ipLocation.lng], 13);
          return;
        }
      }
      const errorMsg = isAr
        ? "متصفحك لا يدعم تحديد الموقع الجغرافي. الرجاء تحديد الموقع يدوياً على الخريطة"
        : "Your browser does not support geolocation. Please select your location manually on the map";
      setLocationError(errorMsg);
      alert(errorMsg);
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    const isNonChrome = browserInfo !== "chrome";

    if (isNonChrome && browserInfo) {
      const browserGuidance = {
        firefox: isAr ? "في فايرفوكس، قد يكون تحديد الموقع أقل دقة. يمكنك أيضاً تحديد الموقع يدوياً على الخريطة." : "On Firefox, location accuracy may be lower. You can also select location manually on map.",
        safari:  isAr ? "في سفاري، قد تحتاج إلى تمكين خدمات الموقع في تفضيلات النظام." : "On Safari, you may need to enable location services in System Preferences.",
        edge:    isAr ? "في إيدج، تأكد من السماح بالوصول إلى الموقع في إعدادات المتصفح." : "On Edge, ensure location access is allowed in browser settings.",
        other:   isAr ? "قد تكون دقة تحديد الموقع محدودة في متصفحك. يمكنك تحديد الموقع يدوياً." : "Location accuracy may be limited in your browser. You can select location manually.",
      };
      setLocationError(browserGuidance[browserInfo]);
    }

    let locationSuccess = false;

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
      });
      const { latitude, longitude } = position.coords;
      setMarkerPosition({ lat: latitude, lng: longitude });
      setMapCenter({ lat: latitude, lng: longitude });
      await applyCoordinates(latitude, longitude);
      mapRef.current?.setView([latitude, longitude], 15);
      locationSuccess = true;
    } catch (error) {
      console.log("High accuracy failed:", error);
      if (!locationSuccess) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 8000, maximumAge: 30000 });
          });
          const { latitude, longitude } = position.coords;
          setMarkerPosition({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });
          await applyCoordinates(latitude, longitude);
          mapRef.current?.setView([latitude, longitude], 13);
          locationSuccess = true;
        } catch (error2) {
          console.log("Low accuracy also failed:", error2);
        }
      }
    }

    if (!locationSuccess) {
      const ipLocation = await getIPBasedLocation();
      if (ipLocation) {
        const useFallback = confirm(
          isAr
            ? `تعذر الحصول على موقعك الدقيق. تم العثور على موقع تقريبي (${ipLocation.city}, ${ipLocation.country}). هل تريد استخدام هذا الموقع؟`
            : `Could not get your exact location. Found approximate location (${ipLocation.city}, ${ipLocation.country}). Do you want to use this location?`
        );
        if (useFallback) {
          setMarkerPosition({ lat: ipLocation.lat, lng: ipLocation.lng });
          setMapCenter({ lat: ipLocation.lat, lng: ipLocation.lng });
          await applyCoordinates(ipLocation.lat, ipLocation.lng);
          mapRef.current?.setView([ipLocation.lat, ipLocation.lng], 10);
          locationSuccess = true;
        }
      }
    }

    setIsGettingLocation(false);

    if (!locationSuccess) {
      let errorMsg = "";
      if (isNonChrome) {
        errorMsg = isAr
          ? `تعذر تحديد موقعك في ${browserInfo === "firefox" ? "فايرفوكس" : browserInfo === "safari" ? "سفاري" : "متصفحك"}. الرجاء النقر على الخريطة لتحديد موقعك يدوياً.`
          : `Could not determine your location on ${browserInfo === "firefox" ? "Firefox" : browserInfo === "safari" ? "Safari" : "your browser"}. Please click on the map to select your location manually.`;
      } else {
        errorMsg = isAr
          ? "تعذر الحصول على موقعك. الرجاء تحديد الموقع يدوياً على الخريطة"
          : "Could not get your location. Please select location manually on the map";
      }
      setLocationError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleMarkerDragEnd = async (e) => {
    const { lat, lng } = e.target.getLatLng();
    setMarkerPosition({ lat, lng });
    setMapCenter({ lat, lng });
    await applyCoordinates(lat, lng);
  };

  const handleMapMoveStart = () => setIsMapMoving(true);

  const handleMapMoveEnd = async () => {
    if (mapRef.current && !isMapMoving) {
      const { lat, lng } = mapRef.current.getCenter();
      setMarkerPosition({ lat, lng });
      setMapCenter({ lat, lng });
      await applyCoordinates(lat, lng);
    }
    setIsMapMoving(false);
  };

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setMarkerPosition({ lat, lng });
    setMapCenter({ lat, lng });
    await applyCoordinates(lat, lng);
  };

  const handleInputChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleArrayChange = (index, field, value) =>
    setFormData((p) => { const arr = [...p[field]]; arr[index] = value; return { ...p, [field]: arr }; });

  const addArrayField    = (field) => setFormData((p) => ({ ...p, [field]: [...p[field], ""] }));

  const removeArrayField = (field, index) =>
    setFormData((p) => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }));

  const handleImageUpload = (index, url) =>
    setFormData((p) => { const imgs = [...p.images]; imgs[index] = url; return { ...p, images: imgs }; });

  const handleImageRemove = (index) =>
    setFormData((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));

  const addImageSlot = () => setFormData((p) => ({ ...p, images: [...p.images, ""] }));

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setMarkerPosition(null);
    setMapCenter(null);
    setSelectedLocation(null);
    setIsEditing(false);
    setEditingId(null);
    setLocationError(null);
  };

  const cancelEdit = () => { setShowForm(false); resetForm(); };

  const handleEdit = (listing) => {
    const coords = listing.coordinates?.lat && listing.coordinates?.lng ? listing.coordinates : null;
    setIsEditing(true);
    setEditingId(listing._id);
    setFormData({
      title:       listing.title       ?? "",
      description: listing.description ?? "",
      price:       listing.price       ?? "",
      location:    listing.location    ?? "",
      coordinates: coords,
      images:      listing.images      ?? [],
      amenities:   listing.amenities?.length ? listing.amenities : [""],
      rules:       listing.rules       ?? [],
      category:    listing.category    ?? "city",
    });
    if (coords) {
      setMarkerPosition(coords);
      setMapCenter(coords);
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
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res  = await fetch("/api/listings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowForm(false);
      resetForm();
      fetchListings();
      alert(t.listingCreatedSuccess);
    } catch (err) {
      console.error("Error creating listing:", err);
      alert(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res  = await fetch(`/api/listings/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
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
      console.error("Error updating listing:", err);
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.confirmDeleteListing)) return;
    try {
      const res  = await fetch(`/api/listings/${id}?deleteListing=true`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchListings();
      alert(t.listingDeletedSuccess);
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert(err.message);
    }
  };

  useEffect(() => {
    if (showForm && !isEditing && !mapCenter && !isGettingLocation) {
      setMapCenter(DEFAULT_CENTER);
    }
  }, [showForm, isEditing, mapCenter, isGettingLocation]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f6f2" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e8c547", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

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
        .map-wrapper { border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; }
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
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .listings-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px)  { .listings-grid { grid-template-columns: 1fr; } .images-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px)  { .hamburger { display: flex; } .desktop-nav { display: none !important; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f7f6f2", direction: isAr ? "rtl" : "ltr" }}>

        {/* Nav */}
        <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(26,26,46,0.97)", borderBottom: "1px solid rgba(232,197,71,0.15)", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none", fontFamily: "'Cairo', 'Tajawal', sans-serif", fontWeight: 500, fontSize: 26, color: "#f3f3f5", letterSpacing: "1px" }}>
            mar<span style={{ fontWeight: 700, color: "#e8c547" }}>haba</span>
          </Link>
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Link href="/host-dashboard" className="nav-link">{t.overview}</Link>
            <Link href="/host/listings"  className="nav-link active">{t.myListings}</Link>
            <Link href="/host/bookings"  className="nav-link">{t.bookings}</Link>
            <button onClick={toggleLanguage} style={{ background: "rgba(232,197,71,0.15)", border: "1px solid rgba(232,197,71,0.3)", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", color: "#e8c547", fontFamily: "inherit", marginLeft: 8 }}>
              {isAr ? "🇬🇧 English" : "🇸🇦 عربي"}
            </button>
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.12)", margin: "0 6px" }} />
            <button onClick={() => router.push("/host-dashboard")} className="btn-primary" style={{ padding: "6px 14px" }}>
              {t.dashboard} →
            </button>
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
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {isAr ? cat.labelAr : cat.labelEn}
                      </option>
                    ))}
                  </select>
                  {formData.category && (
                    <div style={{ fontSize: 11, color: "#666", marginTop: 5 }}>
                      {isAr
                        ? CATEGORIES.find((c) => c.id === formData.category)?.descriptionAr
                        : CATEGORIES.find((c) => c.id === formData.category)?.descriptionEn}
                    </div>
                  )}
                </div>

                <hr className="divider" />

                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="field-label">{t.location} *</label>

                  {browserInfo !== "chrome" && browserInfo && (
                    <div style={{ background: "#FFF3E0", border: "1px solid #FFB74D", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#E65100" }}>
                      ℹ️ {browserInfo === "firefox" && (isAr ? "نصيحة لفايرفوكس: قد تكون دقة الموقع أقل من كروم. يمكنك النقر على الخريطة لتحديد الموقع يدوياً." : "Firefox tip: Location accuracy may be lower than Chrome. You can click on the map to select location manually.")}
                      {browserInfo === "safari" && (isAr ? "نصيحة لسفاري: تأكد من تمكين خدمات الموقع في تفضيلات النظام > الخصوصية والأمان." : "Safari tip: Ensure location services are enabled in System Preferences > Security & Privacy.")}
                      {browserInfo === "edge" && (isAr ? "نصيحة لإيدج: تحقق من إعدادات الخصوصية للسماح بالوصول إلى الموقع." : "Edge tip: Check privacy settings to allow location access.")}
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
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>💡 {t.dragMarkerHint}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                        {isAr ? "انقر على الخريطة لتحديد الموقع" : "Click map to select location"}
                      </span>
                    </div>

                    {(!mapCenter || isGettingLocation) && (
                      <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f6f2", flexDirection: "column", gap: 12 }}>
                        {isGettingLocation ? (
                          <>
                            <div style={{ width: 40, height: 40, border: "3px solid #e8c547", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                            <p style={{ fontSize: 12, color: "#999" }}>{t.gettingLocation}</p>
                            {browserInfo !== "chrome" && (
                              <p style={{ fontSize: 11, color: "#e8c547", textAlign: "center", maxWidth: 280 }}>
                                {isAr ? "قد يستغرق هذا وقتاً أطول في متصفحك. يمكنك أيضاً النقر على الخريطة لتحديد الموقع يدوياً." : "This may take longer on your browser. You can also click on the map to select location manually."}
                              </p>
                            )}
                          </>
                        ) : (
                          <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: 12, color: "#999", marginBottom: 12 }}>
                              {locationError || (isAr ? "انقر على 'موقعي' أو انقر على الخريطة لتحديد موقع العقار" : "Click 'My Location' or click on the map to set property location")}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                if (mapRef.current) {
                                  const center = mapRef.current.getCenter();
                                  handleMapClick({ latlng: center });
                                }
                              }}
                              style={{ fontSize: 11, color: "#e8c547", background: "none", border: "1px solid #e8c547", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}
                            >
                              {isAr ? "استخدام موقع الخريطة الحالي" : "Use current map location"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {mapCenter && !isGettingLocation && (
                      <div style={{ height: 400, width: "100%" }}>
                        <MapContainer
                          key={`${mapCenter.lat}-${mapCenter.lng}`}
                          center={[mapCenter.lat, mapCenter.lng]}
                          zoom={markerPosition ? 14 : 2}
                          style={{ height: "100%", width: "100%" }}
                          whenCreated={(map) => { mapRef.current = map; }}
                          dragging
                          scrollWheelZoom
                          doubleClickZoom
                          onDragStart={handleMapMoveStart}
                          onDragEnd={handleMapMoveEnd}
                          onclick={handleMapClick}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                          {markerPosition && draggableIcon && (
                            <Marker
                              position={[markerPosition.lat, markerPosition.lng]}
                              draggable
                              eventHandlers={{ dragend: handleMarkerDragEnd }}
                              icon={draggableIcon}
                            >
                              <Popup>{t.propertyLocation}<br />{t.dragToAdjust}</Popup>
                            </Marker>
                          )}
                        </MapContainer>
                      </div>
                    )}
                  </div>

                  {selectedLocation?.address && (
                    <div className="location-pill">
                      <p style={{ fontSize: 12, color: "#7a6012", fontWeight: 500 }}>📍 {selectedLocation.address}</p>
                      <p style={{ fontSize: 11, color: "#a08020" }}>{selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
                    </div>
                  )}
                </div>

                <hr className="divider" />

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

                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="field-label">{t.amenities}</label>
                  {formData.amenities.map((amenity, index) => (
                    <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <input type="text" value={amenity} onChange={(e) => handleArrayChange(index, "amenities", e.target.value)} placeholder={t.amenityPlaceholder} className="field-input" style={{ flex: 1 }} />
                      {index > 0 && (
                        <button type="button" onClick={() => removeArrayField("amenities", index)} style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, cursor: "pointer" }}>
                          {t.remove}
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addArrayField("amenities")} style={{ fontSize: 12, color: "#e8c547", background: "none", border: "none", cursor: "pointer", padding: "4px 0", marginTop: 4 }}>
                    + {t.addAmenity}
                  </button>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="field-label">{t.houseRules}</label>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: 8 }}>{t.quickAdd}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {[t.ruleNoSmoking, t.ruleNoParties, t.ruleNoPets, t.ruleQuietHours, t.ruleSelfCheckIn, t.ruleNoShoes].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => { if (!formData.rules.includes(suggestion)) setFormData((p) => ({ ...p, rules: [...p.rules, suggestion] })); }}
                          style={{ background: formData.rules.includes(suggestion) ? "#e8c547" : "#fafaf8", color: formData.rules.includes(suggestion) ? "#1a1a2e" : "#888", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 20, padding: "4px 12px", fontSize: 11, cursor: "pointer" }}
                        >
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
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => { const rules = [...formData.rules]; rules[index] = e.target.value; setFormData((p) => ({ ...p, rules })); }}
                        placeholder={t.rulePlaceholder}
                        className="field-input"
                        style={{ flex: 1 }}
                      />
                      <button type="button" onClick={() => setFormData((p) => ({ ...p, rules: p.rules.filter((_, i) => i !== index) }))} style={{ background: "none", border: "none", color: "#e05a5a", fontSize: 18, cursor: "pointer", padding: "0 8px" }}>✕</button>
                    </div>
                  ))}

                  <button type="button" onClick={() => setFormData((p) => ({ ...p, rules: [...p.rules, ""] }))} style={{ fontSize: 12, color: "#e8c547", background: "none", border: "1px dashed rgba(232,197,71,0.5)", borderRadius: 8, cursor: "pointer", padding: "8px 12px", marginTop: 8, width: "100%" }}>
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
                          <div className="category-badge">
                            {category.icon} {isAr ? category.labelAr : category.labelEn}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "1.25rem" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 500, color: "#111118", marginBottom: 6 }}>{listing.title}</h3>
                        <p style={{ fontSize: 12, color: "#888", marginBottom: "0.5rem" }}>📍 {listing.location}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "0.875rem" }}>
                          <Link href={`/listings/${listing._id}`} style={{ fontSize: 12, color: "#1a1a2e", textDecoration: "none" }}>{t.viewDetails} →</Link>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => handleEdit(listing)}       style={{ fontSize: 12, color: "#185FA5", background: "none", border: "none", cursor: "pointer" }}>{t.edit}</button>
                            <button onClick={() => handleDelete(listing._id)} style={{ fontSize: 12, color: "#e05a5a", background: "none", border: "none", cursor: "pointer" }}>{t.delete}</button>
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

        <footer style={{ background: "#111118", borderTop: "1px solid rgba(232,197,71,0.08)", padding: "2rem 1.5rem", marginTop: "3rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div className="font-display" style={{ fontStyle: isAr ? "normal" : "italic", fontWeight: 300, fontSize: 18, color: "#fff" }}>
              mar<span style={{ fontStyle: "normal", fontWeight: 500, color: "#e8c547" }}>haba</span>
            </div>
            <p style={{ fontSize: 11, color: "#333" }}>© 2024 Marhaba. {t.rights}</p>
          </div>
        </footer>
      </div>
    </>
  );
}