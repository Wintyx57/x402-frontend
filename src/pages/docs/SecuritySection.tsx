interface Props { d: Record<string, string>; }

import { DocsCodeBlock } from './shared';

const API_BASE = 'https://x402-api.onrender.com';

export default function SecuritySection({ d }: Props) {
  return (
    <section id="security">
      <h2 className="text-2xl font-bold text-white mb-6">{d.securityTitle || 'Security'}</h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {[
          { title: d.securityBudgetTitle, desc: d.securityBudgetDesc },
          { title: d.securityReplayTitle, desc: d.securityReplayDesc },
          { title: d.securityOnchainTitle, desc: d.securityOnchainDesc },
          { title: d.securityRateTitle, desc: d.securityRateDesc },
          { title: d.securitySsrfTitle, desc: d.securitySsrfDesc },
        ].map((item, i) => (
          <div key={i} className="glass-card rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
            <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">{d.securityBestTitle || 'Best Practices'}</h3>
        <ul className="space-y-2">
          {[d.securityBest1, d.securityBest2, d.securityBest3].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
              <svg className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* ERC-8004 Agent Identity */}
      <div className="glass-card rounded-xl p-5 mt-6 border border-violet-500/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30">
            <svg className="w-4.5 h-4.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-sm">{d.erc8004Title || 'ERC-8004 Agent Identity'}</h3>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed mb-4">{d.erc8004Desc || ''}</p>
        <p className="text-gray-500 text-xs mb-2">{d.erc8004Endpoint || 'Verify any agent identity for free:'}</p>
        <DocsCodeBlock code={`curl ${API_BASE}/api/agent/0xYourAgentAddress`} />
      </div>
    </section>
  );
}
