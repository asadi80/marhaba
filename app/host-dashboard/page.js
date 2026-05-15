"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import "./style.css";

const CLOUDINARY_CLOUD_NAME = "dcakmhk1o";
const CLOUDINARY_UPLOAD_PRESET = "host_id_verification"; // create an unsigned preset in Cloudinary dashboard

export default function HostDashboard() {
  const router = useRouter();
  const { lang, t, toggleLanguage } = useLanguage();
  const isAr = lang === "ar";
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    totalEarnings: 0,
    rating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // ID upload state
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const arabicFont =
    "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishFont = "'DM Mono', monospace";
  const arabicDisplay =
    "'Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', sans-serif";
  const englishDisplay = "'Fraunces', serif";
  const bodyFont = isAr ? arabicFont : englishFont;
  const displayFont = isAr ? arabicDisplay : englishDisplay;

  useEffect(() => {
    (async () => {
      try {
        const [userRes, listingsRes, bookingsRes] = await Promise.all([
          fetch("/api/auth/me", { credentials: "include" }),
          fetch("/api/host/listings", { credentials: "include" }),
          fetch("/api/bookings", { credentials: "include" }),
        ]);

        const userData = await userRes.json();
        const listingsData = await listingsRes.json();
        const bookingsData = await bookingsRes.json();

        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        const user = userData?.user || null;
        const listings = Array.isArray(listingsData?.listings)
          ? listingsData.listings
          : [];
        const bookings = Array.isArray(bookingsData?.bookings)
          ? bookingsData.bookings
          : [];

        setUser(user);

        if (user?.role !== "host") {
          router.push("/dashboard");
          return;
        }

        const confirmed = bookings.filter((b) => b.status === "confirmed");
        setStats({
          totalListings: listings.length,
          totalBookings: bookings.length,
          confirmedBookings: confirmed.length,
          totalEarnings: confirmed.reduce((s, b) => s + (b.totalPrice || 0), 0),
          rating: user?.hostDetails?.rating || 0,
        });

        // Check if ID was already uploaded
        if (user?.idVerificationUrl) {
          setUploadDone(true);
        }
      } catch (e) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  // --- Cloudinary Upload ---
  const handleFileChange = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setUploadError(
        isAr
          ? "صيغة غير مدعومة. استخدم JPG أو PNG أو PDF."
          : "Unsupported format. Use JPG, PNG, or PDF."
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        isAr ? "الملف أكبر من 10 ميغابايت." : "File exceeds 10 MB."
      );
      return;
    }
    setUploadError("");
    setIdFile(file);
    if (file.type.startsWith("image/")) {
      setIdPreview(URL.createObjectURL(file));
    } else {
      setIdPreview(null);
    }
  };

const handleUploadID = async () => {
  if (!idFile) return;
  setUploading(true);
  setUploadError("");
  try {
    // Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", idFile);
    // Note: Don't send upload_preset and folder here if you're handling it in the backend
    // The backend already has folder: 'marhaba-hostId'

    console.log("Uploading file:", idFile.name);
    
    const cloudRes = await fetch("/api/upload/host-id", {
      method: "POST",
      body: formData
    });
    
    const cloudData = await cloudRes.json();
    console.log("Cloudinary response:", cloudData);

    if (!cloudRes.ok) {
      throw new Error(cloudData.message || "Cloudinary upload failed");
    }

    // FIX: Use 'url' not 'secure_url' (your backend returns 'url')
    const imageUrl = cloudData.url;
    if (!imageUrl) {
      throw new Error("No URL returned from Cloudinary");
    }

    console.log("Saving to database with URL:", imageUrl);
    
    // Save the URL to the user record via your API
    const saveRes = await fetch("/api/host/upload-id", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idVerificationUrl: imageUrl,  // FIX: Use 'url' from cloudData
        publicId: cloudData.public_id,
      }),
    });

    const saveData = await saveRes.json();
    console.log("Save response:", saveData);

    if (!saveRes.ok) {
      throw new Error(saveData.message || "Failed to save verification URL");
    }

    setUploadDone(true);
    
    // Refresh user data to reflect the uploaded ID
    const userRes = await fetch("/api/auth/me", { credentials: "include" });
    const userData = await userRes.json();
    if (userData.user) {
      setUser(userData.user);
    }
    
    // Clear the file input
    setIdFile(null);
    setIdPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
  } catch (err) {
    console.error("Upload error:", err);
    setUploadError(
      isAr
        ? `فشل الرفع: ${err.message}`
        : `Upload failed: ${err.message}`
    );
  } finally {
    setUploading(false);
  }
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
    AVATAR_PAL[(name?.charCodeAt(0) ?? 0) % AVATAR_PAL.length];

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

  // --- PENDING STATE: show ID upload UI ---
  if (user?.role === "host" && user?.status === "pending") {
    const isExpired = user?.statusReason === "expired";
    const alreadyUploaded = uploadDone || !!user?.idVerificationUrl;
    const userInitials =
      user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() ?? "H";
    const { bg: aviBg, color: aviColor } = avi(user?.name);

    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: ${bodyFont} !important; background: #f7f6f2; -webkit-font-smoothing: antialiased; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          .pending-card { animation: fadeUp 0.4s ease both; }
          .upload-drop-zone { border: 2px dashed #d0cfc8; border-radius: 12px; padding: 2rem; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
          .upload-drop-zone:hover, .upload-drop-zone.drag-over { border-color: #e8c547; background: rgba(232,197,71,0.04); }
          .upload-btn { background: #1a1a2e; color: #e8c547; border: none; border-radius: 8px; padding: 10px 24px; font-size: 13px; cursor: pointer; font-family: inherit; transition: opacity 0.15s; width: 100%; margin-top: 1rem; }
          .upload-btn:hover { opacity: 0.85; }
          .upload-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        `}</style>

        <div style={{ minHeight: "100vh", background: "#f7f6f2", direction: isAr ? "rtl" : "ltr" }}>
          {/* NAV */}
          <nav style={{ background: "#1a1a2e", borderBottom: "1px solid rgba(232,197,71,0.15)", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
            <Link href="/" style={{ textDecoration: "none", fontFamily: isAr ? "'Cairo', 'Tajawal', sans-serif" : "'Fraunces', serif", fontWeight: 500, fontSize: "24px", color: "#ffffff" }}>
              mar<span style={{ fontWeight: 700, color: "#e8c547" }}>haba</span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: aviBg, color: aviColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500 }}>
                {userInitials}
              </div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{user?.name}</span>
              <button onClick={handleLogout} style={{ background: "rgba(232,197,71,0.1)", border: "1px solid rgba(232,197,71,0.25)", borderRadius: 6, color: "#e8c547", padding: "4px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                {t.logout || "Logout"}
              </button>
            </div>
          </nav>

          <main style={{ maxWidth: 560, margin: "0 auto", padding: "3rem 1.5rem" }}>
            <div className="pending-card" style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)", padding: "2.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

              {/* Status badge */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
                <span style={{ background: isExpired ? "#FEE2E2" : "#FAEEDA", color: isExpired ? "#991B1B" : "#633806", fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 20, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {isExpired ? (isAr ? "انتهت الصلاحية" : "Expired") : (isAr ? "قيد المراجعة" : "Pending Approval")}
                </span>
              </div>

              {/* Title */}
              <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                <h2 style={{ fontFamily: displayFont, fontStyle: isAr ? "normal" : "italic", fontWeight: 300, fontSize: 26, color: "#111118", marginBottom: 8 }}>
                  {isExpired
                    ? (isAr ? "انتهت صلاحية اشتراكك" : "Subscription Expired")
                    : (isAr ? "مرحباً بك في لوحة المضيف" : "Welcome, Host")}
                </h2>
                <p style={{ fontSize: 13, color: "#777", lineHeight: 1.7, maxWidth: 380, margin: "0 auto" }}>
                  {alreadyUploaded
                    ? (isAr ? "تم استلام وثيقة الهوية. سيتم مراجعة حسابك من قِبل الفريق وستتلقى إشعاراً عند التفعيل." : "Your ID document has been received. Our team will review your account and notify you once it's approved.")
                    : (isAr ? "لإتمام التسجيل كمضيف والتمكن من إضافة العقارات، يرجى رفع صورة من وثيقة هويتك الرسمية." : "To complete your host registration and start adding listings, please upload a copy of your official ID document.")
                  }
                </p>
              </div>

              {/* Already uploaded — waiting state */}
              {alreadyUploaded ? (
                <div style={{ background: "#EAF3DE", borderRadius: 12, padding: "1.25rem", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 13, color: "#27500A", fontWeight: 500 }}>
                    {isAr ? "تم رفع الهوية بنجاح" : "ID uploaded successfully"}
                  </div>
                  <div style={{ fontSize: 12, color: "#27500A", opacity: 0.7, marginTop: 4 }}>
                    {isAr ? "في انتظار موافقة الإدارة" : "Awaiting admin approval"}
                  </div>
                </div>
              ) : (
                /* Upload form */
                <>
                  {/* Drop zone */}
                  <div
                    className={`upload-drop-zone${dragOver ? " drag-over" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]); }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileChange(e.target.files[0])}
                    />

                    {idPreview ? (
                      <div>
                        <img src={idPreview} alt="ID preview" style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 8, objectFit: "contain", marginBottom: 8 }} />
                        <div style={{ fontSize: 12, color: "#555" }}>{idFile?.name}</div>
                      </div>
                    ) : idFile ? (
                      <div>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                        <div style={{ fontSize: 12, color: "#555" }}>{idFile.name}</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>🪪</div>
                        <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>
                          {isAr ? "اسحب الملف هنا أو انقر للاختيار" : "Drag & drop or click to choose"}
                        </div>
                        <div style={{ fontSize: 11, color: "#aaa" }}>
                          {isAr ? "JPG · PNG · PDF — بحد أقصى 10 ميغابايت" : "JPG · PNG · PDF — max 10 MB"}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error */}
                  {uploadError && (
                    <div style={{ marginTop: 10, fontSize: 12, color: "#C53030", background: "#FFF5F5", border: "1px solid #FEB2B2", borderRadius: 8, padding: "8px 12px" }}>
                      {uploadError}
                    </div>
                  )}

                  {/* Upload button */}
                  <button
                    className="upload-btn"
                    onClick={handleUploadID}
                    disabled={!idFile || uploading}
                  >
                    {uploading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <span style={{ width: 14, height: 14, border: "2px solid rgba(232,197,71,0.3)", borderTopColor: "#e8c547", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                        {isAr ? "جارٍ الرفع..." : "Uploading..."}
                      </span>
                    ) : (
                      isAr ? "رفع الهوية" : "Submit ID for Verification"
                    )}
                  </button>

                  {/* Info note */}
                  <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
                    {isAr
                      ? "سيتم استخدام هذه الوثيقة للتحقق من هويتك فقط ولن تُشارك مع أي طرف آخر."
                      : "This document will only be used for identity verification and will not be shared with third parties."}
                  </p>
                </>
              )}

              {/* Steps indicator */}
              <div style={{ marginTop: "2rem", display: "flex", gap: 0, borderTop: "1px solid #f0ede8", paddingTop: "1.25rem" }}>
                {[
                  { step: 1, label: isAr ? "إنشاء الحساب" : "Create Account", done: true },
                  { step: 2, label: isAr ? "رفع الهوية" : "Upload ID", done: alreadyUploaded },
                  { step: 3, label: isAr ? "موافقة الإدارة" : "Admin Approval", done: false },
                  { step: 4, label: isAr ? "إضافة عقارات" : "Add Listings", done: false },
                ].map((s, i, arr) => (
                  <div key={s.step} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                    {i < arr.length - 1 && (
                      <div style={{ position: "absolute", top: 13, left: "50%", right: "-50%", height: 2, background: s.done ? "#1D9E75" : "#e5e3dc", zIndex: 0 }} />
                    )}
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: s.done ? "#1D9E75" : "#e5e3dc", color: s.done ? "#fff" : "#aaa", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", position: "relative", zIndex: 1 }}>
                      {s.done ? "✓" : s.step}
                    </div>
                    <div style={{ fontSize: 10, color: s.done ? "#27500A" : "#aaa", lineHeight: 1.3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  // --- MAIN DASHBOARD (confirmed hosts) ---
  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "H";
  const { bg: aviBg, color: aviColor } = avi(user?.name);
  const avgPerBooking = stats.totalEarnings / (stats.confirmedBookings || 1);
  const pendingCount = stats.totalBookings - stats.confirmedBookings;

  const formatCurrency = (amount) =>
    isAr
      ? `${Math.round(amount).toLocaleString()} دينار`
      : `${Math.round(amount).toLocaleString()} LYD`;

  const NAV_LINKS = [
    { href: "/host-dashboard", label: t.overview },
    { href: "/host/listings", label: t.myListings },
    { href: "/host/bookings", label: t.bookings },
  ];

  const STAT_CARDS = [
    { label: t.activeListings, value: stats.totalListings, accent: "#378ADD" },
    { label: t.totalBookings, value: stats.totalBookings, sub: `${stats.confirmedBookings} ${t.confirmed}`, accent: "#7F77DD" },
    { label: t.totalEarnings, value: formatCurrency(stats.totalEarnings), sub: t.confirmedOnly, accent: "#1D9E75" },
    { label: t.hostRating, value: stats.rating.toFixed(1), accent: "#e8c547" },
  ];

  const SUMMARY_CARDS = [
    { label: t.confirmed, value: stats.confirmedBookings, sub: t.readyForGuests, sBg: "#EAF3DE", sColor: "#27500A", bColor: "#1D9E75" },
    { label: t.pending, value: pendingCount, sub: t.awaitingAction, sBg: "#FAEEDA", sColor: "#633806", bColor: "#BA7517" },
    { label: t.avgPerBooking, value: formatCurrency(avgPerBooking), sub: t.fromConfirmed, sBg: "#E6F1FB", sColor: "#0C447C", bColor: "#378ADD" },
  ];

  const ACTION_CARDS = [
    { href: "/host/listings", label: t.manageListings, desc: t.manageListingsDesc, accent: "#7F77DD" },
    { href: "/host/bookings", label: t.viewBookings, desc: t.viewBookingsDesc, accent: "#1D9E75" },
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=Almarai:wght@300;400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ${bodyFont} !important; background: #f7f6f2; color: #222; -webkit-font-smoothing: antialiased; }
        .font-display { font-family: ${displayFont} !important; }
        .nav-link { font-size: 12px; color: rgba(255,255,255,0.5); text-decoration: none; padding: 6px 12px; border-radius: 6px; transition: color .15s, background .15s; }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .nav-link.active { color: #e8c547; }
        .logout-btn { background: rgba(232,197,71,0.1); border: 1px solid rgba(232,197,71,0.25); border-radius: 6px; color: #e8c547; padding: 4px 12px; font-size: 11px; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .logout-btn:hover { background: rgba(232,197,71,0.2); }
        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .hamburger span { display: block; width: 20px; height: 2px; background: rgba(255,255,255,0.7); border-radius: 2px; transition: all 0.2s; }
        .mobile-nav-menu { display: none; position: fixed; top: 56px; left: 0; right: 0; background: #1a1a2e; border-bottom: 1px solid rgba(232,197,71,0.15); padding: 1rem 1.5rem; z-index: 40; flex-direction: column; gap: 10px; }
        .mobile-nav-menu.open { display: flex; }
        .mobile-nav-link { font-size: 13px; color: rgba(255,255,255,0.7); text-decoration: none; padding: 8px 0; }
        .stat-card { background: #fff; border-radius: 12px; border: 1px solid rgba(0,0,0,0.07); padding: 1rem; border-top: 3px solid var(--accent); }
        .summary-card { border-radius: 12px; padding: 1rem; }
        .action-card { background: #fff; border-radius: 12px; border: 1px solid rgba(0,0,0,0.07); padding: 1.25rem; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; }
        .action-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .summary-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .action-grid { grid-template-columns: 1fr !important; }
          .desktop-nav-links, .desktop-user-info { display: none !important; }
          .hamburger { display: flex; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .summary-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f7f6f2", direction: lang === "ar" ? "rtl" : "ltr" }}>
        {/* NAV */}
        <nav style={{ background: "#1a1a2e", borderBottom: "1px solid rgba(232,197,71,0.15)", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link href="/" style={{ textDecoration: "none", fontFamily: isAr ? "'Cairo', 'Tajawal', sans-serif" : "'Fraunces', serif", fontWeight: 500, fontSize: "24px", color: "#ffffff", letterSpacing: "1px" }}>
              mar<span style={{ fontWeight: 700, color: "#e8c547" }}>haba</span>
            </Link>
            <div className="desktop-nav-links" style={{ display: "flex", gap: 2 }}>
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="nav-link">{label}</Link>
              ))}
            </div>
          </div>

          <div className="desktop-user-info" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={toggleLanguage} style={{ background: "rgba(232,197,71,0.15)", border: "1px solid rgba(232,197,71,0.3)", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", color: "#e8c547", fontFamily: "inherit" }}>
              {lang === "en" ? "🇸🇦 عربي" : "🇬🇧 English"}
            </button>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: aviBg, color: aviColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, flexShrink: 0 }}>
              {userInitials}
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{user?.name}</span>
            <span style={{ fontSize: 10, color: "#e8c547", background: "rgba(232,197,71,0.1)", border: "1px solid rgba(232,197,71,0.25)", padding: "2px 10px", borderRadius: 20 }}>
              {t.host}
            </span>
            <button onClick={handleLogout} className="logout-btn">{t.logout}</button>
          </div>

          <button className="hamburger" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Menu">
            <span style={{ transform: mobileNavOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
            <span style={{ opacity: mobileNavOpen ? 0 : 1 }} />
            <span style={{ transform: mobileNavOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        </nav>

        {/* Mobile nav */}
        <div className={`mobile-nav-menu ${mobileNavOpen ? "open" : ""}`}>
          <button onClick={toggleLanguage} style={{ background: "rgba(232,197,71,0.15)", border: "1px solid rgba(232,197,71,0.3)", borderRadius: 6, padding: "8px 12px", fontSize: 12, cursor: "pointer", color: "#e8c547", fontFamily: "inherit", marginBottom: 10, width: "100%" }}>
            {lang === "en" ? "🇸🇦 عربي" : "🇬🇧 English"}
          </button>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>{label}</Link>
          ))}
          <div style={{ paddingTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: aviBg, color: aviColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500 }}>{userInitials}</div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">{t.logout}</button>
          </div>
        </div>

        <main className="main-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "1.75rem 1.5rem" }}>
          {/* PROFILE STRIP */}
          <div className="fu profile-strip" style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.07)", padding: "1.25rem 1.5rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: aviBg, color: aviColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 500, flexShrink: 0 }}>
                {userInitials}
              </div>
              <div>
                <div className="font-display" style={{ fontStyle: isAr ? "normal" : "italic", fontWeight: 300, fontSize: 22, color: "#111118", lineHeight: 1.1 }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 3 }}>{t.hostAccount}</div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 3 }}>
                  {t.expiryDate}{" "}
                  {user?.hostExpiryDate ? new Date(user.hostExpiryDate).toLocaleDateString() : t.notAvailable}
                </div>
              </div>
            </div>
            <Link href="/host/listings" style={{ background: "#1a1a2e", color: "#e8c547", padding: "8px 18px", borderRadius: 8, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
              + {t.newListing}
            </Link>
          </div>

          {/* STAT CARDS */}
          <div className="fu fu1 stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: "1.25rem" }}>
            {STAT_CARDS.map(({ label, value, accent, sub }) => (
              <div key={label} className="stat-card" style={{ "--accent": accent }}>
                <div className="font-display" style={{ fontStyle: isAr ? "normal" : "italic", fontWeight: 300, fontSize: 30, color: "#111118", lineHeight: 1, marginBottom: 4 }}>
                  {value}
                </div>
                <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "#999" }}>{label}</div>
                {sub && <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>{sub}</div>}
              </div>
            ))}
          </div>

          {/* BOOKING SUMMARY */}
          <div className="fu fu2" style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.07)", padding: "1.5rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div className="font-display" style={{ fontStyle: isAr ? "normal" : "italic", fontWeight: 300, fontSize: 20, color: "#111118" }}>
                {t.bookingSummary}
              </div>
              <Link href="/host/bookings" style={{ fontSize: 12, color: "#185FA5", textDecoration: "none" }}>
                {t.viewAll} →
              </Link>
            </div>
            <div className="summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {SUMMARY_CARDS.map(({ label, value, sub, sBg, sColor, bColor }) => (
                <div key={label} className="summary-card" style={{ "--bColor": bColor, background: sBg }}>
                  <div className="font-display" style={{ fontStyle: isAr ? "normal" : "italic", fontWeight: 300, fontSize: 28, color: sColor, lineHeight: 1, marginBottom: 4 }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: sColor, opacity: 0.85 }}>{label}</div>
                  <div style={{ fontSize: 11, color: sColor, opacity: 0.55, marginTop: 4 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="fu fu3">
            <div className="font-display" style={{ fontStyle: isAr ? "normal" : "italic", fontWeight: 300, fontSize: 20, color: "#111118", marginBottom: "1rem" }}>
              {t.quickActions}
            </div>
          </div>
          <div className="fu fu4 action-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {ACTION_CARDS.map(({ href, label, desc, accent }) => (
              <Link key={href} href={href} className="action-card" style={{ "--accent": accent }}>
                <div className="font-display" style={{ fontStyle: isAr ? "normal" : "italic", fontWeight: 300, fontSize: 20, color: "#111118", marginBottom: 6 }}>
                  {label}
                </div>
                <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>{desc}</p>
                <div style={{ fontSize: 12, color: accent, marginTop: "1rem", fontWeight: 500 }}>{t.go} →</div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}