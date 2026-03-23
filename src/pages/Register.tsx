import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import useSEO from '../hooks/useSEO'
import { API_URL } from '../config'

import AuroraBackground from '../components/register/AuroraBackground'
import Carousel3D from '../components/register/Carousel3D'
import CompactTabs from '../components/register/CompactTabs'
import ListApiForm from '../components/register/ListApiForm'
import OpenApiPanel from '../components/register/OpenApiPanel'
import RapidApiPanel from '../components/register/RapidApiPanel'
import PaymentLinkForm from '../components/register/PaymentLinkForm'

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────

const CARDS = [
  {
    title: 'List Your API',
    description: 'Paste your URL, set a price, and start earning.',
    badge: '~ 30 sec',
    color: 'green' as const,
  },
  {
    title: 'Import OpenAPI',
    description: 'Upload your spec and import all endpoints at once.',
    badge: 'Bulk import',
    color: 'orange' as const,
  },
  {
    title: 'From RapidAPI',
    description: 'Migrate in one click. Credentials auto-configured.',
    badge: '1-click',
    color: 'blue' as const,
  },
  {
    title: 'Payment Links',
    description: 'Paywall any URL. Share a link, get paid in USDC.',
    badge: 'Paywall',
    color: 'purple' as const,
  },
]

const TABS = [
  { label: 'List API',      color: 'green'  as const },
  { label: 'OpenAPI',       color: 'orange' as const },
  { label: 'RapidAPI',      color: 'blue'   as const },
  { label: 'Payment Link',  color: 'purple' as const },
]

// ─────────────────────────────────────────────────────────────────────────────
// Register — hub page
// ─────────────────────────────────────────────────────────────────────────────

export default function Register() {
  useSEO({
    title: 'Register — x402 Bazaar',
    description: 'List your API, import from OpenAPI or RapidAPI, or create a payment link. Start earning USDC in minutes.',
  })

  const [searchParams] = useSearchParams()
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState({ totalServices: '--', totalPayments: '--' })

  // Honour ?mode=quick / ?mode=paylink URL params
  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'quick')   setSelectedCard(0)
    else if (mode === 'paylink') setSelectedCard(3)
  }, [searchParams])

  // Fetch live platform stats
  useEffect(() => {
    fetch(`${API_URL}/api/public-stats`)
      .then(r => r.json())
      .then(data => setStats({
        totalServices: String(data.totalServices ?? '107'),
        totalPayments: String(data.totalPayments ?? '0'),
      }))
      .catch(() => {})
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────

  function selectCard(index: number) {
    setSelectedCard(index)
    setCurrentIndex(index)
  }

  function backToCarousel() {
    setSelectedCard(null)
  }

  function switchTab(index: number) {
    setSelectedCard(index)
    setCurrentIndex(index)
  }

  function navigateCarousel(dir: number) {
    setCurrentIndex(prev => (prev + dir + CARDS.length) % CARDS.length)
  }

  // ── Panel renderer ────────────────────────────────────────────────────────

  function renderPanel() {
    if (selectedCard === null) return null

    const panels = [
      <ListApiForm    key="list"     onBack={backToCarousel} />,
      <OpenApiPanel   key="openapi"  onBack={backToCarousel} />,
      <RapidApiPanel  key="rapidapi" onBack={backToCarousel} />,
      <PaymentLinkForm key="paylink" onBack={backToCarousel} />,
    ]

    return (
      <div className="max-w-[640px] mx-auto animate-fade-in-up">
        {panels[selectedCard]}
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <AuroraBackground />

      <div className="relative z-[2] max-w-[1200px] mx-auto px-6 pt-16 pb-24">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div className="text-center mb-16">

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[rgba(255,153,0,0.08)] border border-[rgba(255,153,0,0.2)] text-[#FF9900] text-[13px] font-semibold mb-5 tracking-wide">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            For Providers
          </div>

          {/* Title with 3-layer depth effect matching prototype */}
          <div className="hero-title-wrap">
            <div className="hero-title-shadow" aria-hidden="true">Monetize Your API</div>
            <div className="hero-title-shadow" aria-hidden="true">Monetize Your API</div>
            <div className="hero-title-shadow" aria-hidden="true">Monetize Your API</div>
            <h1 className="text-[clamp(36px,5.5vw,58px)] font-extrabold leading-[1.1] mb-4 bg-gradient-to-br from-white from-20% to-[#FF9900] bg-clip-text text-transparent tracking-tight relative">
              Monetize Your API
            </h1>
          </div>

          <p className="text-lg text-gray-400 max-w-[500px] mx-auto leading-relaxed">
            Start earning USDC in minutes. Choose how you want to list your service.
          </p>
        </div>

        {/* ── 3D CAROUSEL ──────────────────────────────────────────────────── */}
        <Carousel3D
          cards={CARDS}
          currentIndex={currentIndex}
          isCompact={selectedCard !== null}
          onSelect={selectCard}
          onNavigate={navigateCarousel}
          onIndexChange={setCurrentIndex}
        />

        {/* ── COMPACT TABS (visible after card selection) ───────────────────── */}
        <CompactTabs
          tabs={TABS}
          activeIndex={selectedCard ?? currentIndex}
          onSelect={switchTab}
          visible={selectedCard !== null}
        />

        {/* ── FORM PANEL ───────────────────────────────────────────────────── */}
        {renderPanel()}

        {/* ── STATS BAR ────────────────────────────────────────────────────── */}
        <div className="flex justify-center gap-12 mt-12 pt-8 relative flex-wrap">
          {/* Accent rule */}
          <div
            className="absolute top-0 left-[10%] right-[10%] h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(255,153,0,0.2), transparent)' }}
            aria-hidden="true"
          />

          <StatItem value={stats.totalServices} label="APIs listed" />
          <StatItem value="95%"                  label="Revenue to you" />
          <StatItem value="3"                    label="Chains supported" />
          <StatItem value={stats.totalPayments}  label="Total payments" />
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StatItem — small helper to keep stats bar DRY
// ─────────────────────────────────────────────────────────────────────────────

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-[28px] font-extrabold font-mono bg-gradient-to-br from-[#FF9900] to-[#ffcc66] bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-[13px] text-gray-400 mt-1">{label}</div>
    </div>
  )
}
