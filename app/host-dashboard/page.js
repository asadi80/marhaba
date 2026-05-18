//app/host-dasboard
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

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

  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

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

        if (!userRes.ok) { router.push("/login"); return; }

        const user = userData?.user || null;
        const listings = Array.isArray(listingsData?.listings) ? listingsData.listings : [];
        const bookings = Array.isArray(bookingsData?.bookings) ? bookingsData.bookings : [];

        setUser(user);
        if (user?.role !== "host") { router.push("/dashboard"); return; }

        const confirmed = bookings.filter((b) => b.status === "confirmed");
        setStats({
          totalListings: listings.length,
          totalBookings: bookings.length,
          confirmedBookings: confirmed.length,
          totalEarnings: confirmed.reduce((s, b) => s + (b.totalPrice || 0), 0),
          rating: user?.hostDetails?.rating || 0,
        });

        if (user?.idVerificationUrl) setUploadDone(true);
      } catch {
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

  const handleFileChange = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setUploadError(isAr ? "صيغة غير مدعومة. استخدم JPG أو PNG أو PDF." : "Unsupported format. Use JPG, PNG, or PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(isAr ? "الملف أكبر من 10 ميغابايت." : "File exceeds 10 MB.");
      return;
    }
    setUploadError("");
    setIdFile(file);
    if (file.type.startsWith("image/")) setIdPreview(URL.createObjectURL(file));
    else setIdPreview(null);
  };

  const handleUploadID = async () => {
    if (!idFile) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", idFile);
      const cloudRes = await fetch("/api/upload/host-id", { method: "POST", body: formData });
      const cloudData = await cloudRes.json();
      if (!cloudRes.ok) throw new Error(cloudData.message || "Cloudinary upload failed");
      const imageUrl = cloudData.url;
      if (!imageUrl) throw new Error("No URL returned from Cloudinary");

      const saveRes = await fetch("/api/host/upload-id", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idVerificationUrl: imageUrl, publicId: cloudData.public_id }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.message || "Failed to save verification URL");

      setUploadDone(true);
      const userRes = await fetch("/api/auth/me", { credentials: "include" });
      const userData = await userRes.json();
      if (userData.user) setUser(userData.user);
      setIdFile(null);
      setIdPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadError(isAr ? `فشل الرفع: ${err.message}` : `Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const AVATAR_PAL = [
    { bg: "bg-[#EEEDFE]", color: "text-[#3C3489]" },
    { bg: "bg-[#E6F1FB]", color: "text-[#0C447C]" },
    { bg: "bg-[#EAF3DE]", color: "text-[#27500A]" },
    { bg: "bg-[#FAEEDA]", color: "text-[#633806]" },
    { bg: "bg-[#E1F5EE]", color: "text-[#085041]" },
    { bg: "bg-[#FBEAF0]", color: "text-[#72243E]" },
  ];
  const avi = (name) => AVATAR_PAL[(name?.charCodeAt(0) ?? 0) % AVATAR_PAL.length];

  // --- LOADING ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2]">
      <div className="w-7 h-7 rounded-full border-[2.5px] border-[#1a1a2e] border-t-transparent animate-spin" />
    </div>
  );

  // --- PENDING STATE ---
  if (user?.role === "host" && user?.status === "pending") {
    const isExpired = user?.statusReason === "expired";
    const alreadyUploaded = uploadDone || !!user?.idVerificationUrl;
    const userInitials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "H";
    const { bg: aviBg, color: aviColor } = avi(user?.name);

    return (
      <div className={`min-h-screen bg-[#f7f6f2] ${isAr ? "dir-rtl" : ""}`} dir={isAr ? "rtl" : "ltr"}>
        {/* NAV */}
        <nav className="bg-[#1a1a2e] border-b border-[#e8c547]/15 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
          <Link href="/" className="no-underline font-['Cairo','Tajawal',sans-serif] font-medium text-[26px] text-white tracking-wide">
            مر<span className="font-bold text-[#e8c547]">حبا</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-medium ${aviBg} ${aviColor}`}>
              {userInitials}
            </div>
            <span className="text-xs text-white/60">{user?.name}</span>
            <button onClick={handleLogout} className="bg-[#e8c547]/10 border border-[#e8c547]/25 rounded-md text-[#e8c547] px-3 py-1 text-[11px] cursor-pointer font-[inherit]">
              {t.logout || "Logout"}
            </button>
          </div>
        </nav>

        <main className="max-w-[560px] mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl border border-black/7 p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] animate-[fadeUp_0.4s_ease_both]">

            {/* Status badge */}
            <div className="flex justify-center mb-6">
              <span className={`text-[11px] font-semibold px-3.5 py-1 rounded-full tracking-wide uppercase ${isExpired ? "bg-red-100 text-red-800" : "bg-[#FAEEDA] text-[#633806]"}`}>
                {isExpired ? (isAr ? "انتهت الصلاحية" : "Expired") : (isAr ? "قيد المراجعة" : "Pending Approval")}
              </span>
            </div>

            {/* Title */}
            <div className="text-center mb-7">
              <h2 className="font-['Fraunces',serif] italic font-light text-[26px] text-[#111118] mb-2">
                {isExpired ? (isAr ? "انتهت صلاحية اشتراكك" : "Subscription Expired") : (isAr ? "مرحباً بك في لوحة المضيف" : "Welcome, Host")}
              </h2>
              <p className="text-[13px] text-[#777] leading-relaxed max-w-[380px] mx-auto">
                {alreadyUploaded
                  ? (isAr ? "تم استلام وثيقة الهوية. سيتم مراجعة حسابك من قِبل الفريق وستتلقى إشعاراً عند التفعيل." : "Your ID document has been received. Our team will review your account and notify you once it's approved.")
                  : (isAr ? "لإتمام التسجيل كمضيف والتمكن من إضافة العقارات، يرجى رفع صورة من وثيقة هويتك الرسمية." : "To complete your host registration and start adding listings, please upload a copy of your official ID document.")}
              </p>
            </div>

            {/* Already uploaded */}
            {alreadyUploaded ? (
              <div className="bg-[#EAF3DE] rounded-xl p-5 text-center">
                <div className="text-[28px] mb-2">✅</div>
                <div className="text-[13px] text-[#27500A] font-medium">
                  {isAr ? "تم رفع الهوية بنجاح" : "ID uploaded successfully"}
                </div>
                <div className="text-xs text-[#27500A]/70 mt-1">
                  {isAr ? "في انتظار موافقة الإدارة" : "Awaiting admin approval"}
                </div>
              </div>
            ) : (
              <>
                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]); }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-[#e8c547] bg-[#e8c547]/5" : "border-[#d0cfc8] hover:border-[#e8c547] hover:bg-[#e8c547]/[0.04]"}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                  {idPreview ? (
                    <div>
                      <img src={idPreview} alt="ID preview" className="max-h-40 max-w-full rounded-lg object-contain mb-2 mx-auto" />
                      <div className="text-xs text-[#555]">{idFile?.name}</div>
                    </div>
                  ) : idFile ? (
                    <div>
                      <div className="text-[32px] mb-2">📄</div>
                      <div className="text-xs text-[#555]">{idFile.name}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[36px] mb-2.5">🪪</div>
                      <div className="text-[13px] text-[#555] mb-1">
                        {isAr ? "اسحب الملف هنا أو انقر للاختيار" : "Drag & drop or click to choose"}
                      </div>
                      <div className="text-[11px] text-[#aaa]">
                        {isAr ? "JPG · PNG · PDF — بحد أقصى 10 ميغابايت" : "JPG · PNG · PDF — max 10 MB"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error */}
                {uploadError && (
                  <div className="mt-2.5 text-xs text-[#C53030] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {uploadError}
                  </div>
                )}

                {/* Upload button */}
                <button
                  onClick={handleUploadID}
                  disabled={!idFile || uploading}
                  className="w-full mt-4 bg-[#1a1a2e] text-[#e8c547] border-none rounded-lg py-2.5 px-6 text-[13px] cursor-pointer font-[inherit] transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-[#e8c547]/30 border-t-[#e8c547] rounded-full animate-spin inline-block" />
                      {isAr ? "جارٍ الرفع..." : "Uploading..."}
                    </span>
                  ) : (isAr ? "رفع الهوية" : "Submit ID for Verification")}
                </button>

                <p className="text-[11px] text-[#bbb] text-center mt-3 leading-relaxed">
                  {isAr
                    ? "سيتم استخدام هذه الوثيقة للتحقق من هويتك فقط ولن تُشارك مع أي طرف آخر."
                    : "This document will only be used for identity verification and will not be shared with third parties."}
                </p>
              </>
            )}

            {/* Steps indicator */}
            <div className="mt-8 flex border-t border-[#f0ede8] pt-5">
              {[
                { step: 1, label: isAr ? "إنشاء الحساب" : "Create Account", done: true },
                { step: 2, label: isAr ? "رفع الهوية" : "Upload ID", done: alreadyUploaded },
                { step: 3, label: isAr ? "موافقة الإدارة" : "Admin Approval", done: false },
                { step: 4, label: isAr ? "إضافة عقارات" : "Add Listings", done: false },
              ].map((s, i, arr) => (
                <div key={s.step} className="flex-1 text-center relative">
                  {i < arr.length - 1 && (
                    <div className={`absolute top-[13px] left-1/2 right-[-50%] h-0.5 z-0 ${s.done ? "bg-[#1D9E75]" : "bg-[#e5e3dc]"}`} />
                  )}
                  <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center mx-auto mb-1.5 relative z-10 text-[11px] font-semibold ${s.done ? "bg-[#1D9E75] text-white" : "bg-[#e5e3dc] text-[#aaa]"}`}>
                    {s.done ? "✓" : s.step}
                  </div>
                  <div className={`text-[10px] leading-tight ${s.done ? "text-[#27500A]" : "text-[#aaa]"}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  const userInitials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "H";
  const { bg: aviBg, color: aviColor } = avi(user?.name);
  const avgPerBooking = stats.totalEarnings / (stats.confirmedBookings || 1);
  const pendingCount = stats.totalBookings - stats.confirmedBookings;
  const formatCurrency = (amount) => isAr ? `${Math.round(amount).toLocaleString()} دينار` : `${Math.round(amount).toLocaleString()} LYD`;

  const NAV_LINKS = [
    { href: "/host-dashboard", label: t.dashboard },
    { href: "/host/listings", label: t.myListings },
    { href: "/host/bookings", label: t.bookings },
    { href: "/host/analytics", label: t.analytics },
  ];

  const STAT_CARDS = [
    { label: t.activeListings, value: stats.totalListings, borderColor: "border-t-[#378ADD]" },
    { label: t.totalBookings, value: stats.totalBookings, sub: `${stats.confirmedBookings} ${t.confirmed}`, borderColor: "border-t-[#7F77DD]" },
    { label: t.totalEarnings, value: formatCurrency(stats.totalEarnings), sub: t.confirmedOnly, borderColor: "border-t-[#1D9E75]" },
    { label: t.hostRating, value: stats.rating.toFixed(1), borderColor: "border-t-[#e8c547]" },
  ];

  const SUMMARY_CARDS = [
    { label: t.confirmed, value: stats.confirmedBookings, sub: t.readyForGuests, bg: "bg-[#EAF3DE]", textColor: "text-[#27500A]", borderColor: "border-t-[#1D9E75]" },
    { label: t.pending, value: pendingCount, sub: t.awaitingAction, bg: "bg-[#FAEEDA]", textColor: "text-[#633806]", borderColor: "border-t-[#BA7517]" },
    { label: t.avgPerBooking, value: formatCurrency(avgPerBooking), sub: t.fromConfirmed, bg: "bg-[#E6F1FB]", textColor: "text-[#0C447C]", borderColor: "border-t-[#378ADD]" },
  ];

  const ACTION_CARDS = [
    { href: "/host/listings", label: t.manageListings, desc: t.manageListingsDesc, accentText: "text-[#7F77DD]", borderColor: "border-t-[#7F77DD]" },
    { href: "/host/bookings", label: t.viewBookings, desc: t.viewBookingsDesc, accentText: "text-[#1D9E75]", borderColor: "border-t-[#1D9E75]" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f2]" dir={isAr ? "rtl" : "ltr"}>
      {/* NAV */}
      <nav className="bg-[#1a1a2e] border-b border-[#e8c547]/15 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="no-underline font-['Cairo','Tajawal',sans-serif] font-medium text-[26px] text-white tracking-wide">
            مر<span className="font-bold text-[#e8c547]">حبا</span>
          </Link>
          <div className="hidden md:flex gap-0.5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="text-xs text-white/45 no-underline px-3 py-1.5 rounded-md hover:text-white/90 hover:bg-white/[0.06] transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          <button onClick={toggleLanguage} className="bg-[#e8c547]/15 border border-[#e8c547]/30 rounded-md px-2.5 py-1 text-[11px] cursor-pointer text-[#e8c547] font-[inherit]">
            {lang === "en" ? "🇸🇦 عربي" : "🇬🇧 English"}
          </button>
          <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-medium shrink-0 ${aviBg} ${aviColor}`}>
            {userInitials}
          </div>
          <span className="text-xs text-white/60">{user?.name}</span>
          <span className="text-[10px] text-[#e8c547] bg-[#e8c547]/10 border border-[#e8c547]/25 px-2.5 py-0.5 rounded-full">
            {t.host}
          </span>
          <button onClick={handleLogout} className="bg-none border border-white/12 rounded-md text-white/40 font-['DM_Mono',monospace] text-[11px] px-3 py-1 cursor-pointer hover:border-red-400/50 hover:text-red-400/90 transition-colors">
            {t.logout}
          </button>
        </div>

        {/* Hamburger */}
        <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden flex flex-col gap-1.5 bg-transparent border-none cursor-pointer p-1" aria-label="Menu">
          <span className={`block w-[18px] h-0.5 bg-white/60 rounded transition-transform ${mobileNavOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-[18px] h-0.5 bg-white/60 rounded transition-opacity ${mobileNavOpen ? "opacity-0" : ""}`} />
          <span className={`block w-[18px] h-0.5 bg-white/60 rounded transition-transform ${mobileNavOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </nav>

      {/* Mobile nav */}
      {mobileNavOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bg-[#1a1a2e] border-b border-[#e8c547]/12 px-6 py-4 z-40 flex flex-col gap-1">
          <button onClick={toggleLanguage} className="bg-[#e8c547]/15 border border-[#e8c547]/30 rounded-md py-2 px-3 text-xs cursor-pointer text-[#e8c547] font-[inherit] mb-2.5 w-full">
            {lang === "en" ? "🇸🇦 عربي" : "🇬🇧 English"}
          </button>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileNavOpen(false)} className="text-[13px] text-white/60 no-underline py-2.5 border-b border-white/[0.06] last:border-b-0">
              {label}
            </Link>
          ))}
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium ${aviBg} ${aviColor}`}>{userInitials}</div>
              <span className="text-xs text-white/60">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="bg-none border border-white/12 rounded-md text-white/40 text-[11px] px-3 py-1 cursor-pointer">
              {t.logout}
            </button>
          </div>
        </div>
      )}

      <main className="max-w-[1100px] mx-auto px-4 md:px-6 py-7">
        {/* PROFILE STRIP */}
        <div className="bg-white rounded-xl border border-black/7 px-6 py-5 mb-3 flex items-center justify-between gap-4 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="flex items-center gap-3.5">
            <div className={`w-[46px] h-[46px] rounded-full flex items-center justify-center text-[15px] font-medium shrink-0 ${aviBg} ${aviColor}`}>
              {userInitials}
            </div>
            <div>
              <div className="font-['Fraunces',serif] italic font-light text-[22px] text-[#111118] leading-tight">
                {user?.name}
              </div>
              <div className="text-[11px] text-[#999] mt-0.5">{t.hostAccount}</div>
              <div className="text-[11px] text-[#999] mt-0.5">
                {t.expiryDate}{" "}
                {user?.hostExpiryDate ? new Date(user.hostExpiryDate).toLocaleDateString() : t.notAvailable}
              </div>
            </div>
          </div>
          <Link href="/host/listings" className="bg-[#1a1a2e] text-[#e8c547] px-4 py-2 rounded-lg text-xs no-underline whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity">
            + {t.newListing}
          </Link>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_0.07s_both]">
          {STAT_CARDS.map(({ label, value, borderColor, sub }) => (
            <div key={label} className={`bg-white rounded-xl border border-black/7 p-4 border-t-[3px] ${borderColor}`}>
              <div className="font-['Fraunces',serif] italic font-light text-[30px] text-[#111118] leading-none mb-1">
                {value}
              </div>
              <div className="text-[11px] tracking-wide uppercase text-[#999]">{label}</div>
              {sub && <div className="text-[11px] text-[#bbb] mt-1">{sub}</div>}
            </div>
          ))}
        </div>

        {/* BOOKING SUMMARY */}
        <div className="bg-white rounded-xl border border-black/7 p-6 mb-3 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_0.14s_both]">
          <div className="flex items-center justify-between mb-4">
            <div className="font-['Fraunces',serif] italic font-light text-xl text-[#111118]">
              {t.bookingSummary}
            </div>
            <Link href="/host/bookings" className="text-xs text-[#185FA5] no-underline">
              {t.viewAll} →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {SUMMARY_CARDS.map(({ label, value, sub, bg, textColor, borderColor }) => (
              <div key={label} className={`rounded-xl p-5 border-t-[3px] ${bg} ${borderColor}`}>
                <div className={`font-['Fraunces',serif] italic font-light text-[28px] leading-none mb-1 ${textColor}`}>
                  {value}
                </div>
                <div className={`text-[11px] tracking-wide uppercase opacity-85 ${textColor}`}>{label}</div>
                <div className={`text-[11px] opacity-55 mt-1 ${textColor}`}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="font-['Fraunces',serif] italic font-light text-xl text-[#111118] mb-4 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_0.21s_both]">
          {t.quickActions}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_0.28s_both]">
          {ACTION_CARDS.map(({ href, label, desc, accentText, borderColor }) => (
            <Link key={href} href={href} className={`bg-white rounded-xl border border-black/7 border-t-[3px] ${borderColor} p-6 no-underline block hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)] transition-all duration-200`}>
              <div className="font-['Fraunces',serif] italic font-light text-xl text-[#111118] mb-1.5">
                {label}
              </div>
              <p className="text-[13px] text-[#888] leading-relaxed">{desc}</p>
              <div className={`text-xs mt-4 font-medium ${accentText}`}>{t.go} →</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}