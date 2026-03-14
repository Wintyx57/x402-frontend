import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import ConnectButton from './ConnectButton';
import LanguageToggle from './LanguageToggle';
import DarkModeToggle from './DarkModeToggle';

type DropdownId = 'marketplace' | 'providers' | 'dev' | null;

interface NavLink {
  to: string;
  label: string;
}

interface NavDropdownProps {
  id: DropdownId;
  label: string;
  links: NavLink[];
  openDropdown: DropdownId;
  setOpenDropdown: (id: DropdownId) => void;
  pathname: string;
}

function NavDropdown({ id, label, links, openDropdown, setOpenDropdown, pathname }: NavDropdownProps) {
  const isOpen = openDropdown === id;
  const hasActive = links.some(l => pathname === l.to || pathname.startsWith(l.to + '/'));

  return (
    <div className="relative">
      <button
        onClick={() => setOpenDropdown(isOpen ? null : id)}
        onMouseEnter={() => setOpenDropdown(id)}
        className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded transition-colors duration-200 whitespace-nowrap cursor-pointer
          ${hasActive ? 'text-[#FF9900]' : 'text-gray-300 hover:text-white hover:bg-white/5'}
          ${isOpen ? 'bg-white/5' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {/* Active indicator dot */}
        {hasActive && (
          <span className="w-1 h-1 rounded-full bg-[#FF9900] shrink-0" aria-hidden="true" />
        )}
        {label}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute top-full left-0 mt-1 min-w-[180px] bg-[#1a1f2e] border border-white/10 rounded-lg shadow-xl
                     py-1 z-50 animate-fade-in"
          onMouseLeave={() => setOpenDropdown(null)}
        >
          {links.map(({ to, label: linkLabel }) => {
            const isActive = pathname === to || pathname.startsWith(to + '/');
            return (
              <Link
                key={to}
                to={to}
                role="menuitem"
                onClick={() => setOpenDropdown(null)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 text-sm no-underline px-4 py-2 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#FF9900] bg-[#FF9900]/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] shrink-0" aria-hidden="true" />
                )}
                {linkLabel}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const [mobileAccordion, setMobileAccordion] = useState<DropdownId>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navStripRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const onServicesPage = pathname === '/services' || pathname.startsWith('/services/');
  const searchValue = onServicesPage ? (searchParams.get('q') || '') : localSearch;

  const closeMobile = () => setMobileOpen(false);

  // Close dropdown on click outside or Escape
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (navStripRef.current && !navStripRef.current.contains(e.target as Node)) {
      setOpenDropdown(null);
    }
  }, []);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpenDropdown(null);
      setMobileOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleClickOutside, handleEscape]);

  // Close menu on route change
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenDropdown(null);
      setMobileOpen(false);
    }
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!mobileOpen) return;

    const panel = mobilePanelRef.current;
    if (!panel) return;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const getFocusableElements = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(focusableSelectors)).filter(
        (el) => !el.closest('[aria-hidden="true"]'),
      );

    // Focus the first focusable element when the menu opens
    const firstFocusable = getFocusableElements()[0];
    firstFocusable?.focus();

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleFocusTrap);
    return () => {
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [mobileOpen]);

  const clearSearch = () => {
    if (onServicesPage) {
      const params = new URLSearchParams(searchParams);
      params.delete('q');
      setSearchParams(params);
    } else {
      setLocalSearch('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onServicesPage) {
      const params = new URLSearchParams(searchParams);
      if (val) {
        params.set('q', val);
      } else {
        params.delete('q');
      }
      setSearchParams(params);
    } else {
      setLocalSearch(val);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onServicesPage) return;
    if (localSearch.trim()) {
      navigate(`/services?q=${encodeURIComponent(localSearch.trim())}`);
      setLocalSearch('');
    }
  };

  const exploreLinks: NavLink[] = [
    { to: '/services', label: t.nav.services },
    { to: '/fund', label: t.nav.fund },
    { to: '/playground', label: t.nav.playground },
    { to: '/compare', label: t.nav.compare },
  ];

  const providerLinks: NavLink[] = [
    { to: '/for-providers', label: t.nav.forProviders },
    { to: '/register', label: t.nav.register },
  ];

  const devLinks: NavLink[] = [
    { to: '/quickstart', label: 'Quickstart' },
    { to: '/docs', label: t.nav.docs },
    { to: '/integrate', label: t.nav.integrate },
  ];

  const dropdownGroups = [
    { id: 'marketplace' as DropdownId, label: 'Explore', links: exploreLinks },
    { id: 'providers' as DropdownId, label: 'For Providers', links: providerLinks },
    { id: 'dev' as DropdownId, label: t.nav.forDevelopers, links: devLinks },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#131921]/90 backdrop-blur-xl border-b border-white/8" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline shrink-0" aria-label="x402 Bazaar — Home">
            <span className="text-[#FF9900] font-bold text-xl">x402</span>
            <span className="hidden sm:inline text-white text-lg font-light">Bazaar</span>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xl mx-auto" role="search">
            <div className="relative flex items-center w-full">
              <label htmlFor="nav-search" className="sr-only">{t.nav.searchPlaceholder}</label>
              <input
                id="nav-search"
                type="search"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder={t.nav.searchPlaceholder}
                autoComplete="off"
                className="w-full bg-white/8 border border-white/10 rounded-lg pl-10 pr-9 py-2 text-sm text-white
                           placeholder-gray-500 focus:outline-none focus:border-[#FF9900]/50 focus:bg-white/10
                           focus:ring-1 focus:ring-[#FF9900]/20 transition-all duration-200"
              />
              <svg
                className="absolute left-3 w-4 h-4 text-gray-500 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchValue && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 w-5 h-5 flex items-center justify-center text-gray-500
                             hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none p-0"
                  aria-label="Clear search"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <DarkModeToggle />
            <LanguageToggle />
            <ConnectButton />

            {/* Mobile hamburger */}
            <button
              ref={hamburgerRef}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden relative w-9 h-9 flex flex-col items-center justify-center gap-[5px]
                         bg-transparent border-none cursor-pointer z-50 rounded-lg
                         hover:bg-white/5 transition-colors duration-200"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              type="button"
            >
              <span className={`block w-5 h-[2px] rounded-full transition-all duration-300 origin-center ${
                mobileOpen ? 'translate-y-[7px] rotate-45 bg-[#FF9900]' : 'bg-gray-300'
              }`} />
              <span className={`block w-5 h-[2px] rounded-full transition-all duration-300 ${
                mobileOpen ? 'opacity-0 scale-x-0 bg-[#FF9900]' : 'bg-gray-300'
              }`} />
              <span className={`block w-5 h-[2px] rounded-full transition-all duration-300 origin-center ${
                mobileOpen ? '-translate-y-[7px] -rotate-45 bg-[#FF9900]' : 'bg-gray-300'
              }`} />
            </button>
          </div>
        </div>

        {/* Nav strip — desktop dropdowns */}
        <div ref={navStripRef} data-nav-strip className="hidden md:block border-t border-white/5 bg-[#232f3e]">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-10">
            {dropdownGroups.map(({ id, label, links }) => (
              <NavDropdown
                key={id}
                id={id}
                label={label}
                links={links}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                pathname={pathname}
              />
            ))}
            {/* Active page indicator — right aligned */}
            <div className="ml-auto flex items-center gap-1.5">
              {(() => {
                const allLinks = [...exploreLinks, ...providerLinks, ...devLinks];
                const active = allLinks.find(l => pathname === l.to || (l.to !== '/' && pathname.startsWith(l.to + '/')));
                if (!active) return null;
                return (
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#FF9900]" aria-hidden="true" />
                    {active.label}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Mobile menu — slide-in overlay */}
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className={`md:hidden fixed inset-0 top-14 z-40 transition-all duration-300 ${
            mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
              mobileOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Panel — slides in from left */}
          <div
            ref={mobilePanelRef}
            className={`relative w-[280px] max-w-[85vw] h-full bg-[#131921] border-r border-white/8
                        flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Mobile search */}
            <div className="p-4 border-b border-white/8">
              <form onSubmit={(e) => { handleSearch(e); closeMobile(); }} role="search">
                <div className="relative flex items-center">
                  <label htmlFor="mobile-search" className="sr-only">{t.nav.searchPlaceholder}</label>
                  <input
                    id="mobile-search"
                    type="search"
                    value={searchValue}
                    onChange={handleSearchChange}
                    placeholder={t.nav.searchPlaceholder}
                    autoComplete="off"
                    className="w-full bg-white/8 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white
                               placeholder-gray-500 focus:outline-none focus:border-[#FF9900]/50
                               transition-all duration-200"
                  />
                  <svg className="absolute left-3 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1" aria-label="Mobile navigation links">
              {dropdownGroups.map(({ id, label, links }) => {
                const isAccordionOpen = mobileAccordion === id;
                const hasActive = links.some(l => pathname === l.to || pathname.startsWith(l.to + '/'));
                return (
                  <div key={id}>
                    <button
                      onClick={() => setMobileAccordion(isAccordionOpen ? null : id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-colors duration-200 cursor-pointer
                        ${hasActive ? 'text-[#FF9900] bg-[#FF9900]/8' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        ${isAccordionOpen ? 'bg-white/5' : ''}`}
                      aria-expanded={isAccordionOpen}
                    >
                      <span className="flex items-center gap-2">
                        {hasActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900]" aria-hidden="true" />}
                        {label}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isAccordionOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className={`overflow-hidden transition-all duration-250 ${
                      isAccordionOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="pl-4 flex flex-col gap-0.5 pb-1 pt-0.5">
                        {links.map(({ to, label: linkLabel }) => {
                          const isActive = pathname === to || pathname.startsWith(to + '/');
                          return (
                            <Link
                              key={to}
                              to={to}
                              onClick={closeMobile}
                              className={`flex items-center gap-2 text-sm no-underline px-3 py-2 rounded-lg transition-colors duration-200 ${
                                isActive
                                  ? 'text-[#FF9900] bg-[#FF9900]/10 font-medium'
                                  : 'text-gray-300 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {isActive && <span className="w-1 h-1 rounded-full bg-[#FF9900] shrink-0" aria-hidden="true" />}
                              {linkLabel}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Bottom — Register CTA */}
            <div className="p-4 border-t border-white/8">
              <Link
                to="/register"
                onClick={closeMobile}
                className="block w-full gradient-btn text-white text-center text-sm font-semibold
                           py-2.5 rounded-xl no-underline transition-all duration-200 hover:brightness-110"
              >
                List Your API — 95% Revenue
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

Navbar.displayName = 'Navbar';
export default memo(Navbar);
