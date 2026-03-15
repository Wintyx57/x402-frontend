import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

function BackToTop() {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Back to top"
      className="group flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#FF9900]
                 transition-colors duration-200 cursor-pointer bg-transparent border-none"
    >
      <span className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center
                       group-hover:bg-[#FF9900]/10 group-hover:border-[#FF9900]/25 transition-all duration-200">
        <svg
          className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </span>
      Back to top
    </button>
  );
}

const SOCIAL_LINKS = [
  {
    label: 'Twitter / X',
    href: 'https://x.com/x402_bazaar',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/Wintyx57',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
] as const;

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/8 bg-gradient-to-b from-[#131921] to-[#0e1117]" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Main grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#FF9900] font-bold text-lg">x402</span>
              <span className="text-white text-sm font-light">Bazaar</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">{t.home.footerDesc}</p>

            {/* Social links */}
            <div className="flex items-center gap-2" role="list" aria-label="Social media links">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  role="listitem"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
                             text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20
                             transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
              {t.home.footerProduct}
            </h3>
            <nav aria-label="Product links">
              <ul className="flex flex-col gap-0.5">
                {[
                  { to: '/services', label: t.nav.services },
                  { to: '/docs', label: t.nav.docs },
                  { to: '/playground', label: t.nav.playground },
                  { to: '/register', label: t.nav.register },
                  { to: '/for-providers', label: t.nav.forProviders },
                  { to: '/my-apis', label: t.myApis?.title || 'My APIs' },
                  { to: '/compare', label: t.nav.compare },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-xs text-gray-300 hover:text-white no-underline transition-colors py-1 block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
              {t.home.footerResources}
            </h3>
            <nav aria-label="Resource links">
              <ul className="flex flex-col gap-0.5">
                {[
                  { to: '/about', label: t.nav.about },
                  { to: '/faq', label: 'FAQ' },
                  { to: '/status', label: t.nav.status },
                  { to: '/analytics', label: t.nav.analytics },
                  { to: '/integrate', label: t.nav.integrate },
                  { to: '/blog', label: t.blog.title },
                  { to: '/privacy', label: t.nav.privacy },
                  { to: '/terms', label: t.nav.terms },
                  { to: '/legal', label: t.nav.legal },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-xs text-gray-300 hover:text-white no-underline transition-colors py-1 block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Community / Open Source column */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
              {t.nav.community}
            </h3>
            <ul className="flex flex-col gap-0.5">
              <li>
                <a
                  href="https://github.com/Wintyx57"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-300 hover:text-white no-underline transition-colors py-1
                             flex items-center gap-1.5 group"
                >
                  <svg className="w-3.5 h-3.5 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub (Wintyx57)
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/x402_bazaar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-300 hover:text-white no-underline transition-colors py-1
                             flex items-center gap-1.5 group"
                >
                  <svg className="w-3.5 h-3.5 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  @x402_bazaar
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Wintyx57/x402-bazaar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-300 hover:text-white no-underline transition-colors py-1"
                >
                  {t.nav.sourceCode}
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Wintyx57/x402-bazaar/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-300 hover:text-white no-underline transition-colors py-1"
                >
                  {t.nav.reportIssue}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            Built on{' '}
            <span className="text-[#FF9900] font-medium">x402 Protocol</span>
            {' '}&middot;{' '}
            Powered by Base &amp; <span className="text-[#34D399]">SKALE</span>
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-400">&copy; 2026 x402 Bazaar</p>
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
