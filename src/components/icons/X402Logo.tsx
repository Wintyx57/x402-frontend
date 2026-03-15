export default function X402Logo({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="x402-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0D1117" />
          <stop offset="100%" stopColor="#161B22" />
        </linearGradient>
        <linearGradient id="x402-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFAA22" />
          <stop offset="100%" stopColor="#FF8800" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="96" ry="96" fill="url(#x402-bg)" />
      <rect x="4" y="4" width="504" height="504" rx="92" ry="92" fill="none" stroke="#FF9900" strokeOpacity="0.3" strokeWidth="8" />
      <text
        x="256"
        y="340"
        fontFamily="'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif"
        fontWeight="800"
        fontSize="300"
        fill="url(#x402-accent)"
        textAnchor="middle"
        letterSpacing="-12"
      >
        x4
      </text>
    </svg>
  );
}
