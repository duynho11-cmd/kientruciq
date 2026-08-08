import { useEffect, useRef, useState, forwardRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { projects } from '../data/projects'


const ImagePanel = forwardRef(function ImagePanel(
  { src, alt, panelRef, index, total },
  _ref  // eslint-disable-line no-unused-vars
) {
  const containerRef = useRef(null)
  const tiltRafRef   = useRef(null)
  const tiltState    = useRef({ rx: 0, ry: 0, tx: 0, ty: 0 })
  const PANEL_H_VH   = 0.85

  const handleLoad = (e) => {
    const img = e.currentTarget
    img.closest('.dp-panel-img')?.classList.add('loaded')
    const { naturalWidth: nw, naturalHeight: nh } = img
    if (!nw || !nh) return
    const w  = Math.round(window.innerHeight * PANEL_H_VH * (nw / nh))
    const el = containerRef.current
    if (el) { el.style.width = `${w}px`; el.style.flex = `0 0 ${w}px` }
  }

  /* ── 3-D tilt on mouse move ─────────────────────────────── */
  const handleMouseMove = (e) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width  - 0.5   // -0.5 … 0.5
    const ny = (e.clientY - rect.top)  / rect.height - 0.5
    tiltState.current.tx = nx
    tiltState.current.ty = ny
  }

  const handleMouseLeave = () => {
    tiltState.current.tx = 0
    tiltState.current.ty = 0
  }

  useEffect(() => {
    const img = containerRef.current?.querySelector('.dp-img')
    if (!img) return
    const lerp = (a, b, t) => a + (b - a) * t
    const tick = () => {
      const s  = tiltState.current
      s.rx = lerp(s.rx, s.ty * -12, 0.08)   // invert Y so top = positive tilt
      s.ry = lerp(s.ry, s.tx *  12, 0.08)
      img.style.transform = `scale(1.04) rotateX(${s.rx}deg) rotateY(${s.ry}deg)`
      tiltRafRef.current = requestAnimationFrame(tick)
    }
    tiltRafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(tiltRafRef.current)
  }, [])

  return (
    <div
      ref={(el) => {
        containerRef.current = el
        if (typeof panelRef === 'function') panelRef(el)
        else if (panelRef) panelRef.current = el
      }}
      className="dp-panel dp-panel-img"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* index badge */}
      <span className="dp-panel-img__index" aria-hidden="true">
        {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>

      <img
        src={src}
        alt={alt}
        className="dp-img"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onLoad={handleLoad}
      />
    </div>
  )
})

/* Render text với \n thành <br> */
function TextLines({ text }) {
  if (!text) return null
  const parts = text.split('\n')
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && <br />}
    </span>
  ))
}

function TitleChars({ text }) {
  /* Tách theo \n thành dòng, mỗi dòng tách theo từ — không bao giờ wrap giữa chữ */
  const lines = text.split('\n')

  return (
    <h1 className="dp-title" aria-label={text.replace(/\n/g, ' ')}>
      {lines.map((line, li) => (
        <span key={li} className="dp-title__line">
          {line.split(' ').map((word, wi) => (
            <span key={wi} className="dp-title__word">
              {Array.from(word).map((ch, ci) => (
                <span
                  key={ci}
                  className="dp-title__char"
                  aria-hidden="true"
                  style={{ animationDelay: `${0.25 + (li * 20 + wi * 5 + ci) * 0.022}s` }}
                >
                  {ch}
                </span>
              ))}
            </span>
          ))}
          {li < lines.length - 1 && <br />}
        </span>
      ))}
    </h1>
  )
}

/* ── Floating particles ───────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COUNT = 38
    const pts = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(Math.random() * 0.22 + 0.06),
      a:  Math.random(),
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pts.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.a = Math.max(0, p.a - 0.0008)
        if (p.y < -10 || p.a <= 0) {
          p.x = Math.random() * canvas.width
          p.y = canvas.height + 10
          p.a = Math.random() * 0.45 + 0.1
          p.vx = (Math.random() - 0.5) * 0.18
          p.vy = -(Math.random() * 0.22 + 0.06)
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,200,200,${p.a * 0.6})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return (
    <canvas
      ref={canvasRef}
      className="dp-particles"
      aria-hidden="true"
    />
  )
}

/* ── Animated scroll arrow ────────────────────────────────────── */
function ScrollArrow({ opacity }) {
  return (
    <div
      className="dp-scroll-arrow"
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
        <rect x="9" y="0" width="2" height="18" rx="1" fill="currentColor" opacity="0.5" />
        <path
          d="M1 17 L10 26 L19 17"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

/* ── useReveal — add .is-visible when element enters viewport ─── */
function useReveal(ref, options = {}) {
  const optRef = useRef(options)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('is-visible'); io.disconnect() } },
      { threshold: 0.18, ...optRef.current }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
}

/* ProjectDetailPage */
export default function ProjectDetailPage() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const project   = projects.find((p) => p.slug === slug)

  const scrollerRef  = useRef(null)
  const panelRefs    = useRef([])
  const rafRef       = useRef(null)
  const velocityRef  = useRef(0)
  const scrollPctRef = useRef(0)
  const ambientRef   = useRef(null)
  const endPanelRef  = useRef(null)

  /* cursor refs */
  const cursorRef     = useRef(null)
  const dotRef        = useRef(null)
  const ringRef       = useRef(null)
  const labelRef      = useRef(null)
  const mouseRef      = useRef({ x: 0, y: 0, rx: 0, ry: 0 })
  const cursorRafRef  = useRef(null)

  const skewRef      = useRef(0)          // current skew (lerped)

  const [scrollPct, setScrollPct] = useState(0)
  const [entered,   setEntered]   = useState(false)

  /* Scroll-reveal for end panel */
  useReveal(endPanelRef, { threshold: 0.12 })

  /* redirect if not found */
  useEffect(() => {
    if (!project) navigate('/', { replace: true })
  }, [project, navigate])

  /* enter animation */
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 40)
    return () => clearTimeout(t)
  }, [])

  /* ── Master rAF: momentum + 3D panel fold ─────────────────── */
  useEffect(() => {
    const sc = scrollerRef.current
    if (!sc) return

    const tick = () => {
      /* momentum */
      if (Math.abs(velocityRef.current) > 0.15) {
        sc.scrollLeft      += velocityRef.current
        velocityRef.current *= 0.91
      }

      /* progress */
      const pct  = sc.scrollLeft / (sc.scrollWidth - sc.clientWidth)
      const safe = isNaN(pct) ? 0 : Math.max(0, Math.min(1, pct))
      if (Math.abs(safe - scrollPctRef.current) > 0.0005) {
        scrollPctRef.current = safe
        setScrollPct(safe)
      }

      /* 3D fold + velocity skew */
      const viewCx  = sc.scrollLeft + sc.offsetWidth / 2
      /* lerp skew toward velocity target */
      const skewTarget = Math.max(-8, Math.min(8, velocityRef.current * -0.12))
      skewRef.current  = skewRef.current + (skewTarget - skewRef.current) * 0.1

      panelRefs.current.forEach((el) => {
        if (!el) return
        const panelCx = el.offsetLeft + el.offsetWidth / 2
        const dist    = panelCx - viewCx
        const norm    = Math.max(-1, Math.min(1, dist / sc.offsetWidth))
        const scale   = 0.82 + 0.18 * (1 - Math.abs(norm))
        const ty      = Math.abs(norm) * 26
        const rotY    = norm * -34
        /* skewX adds tactile "warp" feel when scrolling fast */
        el.style.transform = `rotateY(${rotY}deg) scale(${scale}) translateY(${ty}px) skewX(${skewRef.current}deg)`
      })

      /* ambient glow follows scroll */
      if (ambientRef.current) {
        const ax = 20 + safe * 60   // 20% → 80% of viewport width
        ambientRef.current.style.left = `${ax}%`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  /* ── Scroll sync ──────────────────────────────────────────── */
  useEffect(() => {
    const sc = scrollerRef.current
    if (!sc) return
    const onScroll = () => {
      const pct = sc.scrollLeft / (sc.scrollWidth - sc.clientWidth)
      scrollPctRef.current = isNaN(pct) ? 0 : pct
      setScrollPct(scrollPctRef.current)
    }
    sc.addEventListener('scroll', onScroll, { passive: true })
    return () => sc.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Wheel → momentum ─────────────────────────────────────── */
  useEffect(() => {
    const sc = scrollerRef.current
    if (!sc) return
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      e.preventDefault()
      velocityRef.current += e.deltaY * 0.5
      velocityRef.current  = Math.max(-55, Math.min(55, velocityRef.current))
    }
    sc.addEventListener('wheel', onWheel, { passive: false })
    return () => sc.removeEventListener('wheel', onWheel)
  }, [])

  /* ── Mouse drag ───────────────────────────────────────────── */
  useEffect(() => {
    const sc = scrollerRef.current
    if (!sc) return
    const drag = { active: false, startX: 0, startScroll: 0, lastX: 0, lastT: 0 }

    const onDown = (e) => {
      if (e.button !== 0) return
      if (e.target.closest('button, a, input')) return
      e.preventDefault()
      drag.active      = true
      drag.startX      = e.clientX
      drag.startScroll = sc.scrollLeft
      drag.lastX       = e.clientX
      drag.lastT       = Date.now()
      velocityRef.current    = 0
      sc.style.userSelect    = 'none'
      cursorRef.current?.classList.add('is-drag')
    }

    const onMove = (e) => {
      if (!drag.active) return
      sc.scrollLeft = drag.startScroll - (e.clientX - drag.startX)
      const dt = Math.max(Date.now() - drag.lastT, 1)
      velocityRef.current = -(e.clientX - drag.lastX) / dt * 14
      drag.lastX = e.clientX
      drag.lastT = Date.now()
    }

    const onUp = () => {
      if (!drag.active) return
      drag.active         = false
      sc.style.userSelect = ''
      velocityRef.current = Math.max(-60, Math.min(60, velocityRef.current))
      cursorRef.current?.classList.remove('is-drag')
    }

    sc.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      sc.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [])

  /* ── Keyboard ─────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') velocityRef.current += 30
      if (e.key === 'ArrowLeft')  velocityRef.current -= 30
      if (e.key === 'Escape')     navigate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  /* ── Custom cursor + magnetic pull ──────────────────────────── */
  useEffect(() => {
    const dot   = dotRef.current
    const ring  = ringRef.current
    const label = labelRef.current
    if (!dot || !ring) return

    const lerp = (a, b, t) => a + (b - a) * t

    /* magnetic target offset — lerped separately */
    const mag = { ox: 0, oy: 0, lox: 0, loy: 0 }
    const RADIUS  = 90   // px — activation radius
    const PULL    = 0.38 // strength 0-1

    const onMove = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`
      if (label) label.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`

      /* find closest magnetic element */
      let closestDist = Infinity
      let pullX = 0, pullY = 0

      document.querySelectorAll('.dp-mag').forEach((el) => {
        const rect = el.getBoundingClientRect()
        const cx   = rect.left + rect.width  / 2
        const cy   = rect.top  + rect.height / 2
        const dx   = e.clientX - cx
        const dy   = e.clientY - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < RADIUS && dist < closestDist) {
          closestDist = dist
          const strength = (1 - dist / RADIUS) * PULL
          pullX = dx * strength
          pullY = dy * strength
        }
      })

      mag.ox = pullX
      mag.oy = pullY
    }

    const tickCursor = () => {
      mouseRef.current.rx = lerp(mouseRef.current.rx || mouseRef.current.x, mouseRef.current.x, 0.11)
      mouseRef.current.ry = lerp(mouseRef.current.ry || mouseRef.current.y, mouseRef.current.y, 0.11)

      /* lerp magnetic offset */
      mag.lox = lerp(mag.lox, mag.ox, 0.12)
      mag.loy = lerp(mag.loy, mag.oy, 0.12)

      const rx = mouseRef.current.rx + mag.lox
      const ry = mouseRef.current.ry + mag.loy
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`

      cursorRafRef.current = requestAnimationFrame(tickCursor)
    }
    cursorRafRef.current = requestAnimationFrame(tickCursor)

    const onEnter = () => cursorRef.current?.classList.add('is-hover')
    const onLeave = () => { cursorRef.current?.classList.remove('is-hover'); mag.ox = 0; mag.oy = 0 }

    const hoverEls = document.querySelectorAll('.dp-next-card, .dp-back-btn, .dp-panel-img')
    hoverEls.forEach((el) => {
      el.classList.add('dp-mag')
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
  }, [entered])

  if (!project) return null

  const projectIdx   = projects.findIndex((p) => p.slug === slug)
  const nextProject  = projects[(projectIdx + 1) % projects.length]
  const infoParallax = Math.max(0, (0.18 - scrollPct) * 110)
  const totalImages  = project.images.length
  const hintOpacity  = Math.max(0, 1 - scrollPct * 8)

  return (
    <div className={`dp-root${entered ? ' dp-entered' : ''}`}>

      {/* Custom cursor */}
      <div ref={cursorRef} className="dp-cursor" aria-hidden="true">
        <div ref={dotRef}   className="dp-cursor__dot"   />
        <div ref={ringRef}  className="dp-cursor__ring"  />
        <span ref={labelRef} className="dp-cursor__label">view</span>
      </div>

      {/* Ambient glow */}
      <div ref={ambientRef} className="dp-ambient" aria-hidden="true" />

      {/* Floating particles */}
      <ParticleCanvas />

      {/* Progress bar */}
      <div
        className="dp-progress"
        style={{ width: `${scrollPct * 100}%` }}
        aria-hidden="true"
      />

      <div ref={scrollerRef} className="dp-scroller scrollbar-hide">

        {/* Image 0 */}
        <ImagePanel
          src={project.images[0]}
          alt={`${project.title} — 1`}
          panelRef={(el) => (panelRefs.current[0] = el)}
          index={1}
          total={totalImages}
        />

        {/* Info panel */}
        <div
          ref={(el) => (panelRefs.current[1] = el)}
          className="dp-panel dp-panel-info"
        >
          <div
            className="dp-info-inner"
            style={{ transform: `translateX(${infoParallax}px)` }}
          >
            <p className="dp-eyebrow">
              <TextLines text={project.subtitle} />
            </p>

            <TitleChars text={project.title} />

            <div className="dp-divider" />

            <p className="dp-description">{project.description}</p>

            <div className="dp-divider" />

            <dl className="dp-meta">
              <div className="dp-meta-row">
                <dt className="dp-meta-label">Thông tin</dt>
                <dd className="dp-meta-value"><TextLines text={project.category} /></dd>
              </div>
              <div className="dp-meta-row">
                <dt className="dp-meta-label">Năm</dt>
                <dd className="dp-meta-value">{project.year}</dd>
              </div>
            </dl>

            {project.tags?.length > 0 && (
              <div className="dp-tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="dp-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Remaining images */}
        {project.images.slice(1).map((src, i) => (
          <ImagePanel
            key={src}
            src={src}
            alt={`${project.title} — ${i + 2}`}
            panelRef={(el) => (panelRefs.current[i + 2] = el)}
            index={i + 2}
            total={totalImages}
          />
        ))}

        {/* End panel */}
        <div
          ref={(el) => {
            panelRefs.current[project.images.length + 1] = el
            endPanelRef.current = el
          }}
          className="dp-panel dp-panel-end dp-reveal"
        >
          <div className="dp-end-inner">
            <p className="dp-end-label">Tham khảo thiết kế tiếp theo</p>

            <button
              className="dp-next-card"
              onClick={() => navigate(`/project/${nextProject.slug}`)}
            >
              <div className="dp-next-thumb">
                <img
                  src={nextProject.coverImage}
                  alt={nextProject.title}
                  draggable={false}
                />
              </div>
              <div className="dp-next-meta">
                <span className="dp-next-dir">Next →</span>
                <span className="dp-next-name">{nextProject.title}</span>
              </div>
            </button>

            <button className="dp-back-btn" onClick={() => navigate('/')}>
              ↩ Back to work
            </button>
          </div>
        </div>

      </div>

      {/* Scroll hint + arrow */}
      <div
        className="dp-scroll-hint"
        style={{ opacity: hintOpacity }}
        aria-hidden="true"
      >
        scroll to explore
      </div>
      <ScrollArrow opacity={hintOpacity} />

    </div>
  )
}
