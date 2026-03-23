import React, { useEffect, useRef, useCallback, useState } from 'react'
import CarouselCard from './CarouselCard'

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

const RADIUS = 320
const DRAG_THRESHOLD = 50

function computeCardStyle(i: number, current: number, total: number): React.CSSProperties {
  const angle = ((i - current) * 360) / total
  const rad = (angle * Math.PI) / 180
  const x = Math.sin(rad) * RADIUS
  const z = Math.cos(rad) * RADIUS - RADIUS
  const scale = 0.55 + (Math.cos(rad) + 1) * 0.225
  return {
    transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
    zIndex: Math.round(scale * 10),
  }
}

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
  const didDrag = useRef(false)
  const [leftHover, setLeftHover] = useState(false)
  const [rightHover, setRightHover] = useState(false)

  function startAutoRotate() {
    if (autoRotateRef.current) return
    autoRotateRef.current = setInterval(() => onNavigate(1), 3500)
  }

  function stopAutoRotate() {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current)
      autoRotateRef.current = null
    }
  }

  useEffect(() => () => stopAutoRotate(), [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button[data-arrow]')) return
    dragStartX.current = e.clientX
    didDrag.current = false
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    stopAutoRotate()
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragStartX.current === null) return
    if (Math.abs(e.clientX - dragStartX.current) > 10) didDrag.current = true
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (dragStartX.current === null) return
    const diff = e.clientX - dragStartX.current
    if (Math.abs(diff) > DRAG_THRESHOLD) onNavigate(diff < 0 ? 1 : -1)
    dragStartX.current = null
    setTimeout(() => { didDrag.current = false }, 0)
  }, [onNavigate])

  if (isCompact) return null

  const arrowStyle = (side: 'left' | 'right', hovered: boolean): React.CSSProperties => ({
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: 16,
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: hovered ? 'rgba(255,153,0,0.12)' : 'rgba(255,255,255,0.04)',
    border: hovered ? '1px solid rgba(255,153,0,0.3)' : '1px solid rgba(255,255,255,0.08)',
    color: hovered ? '#FF9900' : '#9ca3af',
    fontSize: 22,
    fontWeight: 300,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    transition: 'all 0.25s ease',
    backdropFilter: 'blur(8px)',
    boxShadow: hovered ? '0 0 20px rgba(255,153,0,0.1)' : 'none',
  })

  return (
    <div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 420,
          marginBottom: 20,
          cursor: 'grab',
          userSelect: 'none',
        }}
        onMouseEnter={startAutoRotate}
        onMouseLeave={stopAutoRotate}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Left arrow — inside the container, not overflowing */}
        <button
          data-arrow="left"
          aria-label="Previous"
          style={arrowStyle('left', leftHover)}
          onMouseEnter={() => setLeftHover(true)}
          onMouseLeave={() => setLeftHover(false)}
          onClick={(e) => { e.stopPropagation(); onNavigate(-1) }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        {/* 3D scene */}
        <div style={{ perspective: '1400px', position: 'relative', width: 320, height: 360, transformStyle: 'preserve-3d' }}>
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
              onClick={() => { if (!didDrag.current) onSelect(i) }}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          data-arrow="right"
          aria-label="Next"
          style={arrowStyle('right', rightHover)}
          onMouseEnter={() => setRightHover(true)}
          onMouseLeave={() => setRightHover(false)}
          onClick={(e) => { e.stopPropagation(); onNavigate(1) }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
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
