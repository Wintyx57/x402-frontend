import React, { useState, memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/LanguageContext";
import StarRating from "./StarRating";
import X402Logo from "./icons/X402Logo";
import CategoryIcon from "./CategoryIcon";
import type { Service } from "../types/service";

const CATEGORY_BG: Record<string, string> = {
  ai: "bg-violet-500/15 border-violet-500/25",
  finance: "bg-emerald-500/15 border-emerald-500/25",
  data: "bg-blue-500/15 border-blue-500/25",
  developer: "bg-cyan-500/15 border-cyan-500/25",
  media: "bg-pink-500/15 border-pink-500/25",
  security: "bg-emerald-400/15 border-emerald-400/25",
  location: "bg-amber-500/15 border-amber-500/25",
  communication: "bg-indigo-500/15 border-indigo-500/25",
  seo: "bg-teal-500/15 border-teal-500/25",
  scraping: "bg-orange-500/15 border-orange-500/25",
  fun: "bg-rose-500/15 border-rose-500/25",
};

function getCategoryBg(category: string | undefined): string {
  return (category && CATEGORY_BG[category]) || "bg-[#1a1f2e] border-white/8";
}

function getDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    if (
      /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01]))/.test(
        parsed.hostname,
      )
    )
      return null;
    return parsed.hostname;
  } catch {
    return null;
  }
}

function isValidServiceUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

interface QualityTier {
  label: string;
  color: string;
  bg: string;
}

function getQualityTier(uptimePercent: number | null): QualityTier | null {
  if (uptimePercent == null) return null;
  if (uptimePercent >= 99)
    return { label: "Gold", color: "#FBBF24", bg: "#FBBF24" };
  if (uptimePercent >= 95)
    return { label: "Silver", color: "#94A3B8", bg: "#94A3B8" };
  if (uptimePercent >= 90)
    return { label: "Bronze", color: "#CD7F32", bg: "#CD7F32" };
  return null;
}

function getTrustBadge(
  score: number | null | undefined,
): { label: string; color: string; bg: string } | null {
  if (score == null) return null;
  if (score >= 80)
    return { label: `${score}`, color: "#34D399", bg: "#34D399" };
  if (score >= 60)
    return { label: `${score}`, color: "#FBBF24", bg: "#FBBF24" };
  if (score >= 40)
    return { label: `${score}`, color: "#FB923C", bg: "#FB923C" };
  return { label: `${score}`, color: "#F87171", bg: "#F87171" };
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
  healthStatus?: "online" | "offline" | null;
  uptimePercent?: number | null;
  reviewStats?: ReviewStats | null;
}

function ServiceCard({
  service,
  healthStatus = null,
  uptimePercent = null,
  reviewStats = null,
}: ServiceCardProps) {
  const { t } = useTranslation();
  const isFree = Number(service.price_usdc) === 0;
  const price = Number(service.price_usdc) || 0;
  const isNative = service.url?.startsWith("https://x402-api.onrender.com");
  const isFreeTierEligible = !isFree && isNative && price > 0 && price <= 0.01;
  const initial = service.name?.charAt(0)?.toUpperCase() || "?";
  const domain = getDomain(service.url);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const quality = getQualityTier(uptimePercent);
  const trustBadge = getTrustBadge(service.trust_score);
  const isNew = isNewService(service.created_at);
  const primaryCategory =
    service.tags?.find(
      (tag: string) => !["x402-native", "live"].includes(tag),
    ) || service.tags?.[0];

  // Build badges array, max 2 (priority: Native > Trust > Quality > AutoTested)
  const badges = useMemo(() => {
    const list: { key: string; el: React.ReactElement }[] = [];
    if (isNative) {
      list.push({
        key: "native",
        el: (
          <span className="text-[11px] bg-[#FF9900]/10 text-[#FF9900] px-2 py-0.5 rounded-md border border-[#FF9900]/20 shrink-0">
            {t.serviceCard.native}
          </span>
        ),
      });
    }
    if (isFreeTierEligible) {
      list.push({
        key: "free-trial",
        el: (
          <span className="text-[11px] bg-[#34D399]/10 text-[#34D399] px-2 py-0.5 rounded-md border border-[#34D399]/20 shrink-0 font-medium">
            {t.serviceCard.freeToTry}
          </span>
        ),
      });
    }
    if (trustBadge) {
      list.push({
        key: "trust",
        el: (
          <span
            className="text-[11px] px-2 py-0.5 rounded-md shrink-0 font-medium flex items-center gap-0.5"
            style={{
              backgroundColor: `${trustBadge.bg}15`,
              color: trustBadge.color,
              border: `1px solid ${trustBadge.bg}30`,
            }}
            aria-label={`Trust score: ${trustBadge.label} out of 100`}
            title="Proof of Quality score"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01z" />
            </svg>
            {trustBadge.label}
          </span>
        ),
      });
    }
    if (quality) {
      list.push({
        key: "quality",
        el: (
          <span
            className="text-[11px] px-2 py-0.5 rounded-md shrink-0 font-medium"
            style={{
              backgroundColor: `${quality.bg}15`,
              color: quality.color,
              border: `1px solid ${quality.bg}30`,
            }}
            aria-label={`${quality.label} tier - ${uptimePercent}% uptime over 7 days`}
          >
            {quality.label}
          </span>
        ),
      });
    }
    if (service.verified_status === "reachable") {
      list.push({
        key: "auto-tested",
        el: (
          <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
            {t.serviceCard.autoTested}
          </span>
        ),
      });
    }
    return list.slice(0, 2);
  }, [
    isNative,
    isFreeTierEligible,
    trustBadge,
    quality,
    service.verified_status,
    uptimePercent,
    t.serviceCard,
  ]);

  const handleCopyPrompt = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const requiredParams = service.required_parameters?.required;
    const paramsLine = requiredParams?.length
      ? `\nRequired parameters: ${requiredParams.join(", ")}. You MUST provide these parameters or the call will fail.`
      : "";
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
    <div
      className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col h-full transition-all duration-300 ease-out
                    hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1.5
                    hover:shadow-[0_0_20px_rgba(255,153,0,0.12),0_8px_32px_rgba(0,0,0,0.60)] group relative"
    >
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

      {/* ===== HEADER: Logo + Name + Price ===== */}
      <div className="flex items-start gap-4 mb-4">
        {/* Logo 48px */}
        <div
          className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden ${
            isNative
              ? getCategoryBg(primaryCategory)
              : "bg-[#1a1f2e] border-white/8"
          }`}
        >
          {isNative ? (
            primaryCategory ? (
              <CategoryIcon
                category={
                  primaryCategory as Parameters<
                    typeof CategoryIcon
                  >[0]["category"]
                }
                className="w-6 h-6"
              />
            ) : (
              <X402Logo className="w-12 h-12" />
            )
          ) : service.logo_url ? (
            <img
              src={service.logo_url}
              alt=""
              className="w-8 h-8 object-contain"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : domain && !imgError ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
              alt=""
              className="w-7 h-7 object-contain"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <span className="text-lg font-bold text-[#FF9900]">{initial}</span>
          )}
        </div>

        {/* Name + Category + Status */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-white font-semibold text-[15px] leading-snug truncate"
            title={service.name}
          >
            {service.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400 capitalize">
              {primaryCategory}
            </span>
            {healthStatus === "online" && (
              <span className="flex items-center gap-1 text-[10px] text-[#34D399] shrink-0">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse"
                  aria-hidden="true"
                />
                {t.serviceCard.online || "Online"}
              </span>
            )}
            {healthStatus === "offline" && (
              <span className="flex items-center gap-1 text-[10px] text-red-400 shrink-0">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-red-400"
                  aria-hidden="true"
                />
                {t.serviceCard.offline || "Offline"}
              </span>
            )}
          </div>
        </div>

        {/* Price badge */}
        <span
          className={`shrink-0 font-mono text-sm font-bold px-3 py-1.5 rounded-lg ${
            isFree
              ? "bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20"
              : "bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20"
          }`}
        >
          {isFree ? t.serviceCard.free : `$${service.price_usdc}`}
        </span>
      </div>

      {/* ===== BODY: Description + Badges + Reviews ===== */}

      {/* Description */}
      <p
        className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3"
        title={service.description}
      >
        {service.description}
      </p>

      {/* Badges row — max 2 */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {badges.map((b) => (
            <span key={b.key}>{b.el}</span>
          ))}
        </div>
      )}

      {/* Reviews */}
      {reviewStats && reviewStats.count > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={reviewStats.average} size="sm" />
          <span className="text-[10px] text-gray-300">
            {reviewStats.average} ({reviewStats.count})
          </span>
        </div>
      )}

      {/* ===== FOOTER: 2 CTAs only ===== */}
      <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/6">
        {isValidServiceUrl(service.url) && (
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 min-h-[44px] sm:min-h-0 rounded-md
                       bg-white/5 text-gray-300 hover:text-white hover:bg-white/10
                       transition-all duration-200 cursor-pointer border-none active:scale-95"
            aria-label={copied ? t.serviceCard.copied : t.serviceCard.useWithAI}
            title={t.serviceCard.useWithAI}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z" />
            </svg>
            {copied ? t.serviceCard.copied : t.serviceCard.useWithAI}
          </button>
        )}
        <Link
          to={`/services/${service.id}`}
          className="ml-auto text-xs font-medium text-[#FF9900] hover:text-[#FFB340] no-underline min-h-[44px] sm:min-h-0 flex items-center
                     transition-colors duration-200"
          onClick={(e) => e.stopPropagation()}
          aria-label={`View details for ${service.name}`}
        >
          {t.serviceCard.viewApi} &rarr;
        </Link>
      </div>
    </div>
  );
}

ServiceCard.displayName = "ServiceCard";
export default memo(ServiceCard);
