import { useTranslation } from '../i18n/LanguageContext';

export default function ServiceCard({ service }) {
  const { t } = useTranslation();
  const isFree = Number(service.price_usdc) === 0;
  const initial = service.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="glass-card rounded-lg p-4 transition-all duration-200 hover:bg-white/[0.04]
                    hover:border-white/10 group">
      {/* Top row: initial + name + price */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-[#232f3e] flex items-center justify-center
                        text-sm font-bold text-[#FF9900] shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm leading-tight truncate">{service.name}</h3>
          <span className="inline-block text-xs mt-0.5 text-gray-500 capitalize">
            {service.tags?.[0]}
          </span>
        </div>
        <span className={`shrink-0 font-mono text-xs font-bold px-2.5 py-1 rounded-md ${
          isFree
            ? 'bg-white/5 text-gray-400 border border-white/8'
            : 'bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20'
        }`}>
          {isFree ? t.serviceCard.free : `$${service.price_usdc}`}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-xs mb-3 leading-relaxed line-clamp-2">
        {service.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {service.tags?.slice(0, 3).map(tag => (
          <span key={tag} className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
        {service.tags?.length > 3 && (
          <span className="text-[10px] text-gray-600 px-1">+{service.tags.length - 3}</span>
        )}
      </div>

      {/* Bottom row: owner + verify + action */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] text-gray-600">
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
          className="text-[10px] font-medium text-[#FF9900] hover:text-[#FEBD69] no-underline
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          {t.serviceCard.viewApi} &rarr;
        </a>
      </div>
    </div>
  );
}
