'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import ImageUpload from '@/components/ImageUpload';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const draggableIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function HostListings() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [markerPosition, setMarkerPosition] = useState({ lat: 51.505, lng: -0.09 });
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 51.505,
    lng: -0.09,
    address: 'London, UK',
  });
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    coordinates: { lat: 51.505, lng: -0.09 },
    images: [],
    amenities: [''],
  });

  useEffect(() => {
    fetchListings();
    getUserLocation();
    const fallbackTimeout = setTimeout(() => {
      if (isGettingLocation) {
        setIsGettingLocation(false);
      }
    }, 6000);
    return () => clearTimeout(fallbackTimeout);
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/host/listings');
      const data = await response.json();
      setListings(data.listings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setMarkerPosition(newLocation);
        setMapCenter(newLocation);
        await updateLocationFromCoordinates(latitude, longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to retrieve your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED: errorMessage += 'Please allow location access to use this feature.'; break;
          case error.POSITION_UNAVAILABLE: errorMessage += 'Location information is unavailable.'; break;
          case error.TIMEOUT: errorMessage += 'The request to get your location timed out.'; break;
          default: errorMessage += 'Please make sure location services are enabled.';
        }
        alert(errorMessage);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) return data.display_name;
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const updateLocationFromCoordinates = async (lat, lng) => {
    const address = await reverseGeocode(lat, lng);
    setSelectedLocation({ lat, lng, address });
    setFormData(prev => ({ ...prev, location: address, coordinates: { lat, lng } }));
  };

  const handleMarkerDragEnd = async (e) => {
    const marker = e.target;
    const position = marker.getLatLng();
    const lat = position.lat;
    const lng = position.lng;
    setMarkerPosition({ lat, lng });
    setMapCenter({ lat, lng });
    await updateLocationFromCoordinates(lat, lng);
  };

  const handleMapMoveEnd = async () => {
    if (mapRef.current && !isMapMoving) {
      const center = mapRef.current.getCenter();
      const lat = center.lat;
      const lng = center.lng;
      setMarkerPosition({ lat, lng });
      setMapCenter({ lat, lng });
      await updateLocationFromCoordinates(lat, lng);
    }
    setIsMapMoving(false);
  };

  const handleMapMoveStart = () => setIsMapMoving(true);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleArrayChange = (index, field, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field) => setFormData({ ...formData, [field]: [...formData[field], ''] });

  const removeArrayField = (field, index) =>
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });

  const handleImageUpload = (index, url) => {
    const newImages = [...formData.images];
    newImages[index] = url;
    setFormData({ ...formData, images: newImages });
  };

  const handleImageRemove = (index) =>
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });

  const addImageSlot = () =>
    setFormData({ ...formData, images: [...formData.images, ''] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location || !formData.coordinates) { alert('Please select a location on the map'); return; }
    if (formData.images.length === 0 || !formData.images[0]) { alert('Please upload at least one image'); return; }
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setShowForm(false);
      setFormData({ title: '', description: '', price: '', location: '', coordinates: { lat: 51.505, lng: -0.09 }, images: [], amenities: [''] });
      setMarkerPosition({ lat: 51.505, lng: -0.09 });
      setMapCenter({ lat: 51.505, lng: -0.09 });
      setSelectedLocation({ lat: 51.505, lng: -0.09, address: 'London, UK' });
      fetchListings();
      alert('Listing created successfully!');
    } catch (error) {
      console.error('Error creating listing:', error);
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const response = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      if (response.ok) fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const useCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Got location:', latitude, longitude);
          setMarkerPosition({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });
          await updateLocationFromCoordinates(latitude, longitude);
          if (mapRef.current) mapRef.current.setView([latitude, longitude], 15);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsGettingLocation(false);
          let errorMessage = 'Unable to get your location. ';
          switch (error.code) {
            case error.PERMISSION_DENIED: errorMessage += 'Please allow location access in your browser.'; break;
            case error.POSITION_UNAVAILABLE: errorMessage += 'Location information is unavailable.'; break;
            case error.TIMEOUT: errorMessage += 'The request to get your location timed out.'; break;
            default: errorMessage += 'Please check your location settings.';
          }
          alert(errorMessage);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const centerOnMarker = () => {
    if (mapRef.current) mapRef.current.setView([markerPosition.lat, markerPosition.lng], 15);
  };

  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,300;1,9..144,500&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          body{font-family:'DM Mono',monospace;background:#f7f6f2;}
          @keyframes spin{to{transform:rotate(360deg);}}
        `}</style>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f6f2' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e8c547', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,300;1,9..144,500&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{font-family:'DM Mono',monospace;background:#f7f6f2;color:#111118;-webkit-font-smoothing:antialiased;}
        .font-display{font-family:'Fraunces',serif;}

        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}

        .fu{animation:fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;}
        .fu0{animation-delay:0s;}.fu1{animation-delay:.08s;}.fu2{animation-delay:.16s;}

        .nav-blur{backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);}

        .nav-link{font-size:12px;color:rgba(255,255,255,0.5);text-decoration:none;padding:6px 12px;border-radius:6px;transition:color .15s,background .15s;}
        .nav-link:hover{color:#fff;background:rgba(255,255,255,0.06);}
        .nav-link.active{color:#e8c547;}

        .btn-primary{
          background:#e8c547;color:#1a1a2e;padding:9px 20px;border-radius:8px;
          font-size:12px;font-family:'DM Mono',monospace;font-weight:500;
          text-decoration:none;display:inline-flex;align-items:center;gap:6px;
          border:none;cursor:pointer;transition:opacity .15s,transform .15s;
        }
        .btn-primary:hover{opacity:.88;transform:translateY(-1px);}

        .btn-dark{
          background:#1a1a2e;color:#e8c547;padding:9px 20px;border-radius:8px;
          font-size:12px;font-family:'DM Mono',monospace;font-weight:500;
          border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;
          transition:opacity .15s,transform .15s;
        }
        .btn-dark:hover{opacity:.88;transform:translateY(-1px);}

        .btn-ghost-sm{
          background:transparent;color:#555;padding:8px 14px;border-radius:8px;
          font-size:12px;font-family:'DM Mono',monospace;
          border:1px solid rgba(0,0,0,0.12);cursor:pointer;
          display:inline-flex;align-items:center;gap:6px;
          transition:border-color .15s,color .15s;
        }
        .btn-ghost-sm:hover{border-color:rgba(0,0,0,0.3);color:#111118;}

        .btn-cancel{
          background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);padding:8px 16px;border-radius:8px;
          font-size:12px;font-family:'DM Mono',monospace;
          border:1px solid rgba(255,255,255,0.12);cursor:pointer;
          display:inline-flex;align-items:center;gap:6px;
          transition:border-color .15s,color .15s;
        }
        .btn-cancel:hover{border-color:rgba(255,255,255,0.3);color:#fff;}

        .listing-card{
          background:#fff;border-radius:16px;border:1px solid rgba(0,0,0,0.07);
          overflow:hidden;transition:transform .22s,box-shadow .22s;
        }
        .listing-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.08);}
        .listing-card .card-img{transition:transform .4s;}
        .listing-card:hover .card-img{transform:scale(1.05);}

        .form-panel{background:#fff;border-radius:16px;border:1px solid rgba(0,0,0,0.07);padding:2rem;margin-bottom:2rem;}

        .field-label{display:block;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#888;margin-bottom:6px;}

        .field-input{
          width:100%;padding:10px 14px;border:1px solid rgba(0,0,0,0.12);border-radius:8px;
          font-size:13px;font-family:'DM Mono',monospace;color:#111118;background:#fafaf8;
          outline:none;transition:border-color .15s,box-shadow .15s;
        }
        .field-input:focus{border-color:#e8c547;box-shadow:0 0 0 3px rgba(232,197,71,0.12);background:#fff;}
        .field-input::placeholder{color:#bbb;}
        .field-input[readonly]{background:#f3f3f0;color:#777;cursor:default;}

        .field-textarea{
          width:100%;padding:10px 14px;border:1px solid rgba(0,0,0,0.12);border-radius:8px;
          font-size:13px;font-family:'DM Mono',monospace;color:#111118;background:#fafaf8;
          outline:none;resize:vertical;transition:border-color .15s,box-shadow .15s;
        }
        .field-textarea:focus{border-color:#e8c547;box-shadow:0 0 0 3px rgba(232,197,71,0.12);background:#fff;}
        .field-textarea::placeholder{color:#bbb;}

        .map-wrapper{border:1px solid rgba(0,0,0,0.1);border-radius:12px;overflow:hidden;}
        .map-header{background:#1a1a2e;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;}
        .location-pill{background:#fdf8e7;border:1px solid rgba(232,197,71,0.3);border-radius:10px;padding:10px 14px;margin-top:10px;}

        .add-img-btn{
          border:2px dashed rgba(0,0,0,0.12);border-radius:12px;padding:1.5rem;
          background:none;cursor:pointer;width:100%;display:flex;flex-direction:column;
          align-items:center;gap:6px;transition:border-color .15s;
          font-family:'DM Mono',monospace;font-size:12px;color:#999;
        }
        .add-img-btn:hover{border-color:#e8c547;color:#e8c547;}

        .divider{border:none;border-top:1px solid rgba(0,0,0,0.07);margin:1.5rem 0;}

        .hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px;}
        .hamburger span{display:block;width:20px;height:2px;background:rgba(255,255,255,0.7);border-radius:2px;transition:all .2s;}
        .mobile-menu{display:none;position:fixed;top:56px;left:0;right:0;background:#1a1a2e;border-bottom:1px solid rgba(232,197,71,0.15);padding:1rem 1.5rem;z-index:40;flex-direction:column;gap:10px;}
        .mobile-menu.open{display:flex;animation:fadeIn .2s ease;}

        .listings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
        .images-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}

        @media(max-width:1024px){.listings-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:768px){
          .listings-grid{grid-template-columns:1fr;}
          .images-grid{grid-template-columns:repeat(2,1fr);}
          .loc-btns{flex-direction:column;}
          .form-footer{flex-direction:column;}
          .page-header-row{flex-direction:column;align-items:flex-start!important;}
        }
        @media(max-width:640px){
          .hamburger{display:flex;}
          .desktop-nav{display:none!important;}
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f7f6f2' }}>

        {/* ── NAV ── */}
        <nav className="nav-blur" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(26,26,46,0.97)', borderBottom: '1px solid rgba(232,197,71,0.15)', padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className="font-display" style={{ fontStyle: 'italic', fontWeight: 300, fontSize: 22, color: '#fff' }}>
              mar<span style={{ fontStyle: 'normal', fontWeight: 500, color: '#e8c547' }}>haba</span>
            </div>
          </Link>

          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link href="/host-dashboard" className="nav-link">overview</Link>
            <Link href="/host/listings" className="nav-link active">my listings</Link>
            <Link href="/host/bookings" className="nav-link">bookings</Link>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', margin: '0 6px' }} />
            <button onClick={() => router.push('/host-dashboard')} className="btn-primary" style={{ padding: '6px 14px' }}>dashboard →</button>
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span style={{ transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>
        </nav>

        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <Link href="/host-dashboard" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '8px 0' }}>overview</Link>
          <Link href="/host/listings" style={{ fontSize: 13, color: '#e8c547', textDecoration: 'none', padding: '8px 0' }}>my listings</Link>
          <Link href="/host/bookings" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '8px 0' }}>bookings</Link>
        </div>

        {/* ── PAGE HEADER ── */}
        <div style={{ background: '#1a1a2e', borderBottom: '1px solid rgba(232,197,71,0.12)', padding: '2.5rem 1.5rem 2rem' }}>
          <div className="page-header-row" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
            <div>
              <div className="fu fu0" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(232,197,71,0.6)', marginBottom: 8 }}>host panel</div>
              <h1 className="fu fu1 font-display" style={{ fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(28px,4vw,38px)', color: '#fff' }}>
                My <span style={{ fontWeight: 500, color: '#e8c547' }}>listings</span>
              </h1>
              <p className="fu fu2" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
                {listings.length} listing{listings.length !== 1 ? 's' : ''} active
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={showForm ? 'btn-cancel' : 'btn-primary'}
              style={{ flexShrink: 0 }}
            >
              {showForm ? '✕ cancel' : '+ add new listing'}
            </button>
          </div>
        </div>

        {/* ── MAIN ── */}
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

          {/* ── CREATE FORM ── */}
          {showForm && (
            <div className="form-panel fu fu0">
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', marginBottom: 6 }}>new listing</div>
                <h2 className="font-display" style={{ fontStyle: 'italic', fontWeight: 300, fontSize: 26, color: '#111118' }}>
                  Create a <span style={{ fontWeight: 500 }}>listing</span>
                </h2>
              </div>

              <form onSubmit={handleSubmit}>

                {/* Title */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="field-label">Title *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="field-input" placeholder="Beautiful Beach House" />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="field-label">Description *</label>
                  <textarea name="description" required rows="4" value={formData.description} onChange={handleInputChange} className="field-textarea" placeholder="Describe your property, amenities, and what makes it special..." />
                </div>

                {/* Price */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="field-label">Price per night ($) *</label>
                  <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleInputChange} className="field-input" placeholder="99" />
                </div>

                <hr className="divider" />

                {/* Location */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="field-label">Location *</label>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }} className="loc-btns">
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      className="field-input"
                      placeholder="Selected address will appear here"
                      readOnly
                      style={{ flex: 1, minWidth: 180 }}
                    />
                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      disabled={isGettingLocation}
                      style={{
                        background: isGettingLocation ? '#ccc' : '#1D9E75',
                        color: '#fff', border: 'none', borderRadius: 8,
                        padding: '9px 16px', fontSize: 12, fontFamily: 'inherit',
                        cursor: isGettingLocation ? 'not-allowed' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        whiteSpace: 'nowrap', transition: 'opacity .15s',
                      }}
                    >
                      {isGettingLocation ? (
                        <>
                          <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                          getting location…
                        </>
                      ) : '📍 my location'}
                    </button>
                    <button type="button" onClick={centerOnMarker} className="btn-ghost-sm">center map</button>
                  </div>

                  <div className="map-wrapper">
                    <div className="map-header">
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>💡 drag the marker or map to adjust location</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>🖱️ marker is draggable</span>
                    </div>
                    <div style={{ height: 400, width: '100%' }}>
                      <MapContainer
                        center={[mapCenter.lat, mapCenter.lng]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        whenCreated={(map) => { mapRef.current = map; }}
                        dragging={true}
                        scrollWheelZoom={true}
                        doubleClickZoom={true}
                        onDragStart={handleMapMoveStart}
                        onDragEnd={handleMapMoveEnd}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker
                          position={[markerPosition.lat, markerPosition.lng]}
                          draggable={true}
                          eventHandlers={{ dragend: handleMarkerDragEnd }}
                          icon={draggableIcon}
                        >
                          <Popup>
                            <div style={{ textAlign: 'center', fontSize: 12, fontFamily: 'inherit' }}>
                              <strong>📍 Property Location</strong><br />Drag me to adjust position
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>

                  {selectedLocation.address && (
                    <div className="location-pill">
                      <p style={{ fontSize: 12, color: '#7a6012', fontWeight: 500, marginBottom: 2 }}>
                        📍 {selectedLocation.address}
                      </p>
                      <p style={{ fontSize: 11, color: '#a08020' }}>
                        {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)} · drag the marker or map to adjust
                      </p>
                    </div>
                  )}
                </div>

                <hr className="divider" />

                {/* Images */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="field-label">Images * (upload at least one)</label>
                  <div className="images-grid">
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
                      <button type="button" onClick={addImageSlot} className="add-img-btn">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        add image
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>max 6 images · JPG, PNG or GIF · up to 5MB each</p>
                </div>

                <hr className="divider" />

                {/* Amenities */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="field-label">Amenities</label>
                  {formData.amenities.map((amenity, index) => (
                    <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={amenity}
                        onChange={(e) => handleArrayChange(index, 'amenities', e.target.value)}
                        placeholder="e.g. WiFi, Pool, Parking"
                        className="field-input"
                        style={{ flex: 1 }}
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('amenities', index)}
                          style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontFamily: 'inherit', cursor: 'pointer' }}
                        >
                          remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('amenities')}
                    style={{ fontSize: 12, color: '#e8c547', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0', marginTop: 4 }}
                  >
                    + add amenity
                  </button>
                </div>

                {/* Form footer */}
                <div className="form-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost-sm">cancel</button>
                  <button type="submit" className="btn-dark">create listing →</button>
                </div>
              </form>
            </div>
          )}

          {/* ── LISTINGS GRID ── */}
          {listings.length === 0 && !showForm ? (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.07)', padding: '5rem', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
              <p style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>you haven't created any listings yet.</p>
              <button
                onClick={() => setShowForm(true)}
                style={{ background: 'none', border: 'none', color: '#e8c547', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                create your first listing →
              </button>
            </div>
          ) : (
            <div className="listings-grid">
              {listings.map((listing, idx) => (
                <div key={listing._id} className="listing-card fu" style={{ animationDelay: `${idx * 0.06}s` }}>
                  <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="card-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {/* Price badge */}
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(26,26,46,0.92)', color: '#e8c547', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 500, backdropFilter: 'blur(8px)' }}>
                      ${listing.price}<span style={{ fontSize: 10, color: 'rgba(232,197,71,0.6)', fontWeight: 400 }}>/night</span>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ width: '100%', height: 2, background: '#e8c547', borderRadius: 1, marginBottom: '0.875rem', opacity: 0.4 }} />
                    <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111118', marginBottom: 6, lineHeight: 1.3 }}>{listing.title}</h3>
                    <p style={{ fontSize: 12, color: '#888', marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                      <span>📍</span>{listing.location}
                    </p>
                    <p style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 500, marginBottom: '1rem' }}>
                      ${listing.price} <span style={{ fontWeight: 400, fontSize: 12, color: '#999' }}>/ night</span>
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.875rem' }}>
                      <Link
                        href={`/listings/${listing._id}`}
                        style={{ fontSize: 12, color: '#1a1a2e', textDecoration: 'none', fontWeight: 500, transition: 'color .15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#e8c547'}
                        onMouseLeave={e => e.currentTarget.style.color = '#1a1a2e'}
                      >
                        view details →
                      </Link>
                      <button
                        onClick={() => handleDelete(listing._id)}
                        style={{ fontSize: 12, color: '#e05a5a', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'color .15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#991b1b'}
                        onMouseLeave={e => e.currentTarget.style.color = '#e05a5a'}
                      >
                        delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#111118', borderTop: '1px solid rgba(232,197,71,0.08)', padding: '2rem 1.5rem', marginTop: '3rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div className="font-display" style={{ fontStyle: 'italic', fontWeight: 300, fontSize: 18, color: '#fff' }}>
              mar<span style={{ fontStyle: 'normal', fontWeight: 500, color: '#e8c547' }}>haba</span>
            </div>
            <p style={{ fontSize: 11, color: '#333' }}>© 2024 Marhaba. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </>
  );
}