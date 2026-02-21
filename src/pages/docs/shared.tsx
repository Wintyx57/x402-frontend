import SharedCopyButton from '../../components/CopyButton';

interface DocsCodeBlockProps { code: string; }
interface PriceBadgeProps { price?: string; freeLabel?: string; }

export function DocsCodeBlock({ code }: DocsCodeBlockProps) {
  return (
    <div className="relative group">
      <SharedCopyButton text={code} copiedLabel="Copied" />
      <pre className="bg-[#0d1117] border border-white/10 rounded-xl p-3 sm:p-5 pt-12 overflow-x-auto text-xs sm:text-sm leading-relaxed">
        <code className="text-gray-300 font-mono">{code}</code>
      </pre>
    </div>
  );
}

export function PriceBadge({ price, freeLabel }: PriceBadgeProps) {
  return (
    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
      price ? 'bg-[#FF9900]/10 text-[#FF9900]' : 'bg-[#34D399]/10 text-[#34D399]'
    }`}>
      {price ? `${price} USDC` : (freeLabel || 'Free')}
    </span>
  );
}
