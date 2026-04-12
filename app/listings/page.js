'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ListingsPage() {
  const router = useRouter();
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
    { bg: '#EEEDFE', color: '#3C3489' }, { bg: '#E6F1FB', color: '#0C447C' },
    { bg: '#EAF3DE', color: '#27500A' }, { bg: '#FAEEDA', color: '#633806' },
    { bg: '#E1F5EE', color: '#085041' }, { bg: '#FBEAF0', color: '#72243E' },
  ];
  const avi = (name) => AVATAR_PAL[(name?.charCodeAt(0) ?? 0) % AVATAR_PAL.length];

  const NAV_LINKS = [
    { href: '/dashboard', label: 'dashboard' },
    { href: '/listings', label: 'browse', active: true },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Mono', monospace; background: #f7f6f2; -webkit-font-smoothing: antialiased; }
        .font-display { font-family: 'Fraunces', serif; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }

        .fu  { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .fu1 { animation-delay: 0.07s; }
        .fu2 { animation-delay: 0.14s; }

        /* Nav */
        .nav-link { color: rgba(255,255,255,0.45); text-decoration: none; font-size: 12px; padding: 6px 12px; border-radius: 6px; transition: color 0.15s, background 0.15s; }
        .nav-link:hover { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.06); }
        .nav-link.active { color: rgba(255,255,255,0.9); }

        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
        .hamburger span { display: block; width: 18px; height: 2px; background: rgba(255,255,255,0.6); border-radius: 2px; transition: all 0.2s; }

        .mobile-nav { display: none; position: fixed; top: 56px; left: 0; right: 0; background: #1a1a2e; border-bottom: 1px solid rgba(232,197,71,0.12); padding: 1rem 1.5rem; z-index: 40; flex-direction: column; gap: 4px; }
        .mobile-nav.open { display: flex; }
        .mobile-nav-link { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 13px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); display: block; }

        /* Filter bar */
        .filter-input {
          padding: 10px 12px; background: #fafaf8;
          border: 1px solid rgba(0,0,0,0.1); border-radius: 8px;
          font-size: 13px; color: #111118; font-family: 'DM Mono', monospace;
          outline: none; width: 100%;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .filter-input::placeholder { color: #c0bfbb; }
        .filter-input:focus { border-color: #185FA5; box-shadow: 0 0 0 3px rgba(24,95,165,0.08); background: #fff; }
        .filter-input:hover:not(:focus) { border-color: rgba(0,0,0,0.18); }

        .search-btn {
          background: #1a1a2e; color: #e8c547;
          border: none; border-radius: 8px;
          padding: 10px 22px; font-size: 13px;
          font-family: 'DM Mono', monospace;
          cursor: pointer; white-space: nowrap;
          transition: opacity 0.15s, transform 0.15s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .search-btn:hover { opacity: 0.88; transform: translateY(-1px); }

        /* Listing card */
        .listing-card {
          background: #fff; border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.07); overflow: hidden;
          text-decoration: none; display: block;
          transition: transform 0.22s, box-shadow 0.22s;
        }
        .listing-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.09); }

        .listing-img {
          width: 100%; height: 200px; object-fit: cover;
          display: block; transition: transform 0.3s;
        }
        .listing-card:hover .listing-img { transform: scale(1.04); }

        .price-tag {
          display: inline-flex; align-items: baseline; gap: 3px;
        }

        /* Empty state */
        .empty-state {
          text-align: center; padding: 5rem 1.5rem;
          background: #fff; border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.07);
          grid-column: 1 / -1;
        }

        /* Skeleton pulse */
        .skeleton { background: linear-gradient(90deg, #ebe9e3 25%, #f3f1ea 50%, #ebe9e3 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 10px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        /* Responsive */
        @media (max-width: 768px) {
          .hamburger { display: flex; }
          .desktop-nav { display: none !important; }
          .listings-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .filter-grid { grid-template-columns: 1fr 1fr !important; }
          .filter-row { flex-wrap: wrap; }
        }

        @media (max-width: 520px) {
          .listings-grid { grid-template-columns: 1fr !important; }
          .filter-grid { grid-template-columns: 1fr !important; }
          .main-pad { padding: 1.25rem 1rem !important; }
          .listing-img { height: 180px; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f7f6f2' }}>

        {/* NAV */}
        <nav style={{
          background: '#1a1a2e', borderBottom: '1px solid rgba(232,197,71,0.15)',
          padding: '0 1.5rem', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div className="font-display" style={{ fontStyle: 'italic', fontWeight: 300, fontSize: 20, color: '#fff' }}>
                mar<span style={{ fontStyle: 'normal', fontWeight: 500, color: '#e8c547' }}>haba</span>
              </div>
            </Link>
            <div className="desktop-nav" style={{ display: 'flex', gap: 2 }}>
              {NAV_LINKS.map(({ href, label, active }) => (
                <Link key={href} href={href} className={`nav-link${active ? ' active' : ''}`}>{label}</Link>
              ))}
            </div>
          </div>

          <div className="desktop-nav" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/dashboard" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>← dashboard</Link>
          </div>

          <button className="hamburger" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Menu">
            <span style={{ transform: mobileNavOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ opacity: mobileNavOpen ? 0 : 1 }} />
            <span style={{ transform: mobileNavOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>
        </nav>

        {/* Mobile nav */}
        <div className={`mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>{label}</Link>
          ))}
        </div>

        <main className="main-pad" style={{ maxWidth: 1100, margin: '0 auto', padding: '1.75rem 1.5rem' }}>

          {/* HEADER */}
          <div className="fu" style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', marginBottom: 6 }}>
              explore
            </div>
            <h1 className="font-display" style={{ fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(24px,4vw,36px)', color: '#111118', lineHeight: 1.1 }}>
              Browse listings
            </h1>
          </div>

          {/* FILTER BAR */}
          <div className="fu fu1" style={{
            background: '#fff', borderRadius: 14,
            border: '1px solid rgba(0,0,0,0.07)',
            padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
            borderTop: '3px solid #e8c547',
          }}>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: '2 1 180px', minWidth: 0 }}>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#999', marginBottom: 5 }}>location</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1C4.07 1 2.5 2.57 2.5 4.5c0 2.78 3.5 6.5 3.5 6.5s3.5-3.72 3.5-6.5C9.5 2.57 7.93 1 6 1zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="#bbb"/></svg>
                    </span>
                    <input type="text" name="location" placeholder="Anywhere"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      className="filter-input" style={{ paddingLeft: 28 }} />
                  </div>
                </div>
                <div style={{ flex: '1 1 110px', minWidth: 0 }}>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#999', marginBottom: 5 }}>min price</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#bbb', pointerEvents: 'none' }}>$</span>
                    <input type="number" name="minPrice" placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="filter-input" style={{ paddingLeft: 22 }} />
                  </div>
                </div>
                <div style={{ flex: '1 1 110px', minWidth: 0 }}>
                  <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#999', marginBottom: 5 }}>max price</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#bbb', pointerEvents: 'none' }}>$</span>
                    <input type="number" name="maxPrice" placeholder="∞"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="filter-input" style={{ paddingLeft: 22 }} />
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <button type="submit" className="search-btn">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="5" cy="5" r="3.5" stroke="#e8c547" strokeWidth="1.2"/>
                      <path d="M7.5 7.5L10 10" stroke="#e8c547" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    search
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Results count */}
          {!loading && listings.length > 0 && (
            <div className="fu fu1" style={{ fontSize: 12, color: '#999', marginBottom: '1rem' }}>
              {listings.length} {listings.length === 1 ? 'listing' : 'listings'} found
              {filters.location && <> in <span style={{ color: '#111118' }}>{filters.location}</span></>}
            </div>
          )}

          {/* LISTINGS GRID */}
          {loading ? (
            <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ height: 200 }} />
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="skeleton" style={{ height: 14, width: '75%' }} />
                    <div className="skeleton" style={{ height: 11, width: '50%' }} />
                    <div className="skeleton" style={{ height: 13, width: '35%' }} />
                    <div className="skeleton" style={{ height: 11, width: '55%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="fu fu2 listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {listings.map((listing) => {
                const hostAvi = avi(listing.host?.name);
                const hostInitial = listing.host?.name?.charAt(0)?.toUpperCase() || 'H';
                return (
                  <Link href={`/listings/${listing._id}`} key={listing._id} className="listing-card">
                    <div style={{ overflow: 'hidden', height: 200 }}>
                      <img src={listing.images?.[0]} alt={listing.title} className="listing-img" />
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <div className="font-display" style={{ fontStyle: 'italic', fontWeight: 300, fontSize: 18, color: '#111118', lineHeight: 1.2, marginBottom: 6 }}>
                        {listing.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#888', marginBottom: 10, overflow: 'hidden' }}>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                          <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5c0 2.78 3.5 6.5 3.5 6.5s3.5-3.72 3.5-6.5C9.5 2.57 7.93 1 6 1zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="#ccc"/>
                        </svg>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.location}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <div className="price-tag">
                          <span style={{ fontSize: 16, fontWeight: 500, color: '#111118' }}>${listing.price}</span>
                          <span style={{ fontSize: 11, color: '#999' }}>&nbsp;/ night</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: hostAvi.bg, color: hostAvi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, flexShrink: 0 }}>
                            {hostInitial}
                          </div>
                          <span style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>{listing.host?.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="fu fu2 empty-state">
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0efe9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="#ccc" strokeWidth="1.5"/>
                  <path d="M15.5 15.5L19 19" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="font-display" style={{ fontStyle: 'italic', fontWeight: 300, fontSize: 22, color: '#111118', marginBottom: 8 }}>
                No listings found
              </div>
              <p style={{ fontSize: 13, color: '#999', marginBottom: '1.25rem' }}>
                Try adjusting your search filters.
              </p>
              <button onClick={() => { setFilters({ location: '', minPrice: '', maxPrice: '' }); fetchListings(); }}
                style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '8px 18px', fontSize: 12, fontFamily: 'inherit', color: '#555', cursor: 'pointer' }}>
                clear filters
              </button>
            </div>
          )}

        </main>
      </div>
    </>
  );
}