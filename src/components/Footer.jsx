import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/5 bg-[#131921]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#FF9900] font-bold text-lg">x402</span>
              <span className="text-white text-sm font-light">Bazaar</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{t.home.footerDesc}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t.home.footerProduct}</h4>
            <div className="flex flex-col gap-2">
              <Link to="/services" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.nav.services}</Link>
              <Link to="/pricing" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.nav.pricing}</Link>
              <Link to="/docs" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.nav.docs || 'Docs'}</Link>
              <Link to="/playground" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.nav.playground || 'Playground'}</Link>
              <Link to="/register" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.nav.register}</Link>
              <Link to="/for-providers" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.nav.forProviders || 'For Providers'}</Link>
              <Link to="/compare" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.nav.compare || 'Compare'}</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t.home.footerResources}</h4>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.nav.about}</Link>
              <Link to="/faq" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">FAQ</Link>
              <Link to="/status" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.nav.status}</Link>
              <Link to="/analytics" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.nav.analytics || 'Analytics'}</Link>
              <Link to="/integrate" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.nav.integrate}</Link>
              <Link to="/blog" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.blog.title}</Link>
              <Link to="/privacy" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.nav.privacy}</Link>
              <Link to="/terms" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">{t.nav.terms}</Link>
              <a href="https://github.com/Wintyx57/x402-frontend" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1">GitHub</a>
              <a href="https://x.com/x402bazaar" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white no-underline transition-colors py-1 inline-flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Twitter / X
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            Built for the <span className="text-[#FF9900] font-medium">x402 Hackathon</span> &middot; Powered by Base & <span className="text-[#34D399]">SKALE</span>
          </p>
          <p className="text-xs text-gray-600">&copy; 2026 x402 Bazaar</p>
        </div>
      </div>
    </footer>
  );
}
