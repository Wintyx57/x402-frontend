import { useTranslation } from '../i18n/LanguageContext';
import useSEO from '../hooks/useSEO';

export default function Privacy() {
  const { t } = useTranslation();

  useSEO({
    title: 'Privacy Policy',
    description: 'x402 Bazaar privacy policy. No personal data collected, no cookies, no tracking.'
  });

  const sections = [
    {
      title: t.privacy.collectTitle,
      items: [
        { label: t.privacy.collectApi, desc: t.privacy.collectApiDesc },
        { label: t.privacy.collectTx, desc: t.privacy.collectTxDesc },
        { label: t.privacy.collectMonitor, desc: t.privacy.collectMonitorDesc },
      ]
    },
    {
      title: t.privacy.noCollectTitle,
      items: [
        { label: t.privacy.noPersonal, desc: t.privacy.noPersonalDesc },
        { label: t.privacy.noCookies, desc: t.privacy.noCookiesDesc },
        { label: t.privacy.noTracking, desc: t.privacy.noTrackingDesc },
        { label: t.privacy.noThirdParty, desc: t.privacy.noThirdPartyDesc },
      ]
    },
    {
      title: t.privacy.retentionTitle,
      items: [
        { label: t.privacy.retentionLogs, desc: t.privacy.retentionLogsDesc },
        { label: t.privacy.retentionTx, desc: t.privacy.retentionTxDesc },
        { label: t.privacy.retentionMonitor, desc: t.privacy.retentionMonitorDesc },
      ]
    },
    {
      title: t.privacy.blockchainTitle,
      items: [
        { label: t.privacy.blockchainPublic, desc: t.privacy.blockchainPublicDesc },
        { label: t.privacy.blockchainImmutable, desc: t.privacy.blockchainImmutableDesc },
      ]
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 animate-fade-in-up">
        {t.privacy.title}
      </h1>
      <p className="text-gray-500 mb-2 animate-fade-in-up delay-100">
        {t.privacy.subtitle}
      </p>
      <p className="text-xs text-gray-600 mb-8 animate-fade-in-up delay-100">
        {t.privacy.lastUpdated}: 2026-02-13
      </p>

      <div className="space-y-8">
        {sections.map((section, i) => (
          <div key={i} className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: `${(i + 1) * 100}ms` }}>
            <h2 className="text-lg font-semibold text-white mb-4">{section.title}</h2>
            <div className="space-y-3">
              {section.items.map((item, j) => (
                <div key={j} className="flex items-start gap-3">
                  <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${section.title === t.privacy.noCollectTitle ? 'bg-red-500' : 'bg-[#FF9900]'}`} />
                  <div>
                    <span className="text-sm font-medium text-white">{item.label}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact */}
        <div className="glass-card rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <h2 className="text-lg font-semibold text-white mb-3">{t.privacy.contactTitle}</h2>
          <p className="text-sm text-gray-400 mb-3">{t.privacy.contactDesc}</p>
          <a
            href="https://github.com/Wintyx57/x402-backend/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#FF9900] hover:underline"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            GitHub Issues
          </a>
        </div>

        {/* TLDR */}
        <div className="text-center py-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <p className="text-sm text-gray-500 italic">{t.privacy.tldr}</p>
        </div>
      </div>
    </div>
  );
}
