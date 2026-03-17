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

/** Official SKALE Network logo — real logo from skale-logo.jpg */
export function SkaleLogo({ className = 'w-5 h-5' }: LogoProps) {
  return (
    <img
      src="/skale-logo.jpg"
      alt=""
      className={className}
      aria-hidden="true"
    />
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
