'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';

export default function ListingsPage() {
  const router = useRouter();
  const { lang, t, toggleLanguage } = useLanguage();
  const isAr = lang === 'ar';
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [filters, setFilters] = useState({ location: '', minPrice: '', maxPrice: '' });

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      const res = await fetch(`/api/listings?${params}`);
      const data = await res.json();
      setListings(data.listings);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); fetchListings(); };

  const AVATAR_PAL = [
    { bg: 'bg-[#EEEDFE]', color: 'text-[#3C3489]' },
    { bg: 'bg-[#E6F1FB]', color: 'text-[#0C447C]' },
    { bg: 'bg-[#EAF3DE]', color: 'text-[#27500A]' },
    { bg: 'bg-[#FAEEDA]', color: 'text-[#633806]' },
    { bg: 'bg-[#E1F5EE]', color: 'text-[#085041]' },
    { bg: 'bg-[#FBEAF0]', color: 'text-[#72243E]' },
  ];
  const avi = (name) => AVATAR_PAL[(name?.charCodeAt(0) ?? 0) % AVATAR_PAL.length];

  const NAV_LINKS = [
    { href: '/dashboard', label: t.dashboard },
    { href: '/listings', label: t.browse, active: true },
  ];

  const inputClass =
    'w-full py-2.5 px-3 bg-[#fafaf8] border border-black/10 rounded-lg text-[13px] text-[#111118] font-[\'DM_Mono\',monospace] outline-none transition-all placeholder:text-[#c0bfbb] hover:border-black/18 focus:border-[#185FA5] focus:shadow-[0_0_0_3px_rgba(24,95,165,0.08)] focus:bg-white';

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2]" dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? "'Cairo', 'Tajawal', sans-serif" : "'DM Mono', monospace" }}>

      {/* NAV */}
      <nav className="bg-[#1a1a2e] border-b border-[#e8c547]/15 px-6 h-14 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/" className="no-underline font-['Cairo','Tajawal',sans-serif] font-medium text-[26px] text-white tracking-wide">
            مر<span className="font-bold text-[#e8c547]">حبا</span>
          </Link>
          <div className="hidden md:flex gap-0.5">
            {NAV_LINKS.map(({ href, label, active }) => (
              <Link
                key={href}
                href={href}
                className={`text-xs no-underline px-3 py-1.5 rounded-md transition-colors ${active ? 'text-white/90' : 'text-white/45 hover:text-white/90 hover:bg-white/[0.06]'}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={toggleLanguage}
            className="bg-[#e8c547]/15 border border-[#e8c547]/30 rounded-md px-2.5 py-1 text-[11px] cursor-pointer text-[#e8c547] font-[inherit]"
          >
            {lang === "en" ? "🇸🇦 عربي" : "🇬🇧 English"}
          </button>
          <Link href="/dashboard" className="text-xs text-white/45 no-underline">← {t.dashboard}</Link>
          <button
            onClick={handleLogout}
            className="bg-transparent border border-[#e8c547] rounded-md px-2.5 py-[5px] text-[11px] text-[#e8c547] cursor-pointer hover:border-[#e64949] transition-colors font-[inherit]"
          >
            {t.logout || "Logout"}
          </button>
        </div>

        {/* Hamburger */}
        <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden flex flex-col gap-1.5 bg-transparent border-none cursor-pointer p-1" aria-label="Menu">
          <span className={`block w-[18px] h-0.5 bg-white/60 rounded transition-transform ${mobileNavOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-[18px] h-0.5 bg-white/60 rounded transition-opacity ${mobileNavOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-[18px] h-0.5 bg-white/60 rounded transition-transform ${mobileNavOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile nav */}
      {mobileNavOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bg-[#1a1a2e] border-b border-[#e8c547]/12 px-6 py-4 z-40 flex flex-col gap-1">
          <button
            onClick={toggleLanguage}
            className="bg-[#e8c547]/15 border border-[#e8c547]/30 rounded-md px-3 py-2 text-[12px] cursor-pointer text-[#e8c547] font-[inherit] mb-2.5 w-full"
          >
            {lang === 'en' ? '🇸🇦 عربي' : '🇬🇧 English'}
          </button>
          <button
            onClick={handleLogout}
            className="bg-transparent border border-white/20 rounded-md px-3 py-2 text-[12px] text-white cursor-pointer font-[inherit] w-full"
          >
            {t.logout || "Logout"}
          </button>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileNavOpen(false)}
              className="text-[13px] text-white/60 no-underline py-2.5 border-b border-white/[0.06] last:border-b-0 block">
              {label}
            </Link>
          ))}
        </div>
      )}

      <main className="max-w-[1100px] mx-auto px-4 md:px-6 py-7">

        {/* HEADER */}
        <div className="mb-6 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="text-[10px] tracking-[0.12em] uppercase text-[#999] mb-1.5">{t.explore}</div>
          <h1 className="font-['Fraunces',serif] italic font-light text-[clamp(24px,4vw,36px)] text-[#111118] leading-tight">
            {t.browseListings}
          </h1>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white rounded-[14px] border border-black/7 border-t-[3px] border-t-[#e8c547] px-6 py-5 mb-6 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_0.07s_both]">
          <form onSubmit={handleSearch}>
            <div className="flex flex-wrap gap-2.5 items-end">

              {/* Location */}
              <div className="flex-[2_1_180px] min-w-0">
                <label className="block text-[10px] tracking-[0.09em] uppercase text-[#999] mb-1.5">{t.location}</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5c0 2.78 3.5 6.5 3.5 6.5s3.5-3.72 3.5-6.5C9.5 2.57 7.93 1 6 1zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="#bbb"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder={t.anywhere}
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className={`${inputClass} pl-7`}
                  />
                </div>
              </div>

              {/* Min price */}
              <div className="flex-[1_1_110px] min-w-0">
                <label className="block text-[10px] tracking-[0.09em] uppercase text-[#999] mb-1.5">{t.minPrice}</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#bbb] pointer-events-none">$</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className={`${inputClass} pl-[22px]`}
                  />
                </div>
              </div>

              {/* Max price */}
              <div className="flex-[1_1_110px] min-w-0">
                <label className="block text-[10px] tracking-[0.09em] uppercase text-[#999] mb-1.5">{t.maxPrice}</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#bbb] pointer-events-none">$</span>
                  <input
                    type="number"
                    placeholder="∞"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className={`${inputClass} pl-[22px]`}
                  />
                </div>
              </div>

              {/* Search btn */}
              <div className="shrink-0">
                <button type="submit"
                  className="bg-[#1a1a2e] text-[#e8c547] border-none rounded-lg py-2.5 px-[22px] text-[13px] font-['DM_Mono',monospace] cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 transition-all hover:opacity-88 hover:-translate-y-px">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="5" cy="5" r="3.5" stroke="#e8c547" strokeWidth="1.2"/>
                    <path d="M7.5 7.5L10 10" stroke="#e8c547" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  {t.search}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results count */}
        {!loading && listings.length > 0 && (
          <div className="text-xs text-[#999] mb-4 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_0.07s_both]">
            {listings.length} {listings.length === 1 ? t.listing : t.listings} {t.found}
            {filters.location && <> {t.in} <span className="text-[#111118]">{filters.location}</span></>}
          </div>
        )}

        {/* LISTINGS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[14px] border border-black/7 overflow-hidden">
                <div className="h-[200px] bg-gradient-to-r from-[#ebe9e3] via-[#f3f1ea] to-[#ebe9e3] bg-[length:200%_100%] animate-[shimmer_1.4s_infinite] rounded-none" />
                <div className="p-5 flex flex-col gap-2.5">
                  <div className="h-3.5 w-3/4 bg-gradient-to-r from-[#ebe9e3] via-[#f3f1ea] to-[#ebe9e3] bg-[length:200%_100%] animate-[shimmer_1.4s_infinite] rounded-lg" />
                  <div className="h-[11px] w-1/2 bg-gradient-to-r from-[#ebe9e3] via-[#f3f1ea] to-[#ebe9e3] bg-[length:200%_100%] animate-[shimmer_1.4s_infinite] rounded-lg" />
                  <div className="h-3 w-[35%] bg-gradient-to-r from-[#ebe9e3] via-[#f3f1ea] to-[#ebe9e3] bg-[length:200%_100%] animate-[shimmer_1.4s_infinite] rounded-lg" />
                  <div className="h-[11px] w-[55%] bg-gradient-to-r from-[#ebe9e3] via-[#f3f1ea] to-[#ebe9e3] bg-[length:200%_100%] animate-[shimmer_1.4s_infinite] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_0.14s_both]">
            {listings.map((listing) => {
              const hostAvi = avi(listing.host?.name);
              const hostInitial = listing.host?.name?.charAt(0)?.toUpperCase() || 'H';
              return (
                <Link
                  href={`/listings/${listing.id}`}
                  key={listing.id}
                  className="bg-white rounded-[14px] border border-black/7 overflow-hidden no-underline block transition-all duration-[220ms] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.09)] group"
                >
                  <div className="overflow-hidden h-[200px]">
                    <img
                      src={listing.images?.[0]}
                      alt={listing.title}
                      className="w-full h-[200px] object-cover block transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-5">
                    <div className="font-['Fraunces',serif] italic font-light text-[18px] text-[#111118] leading-snug mb-1.5">
                      {listing.title}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#888] mb-2.5 overflow-hidden">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="shrink-0">
                        <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5c0 2.78 3.5 6.5 3.5 6.5s3.5-3.72 3.5-6.5C9.5 2.57 7.93 1 6 1zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="#ccc"/>
                      </svg>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">{listing.location}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-black/[0.06]">
                      <div className="inline-flex items-baseline gap-0.5">
                        <span className="text-base font-medium text-[#111118]">{listing.price} {isAr ? "دينار" : "LYD"}</span>
                        <span className="text-[11px] text-[#999]">&nbsp;/ {t.night}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 ${hostAvi.bg} ${hostAvi.color}`}>
                          {hostInitial}
                        </div>
                        <span className="text-[11px] text-[#888] overflow-hidden text-ellipsis whitespace-nowrap max-w-[80px]">
                          {listing.host?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)_0.14s_both] text-center py-20 px-6 bg-white rounded-[14px] border border-black/7">
            <div className="w-12 h-12 rounded-full bg-[#f0efe9] flex items-center justify-center mx-auto mb-5">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="10" cy="10" r="7" stroke="#ccc" strokeWidth="1.5"/>
                <path d="M15.5 15.5L19 19" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="font-['Fraunces',serif] italic font-light text-[22px] text-[#111118] mb-2">
              {t.noListingsFound}
            </div>
            <p className="text-[13px] text-[#999] mb-5">{t.tryAdjustingFilters}</p>
            <button
              onClick={() => { setFilters({ location: '', minPrice: '', maxPrice: '' }); fetchListings(); }}
              className="bg-transparent border border-black/10 rounded-lg py-2 px-[18px] text-xs font-[inherit] text-[#555] cursor-pointer hover:border-black/20 transition-colors"
            >
              {t.clearFilters}
            </button>
          </div>
        )}

      </main>

      {/* Keyframes via a style tag — Tailwind can't generate custom @keyframes without config */}
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
      `}</style>
    </div>
  );
}