import { useTranslation } from '../i18n/LanguageContext';

const CATEGORY_META = {
  ai:            { emoji: '\u{1F916}', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'cat-ai' },
  finance:       { emoji: '\u{1F4B0}', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'cat-finance' },
  data:          { emoji: '\u{1F4CA}', color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'cat-data' },
  developer:     { emoji: '\u{1F4BB}', color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'cat-developer' },
  media:         { emoji: '\u{1F3A8}', color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'cat-media' },
  security:      { emoji: '\u{1F512}', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'cat-security' },
  location:      { emoji: '\u{1F4CD}', color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'cat-location' },
  communication: { emoji: '\u{1F4AC}', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'cat-communication' },
  seo:           { emoji: '\u{1F50D}', color: 'text-lime-400',   bg: 'bg-lime-500/10',   border: 'cat-seo' },
  scraping:      { emoji: '\u{1F578}\u{FE0F}', color: 'text-violet-400',bg: 'bg-violet-500/10',border: 'cat-scraping' },
  fun:           { emoji: '\u{1F3AE}', color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'cat-fun' },
};

function getCategoryMeta(tags) {
  if (!tags?.length) return CATEGORY_META.data;
  const primary = tags[0];
  return CATEGORY_META[primary] || CATEGORY_META.data;
}

export default function ServiceCard({ service }) {
  const { t } = useTranslation();
  const cat = getCategoryMeta(service.tags);
  const isFree = Number(service.price_usdc) === 0;

  return (
    <div className={`glass-card rounded-xl p-4 transition-all duration-300 hover:bg-white/[0.05]
                    hover:border-white/12 group ${cat.border}`}>
      {/* Top row: emoji + name + price */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${cat.bg} flex items-center justify-center text-lg shrink-0`}>
          {cat.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm leading-tight truncate">{service.name}</h3>
          <span className={`inline-block text-xs mt-0.5 ${cat.color} capitalize`}>
            {service.tags?.[0]}
          </span>
        </div>
        <span className={`shrink-0 font-mono text-xs font-bold px-2.5 py-1 rounded-full ${
          isFree
            ? 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20'
            : 'bg-green-500/15 text-green-400 ring-1 ring-green-500/20'
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
          <span key={tag} className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
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
              className="text-green-500 no-underline hover:text-green-400"
            >
              {t.serviceCard.verified}
            </a>
          )}
        </div>
        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-medium text-blue-400 hover:text-blue-300 no-underline
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          {t.serviceCard.viewApi} &rarr;
        </a>
      </div>
    </div>
  );
}
