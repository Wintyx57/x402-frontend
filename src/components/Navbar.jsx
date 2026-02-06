import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import ConnectButton from './ConnectButton';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { t } = useTranslation();

  return (
    <>
      <nav className="sticky top-0 z-50 glass-strong">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-xl font-bold text-white">x402</span>
            <span className="text-xl font-light gradient-text">Bazaar</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/services" className="relative text-gray-400 hover:text-blue-400 text-sm no-underline
                     transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-0.5
                     after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full">
              {t.nav.services}
            </Link>
            <Link to="/register" className="relative text-gray-400 hover:text-blue-400 text-sm no-underline
                     transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-0.5
                     after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full">
              {t.nav.register}
            </Link>
            <Link to="/developers" className="relative text-gray-400 hover:text-blue-400 text-sm no-underline
                     transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-0.5
                     after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full">
              {t.nav.developers}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ConnectButton />
          </div>
        </div>
      </nav>
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
    </>
  );
}
