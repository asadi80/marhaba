"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar({ NAV_LINKS, user, onTabChange, ini, lang, toggleLanguage, defaultActiveId }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [activeTab, setActiveTab] = useState(defaultActiveId || NAV_LINKS?.[0]?.id || "");
  const router = useRouter();
  const isAr = lang === "ar";

  const getAvatarStyle = (name) => {
    const AVATAR_PAL = [
      { bg: "#EEEDFE", c: "#3C3489" },
      { bg: "#E6F1FB", c: "#0C447C" },
      { bg: "#EAF3DE", c: "#27500A" },
      { bg: "#FAEEDA", c: "#633806" },
      { bg: "#E1F5EE", c: "#085041" },
      { bg: "#FBEAF0", c: "#72243E" },
    ];
    return AVATAR_PAL[(name?.charCodeAt(0) ?? 0) % AVATAR_PAL.length];
  };

  const { bg: aviBg, c: aviColor } = getAvatarStyle(user?.name);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

const handleTabClick = (tab) => {
  if (tab.href) {
    router.push(tab.href);
    setMobileMenuOpen(false);
    return;
  }
  setActiveTab(tab.id);
  onTabChange?.(tab.id);
  setMobileMenuOpen(false);
};

  const roleLabel = user?.role === "host"
    ? isAr ? "مضيف" : "Host"
    : user?.role === "admin"
    ? isAr ? "مدير" : "Admin"
    : isAr ? "مستخدم" : "Guest";

  return (
    <nav className="bg-[#1a1a2e] border-b border-[rgba(232,197,71,.15)] sticky top-0 z-40">
      <div className="px-4 h-14 flex items-center justify-between gap-5">
        {/* Logo */}
        <Link
          href="/"
          className="font-['Cairo','Tajawal',sans-serif] font-medium text-[26px] text-white tracking-[1px] flex-shrink-0 no-underline"
        >
          مر<span className="font-bold text-[#e8c547]">حبا</span>
        </Link>

        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-0.5 flex-1">
          {NAV_LINKS?.map((tab) => (
            <button
              key={tab.id || tab.href}
              onClick={() => handleTabClick(tab)}
              className={`px-3 py-1.5 rounded-md text-[11px] whitespace-nowrap transition-all flex-shrink-0 cursor-pointer bg-transparent border-none ${
                activeTab === tab.id
                  ? "bg-[rgba(232,197,71,.1)] text-[#e8c547]"
                  : "text-white/45 hover:text-white/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="bg-[rgba(232,197,71,.15)] border border-[rgba(232,197,71,.3)] rounded-md px-2.5 py-1 text-[11px] cursor-pointer text-[#e8c547]"
          >
            {isAr ? "🇬🇧" : "🇱🇾"}
          </button>

          {/* Avatar */}
          {/* <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
            style={{ background: aviBg, color: aviColor }}
          >
            {ini}
          </div> */}

          {/* User name + role badge — hidden on mobile */}
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-[10px] text-[#e8c547] bg-[#e8c547]/10 border border-[#e8c547]/25 px-2 py-0.5 rounded-full">{user?.name}</span>
            <span className="text-[10px] text-[#e8c547] bg-[#e8c547]/10 border border-[#e8c547]/25 px-2 py-0.5 rounded-full">
              {roleLabel}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="border border-[#e8c547] rounded-md px-2.5 py-1 text-[11px] cursor-pointer text-[#e8c547] bg-transparent hover:border-red-400/50 hover:text-red-400/90 transition-colors"
          >
            {isAr ? "خروج" : "Logout"}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#e8c547] text-2xl p-1 bg-transparent border-none cursor-pointer"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden flex flex-col border-t border-[rgba(232,197,71,.1)] bg-[#1a1a2e]">
          {NAV_LINKS?.map((tab) => (
            <button
              key={tab.id || tab.href}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-3 text-left text-sm w-full bg-transparent border-none cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[rgba(232,197,71,.1)] text-[#e8c547]"
                  : "text-white/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {/* Mobile user info */}
          <div className="px-4 py-3 border-t border-[rgba(232,197,71,.1)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#e8c547] bg-[#e8c547]/10 border border-[#e8c547]/25 px-2 py-0.5 rounded-full">{user?.name}</span>
              <span className="text-[10px] text-[#e8c547] bg-[#e8c547]/10 border border-[#e8c547]/25 px-2 py-0.5 rounded-full">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}