/**
 * useMagneticDots
 *
 * Spring-physics magnetic pull cho dot navigator.
 * Mỗi dot bị hút về phía chuột khi chuột trong radius,
 * bật ra khi chuột rời với spring damping.
 *
 * @param {React.RefObject} containerRef  - ref tới .carousel-dots wrapper
 * @param {number}          radius        - px radius để kích hoạt (default 60)
 * @param {number}          strength      - pull strength 0–1 (default 0.38)
 */

import { useEffect, useRef } from 'react'

const SPRING    = 0.18   // stiffness
const DAMPING   = 0.72   // velocity decay
const MIN_DIST  = 1      // stop threshold px

export function useMagneticDots(containerRef, radius = 60, strength = 0.38) {
  const stateRef = useRef([])   // [{ x, y, vx, vy, el }]
  const rafRef   = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    /* Collect dot elements */
    const dots = Array.from(container.querySelectorAll('.carousel-dot'))
    stateRef.current = dots.map((el) => ({ el, x: 0, y: 0, vx: 0, vy: 0 }))

    /* Mouse tracking — global so dot still pulls even when cursor
       is between dots */
    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    /* Physics tick */
    const tick = () => {
      const { x: mx, y: my } = mouseRef.current
      let anyActive = false

      stateRef.current.forEach((s) => {
        const rect = s.el.getBoundingClientRect()
        const cx   = rect.left + rect.width  / 2
        const cy   = rect.top  + rect.height / 2

        /* Distance from dot centre to cursor */
        const dx   = mx - cx
        const dy   = my - cy
        const dist = Math.sqrt(dx * dx + dy * dy)

        /* Target offset — pull toward cursor, scaled by proximity */
        let tx = 0, ty = 0
        if (dist < radius) {
          const t  = 1 - dist / radius          // 0 (edge) → 1 (centre)
          const ease = t * t * (3 - 2 * t)      // smoothstep
          tx = dx * ease * strength
          ty = dy * ease * strength
          anyActive = true
        }

        /* Spring toward target */
        s.vx = (s.vx + (tx - s.x) * SPRING) * DAMPING
        s.vy = (s.vy + (ty - s.y) * SPRING) * DAMPING
        s.x += s.vx
        s.y += s.vy

        /* Apply — only write when above threshold */
        const mag = Math.sqrt(s.x * s.x + s.y * s.y)
        if (mag > MIN_DIST || Math.abs(s.vx) > 0.05 || Math.abs(s.vy) > 0.05) {
          s.el.style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px)`
          anyActive = true
        } else if (s.el.style.transform) {
          s.el.style.transform = ''
        }
      })

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    /* Scale-up on proximity — separate hover effect per dot */
    const onDotEnter = (e) => {
      e.currentTarget.classList.add('mag-near')
    }
    const onDotLeave = (e) => {
      e.currentTarget.classList.remove('mag-near')
    }
    dots.forEach((d) => {
      d.addEventListener('mouseenter', onDotEnter)
      d.addEventListener('mouseleave', onDotLeave)
    })

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      dots.forEach((d) => {
        d.removeEventListener('mouseenter', onDotEnter)
        d.removeEventListener('mouseleave', onDotLeave)
        d.style.transform = ''
      })
    }
  }, [containerRef, radius, strength])
}
