import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import ProjectCard from '../components/common/ProjectCard'
import { useMagneticDots } from '../hooks/useMagneticDots'
import { projects as BASE } from '../data/projects'

/* ══════════════════════════════════════════════════════════════
   Constants
   ══════════════════════════════════════════════════════════════ */
const N = BASE.length

const getSlot = () => {
  if (typeof window === 'undefined') return 480
  if (window.innerWidth < 480)  return 320
  if (window.innerWidth < 768)  return 380
  if (window.innerWidth < 1024) return 440
  return 480
}

const FLOAT_CFG = [
  { duration: '7s',   delay: '0s'    },
  { duration: '5s',   delay: '-2s'   },
  { duration: '8s',   delay: '-4s'   },
  { duration: '6s',   delay: '-1s'   },
  { duration: '9s',   delay: '-3s'   },
  { duration: '6.5s', delay: '-3.5s' },
]

const mod = (n, m) => ((n % m) + m) % m

/* ══════════════════════════════════════════════════════════════
   HomePage
   ══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate()
  const sceneRef = useRef(null)
  const cardRefs = useRef([])
  const mainRef  = useRef(null)
  const dotsRef  = useRef(null)   /* for magnetic hook */

  const slotRef   = useRef(getSlot())
  const offsetRef = useRef(0)
  const rafRef    = useRef(null)

  const featureStart  = BASE.findIndex((p) => p.isFeature)
  const getInitOffset = useCallback(
    () => -(featureStart < 0 ? 0 : featureStart) * slotRef.current,
    [featureStart],
  )

  const [activeIdx, setActiveIdx] = useState(featureStart < 0 ? 0 : featureStart)
  const prevIdxRef = useRef(activeIdx)

  /* ── cursor ──────────────────────────────────────────────── */
  const cursorDotRef  = useRef(null)
  const cursorRingRef = useRef(null)
  const mouseRef      = useRef({ x: 0, y: 0, rx: 0, ry: 0 })
  const cursorRafRef  = useRef(null)
  const isHoverRef    = useRef(false)

  const dragRef = useRef({
    active: false, startX: 0, startOff: 0,
    lastX: 0, lastT: 0, lastOff: 0,
  })

  /* ── 1. Magnetic dots ─────────────────────────────────────── */
  useMagneticDots(dotsRef, 72, 0.42)

  /* ── Apply offset ─────────────────────────────────────────── */
  const applyOffset = useCallback((off) => {
    const refs  = cardRefs.current
    if (!refs.length) return
    const SLOT    = slotRef.current
    const TOTAL_W = N * SLOT
    const sceneW  = sceneRef.current?.offsetWidth || window.innerWidth
    const cx      = sceneW / 2

    refs.forEach((el, i) => {
      if (!el) return
      let x = cx + off + i * SLOT - SLOT / 2
      x = mod(x - (cx - TOTAL_W / 2), TOTAL_W) + (cx - TOTAL_W / 2)
      el.style.transform = `translateX(${x}px)`
    })

    offsetRef.current = off
    const raw = mod(Math.round(-off / SLOT), N)

    /* Only trigger React re-render when the active card actually changes */
    if (raw !== prevIdxRef.current) {
      const delta = raw - prevIdxRef.current
      const half  = N / 2
      let d = delta
      if (d >  half) d -= N
      if (d < -half) d += N
      prevIdxRef.current = raw
      setActiveIdx(raw)
    }
  }, [])

  /* ── Snap ─────────────────────────────────────────────────── */
  const snapToNearest = useCallback((fromOff, initVel = 0) => {
    const SLOT   = slotRef.current
    const target = Math.round(fromOff / SLOT) * SLOT
    let off = fromOff, vel = initVel
    // Higher damping + lower stiffness = softer, more fluid deceleration
    const STIFFNESS = 0.09, DAMPING = 0.82

    cancelAnimationFrame(rafRef.current)
    sceneRef.current?.classList.add('is-transitioning')

    const tick = () => {
      const dist = target - off
      vel = vel * DAMPING + dist * STIFFNESS
      off += vel
      applyOffset(off)
      if (Math.abs(dist) < 0.15 && Math.abs(vel) < 0.15) {
        applyOffset(target)
        sceneRef.current?.classList.remove('is-transitioning')
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [applyOffset])

  /* ── Step (wheel) ─────────────────────────────────────────── */
  const step = useCallback((dir) => {
    cancelAnimationFrame(rafRef.current)
    const SLOT   = slotRef.current
    const from   = offsetRef.current
    const target = Math.round(from / SLOT) * SLOT - dir * SLOT
    let off = from, vel = -dir * SLOT * 0.08   // nhỏ hơn nhiều → không nảy
    const STIFFNESS = 0.06, DAMPING = 0.88     // mềm, tắt dần chậm

    sceneRef.current?.classList.add('is-transitioning')

    const tick = () => {
      const dist = target - off
      vel = vel * DAMPING + dist * STIFFNESS
      off += vel
      applyOffset(off)
      if (Math.abs(dist) < 0.15 && Math.abs(vel) < 0.15) {
        applyOffset(target)
        sceneRef.current?.classList.remove('is-transitioning')
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [applyOffset])

  /* ── Init ─────────────────────────────────────────────────── */
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      slotRef.current = getSlot()
      const init = getInitOffset()
      offsetRef.current = init
      applyOffset(init)
    })
    return () => cancelAnimationFrame(raf)
  }, [applyOffset, getInitOffset])

  /* ── Wheel ────────────────────────────────────────────────── */
  useEffect(() => {
    const el = sceneRef.current
    if (!el) return
    let last = 0
    const THROTTLE = 650
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      e.preventDefault()
      const now = Date.now()
      if (now - last < THROTTLE) return
      last = now
      step(e.deltaY > 0 ? 1 : -1)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [step])

  /* ── Drag / touch ─────────────────────────────────────────── */
  useEffect(() => {
    const el = sceneRef.current
    if (!el) return
    const getX = (e) => (e.touches ? e.touches[0].clientX : e.clientX)

    const onStart = (e) => {
      cancelAnimationFrame(rafRef.current)
      dragRef.current = {
        active: true,
        startX: getX(e), startOff: offsetRef.current,
        lastX: getX(e), lastT: Date.now(), lastOff: offsetRef.current,
      }
      cursorDotRef.current?.closest('.carousel-cursor')?.classList.add('is-drag')
    }
    const onMove = (e) => {
      if (!dragRef.current.active) return
      const x  = getX(e)
      const dx = x - dragRef.current.startX
      dragRef.current.lastOff = offsetRef.current
      dragRef.current.lastX   = x
      dragRef.current.lastT   = Date.now()
      applyOffset(dragRef.current.startOff + dx)
    }
    const onEnd = () => {
      if (!dragRef.current.active) return
      dragRef.current.active = false
      const dt   = Math.max(Date.now() - dragRef.current.lastT, 16)
      const dOff = offsetRef.current - dragRef.current.lastOff
      snapToNearest(offsetRef.current, (dOff / dt) * 16)
      cursorDotRef.current?.closest('.carousel-cursor')?.classList.remove('is-drag')
    }

    el.addEventListener('mousedown',  onStart)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onEnd)
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove',  onMove,  { passive: true })
    el.addEventListener('touchend',   onEnd)
    return () => {
      el.removeEventListener('mousedown',  onStart)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onEnd)
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove',  onMove)
      el.removeEventListener('touchend',   onEnd)
    }
  }, [applyOffset, snapToNearest])

  /* ── Resize ───────────────────────────────────────────────── */
  useEffect(() => {
    const onResize = () => {
      const newSlot  = getSlot()
      const prevSlot = slotRef.current
      if (newSlot !== prevSlot) {
        const curIdx = mod(Math.round(-offsetRef.current / prevSlot), N)
        slotRef.current = newSlot
        const newOff    = -curIdx * newSlot
        offsetRef.current = newOff
        applyOffset(newOff)
      } else {
        applyOffset(offsetRef.current)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [applyOffset])

  /* ── Custom cursor ────────────────────────────────────────── */
  useEffect(() => {
    const cursorEl = document.querySelector('.carousel-cursor')
    const dot      = cursorDotRef.current
    const ring     = cursorRingRef.current
    if (!dot || !ring) return

    const onMove = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`
    }

    const lerp = (a, b, t) => a + (b - a) * t
    const tickCursor = () => {
      mouseRef.current.rx = lerp(mouseRef.current.rx ?? mouseRef.current.x, mouseRef.current.x, 0.12)
      mouseRef.current.ry = lerp(mouseRef.current.ry ?? mouseRef.current.y, mouseRef.current.y, 0.12)
      ring.style.transform = `translate(${mouseRef.current.rx}px, ${mouseRef.current.ry}px) translate(-50%,-50%)`
      cursorRafRef.current = requestAnimationFrame(tickCursor)
    }
    cursorRafRef.current = requestAnimationFrame(tickCursor)

    const onEnter = () => { isHoverRef.current = true;  cursorEl?.classList.add('is-hover') }
    const onLeave = () => { isHoverRef.current = false; cursorEl?.classList.remove('is-hover') }
    const hoverEls = document.querySelectorAll('.scroll-item.active, .carousel-dot, a, button')
    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(cursorRafRef.current)
      hoverEls.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [activeIdx])

  /* ── Hover proximity tracking ────────────────────────────── */
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    let lastNearIdx = -1

    const onMove = (e) => {
      if (dragRef.current.active) return
      const refs = cardRefs.current
      if (!refs.length) return

      let bestIdx = -1
      let bestDist = Infinity

      refs.forEach((wrap, i) => {
        if (!wrap) return
        const rect = wrap.getBoundingClientRect()
        const cx   = rect.left + rect.width / 2
        const dist = Math.abs(e.clientX - cx)
        if (dist < bestDist) { bestDist = dist; bestIdx = i }
      })

      // Only highlight non-active nearby cards within half a slot width
      const HALF_SLOT = slotRef.current * 0.55
      if (bestDist > HALF_SLOT) bestIdx = -1

      if (bestIdx !== lastNearIdx) {
        if (lastNearIdx >= 0) {
          const el = cardRefs.current[lastNearIdx]
          el?.querySelector('.scroll-item')?.classList.remove('is-near')
        }
        if (bestIdx >= 0 && bestIdx !== activeIdx) {
          const el = cardRefs.current[bestIdx]
          el?.querySelector('.scroll-item')?.classList.add('is-near')
        }
        lastNearIdx = bestIdx
      }
    }

    scene.addEventListener('mousemove', onMove, { passive: true })
    scene.addEventListener('mouseleave', () => {
      if (lastNearIdx >= 0) {
        cardRefs.current[lastNearIdx]?.querySelector('.scroll-item')?.classList.remove('is-near')
        lastNearIdx = -1
      }
    })

    return () => scene.removeEventListener('mousemove', onMove)
  }, [activeIdx])
  const goTo = useCallback((i) => {
    const SLOT    = slotRef.current
    const TOTAL_W = N * SLOT
    const cur     = offsetRef.current
    const targetOff = -i * SLOT
    let delta = targetOff - cur
    if (delta >  TOTAL_W / 2) delta -= TOTAL_W
    if (delta < -TOTAL_W / 2) delta += TOTAL_W
    snapToNearest(cur + delta, 0)
  }, [snapToNearest])

  /* ══════════════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════════════ */
  return (
    <main ref={mainRef} className="carousel-main">

      {/* Custom cursor */}
      <div className="carousel-cursor" aria-hidden="true">
        <div ref={cursorDotRef}  className="carousel-cursor__dot"  />
        <div ref={cursorRingRef} className="carousel-cursor__ring" />
      </div>

      {/* Ambient glow */}
      <div className="carousel-ambient" aria-hidden="true" />

      {/* Scene */}
      <div ref={sceneRef} className="carousel-scene">
        {BASE.map((project, i) => {
          const float    = FLOAT_CFG[i % FLOAT_CFG.length]
          const isActive = i === activeIdx
          return (
            <ProjectCard
              key={project.id}
              ref={(el) => (cardRefs.current[i] = el)}
              project={project}
              index={i}
              total={N}
              isActive={isActive}
              isFeature={project.isFeature}
              floatStyle={{ '--float-duration': float.duration, '--float-delay': float.delay }}
              onClick={() => {
                if (isActive) navigate(`/project/${project.slug}`)
                else goTo(i)
              }}
            />
          )
        })}

        <div className="carousel-hint" aria-hidden="true">
          {/* <span className="carousel-hint__line" />
          scroll
          <span className="carousel-hint__line" /> */}
        </div>
      </div>

      {/* ── Dots (magnetic) ──────────────────────────────────── */}
      <div ref={dotsRef} className="carousel-dots" role="tablist" aria-label="Projects">
        {BASE.map((project, i) => (
          <button
            key={project.id}
            role="tab"
            aria-selected={i === activeIdx}
            aria-label={project.title}
            className={`carousel-dot${i === activeIdx ? ' active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

    </main>
  )
}
