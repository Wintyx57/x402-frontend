import { useState, useEffect, useLayoutEffect, useRef, useCallback, memo } from 'react';
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
        {label}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
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
                className={`block text-sm no-underline px-4 py-2 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#FF9900] bg-[#FF9900]/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
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
    if (e.key === 'Escape') setOpenDropdown(null);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleClickOutside, handleEscape]);

  // Close dropdown on route change
  useLayoutEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

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

  const marketplaceLinks: NavLink[] = [
    { to: '/services', label: t.nav.services },
    { to: '/pricing', label: t.nav.pricing },
    { to: '/compare', label: t.nav.compare || 'Compare' },
  ];

  const providerLinks: NavLink[] = [
    { to: '/register', label: t.nav.register },
    { to: '/for-providers', label: t.nav.forProviders || 'For Providers' },
    { to: '/creators', label: t.nav.creators || 'Creators' },
  ];

  const devLinks: NavLink[] = [
    { to: '/quickstart', label: 'Quickstart' },
    { to: '/mcp', label: 'MCP' },
    { to: '/docs', label: t.nav.docs || 'Docs' },
    { to: '/playground', label: t.nav.playground || 'Playground' },
  ];

  const dropdownGroups = [
    { id: 'marketplace' as DropdownId, label: t.nav.marketplace, links: marketplaceLinks },
    { id: 'providers' as DropdownId, label: 'Providers', links: providerLinks },
    { id: 'dev' as DropdownId, label: t.nav.forDevelopers, links: devLinks },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#131921]/80 backdrop-blur-xl border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline shrink-0">
            <span className="text-[#FF9900] font-bold text-xl">x402</span>
            <span className="hidden sm:inline text-white text-lg font-light">Bazaar</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xl mx-auto">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder={t.nav.searchPlaceholder}
                className="w-full bg-white/8 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white
                           placeholder-gray-500 focus:outline-none focus:border-[#FF9900]/50 focus:bg-white/10
                           transition-all duration-200"
              />
              <svg className="absolute left-3 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <DarkModeToggle />
            <LanguageToggle />
            <ConnectButton />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-[5px] bg-transparent border-none cursor-pointer z-50"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span className={`block w-5 h-[2px] bg-gray-300 rounded-full transition-all duration-300 origin-center ${
                mobileOpen ? 'translate-y-[7px] rotate-45 bg-[#FF9900]' : ''
              }`} />
              <span className={`block w-5 h-[2px] bg-gray-300 rounded-full transition-all duration-300 ${
                mobileOpen ? 'opacity-0 scale-x-0' : ''
              }`} />
              <span className={`block w-5 h-[2px] bg-gray-300 rounded-full transition-all duration-300 origin-center ${
                mobileOpen ? '-translate-y-[7px] -rotate-45 bg-[#FF9900]' : ''
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
          </div>
        </div>

        {/* Mobile menu — accordion */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-[40rem] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div data-nav-mobile className="border-t border-white/6 px-4 py-3 flex flex-col gap-1 bg-[#131921]">
            {/* Mobile search bar */}
            <form onSubmit={handleSearch} className="sm:hidden mb-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder={t.nav.searchPlaceholder}
                  className="w-full bg-white/8 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white
                             placeholder-gray-500 focus:outline-none focus:border-[#FF9900]/50 focus:bg-white/10
                             transition-all duration-200"
                />
                <svg className="absolute left-3 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {dropdownGroups.map(({ id, label, links }) => {
              const isAccordionOpen = mobileAccordion === id;
              const hasActive = links.some(l => pathname === l.to || pathname.startsWith(l.to + '/'));
              return (
                <div key={id}>
                  <button
                    onClick={() => setMobileAccordion(isAccordionOpen ? null : id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-colors duration-200 cursor-pointer
                      ${hasActive ? 'text-[#FF9900]' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                      ${isAccordionOpen ? 'bg-white/5' : ''}`}
                    aria-expanded={isAccordionOpen}
                  >
                    {label}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isAccordionOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${
                    isAccordionOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pl-3 flex flex-col gap-0.5 pb-1">
                      {links.map(({ to, label: linkLabel }) => {
                        const isActive = pathname === to || pathname.startsWith(to + '/');
                        return (
                          <Link
                            key={to}
                            to={to}
                            onClick={closeMobile}
                            className={`text-sm no-underline px-3 py-2 rounded-lg transition-colors duration-200 ${
                              isActive
                                ? 'text-[#FF9900] bg-[#FF9900]/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {linkLabel}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

Navbar.displayName = 'Navbar';
export default memo(Navbar);
