import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import ConnectButton from './ConnectButton';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const navLinks = [
    { to: '/services', label: t.nav.services },
    { to: '/register', label: t.nav.register },
    { to: '/integrate', label: t.nav.integrate },
    { to: '/developers', label: t.nav.developers },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 glass-strong">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-xl font-bold text-white">x402</span>
            <span className="text-xl font-light gradient-text">Bazaar</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="relative text-gray-400 hover:text-blue-400 text-sm no-underline
                           transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-0.5
                           after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ConnectButton />

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-[5px] bg-transparent border-none cursor-pointer z-50"
              aria-label="Toggle menu"
            >
              <span
                className={`block w-5 h-[2px] bg-gray-300 rounded-full transition-all duration-300 ease-in-out origin-center ${
                  mobileOpen ? 'translate-y-[7px] rotate-45 bg-blue-400' : ''
                }`}
              />
              <span
                className={`block w-5 h-[2px] bg-gray-300 rounded-full transition-all duration-300 ease-in-out ${
                  mobileOpen ? 'opacity-0 scale-x-0' : ''
                }`}
              />
              <span
                className={`block w-5 h-[2px] bg-gray-300 rounded-full transition-all duration-300 ease-in-out origin-center ${
                  mobileOpen ? '-translate-y-[7px] -rotate-45 bg-blue-400' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="glass-strong border-t border-white/8 px-4 py-4 flex flex-col gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMobile}
                className="text-gray-300 hover:text-blue-400 hover:bg-white/5 text-sm no-underline
                           px-3 py-2.5 rounded-lg transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
    </>
  );
}
