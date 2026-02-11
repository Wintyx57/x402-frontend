import { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

function getDomain(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01]))/.test(parsed.hostname)) return null;
    return parsed.hostname;
  } catch {
    return null;
  }
}

function isValidServiceUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function timeAgo(dateStr, t) {
  if (!dateStr) return null;
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffMin < 5) return t.serviceCard.activeNow || 'Active now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  return `${diffD}d ago`;
}

export default function ServiceCard({ service, lastActivity, healthStatus }) {
  const { t } = useTranslation();
  const isFree = Number(service.price_usdc) === 0;
  const initial = service.name?.charAt(0)?.toUpperCase() || '?';
  const domain = getDomain(service.url);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const isNative = service.url?.startsWith('https://x402-api.onrender.com');

  const handleCopyPrompt = async (e) => {
    e.stopPropagation();
    const prompt = `Use x402 Bazaar to call "${service.name}" at ${service.url}${isFree ? ' (free)' : ` (costs ${service.price_usdc} USDC)`}`;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-xl p-5 transition-all duration-200 hover:bg-white/[0.07]
                    hover:border-[#FF9900]/30 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,153,0,0.08),0_4px_12px_rgba(0,0,0,0.3)] group">
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-white font-semibold text-sm leading-tight truncate" title={service.name}>{service.name}</h3>
            {healthStatus === 'online' && (
              <span className="flex items-center gap-1 text-[10px] text-[#34D399] shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                {t.serviceCard.online || 'Online'}
              </span>
            )}
            {healthStatus === 'offline' && (
              <span className="flex items-center gap-1 text-[10px] text-red-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {t.serviceCard.offline || 'Offline'}
              </span>
            )}
            {isNative && (
              <span className="text-[11px] bg-[#FF9900]/10 text-[#FF9900] px-1.5 py-0.5 rounded border border-[#FF9900]/20 shrink-0">
                {t.serviceCard.native}
              </span>
            )}
          </div>
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

      {/* Activity badge */}
      {lastActivity && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
          <span className="text-xs text-gray-500">{timeAgo(lastActivity, t)}</span>
        </div>
      )}

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

      {/* Bottom row: owner + verify + actions */}
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
        <div className="flex items-center gap-2">
          {isValidServiceUrl(service.url) && (
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md
                         bg-white/5 text-gray-400 hover:text-white hover:bg-white/10
                         transition-all duration-200 cursor-pointer border-none"
              title={t.serviceCard.useWithAI}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>
              </svg>
              {copied ? t.serviceCard.copied : t.serviceCard.useWithAI}
            </button>
          )}
          {isValidServiceUrl(service.url) ? (
            <a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-[#FF9900] hover:text-[#FFB340] no-underline
                         sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
            >
              {t.serviceCard.viewApi} &rarr;
            </a>
          ) : (
            <span className="text-xs text-gray-600">{t.serviceCard.viewApi}</span>
          )}
        </div>
      </div>
    </div>
  );
}
