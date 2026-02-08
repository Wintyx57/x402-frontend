import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import ConnectButton from './ConnectButton';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const closeMobile = () => setMobileOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/services?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const navLinks = [
    { to: '/services', label: t.nav.services },
    { to: '/register', label: t.nav.register },
    { to: '/integrate', label: t.nav.integrate },
    { to: '/developers', label: t.nav.developers },
  ];

  return (
    <>
      {/* Top bar */}
      <nav className="sticky top-0 z-50 bg-[#0f0f18]/95 backdrop-blur-xl border-b border-white/6">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 no-underline shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center text-white font-bold text-sm">
              x4
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-white">x402</span>
              <span className="text-lg font-light gradient-text ml-0.5">Bazaar</span>
            </div>
          </Link>

          {/* Search bar — center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white
                           placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/8
                           transition-all duration-300"
              />
              <svg className="absolute left-3 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle />
            <ConnectButton />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-[5px] bg-transparent border-none cursor-pointer z-50"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-[2px] bg-gray-300 rounded-full transition-all duration-300 origin-center ${
                mobileOpen ? 'translate-y-[7px] rotate-45 bg-blue-400' : ''
              }`} />
              <span className={`block w-5 h-[2px] bg-gray-300 rounded-full transition-all duration-300 ${
                mobileOpen ? 'opacity-0 scale-x-0' : ''
              }`} />
              <span className={`block w-5 h-[2px] bg-gray-300 rounded-full transition-all duration-300 origin-center ${
                mobileOpen ? '-translate-y-[7px] -rotate-45 bg-blue-400' : ''
              }`} />
            </button>
          </div>
        </div>

        {/* Category strip — desktop */}
        <div className="hidden md:block border-t border-white/4 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-10 overflow-x-auto">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-gray-400 hover:text-white text-xs font-medium no-underline
                           px-3 py-1.5 rounded-md transition-colors duration-200 hover:bg-white/5 whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
            <div className="w-px h-4 bg-white/10 mx-1" />
            <Link
              to="/services"
              className="text-gray-500 hover:text-blue-400 text-xs no-underline px-3 py-1.5 rounded-md
                         transition-colors duration-200 hover:bg-white/5 whitespace-nowrap"
            >
              {t.nav.allCategories}
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="border-t border-white/6 px-4 py-3 flex flex-col gap-1 bg-[#0f0f18]">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMobile}
                className="text-gray-300 hover:text-white hover:bg-white/5 text-sm no-underline
                           px-3 py-2.5 rounded-lg transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
