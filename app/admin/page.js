"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const getAuthToken = () => localStorage.getItem("marhabaToken");

const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem("marhabaToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return null;
  }
  return response;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState([]);
  const [usersByRole, setUsersByRole] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => { fetchCurrentUser(); }, []);

  useEffect(() => {
    if (currentUser && ["admin", "super_admin"].includes(currentUser.role)) {
      fetchStats();
      fetchUsers();
    }
  }, [currentUser, activeTab]);

  const fetchCurrentUser = async () => {
    try {
      const res = await authFetch("/api/auth/me");
      if (!res) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCurrentUser(data.user);
      if (!["admin", "super_admin"].includes(data.user.role)) router.push("/");
    } catch {
      router.push("/login");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await authFetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const roleParam = activeTab !== "all" ? `?role=${activeTab}` : "";
      const res = await authFetch(`/api/admin/users${roleParam}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setUsersByRole(data.usersByRole);
      }
    } catch {
      showNotification("Error fetching users", "error");
    }
    setLoading(false);
  };

  const handleCreateAdmin = async (formData) => {
    try {
      const res = await authFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message, "success");
        setShowAddModal(false);
        fetchUsers();
        fetchStats();
      } else {
        showNotification(data.message, "error");
      }
    } catch {
      showNotification("Error creating admin", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("marhabaToken");
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpiry");
      router.push("/login");
    } catch (e) { console.error(e); }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getDisplayUsers = () => {
    if (activeTab === "all") return users;
    if (activeTab === "user") return usersByRole.users || [];
    if (activeTab === "host") return usersByRole.hosts || [];
    if (activeTab === "admin") return usersByRole.admins || [];
    if (activeTab === "super_admin") return usersByRole.super_admins || [];
    return [];
  };

  const displayUsers = getDisplayUsers();

  const TABS = [
    { id: "all", label: "all users" },
    { id: "user", label: "regular users" },
    { id: "host", label: "hosts" },
    { id: "admin", label: "admins" },
    { id: "super_admin", label: "super admins" },
  ];

  const STAT_CONFIG = [
    { key: "totalUsers", label: "total users", accent: "#378ADD" },
    { key: "totalHosts", label: "total hosts", accent: "#639922" },
    { key: "totalAdmins", label: "total admins", accent: "#7F77DD" },
    { key: "totalSuperAdmins", label: "super admins", accent: "#e8c547" },
    { key: "totalListings", label: "total listings", accent: "#1D9E75" },
    { key: "totalBookings", label: "total bookings", accent: "#D4537E" },
    { key: "pendingHosts", label: "pending hosts", accent: "#BA7517" },
    { key: "totalRevenue", label: "revenue", accent: "#D85A30", format: (v) => `$${v?.toLocaleString()}` },
  ];

  const AVATAR_PALETTE = [
    { bg: "#EEEDFE", color: "#3C3489" },
    { bg: "#E6F1FB", color: "#0C447C" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FAEEDA", color: "#633806" },
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#FBEAF0", color: "#72243E" },
  ];

  const getAvatarStyle = (name) =>
    AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];

  const roleBadge = (role) => {
    const map = {
      super_admin: { cls: "bg-[#EEEDFE] text-[#3C3489]", label: "super admin" },
      admin: { cls: "bg-[#E6F1FB] text-[#0C447C]", label: "admin" },
      host: { cls: "bg-[#EAF3DE] text-[#27500A]", label: "host" },
      user: { cls: "bg-[#F1EFE8] text-[#444441]", label: "user" },
    };
    const cfg = map[role] || map.user;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${cfg.cls}`}>
        {cfg.label}
      </span>
    );
  };

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

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f6f2]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a1a2e] border-t-transparent" />
      </div>
    );
  }

  const initials = currentUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,300;0,500;1,300&display=swap');
        body { font-family: 'DM Mono', monospace; }
        .font-display { font-family: 'Fraunces', serif; }
        .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--accent-color); }
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .notif-animate { animation: slideIn 0.2s ease; }
        .user-name-link { color: #111118; text-decoration: none; font-weight: 500; font-size: 13px; transition: color 0.15s; }
        .user-name-link:hover { color: #185FA5; text-decoration: underline; }
      `}</style>

      <div className="min-h-screen bg-[#f7f6f2]">
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg text-sm text-white notif-animate bg-[#1a1a2e] border-l-4 ${notification.type === "success" ? "border-[#e8c547]" : "border-[#E24B4A]"}`}>
            {notification.message}
          </div>
        )}

        {/* Navbar */}
        <nav className="bg-[#1a1a2e] border-b border-[#e8c547]/20 px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
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
            <div className="flex gap-0.5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-md text-xs transition-all ${
                    activeTab === tab.id
                      ? "text-[#e8c547] bg-[#e8c547]/10"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: "#e8c547", color: "#1a1a2e" }}>
              {initials}
            </div>
            <div className="text-xs text-white/70">{currentUser.name}</div>
            <span className="text-[10px] text-[#e8c547] bg-[#e8c547]/10 border border-[#e8c547]/25 px-2 py-0.5 rounded-full">
              {currentUser.role}
            </span>
            <button onClick={handleLogout} className="text-xs text-white/40 border border-white/10 px-3 py-1 rounded hover:border-red-400/50 hover:text-red-400 transition-all">
              logout
            </button>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-3 mb-8">
              {STAT_CONFIG.map((s) => (
                <div key={s.key} className="stat-card bg-white rounded-xl p-5 relative overflow-hidden border border-black/[0.06]" style={{ "--accent-color": s.accent }}>
                  <div className="font-display italic font-light text-3xl text-[#111118] leading-none mb-1">
                    {s.format ? s.format(stats[s.key]) : stats[s.key]}
                  </div>
                  <div className="text-[11px] uppercase tracking-widest text-[#999]">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <div className="font-display italic font-light text-lg text-[#111118]">
              {TABS.find((t) => t.id === activeTab)?.label}
              <span className="ml-2 text-sm not-italic font-normal text-[#999]">({displayUsers.length})</span>
            </div>
            {currentUser.role === "super_admin" && (
              <button onClick={() => setShowAddModal(true)} className="bg-[#1a1a2e] text-[#e8c547] text-xs px-4 py-2 rounded-md hover:bg-[#16213e] transition-all flex items-center gap-1.5">
                + add admin
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#1a1a2e] border-t-transparent" />
              </div>
            ) : displayUsers.length === 0 ? (
              <div className="p-12 text-center text-[#999] text-sm">no users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-[#fafaf8]">
                      {["user", "contact", "role", "status", "joined", "id docs", "actions"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-[#999] font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayUsers.map((user) => {
                      const avi = getAvatarStyle(user.name);
                      const userInitials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                      return (
                        <tr key={user._id} className="border-b border-black/[0.04] hover:bg-[#fafaf8] transition-colors last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0" style={{ background: avi.bg, color: avi.color }}>
                                {userInitials}
                              </div>
                              <div>
                                {/* Clickable name → detail page */}
                                <Link href={`/admin/user/${user._id}`} className="user-name-link">
                                  {user.name}
                                </Link>
                                <div className="text-[11px] text-[#999]">#{user._id.slice(-6)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-[13px] text-[#111118]">{user.email}</div>
                            <div className="text-[11px] text-[#999]">{user.phoneNumber}</div>
                          </td>
                          <td className="px-4 py-3">{roleBadge(user.role)}</td>
                          <td className="px-4 py-3">{statusBadge(user.status)}</td>
                          <td className="px-4 py-3 text-[12px] text-[#666]">
                            {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          {/* ID docs count */}
                          <td className="px-4 py-3">
                            {user.idImages?.length > 0 ? (
                              <span className="text-[11px] bg-[#EAF3DE] text-[#27500A] px-2.5 py-0.5 rounded-full font-medium">
                                {user.idImages.length} uploaded
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#bbb]">none</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {/* View button → same detail page */}
                            <Link
                              href={`/admin/user/${user._id}`}
                              className="text-[11px] text-[#185FA5] border border-[#185FA5]/25 px-3 py-1 rounded hover:bg-[#E6F1FB] transition-all inline-block"
                            >
                              view
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {showAddModal && (
        <AdminModal onClose={() => setShowAddModal(false)} onSave={handleCreateAdmin} isSuperAdmin={currentUser.role === "super_admin"} />
      )}
    </>
  );
}

/* ─── Shared modal wrapper ─── */
function ModalShell({ title, onClose, onSubmit, loading, submitLabel, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl border border-black/[0.06] p-8 w-[440px] max-w-[90vw]">
        <div className="font-display italic font-light text-xl text-[#111118] mb-6">{title}</div>
        <form onSubmit={onSubmit}>
          <div className="space-y-4">{children}</div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="text-xs px-4 py-2 border border-black/10 rounded-md text-[#555] hover:bg-gray-50 transition-all">cancel</button>
            <button type="submit" disabled={loading} className="text-xs px-4 py-2 bg-[#1a1a2e] text-[#e8c547] rounded-md hover:bg-[#16213e] disabled:opacity-50 transition-all">
              {loading ? "saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-[#999] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 bg-[#fafaf8] border border-black/10 rounded-md text-[13px] text-[#111118] font-[inherit] outline-none focus:border-[#185FA5] focus:bg-white transition-all";

function AdminModal({ onClose, onSave, isSuperAdmin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", phoneNumber: "", role: "admin" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <ModalShell title="Add new admin" onClose={onClose} onSubmit={handleSubmit} loading={loading} submitLabel="create">
      <Field label="full name"><input required className={inputCls} value={form.name} onChange={set("name")} placeholder="Jane Smith" /></Field>
      <Field label="email"><input required type="email" className={inputCls} value={form.email} onChange={set("email")} placeholder="jane@example.com" /></Field>
      <Field label="password"><input required type="password" minLength={6} className={inputCls} value={form.password} onChange={set("password")} placeholder="min 6 characters" /></Field>
      <Field label="phone number"><input required type="tel" className={inputCls} value={form.phoneNumber} onChange={set("phoneNumber")} placeholder="+1 555 000 0000" /></Field>
      {isSuperAdmin && (
        <Field label="role">
          <select className={inputCls} value={form.role} onChange={set("role")}>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </Field>
      )}
    </ModalShell>
  );
}