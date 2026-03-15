interface LogoProps {
  className?: string;
}

/** Official Base (Coinbase L2) logo mark — blue circle with white "b" */
export function BaseLogo({ className = 'w-5 h-5' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 111 111" fill="none" aria-hidden="true">
      <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF" />
      <path
        d="M55.39 82.39C70.01 82.39 81.86 70.36 81.86 55.52C81.86 40.67 70.01 28.64 55.39 28.64C41.61 28.64 30.27 39.3 29.01 52.84H64.9V58.2H29.01C30.27 71.74 41.61 82.39 55.39 82.39Z"
        fill="white"
      />
    </svg>
  );
}

/** Official SKALE Network logo mark — teal hexagonal S */
export function SkaleLogo({ className = 'w-5 h-5' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="skale-g" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#46BDC6" />
          <stop offset="1" stopColor="#2BA3AA" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="24" fill="#1A1C2B" />
      {/* Upper diamond */}
      <path d="M60 20L88 38V62L60 80L32 62V38L60 20Z" fill="url(#skale-g)" opacity="0.35" />
      {/* Lower diamond */}
      <path d="M60 40L88 58V82L60 100L32 82V58L60 40Z" fill="url(#skale-g)" opacity="0.35" />
      {/* Center S-path */}
      <path
        d="M72 38L60 30L40 42V56L60 68L80 56V70L60 82L48 74"
        stroke="url(#skale-g)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Official Polygon logo mark — purple geometric mark */
export function PolygonLogo({ className = 'w-5 h-5' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 38.4 33.5" fill="none" aria-hidden="true">
      <path
        d="M29 10.2c-.7-.4-1.6-.4-2.4 0L21 13.5l-3.8 2.1-5.5 3.3c-.7.4-1.6.4-2.4 0L5 16.3c-.7-.4-1.2-1.2-1.2-2.1v-5c0-.8.4-1.6 1.2-2.1l4.3-2.5c.7-.4 1.6-.4 2.4 0L16 7.2c.7.4 1.2 1.2 1.2 2.1v3.3l3.8-2.2V7c0-.8-.4-1.6-1.2-2.1l-8-4.7c-.7-.4-1.6-.4-2.4 0L1.2 5C.4 5.4 0 6.2 0 7v9.4c0 .8.4 1.6 1.2 2.1l8.1 4.7c.7.4 1.6.4 2.4 0l5.5-3.2 3.8-2.2 5.5-3.2c.7-.4 1.6-.4 2.4 0l4.3 2.5c.7.4 1.2 1.2 1.2 2.1v5c0 .8-.4 1.6-1.2 2.1L29 27.8c-.7.4-1.6.4-2.4 0l-4.3-2.5c-.7-.4-1.2-1.2-1.2-2.1v-3.3l-3.8 2.2v3.3c0 .8.4 1.6 1.2 2.1l8.1 4.7c.7.4 1.6.4 2.4 0l8.1-4.7c.7-.4 1.2-1.2 1.2-2.1V16c0-.8-.4-1.6-1.2-2.1L29 10.2z"
        fill="#8247E5"
      />
    </svg>
  );
}
