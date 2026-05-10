"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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

// Avatar palette — kept as JS data, applied via inline style only on the circle element
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

// ── Shared input classes ──────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 bg-[#fafaf8] border border-black/10 rounded-md text-[13px] text-[#111118] font-[inherit] outline-none focus:border-[#185FA5] focus:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed";

// ── Small reusable components ─────────────────────────────────────────────────
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

// ── Badge helpers ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    confirmed: "bg-[#EAF3DE] text-[#27500A]",
    pending: "bg-[#FAEEDA] text-[#633806]",
    suspended: "bg-[#FCEBEB] text-[#791F1F]",
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);

  const isSuperAdmin = currentUser?.role === "super_admin";

  useEffect(() => { fetchCurrentUser(); }, []);
  useEffect(() => { if (currentUser) fetchTargetUser(); }, [currentUser, userId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await authFetch("/api/auth/me");
      if (!res) return;
      const data = await res.json();
      if (!res.ok || !["admin", "super_admin"].includes(data.user.role)) {
        router.push("/"); return;
      }
      setCurrentUser(data.user);
    } catch { router.push("/login"); }
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
    } catch (err) {
      showNotification(err.message || "Failed to load user", "error");
    } finally { setLoading(false); }
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
      } else {
        showNotification(data.message || "Update failed", "error");
      }
    } catch { showNotification("Error saving changes", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${targetUser.name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await authFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotification("User deleted", "success");
        setTimeout(() => router.push("/admin"), 1000);
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
      ? new Date(dateStr).toLocaleDateString("en-US", {
          day: "numeric", month: "short", year: "numeric",
        })
      : null;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!currentUser || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a1a2e] border-t-transparent" />
      </div>
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

      {/* ── Lightbox ── */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
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

      {/* ── Notification toast ── */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-40 px-5 py-3 rounded-lg text-sm text-white bg-[#1a1a2e] border-l-4 ${
            notification.type === "success" ? "border-[#e8c547]" : "border-[#E24B4A]"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className="bg-[#1a1a2e] border-b border-[#e8c547]/20 px-4 sm:px-8 h-14 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <span className="font-serif italic font-light text-xl text-white tracking-tight flex-shrink-0">
            mar<span className="not-italic font-medium text-[#e8c547]">haba</span>
          </span>
          <Link href="/admin" className="text-white/50 hover:text-white/80 text-xs transition-colors truncate">
            ← back to users
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Avatar circle — inline style for dynamic color only */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ background: "#e8c547", color: "#1a1a2e" }}
          >
            {adminInitials}
          </div>
          <span className="text-xs text-white/70 hidden sm:block">{currentUser.name}</span>
          <span className="text-[10px] text-[#e8c547] bg-[#e8c547]/10 border border-[#e8c547]/25 px-2 py-0.5 rounded-full hidden sm:inline">
            {currentUser.role}
          </span>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Profile header card */}
        <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-6 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-base sm:text-lg font-medium flex-shrink-0"
              style={{ background: avi.bg, color: avi.color }}
            >
              {userInitials}
            </div>
            <div>
              <h1 className="font-serif italic font-light text-xl sm:text-2xl text-[#111118] leading-tight">
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
              className="self-start sm:self-auto text-xs text-[#A32D2D] border border-[#A32D2D]/20 px-4 py-2 rounded-md hover:bg-[#FCEBEB] transition-all disabled:opacity-50 flex-shrink-0"
            >
              {deleting ? "deleting..." : "delete user"}
            </button>
          )}
        </div>

        {/* Responsive layout: single col → 3-col grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">

          {/* ── LEFT: read-only info panels ── */}
          <div className="flex flex-col gap-5">

            {/* Account info */}
            <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-5">
              <SectionTitle>account info</SectionTitle>
              <InfoRow label="User ID" value={targetUser._id} mono />
              <InfoRow label="Created" value={fmt(targetUser.createdAt)} />
              <InfoRow label="Last active" value={fmt(targetUser.lastActive)} />
              <InfoRow label="Email verified" value={targetUser.emailVerified ? "Yes" : "No"} />
            </div>

            {/* Host details — hosts only */}
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
                <InfoRow label="Notif 1wk" value={targetUser.hostDetails?.notificationSent?.oneWeek ? "Sent" : "Not sent"} />
                <InfoRow label="Notif 2d" value={targetUser.hostDetails?.notificationSent?.twoDays ? "Sent" : "Not sent"} />
              </div>
            )}

            {/* User details */}
            <div className="bg-white rounded-xl border border-black/[0.06] p-4 sm:p-5">
              <SectionTitle>user details</SectionTitle>
              <InfoRow label="Member since" value={fmt(targetUser.userDetails?.memberSince)} />
              <InfoRow label="Bookings" value={targetUser.userDetails?.bookings?.length ?? 0} />
            </div>
          </div>

          {/* ── RIGHT: editable form + ID images ── */}
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

                {/* Phone — editable by all admins */}
                <Field label="phone number">
                  <input
                    type="tel"
                    className={inputCls}
                    value={form.phoneNumber ?? ""}
                    onChange={set("phoneNumber")}
                  />
                </Field>

                <Field label="role">
                  <select
                    className={inputCls}
                    value={form.role ?? ""}
                    onChange={set("role")}
                    disabled={!isSuperAdmin || targetUser.role === "super_admin"}
                  >
                    <option value="user">User</option>
                    <option value="host">Host</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </Field>

                {/* Status — editable by all admins */}
                <Field label="status">
                  <select
                    className={inputCls}
                    value={form.status ?? ""}
                    onChange={set("status")}
                  >
                    <option value="confirmed">Confirmed — starts 6-month timer</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </Field>

                {/* Status reason — editable by all admins */}
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
                          src={url}
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
      </main>
    </div>
  );
}