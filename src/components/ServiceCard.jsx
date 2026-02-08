import { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export default function ServiceCard({ service }) {
  const { t } = useTranslation();
  const isFree = Number(service.price_usdc) === 0;
  const initial = service.name?.charAt(0)?.toUpperCase() || '?';
  const domain = getDomain(service.url);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="glass-card rounded-xl p-5 transition-all duration-200 hover:bg-white/[0.04]
                    hover:border-[#FF9900]/20 hover:-translate-y-0.5 hover:shadow-lg group">
      {/* Top row: logo + name + price */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-[#232f3e] flex items-center justify-center shrink-0 overflow-hidden">
          {domain && !imgError ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
              alt=""
              className="w-6 h-6 object-contain"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <span className="text-sm font-bold text-[#FF9900]">{initial}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm leading-tight truncate" title={service.name}>{service.name}</h3>
          <span className="inline-block text-xs mt-0.5 text-gray-500 capitalize">
            {service.tags?.[0]}
          </span>
        </div>
        <span className={`shrink-0 font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${
          isFree
            ? 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20'
            : 'bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20'
        }`}>
          {isFree ? t.serviceCard.free : `$${service.price_usdc}`}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-xs mb-3 leading-relaxed line-clamp-2" title={service.description}>
        {service.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {service.tags?.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-lg">
            {tag}
          </span>
        ))}
        {service.tags?.length > 3 && (
          <span className="text-xs text-gray-600 px-1">+{service.tags.length - 3}</span>
        )}
      </div>

      {/* Bottom row: owner + verify + action */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-mono">
            {service.owner_address?.slice(0, 6)}...{service.owner_address?.slice(-4)}
          </span>
          {service.tx_hash && (
            <a
              href={`https://basescan.org/tx/${service.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF9900] no-underline hover:text-[#FEBD69]"
            >
              {t.serviceCard.verified}
            </a>
          )}
        </div>
        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-[#FF9900] hover:text-[#FFB340] no-underline
                     transition-opacity duration-200"
        >
          {t.serviceCard.viewApi} &rarr;
        </a>
      </div>
    </div>
  );
}
