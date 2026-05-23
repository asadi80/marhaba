"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import { toDisplayUrl } from '@/lib/cloudinaryHelpers';

const getAuthToken = () => localStorage.getItem("marhabaToken");

const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem("marhabaToken");
    window.location.href = "/login";
    return null;
  }
  return response;
};

const AVATAR_PALETTE = [
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#EAF3DE", color: "#27500A" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#FBEAF0", color: "#72243E" },
];
const getAvatarStyle = (name) =>
  AVATAR_PALETTE[(name?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length];

const inputCls =
  "w-full px-3 py-2 bg-[#fafaf8] border border-black/10 rounded-md text-[13px] text-[#111118] font-[inherit] outline-none focus:border-[#185FA5] focus:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-[#999] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="font-serif italic font-light text-lg text-[#111118] mb-4 pb-2 border-b border-black/[0.06] flex flex-wrap items-baseline gap-1.5">
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-black/[0.04] last:border-0">
      <span className="text-[10px] uppercase tracking-widest text-[#999] flex-shrink-0 w-24 sm:w-32 leading-5">
        {label}
      </span>
      <span
        className={`text-[12px] sm:text-[13px] text-[#111118] text-right break-all leading-5 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value ?? <span className="text-[#ccc]">—</span>}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    confirmed: "bg-[#EAF3DE] text-[#27500A]",
    pending: "bg-[#FAEEDA] text-[#633806]",
    suspended: "bg-[#FCEBEB] text-[#791F1F]",
    active: "bg-[#EAF3DE] text-[#27500A]",
    cancelled: "bg-[#FCEBEB] text-[#791F1F]",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
        map[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function RoleBadge({ role }) {
  const map = {
    super_admin: "bg-[#EEEDFE] text-[#3C3489]",
    admin: "bg-[#E6F1FB] text-[#0C447C]",
    host: "bg-[#EAF3DE] text-[#27500A]",
    user: "bg-[#F1EFE8] text-[#444441]",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
        map[role] || "bg-gray-100 text-gray-700"
      }`}
    >
      {role?.replace("_", " ")}
    </span>
  );
}

function BookingCard({ booking, type }) {
  return (
    <div className="border border-black/[0.06] rounded-lg p-3 hover:bg-[#fafaf8] transition-all">
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#111118] mb-1">
            {type === "host" ? "Guest:" : "Listing:"}
          </p>
          <p className="text-sm font-medium text-[#185FA5] truncate">
            {type === "host"
              ? booking.user?.name || booking.userId
              : booking.listing?.title || booking.listingId}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#666] mt-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider">Check In</span>
          <p className="text-[#111118] mt-0.5">
            {new Date(booking.checkIn).toLocaleDateString()}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider">Check Out</span>
          <p className="text-[#111118] mt-0.5">
            {new Date(booking.checkOut).toLocaleDateString()}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider">Guests</span>
          <p className="text-[#111118] mt-0.5">{booking.guests}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider">Total</span>
          <p className="text-[#111118] mt-0.5 font-medium">
            LYD{booking.totalPrice}
          </p>
        </div>
      </div>
      <p className="text-[10px] text-[#999] mt-2">
        Booked: {new Date(booking.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

function ListingCard({ listing }) {
  return (
    <div className="border border-black/[0.06] rounded-lg overflow-hidden hover:shadow-md transition-all">
      {listing.images?.[0] && (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${listing.images[0]})` }}
        />
      )}
      <div className="p-3">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-sm font-medium text-[#111118] line-clamp-1 flex-1 min-w-0">
            {listing.title}
          </h3>
          <StatusBadge status={listing.status || "active"} />
        </div>
        <p className="text-xs text-[#666] mb-2 line-clamp-2">
          {listing.description}
        </p>
        <div className="flex justify-between items-center text-xs gap-2">
          <span className="text-[#185FA5] font-medium whitespace-nowrap">
            LYD{listing.price}/night
          </span>
          <span className="text-[#999] truncate">{listing.location}</span>
        </div>
        {listing.blockedDates?.length > 0 && (
          <p className="text-[10px] text-[#A32D2D] mt-2">
            {listing.blockedDates.length} blocked date(s)
          </p>
        )}
      </div>
    </div>
  );
}

function SessionCard({ session }) {
  return (
    <div className="border border-black/[0.06] rounded-lg p-3 hover:bg-[#fafaf8] transition-all">
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#111118] mb-1">Device</p>
          <p className="text-sm font-medium text-[#185FA5] truncate">
            {session.device || "Unknown Device"}
          </p>
        </div>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 ${
            session.isActive
              ? "bg-[#EAF3DE] text-[#27500A]"
              : "bg-[#F1EFE8] text-[#444441]"
          }`}
        >
          {session.isActive ? "Active" : "Ended"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[#666] mt-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider">Browser</span>
          <p className="text-[#111118] mt-0.5 truncate">{session.browser || "Unknown"}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider">OS</span>
          <p className="text-[#111118] mt-0.5 truncate">{session.os || "Unknown"}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider">IP</span>
          <p className="text-[#111118] mt-0.5 font-mono truncate">
            {session.ipAddress || "Unknown"}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider">Login</span>
          <p className="text-[#111118] mt-0.5">
            {session.loggedInAt ? new Date(session.loggedInAt).toLocaleString() : "-"}
          </p>
        </div>
        {session.loggedOutAt && (
          <div className="col-span-2">
            <span className="text-[10px] uppercase tracking-wider">Logout</span>
            <p className="text-[#111118] mt-0.5">
              {new Date(session.loggedOutAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
      {session.userAgent && (
        <p className="text-[10px] text-[#999] mt-2 truncate">{session.userAgent}</p>
      )}
    </div>
  );
}

function EventsCard({ event }) {
  return (
    <div className="border border-black/[0.06] rounded-lg p-3 hover:bg-[#fafaf8] transition-all">
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#111118] mb-1">Event Type</p>
          <p className="text-sm font-medium text-[#185FA5] capitalize truncate">
            {event.type}
          </p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E6F1FB] text-[#0C447C] flex-shrink-0 whitespace-nowrap">
          {new Date(event.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="text-xs text-[#666] space-y-2 mt-2">
        {event.metadata?.device?.type && (
          <div className="flex justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider flex-shrink-0">Device</span>
            <span className="text-[#111118] truncate">{event.metadata.device.type}</span>
          </div>
        )}
        {event.metadata?.browser?.name && (
          <div className="flex justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider flex-shrink-0">Browser</span>
            <span className="text-[#111118] truncate">{event.metadata.browser.name}</span>
          </div>
        )}
        {event.metadata?.os?.name && (
          <div className="flex justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider flex-shrink-0">OS</span>
            <span className="text-[#111118] truncate">{event.metadata.os.name}</span>
          </div>
        )}
        {event.metadata?.ip && (
          <div className="flex justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider flex-shrink-0">IP</span>
            <span className="text-[#111118] font-mono truncate">{event.metadata.ip}</span>
          </div>
        )}
        {!event.metadata && (
          <p className="text-[#bbb] text-xs">No metadata available</p>
        )}
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [listingsBookings, setListingsBookings] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [userSession, setUserSession] = useState([]);
  const [userEvents, setUserEvents] = useState([]);

  const isSuperAdmin = currentUser?.role === "super_admin";
  const tabs = [
    { key: "info", label: "Account Info" },
    { key: "listings", label: `Listings (${userListings.length})` },
    { key: "bookings", label: `Bookings (${userBookings.length + listingsBookings.length})` },
    { key: "session", label: `Session (${userSession.length})` },
    { key: "events", label: `Events (${userEvents.length})` },
  ];

  useEffect(() => { fetchCurrentUser(); }, []);
  useEffect(() => { if (currentUser) fetchTargetUser(); }, [currentUser, userId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await authFetch("/api/auth/me");
      if (!res) return;
      const data = await res.json();
      if (!res.ok || !["admin", "super_admin"].includes(data.user.role)) {
        router.push("/");
        return;
      }
      setCurrentUser(data.user);
    } catch {
      router.push("/login");
    }
  };

  const fetchTargetUser = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/admin/users/${userId}`);
      if (!res) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTargetUser(data.user);
      setForm({
        name: data.user.name,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
        role: data.user.role,
        status: data.user.status,
        statusReason: data.user.statusReason || "",
      });
      await fetchUserListings();
      await fetchUserBookings();
      await fetchUserSession();
      await fetchUserEvents();
    } catch (err) {
      showNotification(err.message || "Failed to load user", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserListings = async () => {
    try {
      const res = await authFetch(`/api/admin/users/${userId}/listings`);
      if (res && res.ok) {
        const data = await res.json();
        setUserListings(data.listings || []);
      }
    } catch (err) { console.error(err); }
  };

  const fetchUserBookings = async () => {
    try {
      const res = await authFetch(`/api/admin/users/${userId}/bookings`);
      if (res && res.ok) {
        const data = await res.json();
        setUserBookings(data.bookingsAsGuest || []);
        setListingsBookings(data.bookingsAsHost || []);
      }
    } catch (err) { console.error(err); }
  };

  const fetchUserSession = async () => {
    try {
      const res = await authFetch(`/api/admin/users/${userId}/session`);
      if (res && res.ok) {
        const data = await res.json();
        setUserSession(data.sessions || []);
      }
    } catch (err) { console.error(err); }
  };

  const fetchUserEvents = async () => {
    try {
      const res = await authFetch(`/api/admin/users/${userId}/events`);
      if (res && res.ok) {
        const data = await res.json();
        setUserEvents(data.events || []);
      }
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = isSuperAdmin
        ? { name: form.name, email: form.email, phoneNumber: form.phoneNumber, role: form.role, status: form.status, statusReason: form.statusReason }
        : { phoneNumber: form.phoneNumber, status: form.status, statusReason: form.statusReason };
      const res = await authFetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("User updated successfully", "success");
        setTargetUser((prev) => ({ ...prev, ...(data.user ?? updates) }));
        if (updates.status) await fetchUserListings();
      } else {
        showNotification(data.message || "Update failed", "error");
      }
    } catch {
      showNotification("Error saving changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${targetUser.name}? This will also delete all their listings and bookings. This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await authFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotification(`User deleted with ${data.deletedCount?.listings || 0} listings and associated bookings`, "success");
        setTimeout(() => router.push("/admin"), 1500);
      } else {
        showNotification(data.message, "error");
        setDeleting(false);
      }
    } catch {
      showNotification("Error deleting user", "error");
      setDeleting(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const fmt = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
      : null;

  if (!currentUser || loading) {
    return (
     <LoadingScreen />
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f6f2]">
        <p className="text-[#999] text-sm">User not found.</p>
        <Link href="/admin" className="text-xs text-[#185FA5] underline">← back to admin</Link>
      </div>
    );
  }

  const avi = getAvatarStyle(targetUser.name);
  const userInitials = targetUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const adminInitials = currentUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={toDisplayUrl(lightboxImg)}
            alt="ID document"
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-40 max-w-xs px-5 py-3 rounded-lg text-sm text-white bg-[#1a1a2e] border-l-4 ${
            notification.type === "success" ? "border-[#e8c547]" : "border-[#E24B4A]"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-[#1a1a2e] border-b border-[#e8c547]/20 px-4 sm:px-8 h-14 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Link
            href="/"
            style={{
              textDecoration: "none",
              fontFamily: "'Cairo','Tajawal',sans-serif",
              fontWeight: 500,
              fontSize: "24px",
              color: "#ffffff",
              letterSpacing: "1px",
              flexShrink: 0,
            }}
          >
            مر<span style={{ fontWeight: 700, color: "#e8c547" }}>حبا</span>
          </Link>
          <Link
            href="/admin"
            className="text-white/50 hover:text-white/80 text-xs transition-colors truncate"
          >
            ← back to users
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
            style={{ background: "#e8c547", color: "#1a1a2e" }}
          >
            {adminInitials}
          </div>
          <span className="hidden sm:block text-xs text-white/70 truncate max-w-[100px]">
            {currentUser.name}
          </span>
          <span className="hidden sm:inline text-[10px] text-[#e8c547] bg-[#e8c547]/10 border border-[#e8c547]/25 px-2 py-0.5 rounded-full">
            {currentUser.role}
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Profile header */}
        <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-6 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-base sm:text-lg font-medium flex-shrink-0"
              style={{ background: avi.bg, color: avi.color }}
            >
              {userInitials}
            </div>
            <div className="min-w-0">
              <h1 className="font-serif italic font-light text-xl sm:text-2xl text-[#111118] leading-tight truncate">
                {targetUser.name}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <RoleBadge role={targetUser.role} />
                <StatusBadge status={targetUser.status} />
                <span className="text-[11px] text-[#bbb]">#{targetUser._id?.slice(-8)}</span>
              </div>
            </div>
          </div>

          {isSuperAdmin && targetUser.role !== "super_admin" && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="self-start sm:self-auto text-xs text-[#A32D2D] border border-[#A32D2D]/20 px-4 py-2 rounded-md hover:bg-[#FCEBEB] transition-all disabled:opacity-50 flex-shrink-0 whitespace-nowrap"
            >
              {deleting ? "deleting..." : "delete user"}
            </button>
          )}
        </div>

        {/* Tabs — scrollable on mobile */}
        <div className="border-b border-black/[0.06] mb-6 overflow-x-auto">
          <div className="flex gap-0 min-w-max sm:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-[#185FA5] border-b-2 border-[#185FA5]"
                    : "text-[#666] hover:text-[#111118]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Info Tab ── */}
        {activeTab === "info" && (
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">
            {/* Left column */}
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-5">
                <SectionTitle>account info</SectionTitle>
                <InfoRow label="User ID" value={targetUser._id} mono />
                <InfoRow label="Created" value={fmt(targetUser.createdAt)} />
                <InfoRow label="Last active" value={fmt(targetUser.lastActive)} />
                <InfoRow label="Email verified" value={targetUser.emailVerified ? "Yes" : "No"} />
              </div>

              {targetUser.role === "host" && (
                <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-5">
                  <SectionTitle>host details</SectionTitle>
                  <InfoRow label="Rating" value={targetUser.hostDetails?.rating?.toFixed(1) ?? "0.0"} />
                  <InfoRow label="Listings" value={targetUser.hostDetails?.totalListings ?? 0} />
                  <InfoRow label="Verified" value={targetUser.hostDetails?.verified ? "Yes" : "No"} />
                  <InfoRow label="Joined" value={fmt(targetUser.hostDetails?.joinedDate)} />
                  <InfoRow label="Confirmed" value={fmt(targetUser.hostDetails?.confirmedAt)} />
                  <InfoRow label="Expires" value={fmt(targetUser.hostExpiryDate)} />
                  <InfoRow label="Status reason" value={targetUser.statusReason} />
                </div>
              )}

              <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-5">
                <SectionTitle>user details</SectionTitle>
                <InfoRow label="Member since" value={fmt(targetUser.userDetails?.memberSince)} />
                <InfoRow label="Bookings made" value={userBookings.length} />
                <InfoRow label="Listings" value={userListings.length} />
              </div>
            </div>

            {/* Right columns */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              {/* Edit form */}
              <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-6">
                <SectionTitle>edit user</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="full name">
                    <input
                      className={inputCls}
                      value={form.name ?? ""}
                      onChange={set("name")}
                      disabled={!isSuperAdmin}
                    />
                  </Field>
                  <Field label="email">
                    <input
                      type="email"
                      className={inputCls}
                      value={form.email ?? ""}
                      onChange={set("email")}
                      disabled={!isSuperAdmin}
                    />
                  </Field>
                  <Field label="phone number">
                    <input
                      type="tel"
                      className={inputCls}
                      value={form.phoneNumber ?? ""}
                      onChange={set("phoneNumber")}
                    />
                  </Field>
                  <Field label="status">
                    <select
                      className={inputCls}
                      value={form.status ?? ""}
                      onChange={set("status")}
                    >
                      {targetUser?.role === "host" ? (
                        <>
                          <option value="confirmed">Confirmed — starts 6-month timer</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                        </>
                      ) : (
                        <>
                          <option value="confirmed">Confirmed</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                        </>
                      )}
                    </select>
                    {targetUser?.role === "host" && form.status === "confirmed" && (
                      <p className="text-[11px] text-[#27500A] mt-1">⏱️ 6-month timer starts now.</p>
                    )}
                    {targetUser?.role === "host" && form.status === "pending" && (
                      <p className="text-[11px] text-[#633806] mt-1">⚠️ Pending hosts need to upload ID documents.</p>
                    )}
                    {form.status === "suspended" && (
                      <p className="text-[11px] text-[#791F1F] mt-1">⚠️ Suspended users cannot log in or make bookings.</p>
                    )}
                    {targetUser?.role !== "host" && form.status === "pending" && (
                      <p className="text-[11px] text-[#633806] mt-1">⏳ User is awaiting confirmation.</p>
                    )}
                  </Field>
                  <Field label="status reason (optional)">
                    <input
                      className={inputCls}
                      value={form.statusReason ?? ""}
                      onChange={set("statusReason")}
                      placeholder="e.g. expired, violation..."
                    />
                  </Field>
                </div>

                {!isSuperAdmin && (
                  <p className="text-[11px] text-[#bbb] mt-4 leading-relaxed">
                    As an admin you can update phone number and status. Super admins can edit all fields.
                  </p>
                )}

                <div className="flex justify-end mt-5">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#1a1a2e] text-[#e8c547] text-xs px-5 sm:px-6 py-2.5 rounded-md hover:bg-[#16213e] disabled:opacity-50 transition-all"
                  >
                    {saving ? "saving..." : "save changes"}
                  </button>
                </div>
              </div>

              {/* ID Images */}
              <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-6">
                <SectionTitle>
                  id documents
                  <span className="text-sm not-italic font-normal text-[#999]">
                    ({targetUser.idImages?.length ?? 0})
                  </span>
                </SectionTitle>

                {!targetUser.idImages?.length ? (
                  <div className="flex items-center justify-center py-10 text-[#bbb] text-sm">
                    No ID documents uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {targetUser.idImages.map((url, i) => {
                      const isPdf = url.toLowerCase().includes(".pdf") || url.includes("/raw/");
                      return isPdf ? (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center gap-2 border border-black/10 rounded-lg p-4 sm:p-6 text-center hover:bg-[#fafaf8] transition-all"
                        >
                          <span className="text-3xl">📄</span>
                          <span className="text-[11px] text-[#185FA5]">PDF — open</span>
                        </a>
                      ) : (
                        <div key={i} className="relative group rounded-lg overflow-hidden border border-black/10">
                          <img
                            src={toDisplayUrl(url)}
                            alt={`ID doc ${i + 1}`}
                            className="w-full h-28 sm:h-32 object-cover cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.02]"
                            onClick={() => setLightboxImg(url)}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all pointer-events-none rounded-lg" />
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 text-[10px] bg-white/90 px-2 py-1 rounded text-[#185FA5] transition-all"
                          >
                            open ↗
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Listings Tab ── */}
        {activeTab === "listings" && (
          <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-6">
            <SectionTitle>
              user's listings
              <span className="text-sm not-italic font-normal text-[#999]">({userListings.length})</span>
            </SectionTitle>
            {userListings.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-[#bbb] text-sm">
                This user has no listings yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Bookings Tab ── */}
        {activeTab === "bookings" && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-6">
              <SectionTitle>
                bookings made by this user
                <span className="text-sm not-italic font-normal text-[#999]">({userBookings.length})</span>
              </SectionTitle>
              {userBookings.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-[#bbb] text-sm">
                  This user hasn't made any bookings yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userBookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} type="guest" />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-6">
              <SectionTitle>
                bookings on user's listings
                <span className="text-sm not-italic font-normal text-[#999]">({listingsBookings.length})</span>
              </SectionTitle>
              {listingsBookings.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-[#bbb] text-sm">
                  No bookings have been made on this user's listings yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listingsBookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} type="host" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Session Tab ── */}
        {activeTab === "session" && (
          <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-6">
            <SectionTitle>
              user sessions
              <span className="text-sm not-italic font-normal text-[#999]">({userSession.length})</span>
            </SectionTitle>
            {userSession.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-[#bbb] text-sm">
                This user has no sessions yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userSession.map((session) => (
                  <SessionCard key={session._id} session={session} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Events Tab ── */}
        {activeTab === "events" && (
          <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-6">
            <SectionTitle>
              user events
              <span className="text-sm not-italic font-normal text-[#999]">({userEvents.length})</span>
            </SectionTitle>
            {userEvents.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-[#bbb] text-sm">
                This user has no events yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userEvents.map((event) => (
                  <EventsCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}