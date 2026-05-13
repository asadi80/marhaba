"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import "./style.css";

const CLOUDINARY_CLOUD_NAME = "dcakmhk1o";
const CLOUDINARY_UPLOAD_PRESET = "host_id_verification";

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
        if (user?.idImages?.length > 0) {
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
      const formData = new FormData();
      formData.append("file", idFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", "host_ids");

      const cloudRes = await fetch(
        `api/upload/host-id`,
        { method: "POST", body: formData }
      );
      const cloudData = await cloudRes.json();

      if (!cloudRes.ok || cloudData.error) {
        throw new Error(cloudData.error?.message || "Cloudinary upload failed");
      }

      const saveRes = await fetch("/api/host/upload-id", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idVerificationUrl: cloudData.url,
          publicId: cloudData.public_id,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save verification URL");

      setUploadDone(true);
    } catch (err) {
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

  // --- SUSPENDED STATE: Show suspended message ---
  if (user?.role === "host" && user?.status === "suspended") {
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
          @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          .suspended-card { animation: fadeUp 0.4s ease both; }
        `}</style>

        <div style={{ minHeight: "100vh", background: "#f7f6f2", direction: isAr ? "rtl" : "ltr" }}>
          {/* NAV */}
          <nav style={{ background: "#1a1a2e", borderBottom: "1px solid rgba(232,197,71,0.15)", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
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

          <main style={{ maxWidth: 600, margin: "0 auto", padding: "3rem 1.5rem" }}>
            <div className="suspended-card" style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)", padding: "2.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", textAlign: "center" }}>
              
              {/* Suspended Icon */}
              <div style={{ fontSize: 64, marginBottom: "1rem" }}>⚠️</div>
              
              {/* Status Badge */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
                <span style={{ background: "#FCEBEB", color: "#791F1F", fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 20, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {isAr ? "الحساب معلق" : "Account Suspended"}
                </span>
              </div>

              {/* Title */}
              <div style={{ marginBottom: "1.75rem" }}>
                <h2 style={{ fontFamily: displayFont, fontStyle: isAr ? "normal" : "italic", fontWeight: 500, fontSize: 24, color: "#791F1F", marginBottom: 12 }}>
                  {isAr ? "تم تعليق حساب المضيف الخاص بك" : "Your Host Account Has Been Suspended"}
                </h2>
                <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginTop: 8 }}>
                  {isAr 
                    ? "لقد تم تعليق حساب المضيف الخاص بك. لا يمكنك حالياً إدارة عقاراتك أو استقبال حجوزات جديدة."
                    : "Your host account has been suspended. You cannot manage your listings or receive new bookings at this time."
                  }
                </div>
              </div>

              {/* Message Box */}
              <div style={{ background: "#FEF3C7", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#92400E", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>📧</span>
                  {isAr ? "للتواصل مع الدعم:" : "Contact Support:"}
                </div>
                <div style={{ fontSize: 13, color: "#78350F", lineHeight: 1.6 }}>
                  {isAr 
                    ? "يرجى التواصل مع فريق الدعم لحل هذه المشكلة واستعادة حسابك. يمكنك مراسلتنا على البريد الإلكتروني أو استخدام نموذج الاتصال."
                    : "Please contact our support team to resolve this issue and restore your account. You can reach us via email or the contact form."
                  }
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #FDE68A" }}>
                  <div style={{ fontSize: 12, color: "#78350F", marginBottom: 4 }}>
                    📧 support@marhaba.com
                  </div>
                  <div style={{ fontSize: 12, color: "#78350F" }}>
                    🌐 www.marhaba.com/contact
                  </div>
                </div>
              </div>

              {/* What this means */}
              <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#791F1F", marginBottom: 12 }}>
                  {isAr ? "ماذا يعني هذا؟" : "What does this mean?"}
                </div>
                <ul style={{ fontSize: 12, color: "#666", paddingLeft: isAr ? 20 : 20, lineHeight: 1.8 }}>
                  <li>{isAr ? "لن تظهر عقاراتك في نتائج البحث" : "Your listings will not appear in search results"}</li>
                  <li>{isAr ? "لا يمكن استقبال حجوزات جديدة" : "Cannot receive new bookings"}</li>
                  <li>{isAr ? "الحجوزات الحالية قد تتأثر" : "Existing bookings may be affected"}</li>
                  <li>{isAr ? "لن تتمكن من إضافة أو تعديل العقارات" : "Cannot add or modify listings"}</li>
                </ul>
              </div>

              {/* Contact Button */}
              <a 
                href="mailto:support@marhaba.com"
                style={{ display: "inline-block", background: "#1a1a2e", color: "#e8c547", padding: "10px 24px", borderRadius: 8, fontSize: 13, textDecoration: "none", fontWeight: 500 }}
              >
                {isAr ? "اتصل بالدعم" : "Contact Support"}
              </a>

              {/* Back to Home */}
              <div style={{ marginTop: "1.5rem" }}>
                <Link href="/" style={{ fontSize: 12, color: "#185FA5", textDecoration: "none" }}>
                  ← {isAr ? "العودة إلى الرئيسية" : "Back to Home"}
                </Link>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  // --- PENDING STATE: show ID upload UI ---
// --- SUSPENDED STATE: Show suspended message ---
if (user?.role === "host" && user?.status === "suspended") {
  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "H";
  const { bg: aviBg, color: aviColor } = avi(user?.name);
  
  // Get suspended translations
  const suspendedText = t.suspended || {
    title: isAr ? "تم تعليق حساب المضيف الخاص بك" : "Your Host Account Has Been Suspended",
    description: isAr ? "لقد تم تعليق حساب المضيف الخاص بك. لا يمكنك حالياً إدارة عقاراتك أو استقبال حجوزات جديدة." : "Your host account has been suspended. You cannot manage your listings or receive new bookings at this time.",
    contactSupport: isAr ? "للتواصل مع الدعم:" : "Contact Support:",
    contactMessage: isAr ? "يرجى التواصل مع فريق الدعم لحل هذه المشكلة واستعادة حسابك. يمكنك مراسلتنا على البريد الإلكتروني أو استخدام نموذج الاتصال." : "Please contact our support team to resolve this issue and restore your account. You can reach us via email or the contact form.",
    whatThisMeans: isAr ? "ماذا يعني هذا؟" : "What does this mean?",
    implications: {
      listingsHidden: isAr ? "لن تظهر عقاراتك في نتائج البحث" : "Your listings will not appear in search results",
      noNewBookings: isAr ? "لا يمكن استقبال حجوزات جديدة" : "Cannot receive new bookings",
      existingBookings: isAr ? "الحجوزات الحالية قد تتأثر" : "Existing bookings may be affected",
      noModifications: isAr ? "لن تتمكن من إضافة أو تعديل العقارات" : "Cannot add or modify listings"
    },
    contactButton: isAr ? "اتصل بالدعم" : "Contact Support",
    backToHome: isAr ? "العودة إلى الرئيسية" : "Back to Home"
  };
  
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ${bodyFont} !important; background: #f7f6f2; -webkit-font-smoothing: antialiased; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .suspended-card { animation: fadeUp 0.4s ease both; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f7f6f2", direction: isAr ? "rtl" : "ltr" }}>
        {/* NAV */}
        <nav style={{ background: "#1a1a2e", borderBottom: "1px solid rgba(232,197,71,0.15)", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
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

        <main style={{ maxWidth: 600, margin: "0 auto", padding: "3rem 1.5rem" }}>
          <div className="suspended-card" style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.07)", padding: "2.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", textAlign: "center" }}>
            
            {/* Suspended Icon */}
            <div style={{ fontSize: 64, marginBottom: "1rem" }}>⚠️</div>
            
            {/* Status Badge */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
              <span style={{ background: "#FCEBEB", color: "#791F1F", fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 20, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {isAr ? "الحساب معلق" : "Account Suspended"}
              </span>
            </div>

            {/* Title */}
            <div style={{ marginBottom: "1.75rem" }}>
              <h2 style={{ fontFamily: displayFont, fontStyle: isAr ? "normal" : "italic", fontWeight: 500, fontSize: 24, color: "#791F1F", marginBottom: 12 }}>
                {suspendedText.title}
              </h2>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginTop: 8 }}>
                {suspendedText.description}
              </div>
            </div>

            {/* Message Box */}
            <div style={{ background: "#FEF3C7", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#92400E", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span>📧</span>
                {suspendedText.contactSupport}
              </div>
              <div style={{ fontSize: 13, color: "#78350F", lineHeight: 1.6 }}>
                {suspendedText.contactMessage}
              </div>
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #FDE68A" }}>
                <div style={{ fontSize: 12, color: "#78350F", marginBottom: 4 }}>
                  📧 support@marhaba.com
                </div>
                <div style={{ fontSize: 12, color: "#78350F" }}>
                  🌐 www.marhaba.com/contact
                </div>
              </div>
            </div>

            {/* What this means */}
            <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#791F1F", marginBottom: 12 }}>
                {suspendedText.whatThisMeans}
              </div>
              <ul style={{ fontSize: 12, color: "#666", paddingLeft: isAr ? 20 : 20, lineHeight: 1.8 }}>
                <li>{suspendedText.implications.listingsHidden}</li>
                <li>{suspendedText.implications.noNewBookings}</li>
                <li>{suspendedText.implications.existingBookings}</li>
                <li>{suspendedText.implications.noModifications}</li>
              </ul>
            </div>

            {/* Contact Button */}
            <a 
              href="mailto:support@marhaba.com"
              style={{ display: "inline-block", background: "#1a1a2e", color: "#e8c547", padding: "10px 24px", borderRadius: 8, fontSize: 13, textDecoration: "none", fontWeight: 500 }}
            >
              {suspendedText.contactButton}
            </a>

            {/* Back to Home */}
            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/" style={{ fontSize: 12, color: "#185FA5", textDecoration: "none" }}>
                ← {suspendedText.backToHome}
              </Link>
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