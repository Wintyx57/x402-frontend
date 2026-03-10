import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import StarRating from './StarRating';
import { trackEvent } from '../lib/analytics';
import type { Service } from '../types/service';

function getDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01]))/.test(parsed.hostname)) return null;
    return parsed.hostname;
  } catch {
    return null;
  }
}

function isValidServiceUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function timeAgo(dateStr: string | null, t: { serviceCard: { activeNow?: string } }): string | null {
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

interface QualityTier {
  label: string;
  color: string;
  bg: string;
}

function getQualityTier(uptimePercent: number | null): QualityTier | null {
  if (uptimePercent == null) return null;
  if (uptimePercent >= 99) return { label: 'Gold', color: '#FBBF24', bg: '#FBBF24' };
  if (uptimePercent >= 95) return { label: 'Silver', color: '#94A3B8', bg: '#94A3B8' };
  if (uptimePercent >= 90) return { label: 'Bronze', color: '#CD7F32', bg: '#CD7F32' };
  return null;
}

interface ReviewStats {
  count: number;
  average: number;
}

function isNewService(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() > sevenDaysAgo;
}

interface ServiceCardProps {
  service: Service;
  lastActivity: string | null;
  healthStatus?: 'online' | 'offline' | null;
  uptimePercent?: number | null;
  reviewStats?: ReviewStats | null;
  callCount?: number | null;
}

function ServiceCard({ service, lastActivity, healthStatus = null, uptimePercent = null, reviewStats = null, callCount = null }: ServiceCardProps) {
  const { t } = useTranslation();
  const isFree = Number(service.price_usdc) === 0;
  const initial = service.name?.charAt(0)?.toUpperCase() || '?';
  const domain = getDomain(service.url);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const isNative = service.url?.startsWith('https://x402-api.onrender.com');
  const quality = getQualityTier(uptimePercent);
  const isNew = isNewService(service.created_at);

  const handleCopyPrompt = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const requiredParams = service.required_parameters?.required;
    const paramsLine = requiredParams?.length
      ? `\nRequired parameters: ${requiredParams.join(', ')}. You MUST provide these parameters or the call will fail.`
      : '';
    const prompt = isFree
      ? `Use x402 Bazaar to call "${service.name}" (free).${paramsLine}`
      : `Use x402 Bazaar to call "${service.name}" (costs ${service.price_usdc} USDC).\nWhen calling, specify chain: "base" (default, ~$0.001 gas) or "skale" (ultra-low gas ~$0.0007).\nService ID: ${service.id} — use call_service("${service.id}") for native 95/5 revenue split.${paramsLine}`;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in insecure contexts
    }
  };

  return (
    <div className="glass-card rounded-xl p-3 sm:p-5 transition-all duration-300 ease-out hover:bg-white/[0.07]
                    hover:border-[#FF9900]/30 hover:-translate-y-1 hover:scale-[1.02]
                    hover:shadow-[0_0_20px_rgba(255,153,0,0.08),0_8px_24px_rgba(0,0,0,0.3)] group relative">
      {/* NEW badge */}
      {isNew && (
        <span
          className="absolute -top-2 -right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full
                     bg-[#FF9900] text-black animate-badge-glow select-none z-10"
          aria-label="New service added in the last 7 days"
        >
          NEW
        </span>
      )}

      {/* Top row: logo + name + price */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-[#232f3e] flex items-center justify-center shrink-0 overflow-hidden">
          {domain && !imgError ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
              alt={service.name}
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
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" aria-hidden="true" />
                {t.serviceCard.online || 'Online'}
              </span>
            )}
            {healthStatus === 'offline' && (
              <span className="flex items-center gap-1 text-[10px] text-red-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" aria-hidden="true" />
                {t.serviceCard.offline || 'Offline'}
              </span>
            )}
            {isNative && (
              <span className="text-[11px] bg-[#FF9900]/10 text-[#FF9900] px-1.5 py-0.5 rounded border border-[#FF9900]/20 shrink-0">
                {t.serviceCard.native}
              </span>
            )}
            {service.verified_status === 'reachable' && (
              <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                {t.serviceCard.autoTested}
              </span>
            )}
            {quality && (
              <span
                className="text-[11px] px-1.5 py-0.5 rounded shrink-0 font-medium"
                style={{
                  backgroundColor: `${quality.bg}15`,
                  color: quality.color,
                  border: `1px solid ${quality.bg}30`,
                }}
                aria-label={`${quality?.label} tier - ${uptimePercent}% uptime over 7 days`}
              >
                {quality.label}
              </span>
            )}
          </div>
          <span className="inline-block text-xs mt-0.5 text-gray-300 capitalize">
            {service.tags?.find((tag: string) => !['x402-native', 'live'].includes(tag)) || service.tags?.[0]}
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

      {/* Star rating (if reviews exist) */}
      {reviewStats && reviewStats.count > 0 && (
        <div className="flex items-center gap-1.5 mb-2">
          <StarRating rating={reviewStats.average} size="sm" />
          <span className="text-[10px] text-gray-300">
            {reviewStats.average} ({reviewStats.count})
          </span>
        </div>
      )}

      {/* Description */}
      <p className="text-gray-300 text-xs mb-3 leading-relaxed line-clamp-2" title={service.description}>
        {service.description}
      </p>

      {/* Activity badge */}
      {lastActivity && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" aria-hidden="true" />
          <span className="text-xs text-gray-300">{timeAgo(lastActivity, t)}</span>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {service.tags?.slice(0, 3).map((tag: string) => (
          <span key={tag} className="text-xs text-gray-300 bg-white/5 px-2 py-0.5 rounded-lg">
            {tag}
          </span>
        ))}
        {service.tags?.length > 3 && (
          <span className="text-xs text-gray-500 px-1">+{service.tags.length - 3}</span>
        )}
      </div>

      {/* Call count */}
      {callCount != null && callCount > 0 && (
        <div className="flex items-center gap-1 mb-2">
          <svg className="w-3 h-3 text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span className="text-[11px] text-gray-500">
            {callCount >= 1000
              ? `${(callCount / 1000).toFixed(1)}k calls`
              : `${callCount} calls`}
          </span>
        </div>
      )}

      {/* Bottom row: owner + verify + actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-mono">
            {service.owner_address?.slice(0, 6)}...{service.owner_address?.slice(-4)}
          </span>
          {service.tx_hash && /^0x[a-fA-F0-9]{64}$/.test(service.tx_hash) && (
            <a
              href={`https://basescan.org/tx/${service.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF9900] no-underline hover:text-[#FEBD69]"
              aria-label={`${t.serviceCard.verified} - Basescan (opens in new tab)`}
            >
              {t.serviceCard.verified}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isValidServiceUrl(service.url) && (
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 min-h-[44px] sm:min-h-0 rounded-md
                         bg-white/5 text-gray-300 hover:text-white hover:bg-white/10
                         transition-all duration-200 cursor-pointer border-none active:scale-95"
              aria-label={copied ? t.serviceCard.copied : t.serviceCard.useWithAI}
              title={t.serviceCard.useWithAI}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>
              </svg>
              {copied ? t.serviceCard.copied : t.serviceCard.useWithAI}
            </button>
          )}
          <Link
            to={`/services/${service.id}`}
            className="text-xs font-medium text-gray-300 hover:text-white no-underline min-h-[44px] sm:min-h-0 flex items-center
                       opacity-100 transition-opacity duration-200"
            onClick={e => e.stopPropagation()}
            aria-label={`Reviews for ${service.name}`}
          >
            Reviews
          </Link>
          {isValidServiceUrl(service.url) ? (
            <a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-[#FF9900] hover:text-[#FFB340] no-underline min-h-[44px] sm:min-h-0 flex items-center
                         opacity-100 transition-opacity duration-200"
              aria-label={`View API - ${service.name} (opens in new tab)`}
              onClick={() => trackEvent("service_card_click", { service: service.name })}
            >
              {t.serviceCard.viewApi} &rarr;
            </a>
          ) : (
            <span className="text-xs text-gray-500">{t.serviceCard.viewApi}</span>
          )}
        </div>
      </div>
    </div>
  );
}

ServiceCard.displayName = 'ServiceCard';
export default memo(ServiceCard);
