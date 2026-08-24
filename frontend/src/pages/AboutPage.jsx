import { useEffect, useRef, useState } from 'react'
import teamImg from '../assets/imgMeLinh/18.jpg'

/* ── Core value SVG icons ────────────────────────────────────── */
const IconLeaf = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ color: 'var(--accent)' }}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
)

const IconHandshake = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ color: 'var(--accent)' }}>
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l1.06 1.06L12 21.23l7.36-7.94 1.06-1.06a5.4 5.4 0 0 0 0-7.65z"/>
    <path d="m9 11 3 3 5-5"/>
  </svg>
)

const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ color: 'var(--accent)' }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
)

/*  Core values  */
const CORE_VALUES = [
  {
    Icon: IconLeaf,
    title: 'Tinh tế',
    desc: 'Ưu tiên các vật liệu và phương pháp thiết kế bền vững, an toàn cho con người và môi trường.',
  },
  {
    Icon: IconHandshake,
    title: 'Minh bạch',
    desc: 'Chúng tôi luôn đặt sự hài lòng của khách hàng lên hàng đầu trong từng dự án và dịch vụ.',
  },
  {
    Icon: IconShield,
    title: 'An tâm',
    desc: 'Không chỉ là đối tác, chúng tôi là người bạn đồng hành trong suốt hành trình kiến tạo.',
  },
]

/*  Timeline  */
const TIMELINE = [
  {
    year: '2018',
    label: 'Thành lập',
    desc: 'Kiến Trúc IQ được thành lập với định hướng thiết kế kiến trúc hiện đại, gần gũi với thiên nhiên.',
  },
  {
    year: '2020',
    label: 'Mở rộng',
    desc: 'Hợp tác với các đối tác quốc tế, mở rộng danh mục dịch vụ sang nội thất và quy hoạch tổng thể.',
  },
  {
    year: '2022',
    label: 'Đổi mới',
    desc: 'Ứng dụng công nghệ 3D và BIM vào quy trình thiết kế, nâng cao chất lượng trình bày dự án.',
  },
  {
    year: '2024',
    label: 'Khẳng định',
    desc: 'Hoàn thiện triết lý thiết kế — không gian tối giản, tinh tế và trường tồn cùng thời gian.',
  },
]

/* ── Intersection observer hook ─────────────────────────────── */
function useInView() {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        obs.disconnect()
      }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

/* ── Styles helpers ──────────────────────────────────────────── */
const fadeUp = (visible, delay = 0) => ({
  opacity:    visible ? 1 : 0,
  transform:  visible ? 'translateY(0)' : 'translateY(28px)',
  transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
})

const SectionDivider = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    margin: '0 auto',
  }}>
    <div style={{ width: 40, height: 1, background: 'var(--on-surface)' }} />
    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--on-surface)', opacity: 0.35 }} />
  </div>
)

/* ════════════════════════════════════════════════════════════ */
function AboutPage() {
  /* Hero entrance */
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60)
    return () => clearTimeout(t)
  }, [])

  /* Image parallax / tilt */
  const imgWrapRef  = useRef(null)
  const imgRef      = useRef(null)
  const rafRef      = useRef(null)
  const mouseRef    = useRef({ x: 0.5, y: 0.5 })
  const isHoverRef  = useRef(false)
  const smoothRef   = useRef({ x: 0.5, y: 0.5 })
  const timeRef     = useRef(0)

  useEffect(() => {
    const wrap = imgWrapRef.current
    const img  = imgRef.current
    if (!wrap || !img) return

    const onMouseMove  = (e) => {
      const r = wrap.getBoundingClientRect()
      mouseRef.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
    }
    const onMouseEnter = () => { isHoverRef.current = true }
    const onMouseLeave = () => { isHoverRef.current = false; mouseRef.current = { x: 0.5, y: 0.5 } }

    wrap.addEventListener('mousemove',  onMouseMove, { passive: true })
    wrap.addEventListener('mouseenter', onMouseEnter)
    wrap.addEventListener('mouseleave', onMouseLeave)

    const lerp = (a, b, t) => a + (b - a) * t

    const tick = (ts) => {
      timeRef.current = ts * 0.001
      const sp = isHoverRef.current ? 0.08 : 0.03
      smoothRef.current.x = lerp(smoothRef.current.x, mouseRef.current.x, sp)
      smoothRef.current.y = lerp(smoothRef.current.y, mouseRef.current.y, sp)
      const sx = smoothRef.current.x, sy = smoothRef.current.y
      const t  = timeRef.current
      const floatX   = isHoverRef.current ? 0 : Math.sin(t * 0.55) * 5 + Math.sin(t * 0.31) * 2.5
      const floatY   = isHoverRef.current ? 0 : Math.sin(t * 0.43 + 1) * 4 + Math.cos(t * 0.27) * 2
      const tiltX    = isHoverRef.current ? (sy - 0.5) * -8 : 0
      const tiltY    = isHoverRef.current ? (sx - 0.5) * 10 : 0
      const scale    = isHoverRef.current ? 1.03 : 1
      const parallaxX = isHoverRef.current ? (sx - 0.5) * -16 : 0
      const parallaxY = isHoverRef.current ? (sy - 0.5) * -10 : 0
      wrap.style.transform = `translateX(${floatX}px) translateY(${floatY}px) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`
      img.style.transform  = `translate(${parallaxX}px, ${parallaxY}px) scale(1.08)`
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafRef.current)
      wrap.removeEventListener('mousemove',  onMouseMove)
      wrap.removeEventListener('mouseenter', onMouseEnter)
      wrap.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  /* Scroll-reveal refs */
  const [introRef,    introVis]    = useInView()
  const [valuesRef,   valuesVis]   = useInView()
  const [timelineRef, timelineVis] = useInView()
  const [quoteRef,    quoteVis]    = useInView()

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>

      {/* ══════════════════════════════════════════════════════
          HERO — Ảnh + Bio
      ══════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: 'calc(var(--navbar-h) + 3rem)',
        paddingBottom: '5rem',
        paddingLeft: 'var(--margin-edge)',
        paddingRight: 'var(--margin-edge)',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
      }}>
        <div className="about-hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.45fr)',
          gap: 'clamp(3rem, 6vw, 7rem)',
          alignItems: 'start',
          width: '100%',
        }}>

          {/* Portrait */}
          <div style={{ position: 'sticky', top: 'calc(var(--navbar-h) + 2rem)', ...fadeUp(entered, 0) }}>
            <div
              ref={imgWrapRef}
              style={{
                aspectRatio: '3 / 4',
                overflow: 'hidden',
                borderRadius: '4px',
                backgroundColor: 'var(--surface-container)',
                maxWidth: '380px',
                boxShadow: 'var(--shadow-lg)',
                transformStyle: 'preserve-3d',
                willChange: 'transform',
              }}
            >
              <img
                ref={imgRef}
                src={teamImg}
                alt="Đội ngũ Kiến Trúc IQ"
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', display: 'block',
                  willChange: 'transform', transform: 'scale(1.08)',
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* Bio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Eyebrow + heading */}
            <div style={fadeUp(entered, 80)}>
              <p style={{
                fontSize: '10.5px', fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--accent)', marginBottom: '0.75rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ display: 'inline-block', width: '24px', height: '1.5px', background: 'var(--accent)', borderRadius: '2px' }} />
                Câu chuyện của chúng tôi
              </p>
              <h1 style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: 'clamp(34px, 4.2vw, 54px)',
                fontWeight: 400, lineHeight: 1.1,
                color: 'var(--on-surface)',
                letterSpacing: '-0.01em',
              }}>
                Tầm Nhìn và Sứ Mệnh
              </h1>
            </div>

            {/* Divider */}
            <div style={{
              height: '1px', background: 'var(--outline-variant)',
              ...fadeUp(entered, 130),
            }} />

            {/* Paragraphs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', ...fadeUp(entered, 160) }}>
              <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--on-surface)' }}>
                Tại Kiến Trúc IQ, chúng tôi tin rằng một ngôi nhà hoàn hảo không chỉ đến từ sự lộng lẫy bên ngoài, 
                mà bắt đầu từ tư duy thiết kế thông minh (IQ) bên trong. Chúng tôi không chỉ xây dựng những bức tường, 
                chúng tôi kiến tạo chốn an gia – nơi mỗi chi tiết đều được đo đạc cẩn thận để vừa vặn với thói quen, 
                ngân sách và cá tính riêng của từng gia chủ.
              </p>
              <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--on-surface-variant)' }}>
                Tầm nhìn: Trở thành thương hiệu Kiến trúc & Nội thất hàng đầu được khách hàng tin tưởng lựa chọn nhờ các giải pháp không gian thông minh, 
                tối ưu và mang giá trị bền vững.
              </p>
              <p style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--on-surface-variant)' }}>
                Sứ mệnh: Xóa bỏ nỗi lo về phát sinh chi phí và thi công sai lệch; mang đến trải nghiệm làm nhà nhẹ nhàng, 
                an tâm tuyệt đối cho mọi gia đình Việt.
              </p>
            </div>

            {/* Tags */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.2rem',
              ...fadeUp(entered, 210),
            }}>
              {['Kiến trúc', 'Nội thất', 'Sân vườn'].map((tag) => (
                <span key={tag} style={{
                  fontSize: '10.5px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--on-surface-variant)',
                }}>
                  {tag}
                </span>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          GIÁ TRỊ CỐT LÕI
      ══════════════════════════════════════════════════════ */}
      <section
        ref={introRef}
        style={{
          paddingTop: '6rem', paddingBottom: '6rem',
          paddingLeft: 'var(--margin-edge)', paddingRight: 'var(--margin-edge)',
          maxWidth: 'var(--container-max)', margin: '0 auto',
        }}
      >
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem', ...fadeUp(valuesVis, 0) }}>
          <p style={{
            fontSize: '10.5px', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--accent)', marginBottom: '0.75rem',
          }}>
            ── Triết lý ──
          </p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(26px, 3.5vw, 40px)',
            fontWeight: 400, letterSpacing: '-0.01em',
            color: 'var(--on-surface)', marginBottom: '1.25rem',
          }}>
            Giá trị cốt lõi
          </h2>
          <SectionDivider />
        </div>

        {/* Cards */}
        <div ref={valuesRef} className="values-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'clamp(1.5rem, 3vw, 2.5rem)',
        }}>
          {CORE_VALUES.map((v, i) => (
            <div
              key={v.title}
              style={{
                border: '1px solid var(--outline-variant)',
                borderRadius: '6px',
                padding: 'clamp(1.5rem, 3vw, 2.25rem)',
                display: 'flex', flexDirection: 'column', gap: '0.9rem',
                backgroundColor: 'var(--surface-container)',
                transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                cursor: 'default',
                ...fadeUp(introVis, 120 + i * 80),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ lineHeight: 1, color: 'var(--accent)' }}><v.Icon /></div>
              <h3 style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: '20px', fontWeight: 500,
                color: 'var(--on-surface)', margin: 0,
              }}>
                {v.title}
              </h3>
              <p style={{
                fontSize: '14px', lineHeight: 1.7,
                color: 'var(--on-surface-variant)', margin: 0,
              }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HÀNH TRÌNH PHÁT TRIỂN — Timeline
      ══════════════════════════════════════════════════════ */}
      <section
        ref={timelineRef}
        style={{
          paddingTop: '6rem', paddingBottom: '6rem',
          paddingLeft: 'var(--margin-edge)', paddingRight: 'var(--margin-edge)',
          maxWidth: 'var(--container-max)', margin: '0 auto',
          backgroundColor: 'var(--surface-container)',
        }}
      >
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '4rem', ...fadeUp(timelineVis, 0) }}>
          <p style={{
            fontSize: '10.5px', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--accent)', marginBottom: '0.75rem',
          }}>
            ── Lịch sử ──
          </p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(26px, 3.5vw, 40px)',
            fontWeight: 400, letterSpacing: '-0.01em',
            color: 'var(--on-surface)', marginBottom: '1.25rem',
          }}>
            Hành trình phát triển
          </h2>
          <SectionDivider />
        </div>

        {/* Timeline items */}
        <div style={{
          position: 'relative',
          maxWidth: '680px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}>
          {/* Center line */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0, bottom: 0,
            width: '1px',
            background: 'var(--outline-variant)',
            transform: 'translateX(-50%)',
          }} />

          {TIMELINE.map((item, i) => {
            const isLeft = i % 2 === 0
            return (
              <div
                key={item.year}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  gap: '1.5rem',
                  alignItems: 'start',
                  paddingBottom: i < TIMELINE.length - 1 ? '3.5rem' : 0,
                  ...fadeUp(timelineVis, 150 + i * 120),
                }}
              >
                {/* Left slot */}
                <div style={{ textAlign: 'right', paddingTop: '2px' }}>
                  {isLeft ? (
                    <>
                      <p style={{
                        fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                        fontSize: '22px', fontWeight: 400,
                        color: 'var(--accent)', margin: '0 0 2px',
                      }}>
                        {item.year}
                      </p>
                      <p style={{
                        fontSize: '10px', fontWeight: 700,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: 'var(--on-surface)', margin: '0 0 8px',
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontSize: '13.5px', lineHeight: 1.7,
                        color: 'var(--on-surface-variant)', margin: 0,
                      }}>
                        {item.desc}
                      </p>
                    </>
                  ) : null}
                </div>

                {/* Dot */}
                <div style={{
                  width: '11px', height: '11px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  marginTop: '6px',
                  flexShrink: 0,
                  boxShadow: '0 0 0 4px var(--surface-container)',
                }} />

                {/* Right slot */}
                <div style={{ paddingTop: '2px' }}>
                  {!isLeft ? (
                    <>
                      <p style={{
                        fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                        fontSize: '22px', fontWeight: 400,
                        color: 'var(--accent)', margin: '0 0 2px',
                      }}>
                        {item.year}
                      </p>
                      <p style={{
                        fontSize: '10px', fontWeight: 700,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: 'var(--on-surface)', margin: '0 0 8px',
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontSize: '13.5px', lineHeight: 1.7,
                        color: 'var(--on-surface-variant)', margin: 0,
                      }}>
                        {item.desc}
                      </p>
                    </>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CLOSING QUOTE
      ══════════════════════════════════════════════════════ */}
      <section
        ref={quoteRef}
        style={{
          paddingTop: '7rem', paddingBottom: '7rem',
          paddingLeft: 'var(--margin-edge)', paddingRight: 'var(--margin-edge)',
          maxWidth: '780px',
          margin: '0 auto',
          textAlign: 'center',
          ...fadeUp(quoteVis, 0),
        }}
      >
        <p style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 'clamp(16px, 2.2vw, 20px)',
          fontWeight: 300, lineHeight: 1.75,
          color: 'var(--on-surface-variant)',
          marginBottom: '2rem',
        }}>
          "Đẹp trong thiết kế, Thông minh trong sử dụng."
        </p>
        <p style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: '15px', letterSpacing: '0.06em',
          color: 'var(--on-surface)',
        }}>
          — Kiến Trúc IQ —
        </p>
      </section>

      {/* ── Responsive overrides ─────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .about-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .about-hero-grid > div:first-child {
            position: static !important;
            max-width: 100% !important;
          }
          .values-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 540px) {
          .about-hero-grid > div:first-child img {
            aspect-ratio: 4 / 3 !important;
          }
        }
      `}</style>

    </div>
  )
}

export default AboutPage
