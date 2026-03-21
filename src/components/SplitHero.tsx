import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

const HeroScene = lazy(() => import('./HeroScene'));

type HoverState = 'none' | 'provider' | 'agent';

// Arrow icon shared between both CTAs
function ArrowIcon() {
  return (
    <svg
      className="hero-cta-arrow"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

export default function SplitHero() {
  const { t } = useTranslation();
  const h = t.home;

  const [hoverState, setHoverState] = useState<HoverState>('none');
  const [txCount, setTxCount] = useState(2847);

  // Live counter — increments every few seconds to simulate real activity
  useEffect(() => {
    const interval = setInterval(() => {
      setTxCount(prev => prev + Math.floor(Math.random() * 3));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const heroClass = [
    'hero-split',
    hoverState === 'provider' ? 'hover-provider' : '',
    hoverState === 'agent' ? 'hover-agent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={heroClass} id="hero">
      {/* Three.js scene — lazy loaded, renders its own canvas */}
      <Suspense fallback={null}>
        <HeroScene hoverState={hoverState} />
      </Suspense>

      {/* Noise overlay */}
      <div className="hero-noise" aria-hidden="true" />

      {/* Chain badges */}
      <div className="hero-chain-badges" aria-hidden="true">
        <span className="hero-chain-badge hero-chain-skale">
          <span className="hero-chain-dot" style={{ background: '#00d4aa' }} />
          SKALE
        </span>
        <span className="hero-chain-badge hero-chain-base">
          <span className="hero-chain-dot" style={{ background: '#0052FF' }} />
          Base
        </span>
        <span className="hero-chain-badge hero-chain-poly">
          <span className="hero-chain-dot" style={{ background: '#8247E5' }} />
          Polygon
        </span>
      </div>

      {/* ====== PROVIDER SIDE ====== */}
      <div
        className="hero-side hero-side-provider"
        onMouseEnter={() => setHoverState('provider')}
        onMouseLeave={() => setHoverState('none')}
      >
        <div className="hero-content">
          {/* Label */}
          <div className="hero-label">
            <span className="hero-label-line" />
            {h.heroProviderLabel}
          </div>

          {/* Title */}
          <h2 className="hero-title">
            <span className="hero-word">{h.heroProviderTitle1}</span>
            <br />
            <span className="hero-word">{h.heroProviderTitle2}</span>
            <br />
            <span className="hero-word">
              <span>{h.heroProviderTitle3}</span>
            </span>
          </h2>

          {/* Description */}
          <p className="hero-desc">{h.heroProviderDesc}</p>

          {/* Stat pills */}
          <div className="hero-stats">
            <span className="hero-stat-pill">
              <span className="hero-stat-dot" />
              {h.heroProviderStat1}
            </span>
            <span className="hero-stat-pill">
              <span className="hero-stat-dot" />
              {h.heroProviderStat2}
            </span>
          </div>

          {/* CTA */}
          <div className="hero-cta-wrap">
            <Link to="/register" className="hero-cta-btn">
              {h.heroProviderCta}
              <ArrowIcon />
            </Link>
          </div>

          {/* Reveal — revenue dashboard bars */}
          <div className="hero-reveal">
            <div className="hero-reveal-dashboard">
              <div className="hero-reveal-header">
                <span className="hero-reveal-label">{h.heroProviderRevenue}</span>
                <span className="hero-reveal-amount">$847</span>
              </div>
              <div className="hero-reveal-bars">
                {[
                  { h: '12px', opacity: .15, delay: '.3s' },
                  { h: '20px', opacity: .20, delay: '.4s' },
                  { h: '16px', opacity: .25, delay: '.5s' },
                  { h: '28px', opacity: .30, delay: '.6s' },
                  { h: '24px', opacity: .35, delay: '.7s' },
                  { h: '32px', opacity: .40, delay: '.8s' },
                  { h: '22px', opacity: .45, delay: '.9s' },
                  { h: '38px', opacity: 1,   delay: '1s'  },
                ].map((bar, i) => (
                  <div
                    key={i}
                    className="hero-reveal-bar"
                    style={{
                      ['--hero-bar-h' as string]: bar.h,
                      background: `rgba(255,153,0,${bar.opacity})`,
                      animationDelay: bar.delay,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== CENTER ZONE — logo + counter ====== */}
      <div className="hero-center-zone">
        <div className="hero-logo-ring-wrap">
          <div className="hero-logo-ring" aria-hidden="true" />
          <span className="hero-logo-text">x402</span>
        </div>
        <div className="hero-counter">
          <div>
            <span className="hero-counter-dot" />
            <span className="hero-counter-value">{txCount.toLocaleString()}</span>
          </div>
          <div className="hero-counter-label">{h.heroTxnsLabel}</div>
        </div>
      </div>

      {/* ====== AGENT SIDE ====== */}
      <div
        className="hero-side hero-side-agent"
        onMouseEnter={() => setHoverState('agent')}
        onMouseLeave={() => setHoverState('none')}
      >
        <div className="hero-content">
          {/* Label */}
          <div className="hero-label">
            {h.heroAgentLabel}
            <span className="hero-label-line" />
          </div>

          {/* Title */}
          <h2 className="hero-title">
            <span className="hero-word">Pay</span>{' '}
            <span className="hero-word">and</span>{' '}
            <span className="hero-word">go.</span>
            <br />
            <span className="hero-word">
              <span>{h.heroAgentTitle2}</span>
            </span>
            <br />
            <span className="hero-word">
              <span>{h.heroAgentTitle3}</span>
            </span>
          </h2>

          {/* Description */}
          <p className="hero-desc">{h.heroAgentDesc}</p>

          {/* Stat pills */}
          <div className="hero-stats">
            <span className="hero-stat-pill">
              <span className="hero-stat-dot" />
              {h.heroAgentStat1}
            </span>
            <span className="hero-stat-pill">
              <span className="hero-stat-dot" />
              {h.heroAgentStat2}
            </span>
          </div>

          {/* CTA */}
          <div className="hero-cta-wrap">
            <Link to="/services" className="hero-cta-btn">
              {h.heroAgentCta}
              <ArrowIcon />
            </Link>
          </div>

          {/* Reveal — terminal typing */}
          <div className="hero-reveal">
            <div className="hero-reveal-terminal">
              <div className="hero-terminal-line">
                <span style={{ color: '#60A5FA' }}>$</span>{' '}
                curl -H{' '}
                <span style={{ color: '#FFB347' }}>"X-Payment: 0xabc..."</span>{' \\ '}
              </div>
              <div className="hero-terminal-line">
                &nbsp;&nbsp;x402-api.onrender.com/api/search?q=AI
              </div>
              <div className="hero-terminal-line">
                <span style={{ color: '#4ade80' }}>{`{"results": [...]}`}</span>{' '}
                <span style={{ color: 'rgba(255,255,255,.2)' }}>// 0.001 USDC</span>
                <span className="hero-terminal-cursor" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="hero-scroll-hint" aria-hidden="true">
        <div className="hero-scroll-line" />
        <span>{h.heroScrollLabel}</span>
      </div>

      {/* Bottom bar — powered by SKALE */}
      <div className="hero-bottom-bar">
        <img
          src="/skale-logo.jpg"
          alt="SKALE Network"
          className="hero-bottom-bar-logo"
        />
        <div>
          <div className="hero-bottom-bar-powered">{h.heroPoweredBy}</div>
          <div className="hero-bottom-bar-name">SKALE Network</div>
        </div>
        <span className="hero-bottom-bar-tag">$0.00 gas</span>
        <span className="hero-bottom-bar-tag">Instant</span>
        <span className="hero-bottom-bar-tag">EVM</span>
      </div>
    </div>
  );
}
