// ─────────────────────────────────────────────────────────────────────────────
// RevenueHint — Revenue calculation display with green accent
// ─────────────────────────────────────────────────────────────────────────────

interface RevenueHintProps {
  price: number // USDC per call
}

export default function RevenueHint({ price }: RevenueHintProps) {
  const monthly = (price * 100 * 30 * 0.95).toFixed(2)

  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{
        background: 'rgba(52,211,153,0.05)',
        border: '1px solid rgba(52,211,153,0.2)',
      }}
      role="note"
      aria-label="Revenue estimate"
    >
      {/* Dollar icon */}
      <div
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
        style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}
        aria-hidden="true"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="#34D399"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      </div>

      {/* Text */}
      <p className="text-gray-400 text-xs leading-relaxed">
        At{' '}
        <strong className="font-mono" style={{ color: '#34D399' }}>
          ${price}
        </strong>
        /call, 100 calls/day earns you{' '}
        <strong className="font-mono" style={{ color: '#34D399' }}>
          ${monthly}
        </strong>
        /month (95% split). Paid directly to your wallet in USDC.
      </p>
    </div>
  )
}
