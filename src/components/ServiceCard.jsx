import { useTranslation } from '../i18n/LanguageContext';

export default function ServiceCard({ service }) {
  const { t } = useTranslation();

  return (
    <div className="glass rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:glow-blue
                    hover:border-white/15">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-white font-semibold text-lg">{service.name}</h3>
        <span className={`font-mono text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap ml-3 ${
          Number(service.price_usdc) === 0
            ? 'bg-blue-500/10 text-blue-400'
            : 'bg-green-500/10 text-green-400'
        }`}>
          {Number(service.price_usdc) === 0 ? t.serviceCard.free : `${service.price_usdc} USDC`}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-4 leading-relaxed">
        {service.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {service.tags?.map(tag => (
          <span key={tag} className="text-xs glass text-blue-300 px-2.5 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-mono">
          {service.owner_address?.slice(0, 6)}...{service.owner_address?.slice(-4)}
        </span>
        {service.tx_hash && (
          <a
            href={`https://basescan.org/tx/${service.tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-text font-medium no-underline"
          >
            {t.serviceCard.verifiedOnChain}
          </a>
        )}
      </div>
    </div>
  );
}
