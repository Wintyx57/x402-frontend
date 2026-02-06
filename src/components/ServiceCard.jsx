export default function ServiceCard({ service }) {
  return (
    <div className="bg-[#12121a] border border-gray-800 rounded-xl p-5 hover:border-blue-500/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-white font-semibold text-lg">{service.name}</h3>
        <span className="text-green-400 font-mono text-sm font-bold whitespace-nowrap ml-3">
          {service.price_usdc} USDC
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-4 leading-relaxed">
        {service.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {service.tags?.map(tag => (
          <span key={tag} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
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
            className="text-blue-400 hover:text-blue-300 no-underline"
          >
            Verified on-chain
          </a>
        )}
      </div>
    </div>
  );
}
