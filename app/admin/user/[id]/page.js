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

const selectCls =
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
    <div className="font-display italic font-light text-lg text-[#111118] mb-4 pb-2 border-b border-black/[0.06]">
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-black/[0.04] last:border-0">
      <span className="text-[11px] uppercase tracking-widest text-[#999] flex-shrink-0 w-40">{label}</span>
      <span className={`text-[13px] text-[#111118] text-right ${mono ? "font-mono" : ""}`}>
        {value ?? <span className="text-[#ccc]">—</span>}
      </span>
    </div>
  );
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [currentUser, setCurrentUser] = useState(null);   // the logged-in admin
  const [targetUser, setTargetUser] = useState(null);     // the user being viewed
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
      // Seed form with current values
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
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build the update payload based on role permissions
      const updates = isSuperAdmin
        ? {
            name: form.name,
            email: form.email,
            phoneNumber: form.phoneNumber,
            role: form.role,
            status: form.status,
            statusReason: form.statusReason,
          }
        : {
            // Regular admin: only status + phone
            phoneNumber: form.phoneNumber,
            status: form.status,
            statusReason: form.statusReason,
          };

      const res = await authFetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("User updated successfully", "success");
        setTargetUser(data.user ?? { ...targetUser, ...updates });
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

  const statusBadge = (status) => {
    const map = {
      confirmed: "bg-[#EAF3DE] text-[#27500A]",
      pending: "bg-[#FAEEDA] text-[#633806]",
      suspended: "bg-[#FCEBEB] text-[#791F1F]",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${map[status] || "bg-gray-100 text-gray-700"}`}>
        {status}
      </span>
    );
  };

  const roleBadge = (role) => {
    const map = {
      super_admin: "bg-[#EEEDFE] text-[#3C3489]",
      admin: "bg-[#E6F1FB] text-[#0C447C]",
      host: "bg-[#EAF3DE] text-[#27500A]",
      user: "bg-[#F1EFE8] text-[#444441]",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${map[role] || "bg-gray-100 text-gray-700"}`}>
        {role?.replace("_", " ")}
      </span>
    );
  };

  // ── Loading ──
  if (!currentUser || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a1a2e] border-t-transparent" />
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2] flex-col gap-4">
        <p className="text-[#999] text-sm">User not found.</p>
        <Link href="/admin" className="text-xs text-[#185FA5] underline">← back to admin</Link>
      </div>
    );
  }

  const avi = getAvatarStyle(targetUser.name);
  const userInitials = targetUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const adminInitials = currentUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,500;1,300&display=swap');
        body { font-family: 'DM Mono', monospace; }
        .font-display { font-family: 'Fraunces', serif; }
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .notif-animate { animation: slideIn 0.2s ease; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .fade-in { animation: fadeIn 0.3s ease; }
        .id-img { cursor: zoom-in; transition: transform 0.2s, box-shadow 0.2s; border-radius: 8px; }
        .id-img:hover { transform: scale(1.02); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
      `}</style>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 fade-in"
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
            className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      <div className="min-h-screen bg-[#f7f6f2]">
        {notification && (
          <div className={`fixed top-4 right-4 z-40 px-5 py-3 rounded-lg text-sm text-white notif-animate bg-[#1a1a2e] border-l-4 ${notification.type === "success" ? "border-[#e8c547]" : "border-[#E24B4A]"}`}>
            {notification.message}
          </div>
        )}

        {/* Navbar — same as admin dashboard */}
        <nav className="bg-[#1a1a2e] border-b border-[#e8c547]/20 px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="font-display italic font-light text-xl text-white tracking-tight">
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

            </div>
            <Link href="/admin" className="text-white/50 hover:text-white/80 text-xs transition-colors">
              ← back to users
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: "#e8c547", color: "#1a1a2e" }}>
              {adminInitials}
            </div>
            <div className="text-xs text-white/70">{currentUser.name}</div>
            <span className="text-[10px] text-[#e8c547] bg-[#e8c547]/10 border border-[#e8c547]/25 px-2 py-0.5 rounded-full">
              {currentUser.role}
            </span>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-6 py-8 fade-in">
          {/* Profile header */}
          <div className="bg-white rounded-xl border border-black/[0.06] p-6 mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-medium flex-shrink-0" style={{ background: avi.bg, color: avi.color }}>
                {userInitials}
              </div>
              <div>
                <div className="font-display italic font-light text-2xl text-[#111118] leading-tight">
                  {targetUser.name}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  {roleBadge(targetUser.role)}
                  {statusBadge(targetUser.status)}
                  <span className="text-[11px] text-[#bbb]">#{targetUser._id?.slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Super admin: delete button */}
            {isSuperAdmin && targetUser.role !== "super_admin" && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-[#A32D2D] border border-[#A32D2D]/20 px-4 py-2 rounded-md hover:bg-[#FCEBEB] transition-all disabled:opacity-50"
              >
                {deleting ? "deleting..." : "delete user"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* LEFT: read-only info */}
            <div className="col-span-1 space-y-6">
              {/* Core info */}
              <div className="bg-white rounded-xl border border-black/[0.06] p-5">
                <SectionTitle>account info</SectionTitle>
                <InfoRow label="User ID" value={targetUser._id} mono />
                <InfoRow label="Created" value={new Date(targetUser.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })} />
                <InfoRow label="Last active" value={targetUser.lastActive ? new Date(targetUser.lastActive).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : null} />
                <InfoRow label="Email verified" value={targetUser.emailVerified ? "Yes" : "No"} />
              </div>

              {/* Host details (only for hosts) */}
              {targetUser.role === "host" && (
                <div className="bg-white rounded-xl border border-black/[0.06] p-5">
                  <SectionTitle>host details</SectionTitle>
                  <InfoRow label="Rating" value={targetUser.hostDetails?.rating?.toFixed(1) ?? "0.0"} />
                  <InfoRow label="Total listings" value={targetUser.hostDetails?.totalListings ?? 0} />
                  <InfoRow label="Verified" value={targetUser.hostDetails?.verified ? "Yes" : "No"} />
                  <InfoRow label="Joined date" value={targetUser.hostDetails?.joinedDate ? new Date(targetUser.hostDetails.joinedDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : null} />
                  <InfoRow label="Confirmed at" value={targetUser.hostDetails?.confirmedAt ? new Date(targetUser.hostDetails.confirmedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : null} />
                  <InfoRow
                    label="Expiry date"
                    value={targetUser.hostExpiryDate ? new Date(targetUser.hostExpiryDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : null}
                  />
                  <InfoRow label="Status reason" value={targetUser.statusReason} />
                  <InfoRow label="Notif (1wk)" value={targetUser.hostDetails?.notificationSent?.oneWeek ? "Sent" : "Not sent"} />
                  <InfoRow label="Notif (2d)" value={targetUser.hostDetails?.notificationSent?.twoDays ? "Sent" : "Not sent"} />
                </div>
              )}

              {/* User details */}
              <div className="bg-white rounded-xl border border-black/[0.06] p-5">
                <SectionTitle>user details</SectionTitle>
                <InfoRow label="Member since" value={targetUser.userDetails?.memberSince ? new Date(targetUser.userDetails.memberSince).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : null} />
                <InfoRow label="Bookings" value={targetUser.userDetails?.bookings?.length ?? 0} />
              </div>
            </div>

            {/* RIGHT: editable fields + ID images */}
            <div className="col-span-2 space-y-6">
              {/* Editable form */}
              <div className="bg-white rounded-xl border border-black/[0.06] p-6">
                <SectionTitle>edit user</SectionTitle>

                <div className="grid grid-cols-2 gap-4">
                  {/* Name — super admin only */}
                  <Field label="full name">
                    <input
                      className={inputCls}
                      value={form.name ?? ""}
                      onChange={set("name")}
                      disabled={!isSuperAdmin}
                    />
                  </Field>

                  {/* Email — super admin only */}
                  <Field label="email">
                    <input
                      type="email"
                      className={inputCls}
                      value={form.email ?? ""}
                      onChange={set("email")}
                      disabled={!isSuperAdmin}
                    />
                  </Field>

                  {/* Phone — both admin and super admin */}
                  <Field label="phone number">
                    <input
                      type="tel"
                      className={inputCls}
                      value={form.phoneNumber ?? ""}
                      onChange={set("phoneNumber")}
                    />
                  </Field>

                  {/* Role — super admin only */}
                  <Field label="role">
                    <select
                      className={selectCls}
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

                  {/* Status — both admin and super admin */}
                  <Field label="status">
                    <select className={selectCls} value={form.status ?? ""} onChange={set("status")}>
                      <option value="confirmed">Confirmed — starts 6-month timer</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </Field>

                  {/* Status reason — both */}
                  <Field label="status reason (optional)">
                    <input
                      className={inputCls}
                      value={form.statusReason ?? ""}
                      onChange={set("statusReason")}
                      placeholder="e.g. expired, violation..."
                    />
                  </Field>
                </div>

                {/* Permission note for regular admin */}
                {!isSuperAdmin && (
                  <p className="text-[11px] text-[#bbb] mt-4">
                    As an admin you can update phone number and status. Super admins can edit all fields.
                  </p>
                )}

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#1a1a2e] text-[#e8c547] text-xs px-6 py-2.5 rounded-md hover:bg-[#16213e] disabled:opacity-50 transition-all"
                  >
                    {saving ? "saving..." : "save changes"}
                  </button>
                </div>
              </div>

              {/* ID Images */}
              <div className="bg-white rounded-xl border border-black/[0.06] p-6">
                <SectionTitle>
                  id documents
                  <span className="ml-2 text-sm not-italic font-normal text-[#999]">
                    ({targetUser.idImages?.length ?? 0})
                  </span>
                </SectionTitle>

                {!targetUser.idImages?.length ? (
                  <div className="text-center py-10 text-[#bbb] text-sm">
                    No ID documents uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {targetUser.idImages.map((url, i) => {
                      const isPdf = url.toLowerCase().includes(".pdf") || url.includes("/raw/");
                      return isPdf ? (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center gap-2 border border-black/10 rounded-lg p-6 text-center hover:bg-[#fafaf8] transition-all"
                        >
                          <span className="text-3xl">📄</span>
                          <span className="text-[11px] text-[#185FA5]">PDF — open</span>
                        </a>
                      ) : (
                        <div key={i} className="relative group">
                          <img
                            src={url}
                            alt={`ID doc ${i + 1}`}
                            className="id-img w-full h-32 object-cover border border-black/10"
                            onClick={() => setLightboxImg(url)}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg pointer-events-none" />
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
    </>
  );
}