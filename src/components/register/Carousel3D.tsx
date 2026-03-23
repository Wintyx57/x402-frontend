import React, { useEffect, useRef, useCallback } from 'react'
import CarouselCard from './CarouselCard'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CardData {
  title: string
  description: string
  badge: string
  color: 'green' | 'orange' | 'blue' | 'purple'
}

interface Carousel3DProps {
  cards: CardData[]
  currentIndex: number
  isCompact: boolean
  onSelect: (index: number) => void
  onNavigate: (dir: number) => void
  onIndexChange: (index: number) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Geometry — trigonometry matching the HTML prototype exactly
// ─────────────────────────────────────────────────────────────────────────────

function computeCardStyle(
  i: number,
  currentIndex: number,
  total: number,
): React.CSSProperties {
  const angle = ((i - currentIndex) * (360 / total))
  const rad = (angle * Math.PI) / 180
  const x = Math.sin(rad) * 310
  const zPos = Math.cos(rad) * 310 - 310
  const scale = 0.5 + ((Math.cos(rad) + 1) * 0.25)
  const zIndex = Math.round(scale * 10)
  return {
    transform: `translateX(${x}px) translateZ(${zPos}px) scale(${scale})`,
    zIndex,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Carousel3D
// ─────────────────────────────────────────────────────────────────────────────

export default function Carousel3D({
  cards,
  currentIndex,
  isCompact,
  onSelect,
  onNavigate,
  onIndexChange,
}: Carousel3DProps) {
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dragStartX = useRef<number | null>(null)
  const isDragging = useRef(false)

  function startAutoRotate() {
    if (autoRotateRef.current) return
    autoRotateRef.current = setInterval(() => onNavigate(1), 3000)
  }

  function stopAutoRotate() {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current)
      autoRotateRef.current = null
    }
  }

  useEffect(() => () => stopAutoRotate(), [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragStartX.current = e.clientX
    isDragging.current = false
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    stopAutoRotate()
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragStartX.current === null) return
    const diff = e.clientX - dragStartX.current
    if (Math.abs(diff) > 10) isDragging.current = true
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragStartX.current === null) return
    const diff = e.clientX - dragStartX.current
    if (Math.abs(diff) > 50) {
      onNavigate(diff < 0 ? 1 : -1)
    }
    dragStartX.current = null
    isDragging.current = false
  }, [onNavigate])

  // ── Container style — collapses when a card is selected ───────────────────
  const containerStyle: React.CSSProperties = {
    perspective: '1400px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: isCompact ? 0 : 400,
    opacity: isCompact ? 0 : 1,
    pointerEvents: isCompact ? 'none' : 'auto',
    overflow: isCompact ? 'hidden' : 'visible',
    position: 'relative',
    marginBottom: isCompact ? 0 : 20,
    transition: 'height 0.5s ease, margin 0.5s ease, opacity 0.5s ease',
    cursor: 'grab',
    userSelect: 'none',
  }

  // ── Arrow button — glass style ────────────────────────────────────────────
  const arrowBase: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#8b8f96',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'background 0.3s, color 0.3s',
  }

  return (
    <div>
      {/* ── 3D carousel container ─────────────────────────────────────────── */}
      <div
        style={containerStyle}
        onMouseEnter={() => { if (!isCompact) startAutoRotate() }}
        onMouseLeave={stopAutoRotate}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Left arrow */}
        <button
          aria-label="Previous"
          style={{ ...arrowBase, left: -60 }}
          onClick={() => onNavigate(-1)}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#e5e7eb'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#8b8f96'
          }}
        >
          &#8249;
        </button>

        {/* Cards — laid out on a circle via transform */}
        {cards.map((card, i) => (
          <CarouselCard
            key={i}
            index={i}
            title={card.title}
            description={card.description}
            badge={card.badge}
            color={card.color}
            isActive={i === currentIndex}
            style={computeCardStyle(i, currentIndex, cards.length)}
            onClick={() => { if (!isDragging.current) onSelect(i) }}
          />
        ))}

        {/* Right arrow */}
        <button
          aria-label="Next"
          style={{ ...arrowBase, right: -60 }}
          onClick={() => onNavigate(1)}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#e5e7eb'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#8b8f96'
          }}
        >
          &#8250;
        </button>
      </div>

      {/* ── Dot navigation ───────────────────────────────────────────────── */}
      <div
        style={{
          display: isCompact ? 'none' : 'flex',
          justifyContent: 'center',
          gap: 10,
          marginBottom: 32,
        }}
      >
        {cards.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to card ${i + 1}`}
            onClick={() => onIndexChange(i)}
            style={{
              width: i === currentIndex ? 28 : 10,
              height: 10,
              borderRadius: i === currentIndex ? 5 : '50%',
              background: i === currentIndex ? '#FF9900' : 'rgba(255,255,255,0.12)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
