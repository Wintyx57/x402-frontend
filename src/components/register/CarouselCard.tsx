import React from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CarouselCardProps {
  index: number
  title: string
  description: string
  badge: string
  color: 'green' | 'orange' | 'blue' | 'purple'
  isActive: boolean
  style: React.CSSProperties
  onClick: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Color config
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_CONFIG = {
  green: {
    titleGradient: 'linear-gradient(135deg, #fff, #34D399)',
    shadowRgb: '52,211,153',
  },
  orange: {
    titleGradient: 'linear-gradient(135deg, #fff, #FF9900)',
    shadowRgb: '255,153,0',
  },
  blue: {
    titleGradient: 'linear-gradient(135deg, #fff, #60A5FA)',
    shadowRgb: '96,165,250',
  },
  purple: {
    titleGradient: 'linear-gradient(135deg, #fff, #A78BFA)',
    shadowRgb: '167,139,250',
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// 3D Objects — one per card index
// ─────────────────────────────────────────────────────────────────────────────

/** Card 0 – Rotating cube with "+" SVG on front and back faces */
function ObjCube() {
  return (
    <div className="obj-cube">
      <div className="face front">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <div className="face back">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <div className="face left" />
      <div className="face right" />
      <div className="face top" />
      <div className="face bottom" />
    </div>
  )
}

/** Card 1 – 3 stacked floating document layers */
function ObjDocs() {
  return (
    <div className="obj-docs">
      <div className="doc-layer" />
      <div className="doc-layer" />
      <div className="doc-layer" />
    </div>
  )
}

/** Card 2 – Lightning bolt SVG with 2 pulsing rings */
function ObjBolt() {
  return (
    <div className="obj-bolt">
      <div className="bolt-ring" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(96,165,250,0.7)"
        strokeWidth="1.5"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
      <div className="bolt-ring" />
    </div>
  )
}

/** Card 3 – 3 interlocking chain link divs */
function ObjChain() {
  return (
    <div className="obj-chain">
      <div className="chain-link" />
      <div className="chain-link" />
      <div className="chain-link" />
    </div>
  )
}

const OBJECTS: React.FC[] = [ObjCube, ObjDocs, ObjBolt, ObjChain]

// ─────────────────────────────────────────────────────────────────────────────
// CarouselCard
// ─────────────────────────────────────────────────────────────────────────────

export default function CarouselCard({
  index,
  title,
  description,
  badge,
  color,
  isActive,
  style,
  onClick,
}: CarouselCardProps) {
  const { titleGradient, shadowRgb } = COLOR_CONFIG[color]
  const Object3D = OBJECTS[index]

  // ── Card base styles ──────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    ...style,
    position: 'absolute',
    width: 300,
    height: 330,
    borderRadius: 24,
    padding: '28px 24px',
    cursor: 'pointer',
    transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backfaceVisibility: 'hidden',
    background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
    border: `1px solid ${isActive ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.07)'}`,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    overflow: 'hidden',
    filter: isActive ? 'none' : 'blur(1.5px)',
    opacity: isActive ? 1 : 0.4,
    boxShadow: isActive
      ? `0 0 80px rgba(${shadowRgb}, 0.08), 0 25px 60px rgba(0,0,0,0.5)`
      : 'none',
  }

  // ── Title gradient ────────────────────────────────────────────────────────
  const titleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
    letterSpacing: '-0.3px',
    textShadow: '0 1px 8px rgba(0,0,0,0.3)',
    background: titleGradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }

  return (
    <div
      className={`card-3d${isActive ? ' active' : ''}`}
      data-index={index}
      style={cardStyle}
      onClick={onClick}
    >
      {/* Top highlight line — mirrors .card-3d::before pseudo-element */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* 3D scene */}
      <div className="card-scene">
        <Object3D />
      </div>

      {/* Text block */}
      <div className="card-text" style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={titleStyle}>{title}</h3>
        <p
          className="card-desc"
          style={{
            fontSize: 13.5,
            color: isActive ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.55)',
            lineHeight: 1.6,
            marginBottom: 14,
            fontWeight: 400,
            letterSpacing: '0.1px',
          }}
        >
          {description}
        </p>
        <span className={`card-badge ${color}`}>{badge}</span>
      </div>
    </div>
  )
}
